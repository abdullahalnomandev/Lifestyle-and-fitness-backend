import { IBookingClass } from '../app/modules/bookingClass/bookingClass.interface';
import { IClass } from '../app/modules/class/class.interface';
import config from '../config';
import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  return {
    to: values.email,
    subject: 'Verify your account',
    html: `
<body style="margin:0;padding:0;min-height:100vh;width:100vw;background:#232323;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:420px;margin:40px auto 0 auto;background:#232323;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(32,19,67,.16);">
    <div style="padding:44px 32px 36px 32px;">
      <h1 style="color:#fff;font-size:2.1rem;font-weight:700;margin-bottom:12px;text-align:left;">Verify Account</h1>
      <p style="color:#adadad;font-size:15px;line-height:1.6;margin-bottom:6px;text-align:left;">
        Enter your verification code that we have sent to your email
      </p>
      <p style="color:#fffefe;font-size:15px;margin-bottom:30px;text-align:left;letter-spacing:0.3px;">
        ${values.email}
      </p>
      <div style="color:#adadad;font-size:15px;margin-bottom:16px;">Enter Code</div>
      <div style="display:flex;justify-content:space-between;gap:10px;max-width:320px;margin:0 auto 28px auto;">
        ${String(values.otp)
          .split('')
          .map(
            (d: string) =>
              `<span style="display:inline-block;width:36px;height:44px;border-bottom:2.4px solid #949494;
            text-align:center;font-size:2.2rem;color:#fff;font-weight:500;line-height:44px;">${d}</span>`
          )
          .join('')}
      </div>
      <button style="width:100%;background:#dffe60;color:#232323;font-size:1.15rem;
        font-weight:600;border:none;border-radius:26px;padding:16px 0;cursor:pointer;transition:background .2s;">
        verify
      </button>
    </div>
  </div>
</body>
`,
  };
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `
<body style="margin:0;padding:0;min-height:100vh;width:100vw;font-family:'Inter',Arial,sans-serif;background:#f6f8fa;">
  <div style="max-width:600px;margin:40px auto;padding:40px;background:#fff;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    <h1 style="color:#20274d;font-size:1.6rem;font-weight:700;margin-bottom:16px;">Reset your password</h1>
    <p style="color:#333;font-size:16px;line-height:1.6;margin-bottom:24px;">
      We received a request to reset your password. Click the button below to continue:
    </p>

    <a href="${values.resetLink}" 
      style="display:inline-block;background:#277E16;color:#fff;text-decoration:none;
      font-size:16px;font-weight:600;padding:12px 28px;border-radius:6px;margin:20px 0;">
      Reset Password
    </a>

    <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
    <div style="text-align:center;color:#888;font-size:13px;">
      You're receiving this email because you have an account with LunaSpin.app
    </div>
    <div style="text-align:center;margin-top:10px;">
      <a href="#" style="color:#888;text-decoration:none;margin:0 10px;">Privacy Policy</a> •
      <a href="#" style="color:#888;text-decoration:none;margin:0 10px;">Terms</a>
    </div>
  </div>
</body>
`,
  };
  return data;
};

const updateCompletedWelcomeEmail = (email: string) => {
  return {
    to: email,
    subject: 'Welcome to Lunspain',
    html: `
    <body>
    <h1>Welcome to Lunspain</h1>
    <p>Your profile has been updated successfully.</p>
    </body>
  `,
  };
};

const completeAccount = (email: string) => {
  return {
    to: email,
    subject: 'Complete your Lunspain account',
    html: `
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your account has been completed successfully.</p>
        </div>
    </div>
    <h1>Finish setting up your Lunspain account</h1>
    <p>Your account has been completed successfully.</p>
    </body>
  `,
  };
};

const WelcomMessageForClubCreation = (email: string) => {
  return {
    to: email,
    subject: 'Welcome to Lunspain',
    html: `
    <body>
    <h1>Welcome to Lunspain</h1>
    <p>Your club has been created successfully.</p>
  `,
  };
};

const WelcomMessageForClassCreation = (email: string) => {
  return {
    to: email,
    subject: 'Welcome to Lunspain',
    html: `
    <body>
    <h1>Welcome to Lunspain</h1>
    <p>Your class has been created successfully.</p>
    </body>
  `,
  };
};

const WelcomMessageForClassBooking = (email: string) => {
  return {
    to: email,
    subject: 'Welcome to Lunspain',
    html: `
    <body>
    <h1>Welcome to Lunspain</h1>
    <p>Your class has been booked successfully.</p>
    </body>
  `,
  };
};

const WelcomeMessageForWaitingList = (
  email: string,
  waitingEntry: IBookingClass
) => {
  return {
    to: email,
    subject: 'Welcome to Lunspain',
    html: `
    <body>
    <h1>Welcome to Lunspain</h1>
    <p>You have been added to the waiting list for this class.</p>
    <p>Name: ${waitingEntry.class}</p>
    <p>Class Booking Ref ID: ${waitingEntry.class_booking_ref_id}</p>
    <p>Booking ID: ${waitingEntry.booking_id}</p>
    <p>Price of Class: ${waitingEntry.price_of_class}</p>
    </body>
  `,
  };
};

const MessageForCancellation = (booking: IBookingClass, email: string) => {
  return {
    to: email,
    subject: 'Welcome to Lunspain',
    html: `
    <body>
    <h1>Welcome to Lunspain ${booking.booking_id} payment method: ${booking.payment_method} </h1>
    <p>Your class booking has been cancelled successfully.</p>
    <p>Refund Staus:Canclled</p>
    </body>
  `,
  };
};

const WelcomeMessageForAcceptSpeceASQue = (
  email: string,
  classInfo: IClass,
  classBookingRefId: string,
  bookingId: string
) => {
  return {
    to: email,
    subject: `Spot available – confirm your class ${classInfo.class_name}`,
    html: `
<body style="margin:0;padding:0;min-height:100vh;width:100vw;font-family:'Inter',Arial,sans-serif;background:#f6f8fa;">
  <div style="max-width:600px;margin:40px auto;padding:40px;background:#fff;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    <h1 style="color:#20274d;font-size:1.6rem;font-weight:700;margin-bottom:16px;">A spot just opened up!</h1>
    <p style="color:#333;font-size:16px;line-height:1.6;margin-bottom:12px;">
      Great news—someone cancelled and you’re next on the waiting list.
    </p>

    <table style="width:100%;border-collapse:collapse;margin:24px 0;">
      <tr>
        <td style="padding:8px 0;color:#555;font-weight:600;">Class:</td>
        <td style="padding:8px 0;color:#222;">${classInfo.class_name}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#555;font-weight:600;">Start:</td>
        <td style="padding:8px 0;color:#222;">${classInfo.start_time.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#555;font-weight:600;">Booking ref:</td>
        <td style="padding:8px 0;color:#222;">${classBookingRefId}</td>
      </tr>
    </table>

    <a href="${
      config.front_end_app_url
    }/accept-class?lassRef=${classBookingRefId}" 
       style="display:inline-block;background:#277E16;color:#fff;text-decoration:none;font-size:16px;font-weight:600;padding:12px 28px;border-radius:6px;margin:20px 0;">
      Accept my spot
    </a>

    <p style="color:#666;font-size:14px;margin-top:20px;">
      If you don’t confirm within the next 6 hours we’ll offer the spot to the next person in line.
    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
    <div style="text-align:center;color:#888;font-size:13px;">
      You’re receiving this email because you joined the waiting list at Lunspain.
    </div>
    <div style="text-align:center;margin-top:10px;">
      <a href="${
        config.front_end_app_url
      }/privacy" style="color:#888;text-decoration:none;margin:0 10px;">Privacy Policy</a> •
      <a href="${
        config.front_end_app_url
      }/terms"   style="color:#888;text-decoration:none;margin:0 10px;">Terms</a>
    </div>
  </div>
</body>
`,
  };
};

const RequestToCloseClub = (email: string) => {
  return {
    to: email,
    subject: 'Request to close club',
    html: `
    <body>
    <h1>Request to close club</h1>
    <p>You have requested to close your club. We will close your club after 48 hours if you do not provide marketing permission.</p>
    </body>
  `,
  };
};

const AccountClosedNotificaiton = (email: string) => {
  return {
    to: email,
    subject: 'Account closed',
    html: `
    <body>
    <h1>Account closed</h1>
    <p>Your account has been closed. If you have any questions, please contact us.</p>
    </body>
  `,
  };
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  updateCompletedWelcomeEmail,
  completeAccount,
  WelcomMessageForClubCreation,
  WelcomMessageForClassCreation,
  WelcomMessageForClassBooking,
  WelcomeMessageForWaitingList,
  MessageForCancellation,
  WelcomeMessageForAcceptSpeceASQue,
  RequestToCloseClub,
  AccountClosedNotificaiton,
};
