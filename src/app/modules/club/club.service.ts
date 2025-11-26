import mongoose from 'mongoose';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { CLUB_ROLE, clubSearchableField } from './club.constant';
import { IClub } from './club.interface';
import { Club } from './club.model';
import { ClubMember } from './club_members/club_members.model';
import { IClubMember } from './club_members/club_members.interface';
import { CloseClubRequest } from './privacy/close_club_request.model';
import setCronJob from '../../../shared/setCronJob';
import { CLOSING_STATUS } from './privacy/close_club_request.interface';
import { ClubMemberLeave } from './club_members/club_member_leave.model';

//Create a new club
const createClub = async (payload: IClub & { club_members: string[] }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (payload.club_members.length >= 4) {
      throw new Error('You can only create a club with up to 3 members');
    }

    const [newClub] = await Club.create([payload], { session });

    const allMembers = [
      {
        user: payload.club_creator,
        club: newClub._id,
        role: CLUB_ROLE.CLUB_MANAGER,
      },
      ...payload.club_members.map(user_id => ({
        user: user_id,
        club: newClub._id,
        role: CLUB_ROLE.CLUB_MANAGER,
      })),
    ];

    await ClubMember.insertMany(allMembers, { session });

    await session.commitTransaction();

    const creator = await User.findById(payload.club_creator, {
      email: 1,
    }).lean();
    if (!creator) throw new Error('Creator not found');

    const welcomeTemplate = emailTemplate.WelcomMessageForClubCreation(
      creator.email
    );
    emailHelper.sendEmail(welcomeTemplate);

    return newClub;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllClubs = async (userId: string, query: Record<string, any>) => {
  const result = new QueryBuilder(Club.find(), query)
    .paginate()
    .search(clubSearchableField)
    .fields()
    .filter()
    .sort();

  const clubs = await result.modelQuery.lean();
  const pagination = await result.getPaginationInfo();

  const managedClubs: any[] = [];
  const memberClubs: any[] = [];

  const allMyClubs = await ClubMember.find({ user: userId })
    .populate('club')
    .lean();

  allMyClubs.forEach((club: any) => {
    if (club.role === CLUB_ROLE.CLUB_MANAGER) {
      managedClubs.push(club.club);
    } else {
      memberClubs.push(club.club);
    }
  });

  return {
    pagination,
    data: {
      managedClubs,
      memberClubs,
    },
  };
};

//Get single club by ID
const getSingleClub = async (id: string, userId: string) => {
  const club = await Club.findById(id).lean();
  if (!club) throw new Error('Club not found');

  const totalMembers = await ClubMember.countDocuments({ club: id }).lean();

  // Fetch all club managers
  const managers = await ClubMember.find({
    club: id,
    role: CLUB_ROLE.CLUB_MANAGER,
  })
    .populate(
      'user',
      'profile.username profile.firstName profile.lastName email avatar'
    )
    .lean();

  const myMembership = await ClubMember.findOne({
    club: id,
    user: userId,
  }).lean();
  const role = myMembership?.role || null;

  // Determine group role: owner, member, or user
  let groupRole: 'manager' | 'member' | 'user' = 'user';
  if (role === CLUB_ROLE.CLUB_MANAGER) {
    groupRole = club.club_creator.toString() === userId ? 'manager' : 'member';
  } else if (role === CLUB_ROLE.USER) {
    groupRole = 'member';
  }

  return {
    ...club,
    total_members: totalMembers,
    group_role: groupRole,
    managers: managers.map(m => m.user),
  };
};

//Update a club by ID

const updateClub = async (
  club_id: string,
  userId: string,
  payload: Partial<IClub & { club_members: string[] }>
) => {
  const club = await ClubMember.findOne({
    club: club_id,
    user: userId,
  }).lean() as IClubMember;

  const clubToUpdate = await Club.findById(club_id).lean();

  if (payload.allow_class_cancelation && payload.pre_class_cancelation) {
    payload.pre_class_cancelation = JSON.parse(payload?.pre_class_cancelation as any);
  }

  if (payload.payment) {
    payload.payment = {
      ...clubToUpdate?.payment,
      ...JSON.parse(payload.payment as any),
    }
  }

  if (payload.premium_feature) {
    payload.premium_feature = JSON.parse(payload.premium_feature as any);
  }

  if (club.role !== CLUB_ROLE.CLUB_MANAGER)
    throw new Error('You are not the manager of this club');

  if (payload.club_members && payload.club_members.length >= 5) {
    throw new Error('You can only add up to 4 members to a club');
  }

  if (!!payload.club_members?.length) {
    // Fetch existing managers before deletion
    const existingManagers = await ClubMember.find({
      club: club_id,
      role: CLUB_ROLE.CLUB_MANAGER,
    }).lean();
    const existingIds = new Set(existingManagers.map(m => m.user.toString()));

    // Remove all existing CLUB_MANAGER members for this club
    await ClubMember.deleteMany({
      club: club_id,
      role: CLUB_ROLE.CLUB_MANAGER,
    });

    // Insert fresh list from payload
    const newMembers = payload.club_members.map(user_id => ({
      user: user_id,
      club: club_id,
      role: CLUB_ROLE.CLUB_MANAGER,
    }));

    const allMembers = [
      ...newMembers,
      {
        user: payload.club_creator,
        club: club_id,
        role: CLUB_ROLE.CLUB_MANAGER,
      },
    ];
    await ClubMember.insertMany(allMembers);

    // Identify truly new managers
    const newManagerIds = payload.club_members
      .map(id => id.toString())
      .filter(id => !existingIds.has(id));

    // Fetch user details for new managers only
    const newUsers = await User.find(
      { _id: { $in: newManagerIds } },
      { email: 1 }
    ).lean();

    // Send welcome emails only to new managers
    for (const user of newUsers) {
      const welcomeTemplate = emailTemplate.WelcomMessageForClubCreation(
        user.email
      );
      emailHelper.sendEmail(welcomeTemplate);
    }
  }

  const updatedClub = await Club.findByIdAndUpdate(club_id, payload, {
    new: true,
    runValidators: true,
  });
  return updatedClub;
};

// Delete a club by ID

const deleteClub = async (id: string) => {
  const deletedClub = await Club.findByIdAndDelete(id);
  return deletedClub;
};

// Add a new member to a club
const addMemberToClub = async (
  clubId: string,
  userId: string,
  role: string
) => {

  const updatedClub = await Club.findByIdAndUpdate(
    clubId,
    {
      $addToSet: { club_members: { user_id: userId, role } }, // prevents duplicates
    },
    { new: true }
  ).populate('club_members.user_id');

  return updatedClub;
};

//Remove a member from a club
const removeMemberFromClub = async (clubId: string, userId: string) => {
  const updatedClub = await Club.findByIdAndUpdate(
    clubId,
    { $pull: { club_members: { user_id: userId } } },
    { new: true }
  ).populate('club_members.user_id');

  return updatedClub;
};

//Get all clubs by creator ID
const getClubsByCreator = async (creatorId: string) => {
  const clubs = await Club.find({ club_creator: creatorId });
  return clubs;
};

const joinClub = async (clubId: string, userId: string) => {
  const isExist = await ClubMember.findOne({
    club: clubId,
    user: userId,
  });

  if (isExist) throw new Error('User already joined the club');

  const newMember = await ClubMember.create({
    club: clubId,
    user: userId,
    role: CLUB_ROLE.USER,
  });
  return newMember;
};

const getClubs = async (userId: string, query: Record<string, any>) => {
  const result = new QueryBuilder(Club.find(), query)
    .paginate()
    .search(clubSearchableField)
    .fields()
    .filter()
    .sort();

  const clubs = await result.modelQuery.lean();
  const pagination = await result.getPaginationInfo();

  const clubsWithCounts = await Promise.all(
    clubs.map(async (club: any) => {
      const memberCount = await ClubMember.countDocuments({
        club: club._id,
      });
      return { ...club, club_members: memberCount };
    })
  );

  return {
    pagination,
    data: clubsWithCounts,
  };
};

const leaveClub = async (clubId: string, userId: string, feedback: string) => {
  const membership = await ClubMember.findOne({
    club: clubId,
    user: userId,
  });

  if (!membership) {
    throw new Error('You are not a member of this club');
  }

  // If user is a CLUB_MANAGER, check if they are the last one
  if (membership.role === CLUB_ROLE.CLUB_MANAGER) {
    const otherManagers = await ClubMember.countDocuments({
      club: clubId,
      role: CLUB_ROLE.CLUB_MANAGER,
      user: { $ne: userId },
    });

    if (otherManagers === 0) {
      throw new Error('Last manager cannot leave the club');
    }
  }

  await ClubMember.findByIdAndDelete(membership._id);
  await ClubMemberLeave.create({
    club: clubId,
    user: userId,
    feedback,
  });

  return { message: 'Successfully left the club' };
};
const isLastMember = async (clubId: string, userId: string) => {
  const membership = await ClubMember.findOne({
    club: clubId,
    user: userId,
  });

  if (!membership) {
    throw new Error('You are not a member of this club');
  }

  let isLastManager = false;

  // If user is a CLUB_MANAGER, check if they are the last one
  if (membership.role === CLUB_ROLE.CLUB_MANAGER) {
    const otherManagers = await ClubMember.countDocuments({
      club: clubId,
      role: CLUB_ROLE.CLUB_MANAGER,
      user: { $ne: userId },
    });

    if (otherManagers === 0) {
      isLastManager = true;
    }
  }

  return {
    message: 'Successfully checked if user is the last member',
    data: { isLastManager },
  };
};


// Create a close club request
const createCloseClubRequest = async (
  clubId: string,
  userId: string,
  marketing_permission: boolean,
  feedback: string
) => {

  // Check if user is a member of the club
  const isMember = await ClubMember.findOne({
    club: clubId,
    user: userId,
    role: CLUB_ROLE.CLUB_MANAGER,
  });

  if (!isMember) {
    throw new Error('You are not a manager of this club');
  }

  const existingRequest = await CloseClubRequest.findOne({
    club: clubId,
    requested_user: userId,
  });

  if (existingRequest) {
    await CloseClubRequest.deleteOne({ _id: existingRequest._id });
    return { message: 'Close club request removed' };
  }

  const closeClubRequest = await CloseClubRequest.create({
    club: clubId,
    requested_user: userId,
    marketing_permission,
    feedback,
  });
  const user = await User.findById(userId);


  const requestEmail = emailTemplate.RequestToCloseClub(user?.email || '');
  emailHelper.sendEmail(requestEmail);

  // SET SCHEDULE TIGGER TO DELETE CLUB AFTER 48 HOURS IF NO MARKETING PERMISSION
  setCronJob('0 0 */2 * *', async () => {

    const existRequest = await CloseClubRequest.findOne({
      club: clubId,
      requested_user: userId,
    });


    if (existRequest && existRequest.closing_status === CLOSING_STATUS.PENDING) {

      if (existRequest.marketing_permission) {
        await ClubMember.deleteMany({ club: clubId, role: CLUB_ROLE.CLUB_MANAGER });
      } else {
        await Club.findByIdAndDelete(clubId);
        await ClubMember.deleteMany({ club: clubId });
      }

      await CloseClubRequest.updateOne({ _id: existRequest._id }, { closing_status: CLOSING_STATUS.CLOSED });

      const closeEmail = emailTemplate.AccountClosedNotificaiton(user?.email || '');
      emailHelper.sendEmail(closeEmail);

    }

  });


  return closeClubRequest;
};


// Get close club status
const getClubCloseStatus = async (clubId: string, userId: string) => {
  const closeRequest = await CloseClubRequest.findOne({
    club: clubId,
    requested_user: userId,
  });



  return { message: !!closeRequest ? 'Close request already exists' : 'No close request found', isRequestedToClose: !!closeRequest };
};

export const ClubService = {
  createClub,
  getAllClubs,
  getSingleClub,
  updateClub,
  deleteClub,
  addMemberToClub,
  removeMemberFromClub,
  getClubsByCreator,
  joinClub,
  getClubs,
  leaveClub,
  isLastMember,
  createCloseClubRequest,
  getClubCloseStatus
};
