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
import { getAllAdminOrder, getTotalOrder } from '../store/shopify-gql-api/gql-api';
import { updateUserAccessFeature } from '../../../util/updateUserAccessFeature';
import e from 'cors';
import { PostView } from '../post/postView/postView.model';

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
    await updateUserAccessFeature(isExist?._id as any);

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
    // Fix: 'isExist' is not defined in this scope. Use createUser instead.
    await updateUserAccessFeature(createUser._id as any);
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
  const isExistUser = await User.findById(id, '-status -authorization')
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

  if (payload.image === isExistUser.image) {
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


const getUserActivityFromDB = async (
  requestUserId: string,
  myUserId: string,
  query: Record<string, any>
): Promise<{ data: any[]; pagination: any }> => {
  let activityQuery: any;
  let includeVideoCount = false;

  if (query.type === ACTIVITY_TYPE.POST) {
    activityQuery = Post.find({ creator: requestUserId });
    includeVideoCount = true;
  } else if (query.type === ACTIVITY_TYPE.VIDEO) {
    activityQuery = Post.find({
      creator: requestUserId,
      type: USER_POST_TYPE.VIDEO,
    });
    includeVideoCount = true;
  } else if (query.type === ACTIVITY_TYPE.LIKE) {
    activityQuery = Like.find({ user: requestUserId }).populate('post');
  } else if (query.type === ACTIVITY_TYPE.SAVE) {
    activityQuery = Save.find({ user: requestUserId }).populate('post');
  } else if (query.type === ACTIVITY_TYPE.STORY) {
    activityQuery = Story.find({ creator: requestUserId }).populate('creator');
  }

  if (!activityQuery) {
    throw new Error('Invalid activity type');
  }

  const userQuery = new QueryBuilder(activityQuery, query)
    .paginate()
    .fields()
    .sort();

  let result = await userQuery.modelQuery.lean();
  const pagination = await userQuery.getPaginationInfo();

  /**
   * VIDEO VIEW COUNT LOGIC
   */
  if (includeVideoCount && Array.isArray(result)) {
    const postIds = result
      .filter((post: any) => post.type === USER_POST_TYPE.VIDEO)
      .map((post: any) => post._id);

    const videoViewMap: Record<string, number> = {};

    if (postIds.length > 0) {
      const viewCounts = await PostView.aggregate([
        { $match: { video: { $in: postIds } } },
        {
          $group: {
            _id: '$video',
            count: { $sum: 1 },
          },
        },
      ]);

      for (const vc of viewCounts) {
        videoViewMap[vc._id.toString()] = vc.count;
      }
    }

    result = result.map((item: any) => ({
      ...item,
      ...(item.type === USER_POST_TYPE.VIDEO && {
        videoViewCount: videoViewMap[item._id.toString()] || 0,
      }),
    }));
  }

  return {
    data: result,
    pagination,
  };
};

// DASHBOARD ANALYTICS


const getUserStatistics = async (year: number, userId: string) => {
  // Set months for the whole year
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Set the start and end of the year for querying
  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  // Get new users aggregate per month in a single command
  const newUsersAgg = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        verified: true,
      }
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      }
    }
  ]);

  // Map month (1-based) to user count for quick lookup
  const monthToCount = Array(12).fill(0);
  newUsersAgg.forEach((item: any) => {
    // Month in MongoDB is 1-indexed (Jan: 1)
    monthToCount[item._id.month - 1] = item.count;
  });

  // Only show up to the last month if querying this year
  const now = new Date();
  const isThisYear = year === now.getFullYear();
  const limitMonth = isThisYear ? now.getMonth() + 1 : 12;

  // Compose userStats with cumulative sum
  let runningTotal = 0;
  const userStats = [];
  for (let i = 0; i < limitMonth; i++) {
    runningTotal += monthToCount[i];
    userStats.push({
      month: months[i],
      newUsers: monthToCount[i],
      cumulativeNewUsers: runningTotal,
    });
  }

  return {
    year,
    totalNewUsers: runningTotal,
    userStats,
  };
};



const statistics = async () => {
  // Get total counts and total revenue from Shopify
  const [totalUser, totalReview, totalOrderResp] = await Promise.all([
    User.countDocuments({ verified: true }),
    Comment.countDocuments(),
    getTotalOrder(),
  ]);

  // Compute totalOrder
  const totalOrder =
    typeof totalOrderResp === "object" &&
    totalOrderResp &&
    totalOrderResp.ordersCount &&
    typeof totalOrderResp.ordersCount.count === "number"
      ? totalOrderResp.ordersCount.count
      : 0;

  const ordersResult = await getAllAdminOrder(totalOrder || 1000); // fallback to 1000 if no orders (will not affect sum)
  const edges = ordersResult?.orders?.edges ?? [];
  const totalRevenue = edges.reduce((sum: number, orderEdge: any) => {
    const amount = parseFloat(
      orderEdge.node?.totalPriceSet?.shopMoney?.amount ?? "0"
    );
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return {
    totalUser,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrder,
  };
};


const getAllEarningStatistics = async (year: number) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  const MAX_ORDER_FETCH = 250; 
  const ordersResult = await getAllAdminOrder(MAX_ORDER_FETCH);
  const edges = ordersResult?.orders?.edges ?? [];

  const ordersInYear = edges.filter((orderEdge: any) => {
    const orderDate = new Date(orderEdge.node?.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });

  const earningsByMonth = Array(12).fill(0);

  ordersInYear.forEach((orderEdge: any) => {
    const order = orderEdge.node;
    const createdAt = new Date(order.createdAt);
    const amount = parseFloat(order.totalPriceSet?.shopMoney?.amount ?? "0");
    const monthIndex = createdAt.getUTCMonth();
    if (!isNaN(amount)) {
      earningsByMonth[monthIndex] += amount;
    }
  });

  // Only show up to this month if year is current
  const now = new Date();
  const isThisYear = year === now.getFullYear();
  const limitMonth = isThisYear ? now.getUTCMonth() + 1 : 12;

  // Prepare earningStats array (no cumulative)
  const earningStats = [];
  for (let i = 0; i < limitMonth; i++) {
    earningStats.push({
      month: months[i],
      earning: Number(earningsByMonth[i].toFixed(2)),
    });
  }

  // Calculate total earning for the period returned
  const totalEarning = earningStats.reduce((acc, item) => acc + item.earning, 0);

  return {
    year,
    totalEarning: Number(totalEarning.toFixed(2)),
    earningStats,
  };
};


const toggleProfileUpdate = async (userId: string) => {
  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Toggle user status between 'active' and 'delete'
  user.status = user.status === 'active' ? 'delete' : 'active';
  await user.save();

  return user;
}


const deleteAccount = async (password: string, userId: string) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  // Use User.isMatchPassword
  const isMatch = await User.isMatchPassword(password, user.password);
  if (!isMatch) {
    throw new Error('Incorrect password');
  }

  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) {
    throw new Error('User not found');
  }
  return deletedUser;
}


export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  unfollowUser,
  getAllUsers,
  getUserProfileByIdFromDB,
  getUserActivityFromDB,
  statistics,
  getUserStatistics,
  getAllEarningStatistics,
  toggleProfileUpdate,
  deleteAccount

};
