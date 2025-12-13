import config from '../config';
import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  return {
    to: values.email,
    subject: 'Verify your account',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Account</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background: #f7f8fa; margin: 0; padding: 0;">
  <div style="max-width: 440px; margin: 40px auto; background: #111132; border-radius: 18px; padding: 38px 26px 32px 26px; box-shadow: 0 8px 24px rgba(0,0,0,0.13); text-align: center;">
    <!-- Title -->
    <h1 style="color: #fff; font-size: 22px; font-weight: 700; margin: 0 0 18px 0; letter-spacing: 0.5px;">
      Verify Your Account
    </h1>
    <!-- Greeting -->
    <p style="color: #b3b3d1; font-size: 15px; margin: 0 0 22px 0; line-height: 1.6;">
      Hi,
    </p>
    <!-- Message -->
    <p style="color: #b3b3d1; font-size: 15px; margin: 0 0 30px 0; line-height: 1.6;">
      Thank you for signing up! Please use the verification code below to activate your account.
    </p>
    <!-- OTP Code Box -->
    <div style="display: inline-block; background: #6C2FF9; color: #fff; font-size: 28px; font-weight: 700; letter-spacing: 8px; padding: 18px 0; width: 170px; border-radius: 12px; box-shadow: 0 2px 8px rgba(108,47,249,0.13); margin-bottom: 28px;">
      ${values.otp}
    </div>
    <!-- Expiration Note -->
    <p style="font-size: 13px; color: #9999b3; margin: 28px 0 0 0;">
      This code will expire in <strong style="color: #fff;">3 minutes</strong>.
    </p>
    <!-- Footer -->
    <p style="font-size: 12px; color: #777799; margin: 22px 0 0 0; line-height: 1.6;">
      If you didn’t request this code, you can safely ignore this email.<br />
      For security reasons, do not share this code with anyone.
    </p>
  </div>
</body>
</html>
`,
  };
};

const resetPassWord = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background: #f7f8fa; margin: 0; padding: 0;">
  <div style="max-width: 440px; margin: 40px auto; background: #111132; border-radius: 18px; padding: 38px 26px 32px 26px; box-shadow: 0 8px 24px rgba(0,0,0,0.13); text-align: center;">
    <!-- Title -->
    <h1 style="color: #fff; font-size: 22px; font-weight: 700; margin: 0 0 18px 0; letter-spacing: 0.5px;">
      Verification Code
    </h1>
    <!-- Greeting -->
    <p style="color: #b3b3d1; font-size: 15px; margin: 0 0 22px 0; line-height: 1.6;">
Hi <strong style="color: #fff;">
  ${values && values.name ? values.name.split(' ')[0] : ''}
</strong>,    </p>
    <!-- Message -->
    <p style="color: #b3b3d1; font-size: 15px; margin: 0 0 30px 0; line-height: 1.6;">
      Use the code below to securely sign in to your account.
    </p>
    <!-- OTP Code Box -->
    <div style="display: inline-block; background: #6C2FF9; color: #fff; font-size: 28px; font-weight: 700; letter-spacing: 8px; padding: 18px 0; width: 170px; border-radius: 12px; box-shadow: 0 2px 8px rgba(108,47,249,0.13); margin-bottom: 28px;">
      ${values.otp}
    </div>
    <!-- Expiration Note -->
    <p style="font-size: 13px; color: #9999b3; margin: 28px 0 0 0;">
      This code will expire in <strong style="color: #fff;">3 minutes</strong>.
    </p>
    <!-- Footer -->
    <p style="font-size: 12px; color: #777799; margin: 22px 0 0 0; line-height: 1.6;">
      If you didn’t request this code, you can safely ignore this email.<br />
      For security reasons, do not share this code with anyone.
    </p>
  </div>
</body>
</html>
`,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassWord,
};
