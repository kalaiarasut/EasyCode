import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
    const { searchParams, origin } = new URL(req.url);
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") || "/";

    if (tokenHash && type) {
        return NextResponse.redirect(`${origin}/auth/confirm?token_hash=${tokenHash}&type=${type}&next=${encodeURIComponent(next)}`);
    }

    if (code) {
        return NextResponse.redirect(`${origin}/auth/confirm?code=${code}&next=${encodeURIComponent(next)}`);
    }

    return NextResponse.redirect(`${origin}${next}`);
}
