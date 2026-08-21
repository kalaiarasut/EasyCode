import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export const sendVerificationEmail = async (
    email: string,
    username: string,
    verifyCode: string,
    userId?: string
): Promise<ApiResponse> => {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/auth/confirm?${userId ? `userId=${userId}&` : ''}code=${verifyCode}&email=${encodeURIComponent(email)}`;

    // If no valid Resend API key is provided, log the code and 1-click link to console so local dev sign-up works effortlessly
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_dev")) {
        console.log(`\n=======================================================`);
        console.log(`[DEV EMAIL VERIFICATION] User: ${username} <${email}>`);
        console.log(`[OTP CODE]: ${verifyCode}`);
        console.log(`[1-CLICK AUTH URL]: ${verifyUrl}`);
        console.log(`=======================================================\n`);
        return { success: true, message: "Verification code sent (logged to console in dev mode)" };
    }

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: "Confirm your EasyCode email address",
            react: VerificationEmail({ username, otp: verifyCode, verifyUrl })
        });
        
        return { success: true, message: "Verification email sent successfully" };
    } catch (error) {
        console.error("Error sending verification email: ", error);
        return { success: false, message: "Failed to send verification email" };
    }
};