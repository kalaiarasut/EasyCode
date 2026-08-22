import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const userId = token?._id || token?.id;

        if (!userId) {
            return NextResponse.json({
                success: true,
                keys: {}
            }, { status: 200 });
        }

        const { data, error } = await supabase
            .from('user_api_keys')
            .select('keys')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.warn("Supabase fetch keys error:", error);
            return NextResponse.json({ success: true, keys: {} }, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            keys: data?.keys || {}
        }, { status: 200 });
    } catch (err: any) {
        console.error("GET /api/user/keys error:", err);
        return NextResponse.json({ success: true, keys: {} }, { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const userId = token?._id || token?.id;
        const { keys } = await req.json();

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User session required to save keys to Supabase"
            }, { status: 401 });
        }

        const { error } = await supabase
            .from('user_api_keys')
            .upsert({
                user_id: userId,
                keys: keys || {},
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) {
            console.error("Supabase upsert error:", error);
            return NextResponse.json({
                success: false,
                message: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "API keys securely stored in Supabase"
        }, { status: 200 });
    } catch (err: any) {
        console.error("POST /api/user/keys error:", err);
        return NextResponse.json({
            success: false,
            message: err.message || "Failed to save keys"
        }, { status: 500 });
    }
}
