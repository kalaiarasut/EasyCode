import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, userId } = body;

        if (!email && !userId) {
            return NextResponse.json({
                success: false,
                message: "Email or userId is required"
            }, { status: 400 });
        }

        let query = supabase.from('users').select('*');
        if (userId) {
            query = query.eq('id', userId);
        } else {
            query = query.eq('email', email);
        }

        const { data: user, error } = await query.maybeSingle();

        if (!user || error) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        if (user.is_verified) {
            return NextResponse.json({
                success: true,
                message: "User is already verified. You can sign in now.",
                isVerified: true
            }, { status: 200 });
        }

        const newVerifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const newExpiry = new Date(Date.now() + (15 * 60 * 1000)).toISOString();

        const { error: updateError } = await supabase
            .from('users')
            .update({
                verify_code: newVerifyCode,
                verify_code_expiry: newExpiry
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        await sendVerificationEmail(user.email, user.username, newVerifyCode, user.id);

        return NextResponse.json({
            success: true,
            message: "A new verification link has been sent to your email",
            userId: user.id
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error resending code:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to resend verification link"
        }, { status: 500 });
    }
}
