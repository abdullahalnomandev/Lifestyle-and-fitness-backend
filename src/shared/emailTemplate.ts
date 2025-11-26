import { IBookingClass } from '../app/modules/bookingClass/bookingClass.interface';
import { IClass } from '../app/modules/class/class.interface';
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
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; ">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px; color: #e0e0e0;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                                Hello,
                            </p>
                            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                                Thank you for signing up! Please use the following One-Time Password (OTP) to verify your email address:
                            </p>
                            
                            <!-- OTP Box -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <div style="background-color: #2a2a2a; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
                                            <p style="margin: 0 0 10px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
                                            <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;"> ${values.otp}</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                                <tr>
                                    <td style="background-color: #2a2a2a; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
                                        <p style="margin: 0; color: #f59e0b; font-size: 14px; font-weight: bold;">⚠️ Important</p>
                                        <p style="margin: 5px 0 0 0; color: #b0b0b0; font-size: 14px; line-height: 1.5;">
                                            This code will expire in <strong style="color: #f59e0b;">3 minutes</strong>. Please enter it promptly to complete your verification.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; color: #999;">
                                If you didn't request this verification, please ignore this email or contact our support team if you have concerns.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`,
  };
};

const verifyAccount = (values: {
  email: string;
  otp: number;
  name: string;
}) => {
  const data = {
    to: values.email,
    subject: 'Verify Your Account',
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
      Hi <strong style="color: #fff;">${values.name.split(' ')[0]}</strong>,
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
  return data;
};

export const emailTemplate = {
  createAccount,
  verifyAccount,
};
