import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IUserToken } from './userToken.interface';
import { UserTokenService } from './userToken.service';

const createToken = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  const result = await UserTokenService.createToken(id);

  sendResponse<IUserToken>(res, {
    statusCode: 200,
    success: true,
    message: 'UserToken created successfully!',
    data: result,
  });
});

const getSingleToken = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  const result = await UserTokenService.getSingleToken(id);

  sendResponse<IUserToken>(res, {
    statusCode: 200,
    success: true,
    message: 'UserToken retrieved successfully!',
    data: result,
  });
});

export const UserTokenController = {
  createToken,
  getSingleToken,
};
