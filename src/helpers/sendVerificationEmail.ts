import { transporter, getFromEmail } from "@/lib/nodemailer";
import { ApiResponse } from "@/types/ApiResponse";

export const sendVerificationEmail = async (
  email: string,
  username: string,
  verifyCode: string,
  userId?: string
): Promise<ApiResponse> => {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/auth/confirm?${userId ? `userId=${userId}&` : ""}code=${verifyCode}&email=${encodeURIComponent(email)}`;

  const smtpUser = process.env.SMTP_EMAIL || process.env.EMAIL_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  // If no SMTP credentials are provided, log the code to console so local dev sign-up works smoothly
  if (!smtpUser || !smtpPass) {
    console.log(`\n=======================================================`);
    console.log(`[GMAIL SMTP NOT CONFIGURED - LOGGING OTP TO CONSOLE]`);
    console.log(`User: ${username} <${email}>`);
    console.log(`OTP Code: ${verifyCode}`);
    console.log(`1-Click Verification URL: ${verifyUrl}`);
    console.log(`(To send real emails, add SMTP_EMAIL and SMTP_PASSWORD to your .env.local)`);
    console.log(`=======================================================\n`);
    return {
      success: true,
      message: "Verification code generated (logged to terminal in dev mode)",
    };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm your EasyCode Email</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f7f9; margin: 0; padding: 40px 10px; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .logo { font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.5px; margin-bottom: 24px; text-transform: uppercase; }
        .title { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 12px 0; }
        .desc { font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 24px 0; }
        .otp-box { text-align: center; margin: 28px 0; }
        .otp { display: inline-block; font-family: monospace; font-size: 28px; font-weight: 800; letter-spacing: 8px; color: #111827; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 28px; }
        .btn-wrapper { text-align: center; margin: 24px 0; }
        .btn { display: inline-block; background-color: #111827; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; }
        .footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⚡ EasyCode</div>
        <h1 class="title">Confirm your email address</h1>
        <p class="desc">Hello <strong>${username}</strong>,<br>Thanks for signing up for EasyCode! Use the verification code below to activate your account and start solving coding challenges.</p>
        
        <div class="otp-box">
          <div class="otp">${verifyCode}</div>
        </div>

        <div class="btn-wrapper">
          <a href="${verifyUrl}" class="btn">Confirm Email &amp; Sign In</a>
        </div>

        <div class="footer">
          This verification code will expire in 15 minutes. If you did not request this email, please ignore it safely.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: getFromEmail(),
      to: email,
      subject: `Your EasyCode Verification Code: ${verifyCode}`,
      html: htmlContent,
    });

    return {
      success: true,
      message: "Verification email sent successfully via Gmail SMTP",
    };
  } catch (error: any) {
    console.error("Error sending verification email via Nodemailer: ", error);
    return {
      success: false,
      message: error.message || "Failed to send verification email",
    };
  }
};