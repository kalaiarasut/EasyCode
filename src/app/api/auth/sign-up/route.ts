import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { supabase } from "@/lib/supabaseClient";
import { signUpValidation } from "@/schemas/signUpSchema";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, email, password } = body;

        if (!username || !email || !password) {
            return NextResponse.json({
                success: false,
                message: "All fields are required"
            }, { status: 400 });
        }

        // zod validation
        const parsedData = signUpValidation.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json({
                success: false,
                message: parsedData.error.issues[0].message,
            }, { status: 400 });
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (existingUser && existingUser.is_verified) {
            return NextResponse.json({
                success: false,
                message: "User is already registered with this email"
            }, { status: 400 });
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashPassword = await bcrypt.hash(password, 10);
        const verifyCodeExpiry = new Date(Date.now() + (10 * 60 * 1000)).toISOString();
        let userId: string;

        if (existingUser && !existingUser.is_verified) {
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({
                    username,
                    password_hash: hashPassword,
                    verify_code: verifyCode,
                    verify_code_expiry: verifyCodeExpiry
                })
                .eq('id', existingUser.id)
                .select('id')
                .single();

            if (updateError) throw updateError;
            userId = updatedUser.id;
        } else {
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    username,
                    email,
                    password_hash: hashPassword,
                    verify_code: verifyCode,
                    verify_code_expiry: verifyCodeExpiry,
                    is_verified: false
                })
                .select('id')
                .single();

            if (insertError) throw insertError;
            userId = newUser.id;
        }

        // send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode, userId);
        if (!emailResponse.success) {
            return NextResponse.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "User registered successfully. Please verify your email",
            userId
        }, { status: 201 });
    } catch (error: any) {
        console.error("Something went wrong while registering user: ", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Something went wrong while registering user"
        }, { status: 500 });   
    }
}