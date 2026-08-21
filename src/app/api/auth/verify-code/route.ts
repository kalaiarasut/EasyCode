import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { verifyCodeValidation } from "@/schemas/verifyCodeSchema";

export async function POST(req: NextRequest) {
    try {
        const { id, code } = await req.json();

        if (!id || !code) {
            return NextResponse.json({
                success: false,
                message: "All fields are required"
            }, { status: 400 });
        }

        // zod validation
        const parsedData = verifyCodeValidation.safeParse({ code });
        if (!parsedData.success) {
            return NextResponse.json({
                success: false,
                message: parsedData.error.issues[0].message,
            }, { status: 400 });
        }

        const decodedId = decodeURIComponent(id);
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', decodedId)
            .maybeSingle();

        if (!user || error) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        if (user.is_verified) {
            return NextResponse.json({
                success: false,
                message: "This account is already verified"
            }, { status: 400 });
        }

        const isCodeValid = user.verify_code === code;
        const isCodeNotExpired = user.verify_code_expiry ? new Date(user.verify_code_expiry) > new Date() : false;

        if (isCodeValid && isCodeNotExpired) {
            const { error: updateError } = await supabase
                .from('users')
                .update({ 
                    is_verified: true, 
                    verify_code: null, 
                    verify_code_expiry: null 
                })
                .eq('id', decodedId);

            if (updateError) throw updateError;

            return NextResponse.json({
                success: true,
                message: "Account verified successfully"
            }, { status: 200 });
        } else if (!isCodeNotExpired) {
            return NextResponse.json({
                success: false,
                message: "Verification code expired, please signup again to get a new code"
            }, { status: 400 });
        } else {
            return NextResponse.json({
                success: false,
                message: "Incorrect verification code"
            }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Something went wrong while verifying code: ", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Something went wrong while verifying code"
        }, { status: 500 });
    }
}