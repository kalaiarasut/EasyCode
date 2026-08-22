import { NextRequest, NextResponse } from "next/server";
import { emailValidation } from "@/schemas/forgetPasswordSchema";
import { supabase } from "@/lib/supabaseClient";
import { sendForgetPasswordVerificationEmail } from "@/helpers/sendForgetPasswordVerificationEmail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const parseData = emailValidation.safeParse({ email });
    if (!parseData.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseData.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!user || error) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with this email address",
        },
        { status: 404 }
      );
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("users")
      .update({
        verify_code: verifyCode,
        verify_code_expiry: expiry,
      })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    const emailResponse = await sendForgetPasswordVerificationEmail(
      user.email,
      user.username,
      verifyCode
    );

    if (!emailResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password reset code sent successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Something went wrong while sending forget password email: ", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Something went wrong while sending forget password email",
      },
      { status: 500 }
    );
  }
}