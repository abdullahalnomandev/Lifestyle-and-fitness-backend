import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import setCronJob from '../../../shared/setCronJob';
import unlinkFile from '../../../shared/unlinkFile';
import QueryBuilder from '../../builder/QueryBuilder';
import { Comment } from '../post/comment/comment.model';
import { Like } from '../post/like';
import { Post } from '../post/post.model';
import {
  ACTIVITY_TYPE,
  USER_AUTH_PROVIDER,
  userSearchableField,
} from './user.constant';
import { IUser } from './user.interface';
import { User } from './user.model';
import { getUserInfoWithToken } from './user.util';
import { Notification } from '../notification/notification.mode';
import generateOTP from '../../../util/generateOTP';
import { NetworkConnection } from '../networkConnetion/networkConnetion.model';
import { USER_POST_TYPE } from '../post/post.constant';
import { Save } from '../post/save';
import { NETWORK_CONNECTION_STATUS } from '../networkConnetion/networkConnetion.constant';
import { Story } from '../story/story.model';

const createUserToDB = async (
  payload: Partial<IUser>
): Promise<IUser | { accessToken: string }> => {
  if (!payload.password && !payload.google_id_token && !payload.mobile) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Password or Google or Mobile is required'
    );
  }

  let isValid = false;
  let authorization: { oneTimeCode: string; expireAt: Date } | null = null;

  //GOOGLE
  if (
    payload.auth_provider === USER_AUTH_PROVIDER.GOOGLE &&
    payload.google_id_token
  ) {
    const tokenData = await getUserInfoWithToken(payload?.google_id_token);
    payload.email = tokenData?.data?.email;
    payload.name = tokenData?.data?.name;
    isValid = true;
    if (tokenData) payload.verified = true;

    const isExist = await User.exists({ email: tokenData?.data?.email }).lean();

    if (isExist) {
      const createToken = jwtHelper.createToken(
        { id: isExist._id, role: isExist.role, email: isExist.email },
        config.jwt.jwt_secret as Secret,
        config.jwt.jwt_expire_in as string
      );
      return { accessToken: createToken };
    }
  }
  // APPLE
  else if (
    payload.auth_provider === USER_AUTH_PROVIDER.MOBILE &&
    payload.mobile
  ) {
    isValid = true;
    // will will implement mobile verificaiton later
  }
  //LOCAL
  else {
    if (payload.auth_provider === 'local' && payload.password) {
       isValid = true;

      const otp = generateOTP();
      authorization = {
        oneTimeCode: otp.toString(),
        expireAt: new Date(Date.now() + 3 * 60000),
      };
    }
  }
  const createUser = await User.create(payload);

  if (!createUser || !isValid)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');

  if (isValid && createUser && payload.auth_provider === 'local') {
    if (!authorization?.oneTimeCode || !createUser?.email) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to generate OTP or missing email'
      );
    }
    const createAccountTemplate = emailTemplate.createAccount({
      otp: authorization.oneTimeCode,
      email: createUser.email,
    });
    emailHelper.sendEmail(createAccountTemplate);
    await User.findByIdAndUpdate(createUser._id, { $set: { authorization } });
    return createUser;
  } else {
    //create token
    const createToken = jwtHelper.createToken(
      { id: createUser._id, role: createUser.role, email: createUser.email },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string
    );
    return { accessToken: createToken };
  }
};

const getUserProfileFromDB = async (user: JwtPayload): Promise<any> => {
  const { id } = user;

  // Only unselect the arrays but still need to count their lengths, so will fetch their counts
  const isExistUser = await User.findById(id, '-status -role -authorization')
    .lean()
    .populate('preferences');

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Fetch total posts and network connections for the user
  const [totalPost, totalNetwork] = await Promise.all([
    Post.countDocuments({ creator: id }),
    NetworkConnection.countDocuments({
      $or: [{ request: id }, { recipient: id }],
      status: NETWORK_CONNECTION_STATUS.ACCEPTED,
    }),
  ]);

  // Return all user data + totals
  return {
    ...isExistUser,
    totalPost,
    totalNetwork,
  };
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null> | undefined> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (payload.email) {
    delete payload.email;
  }

  if (payload.image) {
    unlinkFile(payload.image as string);
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true }
  ).lean();

  if (updatedUser) {
    delete (updatedUser as any).authorization;
    delete (updatedUser as any).status;
  }

  return updatedUser;
};

const getAllUsers = async (query: Record<string, any>) => {
  const club_id = query.club_id;

  // Build base query
  let baseQuery = User.find();

  const userQuery = new QueryBuilder(baseQuery, query)
    .paginate()
    .search(userSearchableField)
    .fields()
    .filter(['club_id'])
    .sort();

  const result = await userQuery.modelQuery.lean();
  const pagination = await userQuery.getPaginationInfo();

  return {
    pagination,
    data: result,
  };
};
// .populate({
//   path: "airlineVerification",
//   match: { paymentStatus: "paid" },
//   select: "designation plan employeeId images paymentStatus paymentMethod",
//   populate: {
//     path: "plan",
//     select: "-active",
//   },

export const unfollowUser = async (userId: string, targetId: string) => {
  if (userId === targetId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot unfollow yourself');
  }

  await User.findByIdAndUpdate(userId, {
    $pull: { 'profile.following': targetId },
  });

  await User.findByIdAndUpdate(targetId, {
    $pull: { 'profile.followers': userId },
  });
};


const getUserProfileByIdFromDB = async (
  userId: string,
  requestUserId: string
): Promise<any> => {
  // Only unselect the arrays but still need to count their lengths, so will fetch their counts
  const isExistUser = await User.findById(
    requestUserId,
    '-status -role -authorization'
  )
    .lean()
    .populate('preferences');

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Fetch total posts and network connections for the user
  const [totalPost, totalNetwork, isConnectedToNetwork] = await Promise.all([
    Post.countDocuments({ creator: requestUserId }),
    NetworkConnection.countDocuments({
      $or: [{ requestFrom: requestUserId }, { requestTo: requestUserId }],
      status: NETWORK_CONNECTION_STATUS.ACCEPTED,
    }),
    NetworkConnection.exists({
      $or: [
        { requestFrom: userId, requestTo: requestUserId },
        { requestTo: userId, requestFrom: requestUserId },
      ],
      status: NETWORK_CONNECTION_STATUS.ACCEPTED,
    })
      .lean()
      .then(result => !!result),
  ]);

  // Return all user data + totals + isConnectedToNetwork
  return {
    ...isExistUser,
    totalPost,
    totalNetwork,
    isConnectedToNetwork,
  };
};


const getUserActivityFromDB = async (  requestUserId: string, myUserId: string, query: Record<string, any> ): Promise<{ data: any[]; pagination: any }> => {
  // Get user activity based on type
  let activityQuery;

   if (query.type === ACTIVITY_TYPE.PHOTO)  activityQuery = Post.find({ creator: requestUserId });
   else if (query.type === ACTIVITY_TYPE.LIKE)  activityQuery = Like.find({ user: requestUserId }).populate('post'); 
   else if (query.type === ACTIVITY_TYPE.SAVE) activityQuery = Save.find({ user: requestUserId }).populate('post');
   else if (query.type === ACTIVITY_TYPE.STORY) activityQuery = Story.find({ creator: requestUserId }).populate('creator');
  //  else activityQuery = Post.find({ creator: requestUserId });
  if (!activityQuery) {
    throw new Error('Invalid activity type');
  }

  const userQuery = new QueryBuilder(
    activityQuery as any, // Explicitly cast to any to satisfy QueryBuilder type check
    query
  )
    .paginate()
    .fields()
    .filter(['type'])
    .sort();

  const result = await userQuery.modelQuery;
  const pagination = await userQuery.getPaginationInfo();

  return {
    data: result,
    pagination,
  };
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  unfollowUser,
  getAllUsers,
  getUserProfileByIdFromDB,
  getUserActivityFromDB,
};
