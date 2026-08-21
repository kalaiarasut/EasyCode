import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User id is required"
            }, { status: 400 });
        }

        const { data: allSubmissions, error } = await supabase
            .from('submissions')
            .select(`
                id,
                language,
                code,
                status,
                runtime,
                memory,
                created_at,
                problem:problems(id, title, level, topics)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        return NextResponse.json({
            success: true,
            message: "All submissions fetched successfully",
            submissions: allSubmissions || []
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            success: true,
            submissions: []
        }, { status: 200 });
    }
}