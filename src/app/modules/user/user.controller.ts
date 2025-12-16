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

    const data: any = {
      ...req.body,
    };

    if (image && image !== 'undefined') {
      data.image = image;
    }

    if (req.body.shipping_address) {
      data.shipping_address = JSON.parse(req.body.shipping_address);
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

const getUserActivity = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const requestUserId = req.params?.id;

  const result = await UserService.getUserActivityFromDB(
    requestUserId,
    userId,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Activity list retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getStatistics = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.statistics();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User Statistics retrieved successfully',
    data: result,
  });
});

const UserStatistics = catchAsync(async (req: Request, res: Response) => {
  const year = Number(req.query?.year) || new Date().getFullYear();
  const userId = req?.user?.id;
  const result = await UserService.getUserStatistics(year, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User Statistics retrieved successfully',
    data: result,
  });
});

const UserEarningStatistics = catchAsync(async (req: Request, res: Response) => {
  const year = Number(req.query?.year) || new Date().getFullYear();
  const userId = req?.user?.id;
  const result = await UserService.getAllEarningStatistics(year);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User earning statistics retrieved successfully',
    data: result,
  });
});


const toggleProfileUpdate = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await UserService.toggleProfileUpdate(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User profile update status toggled successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  unfollowUser,
  getAllUsers,
  getUserProfileById,
  getUserActivity,
  UserStatistics,
  getStatistics,
  UserEarningStatistics,
  toggleProfileUpdate
};
