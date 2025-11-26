export type ICreateAccount = {
  email: string;
  otp: string;
};

export type IResetPassword = {
  email: string;
  resetLink: string;
};
