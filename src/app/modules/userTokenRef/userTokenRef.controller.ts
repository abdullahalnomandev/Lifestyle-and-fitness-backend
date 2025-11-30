import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUserTokenRef } from './userTokenRef.interface';
import { UserTokenRefService } from './userTokenRef.service';

const createUserTokenRef = catchAsync(async (req: Request, res: Response) => {
  const { ...userTokenRefData } = req.body;
  const result = await UserTokenRefService.createUserTokenRef(userTokenRefData);

  sendResponse<IUserTokenRef>(res, {
    statusCode: 200,
    success: true,
    message: 'UserTokenRef created successfully!',
    data: result,
  });
});

const getSingleUserTokenRef = catchAsync(
  async (req: Request, res: Response) => {
    const { ref } = req.params;
    const result = await UserTokenRefService.getSingleUserTokenRef(ref);

    sendResponse<IUserTokenRef>(res, {
      statusCode: 200,
      success: true,
      message: 'UserTokenRef retrieved successfully!',
      data: result,
    });
  }
);

const updateUserTokenRef = catchAsync(async (req: Request, res: Response) => {
  const { ref } = req.params;
  const { ...userTokenRefData } = req.body;
  const result = await UserTokenRefService.updateUserTokenRef(
    ref,
    userTokenRefData
  );

  sendResponse<IUserTokenRef>(res, {
    statusCode: 200,
    success: true,
    message: 'UserTokenRef updated successfully!',
    data: result,
  });
});

const deleteUserTokenRef = catchAsync(async (req: Request, res: Response) => {
  const { ref } = req.params;
  const result = await UserTokenRefService.deleteUserTokenRef(ref);

  sendResponse<IUserTokenRef>(res, {
    statusCode: 200,
    success: true,
    message: 'UserTokenRef deleted successfully!',
    data: result,
  });
});

export const UserTokenRefController = {
  createUserTokenRef,
  getSingleUserTokenRef,
  updateUserTokenRef,
  deleteUserTokenRef,
};
