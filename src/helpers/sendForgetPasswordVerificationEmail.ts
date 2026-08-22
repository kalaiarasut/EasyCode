import { transporter, getFromEmail } from "@/lib/nodemailer";
import { ApiResponse } from "@/types/ApiResponse";

export const sendForgetPasswordVerificationEmail = async (
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> => {
  const smtpUser = process.env.SMTP_EMAIL || process.env.EMAIL_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  // If no SMTP credentials are provided, log the code to console so local dev works
  if (!smtpUser || !smtpPass) {
    console.log(`\n=======================================================`);
    console.log(`[PASSWORD RESET CODE - LOGGED TO CONSOLE]`);
    console.log(`User: ${username} <${email}>`);
    console.log(`Reset Code: ${verifyCode}`);
    console.log(`=======================================================\n`);
    return {
      success: true,
      message: "Reset code generated (logged to terminal in dev mode)",
    };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Reset your EasyCode Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f7f9; margin: 0; padding: 40px 10px; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .logo { font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.5px; margin-bottom: 24px; text-transform: uppercase; }
        .title { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 12px 0; }
        .desc { font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 24px 0; }
        .otp-box { text-align: center; margin: 28px 0; }
        .otp { display: inline-block; font-family: monospace; font-size: 28px; font-weight: 800; letter-spacing: 8px; color: #111827; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 28px; }
        .footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⚡ EasyCode</div>
        <h1 class="title">Reset Your Password</h1>
        <p class="desc">Hello <strong>${username}</strong>,<br>We received a request to reset your EasyCode account password. Enter the code below to set a new password:</p>
        
        <div class="otp-box">
          <div class="otp">${verifyCode}</div>
        </div>

        <div class="footer">
          This code is valid for 15 minutes. If you did not request a password reset, please ignore this email or check your account security.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: getFromEmail(),
      to: email,
      subject: `Your EasyCode Password Reset Code: ${verifyCode}`,
      html: htmlContent,
    });

    return {
      success: true,
      message: "Reset code sent successfully via Gmail SMTP",
    };
  } catch (error: any) {
    console.error("Error sending reset password email via Nodemailer: ", error);
    return {
      success: false,
      message: error.message || "Failed to send reset code email",
    };
  }
};