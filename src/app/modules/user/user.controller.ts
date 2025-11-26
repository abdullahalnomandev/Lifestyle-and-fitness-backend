import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      mobile,
      email,
      password,
      confirm_password,
      google_id_token,
      auth_provider,
    } = req.body;

    const result = await UserService.createUserToDB({
      name,
      mobile,
      email,
      password,
      confirm_password,
      google_id_token,
      auth_provider,
    });
    const responseData = auth_provider === 'local' ? undefined : result;
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message:
        auth_provider === 'local'
          ? 'User created successfully. Please verify your email.'
          : 'User created successfully',
      ...(responseData && { data: responseData }), // Only include data if not local
    });
  }
);

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');
    let cover_image = getSingleFilePath(req.files, 'cover_image');

    const data: any = {
      ...req.body,
    };

    if (image && image !== 'undefined') {
      data.image = image;
    }
    if (cover_image && cover_image !== 'undefined') {
      data.cover_image = cover_image;
    }

    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const updateSkypeProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.updateSkypeProfileToDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated skyped successfully.',
  });
});

// Add followUser
const toggleFollowUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const targetId = req.params.id;
  const { fcmToken } = req.query;


  const result = await UserService.toggleFollowUser(userId, targetId,fcmToken as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.data,
  });
});

// Add unfollowUser
const unfollowUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const targetId = req.params.id;

  await UserService.unfollowUser(userId, targetId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully unfollowed the user.',
  });
});

// Add getUserProfileById
const getUserProfileById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const requestUser = req.params?.id;

  const result = await UserService.getUserProfileByIdFromDB(
    userId,
    requestUser
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

// Add getFollowerList
const getFollowerList = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const requestUserId = req.params?.id;

  const patinationOptions = pick(req.query, paginationFields);
  const result = await UserService.getFollowerListFromDB(
    requestUserId,
    userId,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Follower list retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});
// Add getFollowingList
const getFollowingList = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const requestUserId = req.params?.id;

  const result = await UserService.getFollowingListFromDB(
    requestUserId,
    userId,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Following list retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getAllNotificationSettings = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const result = await UserService.getAllNotificationSettingsFromDB(userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Notification settings retrieved successfully',
      data: result,
    });
  }
);

const updateNotificationSettings = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const result = await UserService.updateNotificationSettingsFromDB(
      userId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Notification settings updated successfully',
      data: result,
    });
  }
);

export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  updateSkypeProfile,
  toggleFollowUser,
  unfollowUser,
  getAllUsers,
  getUserProfileById,
  getFollowerList,
  getFollowingList,
  getAllNotificationSettings,
  updateNotificationSettings,
};
