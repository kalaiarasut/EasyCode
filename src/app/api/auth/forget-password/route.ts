import { NextRequest, NextResponse } from "next/server";
import { forgetPasswordValidation } from "@/schemas/forgetPasswordSchema";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, code } = body;

    if (!email || !password || !code) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // zod validation
    const parseData = forgetPasswordValidation.safeParse(body);
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
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const isCodeValid = user.verify_code === code;
    const isCodeNotExpired = user.verify_code_expiry
      ? new Date(user.verify_code_expiry) > new Date()
      : false;

    if (!isCodeValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect reset code",
        },
        { status: 400 }
      );
    }

    if (!isCodeNotExpired) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset code has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: hashedPassword,
        verify_code: null,
        verify_code_expiry: null,
      })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password updated successfully! You can now sign in.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Something went wrong while resetting password: ", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Something went wrong while resetting password",
      },
      { status: 500 }
    );
  }
}