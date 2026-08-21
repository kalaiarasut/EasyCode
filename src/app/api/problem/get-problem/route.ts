import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

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

        const { data: problem, error } = await supabase
            .from('problems')
            .select('*')
            .eq('id', problemId)
            .maybeSingle();

        if (error || !problem) {
            return NextResponse.json({
                success: false,
                message: "Problem not found"
            }, { status: 404 });
        }

        const formattedProblem = {
            ...problem,
            _id: problem.id,
            testCases: problem.test_cases || [],
            topics: Array.isArray(problem.topics) ? problem.topics.join(",") : problem.topics || "",
            companies: Array.isArray(problem.companies) ? problem.companies.join(",") : problem.companies || "",
            similarQuestions: [],
            solutions: []
        };

        return NextResponse.json({
            success: true,
            message: "Problem found successfully",
            problem: formattedProblem
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error fetching problem from Supabase:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Something went wrong while fetching the problem"
        }, { status: 500 });
    }
}