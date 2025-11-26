import { CLUB_PERIOD_TYPE } from './../club/club.constant';
import { emailHelper } from "../../../helpers/emailHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import { MEMBERS_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "./booking.constant";
import { BookingClass } from "./bookingClass.model";
import { UserCredit } from "../user/credit/user.credit.model";
import { IBookingClass } from "./bookingClass.interface";
import { IClub } from "../club/club.interface";
import dayjs from 'dayjs';

// Generate Order ID
const findLastOrderId = async (): Promise<string | undefined> => {
  const lastOrder = await BookingClass.findOne({}, { booking_id: 1, _id: 0 })
    .sort({ createdAt: -1 })
    .lean();

  return lastOrder?.booking_id;
};

export const generateOrderId = async (): Promise<string> => {
  const lastId = await findLastOrderId();

  let numericPart = 0;

  if (lastId) {
    numericPart = parseInt(lastId, 10) || 0;
  }

  const newIdNumber = numericPart + 1;
  const newId = newIdNumber.toString().padStart(4, '0');

  return newId;
};


export const sendBookingConfirmEmail = (email: string) => {
  const welcomeEmailTemplate = emailTemplate.WelcomMessageForClassBooking(email);
  emailHelper.sendEmail(welcomeEmailTemplate);
}

export const addCreditForCardPayment = async (
  club: IClub,
  booking: IBookingClass,
  userId: string,
  email: string,
  classBookingRefId: string,
  startTime: string // e.g. "09:30"
) => {
    // Extract and parse class date from booking ref ID (e.g. "2025-11-09_..." → "2025-11-09")
    const bookingDate = classBookingRefId.split("_")[0]; 
    const classStart = dayjs(`${bookingDate}T${startTime}`); // Full datetime

    // Get cancellation rules
    const cancellationValue = club.pre_class_cancelation?.period || 0;
    const cancellationType = club.pre_class_cancelation?.period_type;

    // Calculate cutoff time for valid cancellation
    let cutoffTime = classStart;
    switch (cancellationType) {
      case CLUB_PERIOD_TYPE.DAY:
        cutoffTime = classStart.subtract(cancellationValue, "day");
        break;
      case CLUB_PERIOD_TYPE.HOUR:
        cutoffTime = classStart.subtract(cancellationValue, "hour");
        break;
      case CLUB_PERIOD_TYPE.MINUTE:
        cutoffTime = classStart.subtract(cancellationValue, "minute");
        break;
      default:
        break;
    }

    // Check if the current time is after cutoff → too late to cancel
    const now = dayjs();
    // Proceed if all conditions match for adding credit
    if (
      booking.attandence_status === MEMBERS_STATUS.ATTEND &&
      booking.payment_method === PAYMENT_METHOD.STRIPE &&
      booking.payment_status === PAYMENT_STATUS.PAID &&
      now.isAfter(cutoffTime)
    ) {
      const existingCredit = await UserCredit.findOne({ user: userId, club: booking.club });

      if (existingCredit) {
        await UserCredit.updateOne(
          { user: userId, club: booking.club },
          { $inc: { credit: 1 } }
        );
      } else {
        await UserCredit.create({ user: userId, club: booking.club, credit: 1 });
      }

      const cancelEmail = emailTemplate.MessageForCancellation(booking, email);
      await emailHelper.sendEmail(cancelEmail);
    }
};