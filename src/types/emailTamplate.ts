export type ICreateAccount = {
  email: string;
  otp: string;
  name?:string;
};

export type IResetPassword = {
  email: string;
  otp: string;
};
