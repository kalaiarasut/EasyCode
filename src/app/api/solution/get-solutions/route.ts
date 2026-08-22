import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const problemId = searchParams.get("problemId");

        if (!problemId) {
            return NextResponse.json({
                success: false,
                message: "Problem ID is required",
            }, { status: 400 });
        }

        const { data: allSolutions, error } = await supabase
            .from('solutions')
            .select(`
                id,
                title,
                code,
                language,
                explanation,
                created_at,
                user:users(id, username, avatar)
            `)
            .eq('problem_id', problemId)
            .order('created_at', { ascending: false });

        return NextResponse.json({
            success: true,
            message: "All solutions are fetched successfully",
            solutions: allSolutions || []
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            success: true,
            solutions: []
        }, { status: 200 });
    }
}