import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
} from '../../../types/auth';
import { USER_AUTH_PROVIDER } from '../user/user.constant';
import { User } from '../user/user.model';
import {
  getAppleUserInfoWithToken,
  getUserInfoWithToken,
} from '../user/user.util';
import { IUser } from '../user/user.interface';
import generateOTP from '../../../util/generateOTP';
import { ICreateAccount } from '../../../types/emailTamplate';

//login
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password, google_id_token, apple_id_token } = payload;

  let userInfo = null;

  //GOOGLE LOGIN
  if (payload.auth_provider === USER_AUTH_PROVIDER.GOOGLE && google_id_token) {
    const tokenData = await getUserInfoWithToken(google_id_token);
    const userEmail = tokenData?.data?.email;
    userInfo = await User.findOne({ email: userEmail }).select('+password');
  }
  //APPLE LOGIN
  else if (
    payload.auth_provider === USER_AUTH_PROVIDER.MOBILE &&
    apple_id_token
  ) {
    const tokenData = await getAppleUserInfoWithToken(apple_id_token);
    const userEmail = tokenData.data.email;
    userInfo = await User.findOne({ email: userEmail }).select('+password');
  }
  // LOCAL LOGIN
  else {
    if (payload.auth_provider === USER_AUTH_PROVIDER.LOCAL && password) {
      const isExist = await User.exists({ email: payload.email })
        .select('+auth_provider')
        .lean();
      if (
        isExist?.auth_provider === USER_AUTH_PROVIDER.GOOGLE ||
        isExist?.auth_provider === USER_AUTH_PROVIDER.MOBILE
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Auth provider not correct! You have to login with ${isExist.auth_provider}`
        );
      }

      userInfo = await User.findOne({ email }).select('+password');

      if (
        userInfo &&
        !(await User.isMatchPassword(password, userInfo.password))
      ) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
      }
    }
  }

  if (!userInfo) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //check verified and status
  if (!userInfo.verified) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account, then try to login again'
    );
  }

  //check user status
  if (userInfo.status === 'delete') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You don’t have permission to access this content.It looks like your account has been deleted.'
    );
  }

  //create token
  const createToken = jwtHelper.createToken(
    { id: userInfo._id, role: userInfo.role, email: userInfo.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return { data: { accessToken: createToken } };
};

//forget password
const forgetPasswordToDB = async (email: string) => {
  const isExistUser = (await User.isExistUserByEmail(email)) as IUser;
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email,
    name: isExistUser.name,
  };
  const forgetPassword = emailTemplate.resetPassWord(value as any);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authorization = {
    isResetPassword: false,
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findByIdAndUpdate(isExistUser._id, { $set: { authorization } });
};

// VERIFY ACC. WITH OTP
const verifyEmailToDB = async (otp: string) => {
  const registeredUser = (await User.findOne(
    { 'authorization.oneTimeCode': otp },
    '_id verified authorization role'
  ).lean()) as IUser;

  if (!registeredUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP is not valid.');
  }

  if (registeredUser.verified) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'This account already verified'
    );
  }

  // Check if authentication, OTP, and expireAt exist
  if (!registeredUser?.authorization?.oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'OTP not found or not requested'
    );
  }

  // Check OTP match
  if (registeredUser?.authorization?.oneTimeCode !== otp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP');
  }

  // Check OTP expiry
  const now = new Date();
  if (
    registeredUser.authorization.expireAt &&
    registeredUser.authorization.expireAt < now
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP has expired');
  }

  // Mark user as verified and clear OTP
  await User.findByIdAndUpdate(
    registeredUser._id,
    {
      $set: {
        verified: true,
        'authorization.oneTimeCode': null,
        'authorization.expireAt': null,
      },
    },
    { new: true }
  );

  //create token
  const createToken = jwtHelper.createToken(
    { id: registeredUser._id, role: registeredUser.role },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return { message: 'Account verified successfully', token: createToken };
};

//forget password
const resetPasswordToDB = async (payload: IAuthResetPassword) => {
  const { newPassword, confirmPassword, otp } = payload;
  //isExist token
  const isExistToken = await User.findOne({ 'authorization.oneTimeCode': otp });
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token is not valid!');
  }

  // Check OTP expiry
  const now = new Date();
  if (
    isExistToken.authorization &&
    isExistToken.authorization.expireAt &&
    isExistToken.authorization.expireAt < now
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP has expired');
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    token: null,
  };

  await User.findOneAndUpdate({ _id: isExistToken._id }, updateData, {
    new: true,
  });
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Current password is incorrect'
    );
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    token: null,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};

const resendEmailToDB = async (email: string) => {
  const registeredUser = await User.findOne({ email }).lean();

  if (registeredUser?.verified) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'This account already verified'
    );
  }

  if (!registeredUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp: otp.toString(),
    email: registeredUser.email,
  };
  const verifyAccount = emailTemplate.createAccount(value as ICreateAccount);
  emailHelper.sendEmail(verifyAccount);

  // Save OTP and expiry to DB
  const authorization = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findByIdAndUpdate(registeredUser._id, { $set: { authorization } });

  return { message: 'OTP resend successfully' };
};

export const AuthService = {
  resendEmailToDB,
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
};
