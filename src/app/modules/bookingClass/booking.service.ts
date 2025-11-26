import { User } from '../user/user.model';
import { Club } from '../club/club.model';
import { StatusCodes } from 'http-status-codes';
import { IBookingClass } from './bookingClass.interface';
import { BookingClass } from './bookingClass.model';
import ApiError from '../../../errors/ApiError';
import { MEMBERS_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from './booking.constant';
import { UserCredit } from '../user/credit/user.credit.model';
import { Class } from '../class/class.model';
import { addCreditForCardPayment, generateOrderId, sendBookingConfirmEmail } from './booking.util';
import { BookingClassCardService } from './booking.stripe';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import QueryBuilder from '../../builder/QueryBuilder';
import setCronJob from '../../../shared/setCronJob';
import cron from 'node-cron';
import { IClass } from '../class/class.interface';
import { ClubMember } from '../club/club_members/club_members.model';

// Create a new booking class
const createBookingClass = async (payload: Partial<IBookingClass & { date_of_class: string }>, origin: string): Promise<IBookingClass | { redirectStripeUrl: string }> => {
  const { user, club, payment_method, class: classId, date_of_class } = payload;

  // ---------------------------
  // 1. Basic Entity Validation
  // ---------------------------
  const [userExists, clubExists, classExists] = await Promise.all([
    User.findById(user).lean(),
    Club.findById(club).lean(),
    Class.findById(classId, 'max_number_of_attendees date_of_class').lean(),
  ]);

  if (!userExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  if (!clubExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found');
  }
  if (!classExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Class not found');
  }
  if (!date_of_class) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Date of class is required');
  }


  // ---------------------------
  // 2. Check if user is a club member
  // ---------------------------
  const isMember = await ClubMember.findOne({ club: club, user: user }).lean();
  console.log({ isMember })

  if (!isMember) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'User must be a member of the club to book a class'
    );
  }

  if (payload.payment_method === PAYMENT_METHOD.PAY_IN_PERSON && !clubExists?.payment?.in_person_payment) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'In person payment is not enabled for this club');
  }

  // ---------------------------
  // 3. Check existing booking
  // ---------------------------
  const isAlreadyBooked = await BookingClass.findOne({ user, club, class: classId, class_booking_ref_id: `${date_of_class.split('T')[0]}_${classExists._id}` });
  if (isAlreadyBooked?.attandence_status === MEMBERS_STATUS.CANCEL || isAlreadyBooked?.attandence_status === MEMBERS_STATUS.WAIT) {
    await BookingClass.deleteOne({ _id: isAlreadyBooked._id }, { new: true });
  }
  if (isAlreadyBooked?.attandence_status === MEMBERS_STATUS.ATTEND) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Class already booked as ${isAlreadyBooked.attandence_status}`);
  }

  // ---------------------------
  // 4. Check class capacity
  // ---------------------------
  const maxCapacity = classExists.max_number_of_attendees;
  const totalBooked = await BookingClass.countDocuments({
    club,
    class: classId,
    attandence_status: MEMBERS_STATUS.ATTEND,
    class_booking_ref_id: `${date_of_class.split('T')[0]}_${classExists._id}`,
  });

  if (totalBooked >= maxCapacity) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Class is fully booked');
  }


  const orderId = await generateOrderId();
  payload.booking_id = orderId;
  payload.attandence_status = MEMBERS_STATUS.ATTEND;
  payload.class_booking_ref_id = `${date_of_class.split('T')[0]}_${classExists._id}`
  // payload.class_booking_ref_id = `${classExists.date_of_class.toISOString().split('T')[0]}_${classExists._id}`
  console.log(classExists)
  // ---------------------------
  // 5. Payment method: PAY IN PERSON
  // ---------------------------
  if (payment_method === PAYMENT_METHOD.PAY_IN_PERSON) {
    const userCredit = await UserCredit.findOne({ user, club: club });

    console.log({userCredit})

    if (userCredit && userCredit.credit >= 1) {
      payload.payment_status = PAYMENT_STATUS.PAID;
      await UserCredit.updateOne(
        { user, club },
        { $inc: { credit: -1 } }
      );
    }else{
      payload.payment_status = PAYMENT_STATUS.PAY_IN_PERSON
    }

    const bookingClass = await BookingClass.create(payload);
    sendBookingConfirmEmail(userExists.email as string);
    return bookingClass;
  }

  // ---------------------------
  // 6. Payment method: STRIPE
  // ---------------------------
  if (payment_method === PAYMENT_METHOD.STRIPE) {
    const createOrder = await BookingClassCardService.bookClass(payload as IBookingClass, origin);
    return createOrder;
  }

  throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or unsupported payment method');
};


// Get all booking classes for a specific club

// Add user to waiting list
const addToWaitingList = async (
  payload: Partial<IBookingClass & { date_of_class: string }>
) => {
  const { user, club, class: classId, date_of_class } = payload;

  /* ------------------------------------------------------------------ */
  /* 1. Validate basic entities                                         */
  /* ------------------------------------------------------------------ */
  const [userExists, clubExists, classExists] = await Promise.all([
    User.findById(user).lean(),
    Club.findById(club).lean(),
    Class.findById(classId, 'max_number_of_attendees date_of_class').lean(),
  ]);

  if (!userExists) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  if (!clubExists) throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found');
  if (!classExists) throw new ApiError(StatusCodes.NOT_FOUND, 'Class not found');
  if (!date_of_class) throw new ApiError(StatusCodes.BAD_REQUEST, 'Date of class is required');

  /* ------------------------------------------------------------------ */
  /* 2. Ensure user is a club member                                    */
  /* ------------------------------------------------------------------ */
  const isMember = await ClubMember.findOne({ club: clubExists._id, user: userExists?._id })
  if (!isMember)
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'User must be a member of the club to book a class'
    );

  if (!clubExists.allow_waiting_list) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Class waiting list is not allowed for this club'
    );
  }
  /* ------------------------------------------------------------------ */
  /* 3. Check if user already has any booking for this slot             */
  /* ------------------------------------------------------------------ */
  const refId = `${date_of_class.split('T')[0]}_${classExists._id}`;
  const existing = await BookingClass.findOne({
    user,
    club,
    class: classId,
    class_booking_ref_id: refId,
  });
  if (existing)
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `User already in ${existing.attandence_status} list`
    );

  /* ------------------------------------------------------------------ */
  /* 4. Count current attendees                                         */
  /* ------------------------------------------------------------------ */
  const totalBooked = await BookingClass.countDocuments({
    club,
    class: classId,
    attandence_status: MEMBERS_STATUS.ATTEND,
    class_booking_ref_id: refId,
  });

  /* ------------------------------------------------------------------ */
  /* 5. Reject if seats are still available                             */
  /* ------------------------------------------------------------------ */
  const maxCapacity = classExists.max_number_of_attendees;
  if (totalBooked < maxCapacity)
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Class has ${maxCapacity - totalBooked} seat(s) available. Please book a seat instead.`
    );

  /* ------------------------------------------------------------------ */
  /* 6. Create waiting-list entry                                       */
  /* ------------------------------------------------------------------ */
  payload.booking_id = await generateOrderId();
  payload.class_booking_ref_id = refId;

  const waitingEntry = await BookingClass.create({
    ...payload,
    attandence_status: MEMBERS_STATUS.WAIT,
  });

  /* ------------------------------------------------------------------ */
  /* 7. Notify user                                                     */
  /* ------------------------------------------------------------------ */
  const template = emailTemplate.WelcomeMessageForWaitingList(
    userExists.email as string,
    waitingEntry
  );
  emailHelper.sendEmail(template);

  return waitingEntry;
};

const getAllBookingAttendance = async (userId: string, clubId: string, classId: string, classStartDate: Date, query: Record<string, any>) => {

  const classStartTime = new Date(classStartDate).toISOString().split('T')[0];

  const [clubExists, classExists] = await Promise.all([
    await Club.findById(clubId).lean(),
    await Class.findById(classId).lean(),
  ])

  if (!clubExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Club not found');
  }
  if (!classExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Class not found');
  }

  const result = new QueryBuilder(
    BookingClass.find({
      club: clubId,
      class: classId,
      class_booking_ref_id: `${classStartTime}_${classId}`,
      attandence_status: { $ne: MEMBERS_STATUS.INITIAL }
    }),
    query
  ).paginate()
    .fields()
    .filter()
    .sort();

  const bookingAttendance = await result.modelQuery;
  const pagination = await result.getPaginationInfo();

  // Add setField to indicate if the requesting user is in the booking list 
  const attancence = {
    attend: 0,
    wait: 0,
    cancel: 0,
  }
  const dataWithOwnership = bookingAttendance.map((booking) => {
    const isOwn = booking.user.toString() === userId;

    if (booking.attandence_status === MEMBERS_STATUS.ATTEND) {
      attancence.attend++;
    } else if (booking.attandence_status === MEMBERS_STATUS.WAIT) {
      attancence.wait++;
    } else if (booking.attandence_status === MEMBERS_STATUS.CANCEL) {
      attancence.cancel++;
    }

    return {
      //@ts-ignore
      ...booking.toObject(),
      isOwn
    };
  });

  return {
    pagination,
    attancence,
    result: dataWithOwnership,
  };
};


const cancelAttendence = async (userId: string, classBookingRefId: string) => {

  // 1. Ensure the booking exists and belongs to the caller
  const booking = await BookingClass.findOne({
    user: userId,
    class_booking_ref_id: classBookingRefId,
  }).lean();
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  // 2. Ensure the club allows cancellation
  const club = await Club.findById(booking.club).lean();
  if (!club?.allow_class_cancelation) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Class cancellation is not enabled for this club');
  }

  // 3. Ensure the booking is still attendable
  if (booking.attandence_status !== MEMBERS_STATUS.ATTEND) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Only attended bookings can be cancelled');
  }

  // 4. Update the booking status
  const updatedBooking = await BookingClass.findByIdAndUpdate(
    booking._id,
    { attandence_status: MEMBERS_STATUS.CANCEL },
    { new: true }
  ).lean();
  if (!updatedBooking) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to cancel booking');
  }

  // 5. Load related entities in parallel
  const [userExists, classExists] = await Promise.all([
    User.findById(userId).lean(),
    Class.findById(booking.class).lean(),
  ]);

  if (!userExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  if (!classExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Class not found');
  }

  // Create or increase a credit if payment with card
  await addCreditForCardPayment(club, booking, userId, userExists.email, classBookingRefId, classExists.start_time)



  const maxCapacity = classExists.max_number_of_attendees;
  const totalBooked = await BookingClass.countDocuments({
    club: booking.club,
    class: booking.class,
    attandence_status: MEMBERS_STATUS.ATTEND,
    class_booking_ref_id: booking.class_booking_ref_id,
  });

  // WILL IVITE AS QUEUE IF CLASS IS CANCEL FOR  BOOKED
  // IF CLASS IS CANCELLED AND THERE ARE SPOTS AVAILABLE, THE NEXT USER IN THE WAITLIST SHOULD BE INVITED.

  if (booking && totalBooked === maxCapacity - 1) {
    const cronJob = cron.schedule('*/30 * * * *', async () => {
      console.log("TRIGGERED", booking.class_booking_ref_id)
      const lastOrder = await BookingClass.findOne({
        club: booking.club,
        class: booking.class,
        attandence_status: MEMBERS_STATUS.WAIT,
        class_booking_ref_id: booking.class_booking_ref_id,
        isQueued: { $ne: true }
      }, { booking_id: 1, user: 1 })
        .sort({ createdAt: 1 })
        .lean();

      console.log({ lastOrder })

      if (!lastOrder) {
        cronJob.stop();
        return;
      }


      await BookingClass.updateOne({
        _id: lastOrder?._id,
      }, {
        isQueued: true,
      });

      const userExists = await User.findById(lastOrder?.user).lean();
      if (userExists) {
        const welcomeEmailTemplate = emailTemplate.WelcomeMessageForAcceptSpeceASQue(userExists.email as string, classExists as IClass, classBookingRefId, lastOrder?.booking_id as string);
        emailHelper.sendEmail(welcomeEmailTemplate);
      }
      // WE WILL SEND EMAIL


      const currentBooked = await BookingClass.countDocuments({
        club: booking.club,
        class: booking.class,
        attandence_status: MEMBERS_STATUS.ATTEND,
        class_booking_ref_id: `${booking.class_booking_ref_id.split('_')[0]}_${classExists._id}`,
      });

      if (currentBooked >= maxCapacity) {
        cronJob.stop();
      }

    });

    cronJob.start();
  }


  return booking;
};




const getBookingAttendance = async (userId: string, classBookingRefId: string) => {
  const bookingAttendance = await BookingClass.findById(classBookingRefId).lean().populate<{ class: IClass }>('class');

  if (!bookingAttendance) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking attendance not found');
  }

  const occ = bookingAttendance.class;
  const totalBooked = await BookingClass.countDocuments({
    club: occ.club,
    class: occ._id,
    attandence_status: MEMBERS_STATUS.ATTEND,
    class_booking_ref_id: classBookingRefId,
  });

  // set remaining_space
  const remaining_space = occ.max_number_of_attendees - totalBooked;

  const isMyBooked = await BookingClass.exists({
    club: occ.club,
    user: userId,
    class: occ._id,
    attandence_status: MEMBERS_STATUS.ATTEND,
    class_booking_ref_id: `${occ.date_of_class.toISOString().split('T')[0]}_${occ._id}`,
  });

  return {
    ...bookingAttendance,
    class: {
      ...occ,
      remaining_space,
    },
    isMyBooked: !!isMyBooked,
  };
};

export const BookingClassService = {
  createBookingClass,
  addToWaitingList,
  getAllBookingAttendance,
  cancelAttendence,
  getBookingAttendance,
};