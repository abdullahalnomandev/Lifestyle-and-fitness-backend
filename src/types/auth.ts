import { USER_AUTH_PROVIDER } from "../app/modules/user/user.constant";

export type IVerifyEmail = {
  email: string;
  verify_token: string;
};

export type ILoginData = {
  email: string;
  password: string;
  auth_provider: USER_AUTH_PROVIDER.GOOGLE | USER_AUTH_PROVIDER.MOBILE | USER_AUTH_PROVIDER.LOCAL
  google_id_token:string;
  apple_id_token:string;
};

export type IAuthResetPassword = {
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

export type IChangePassword = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
