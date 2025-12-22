import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyEmailToDB(req.body.otp);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data:result.token
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUserFromDB(loginData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User logged in successfully.',
    data: result.data,
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  const result = await AuthService.forgetPasswordToDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Please check your email. We have sent you a password reset link.',
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { ...resetData } = req.body;
  const result = await AuthService.resetPasswordToDB(resetData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully reset.',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...passwordData } = req.body;
  await AuthService.changePasswordToDB(user, passwordData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully changed',
  });
});

const resendEmail = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  await AuthService.resendEmailToDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'OTP successfully sent',
  });
});

const verifyOTPToDb = catchAsync(async (req: Request, res: Response) => {
  const {email, otp} = req.body;
  await AuthService.verifyOTP(email,otp);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'OTP successfully sent',
  });
});

export const AuthController = {
  resendEmail,
  verifyEmail,
  loginUser,
  forgetPassword,
  resetPassword,
  changePassword,
  verifyOTPToDb
};
