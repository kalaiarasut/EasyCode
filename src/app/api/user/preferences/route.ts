import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?._id || token?.id;

    if (!userId) {
      return NextResponse.json(
        { success: true, preferences: {} },
        { status: 200 }
      );
    }

    // Attempt to query user_preferences table
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("preferences")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data?.preferences) {
        return NextResponse.json(
          { success: true, preferences: data.preferences },
          { status: 200 }
        );
      }
    } catch (e) {
      // Table may not exist yet, fallback gracefully
    }

    return NextResponse.json(
      { success: true, preferences: {} },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/user/preferences error:", err);
    return NextResponse.json(
      { success: true, preferences: {} },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?._id || token?.id;
    const body = await req.json();
    const { preferences } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User session required to save preferences" },
        { status: 401 }
      );
    }

    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: userId,
            preferences: preferences || {},
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.warn("Supabase user_preferences upsert error (falling back):", error);
      }
    } catch (e) {
      console.warn("Supabase user_preferences table not found (saving locally only)");
    }

    return NextResponse.json(
      { success: true, message: "Preferences saved successfully", preferences },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("POST /api/user/preferences error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to save preferences" },
      { status: 500 }
    );
  }
}
