import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User ID is required"
            }, { status: 400 });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, email, avatar, user_type, is_verified, created_at')
            .eq('id', userId)
            .maybeSingle();

        if (!user || error) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "User found successfully",
            user: {
                ...user,
                _id: user.id,
                solvedQuestions: []
            }
        }, { status: 200 });
    } catch (error: any) {
        console.log("Something went wrong while fetching user info: ", error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong while fetching user info"
        }, { status: 500 });
    }
}