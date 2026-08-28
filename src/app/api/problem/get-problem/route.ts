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

        let query = supabase.from('problems').select('*');
        
        let problem = null;
        if (problemId) {
            const { data: byId } = await supabase
                .from('problems')
                .select('*')
                .eq('id', problemId)
                .maybeSingle();
            
            if (byId) {
                problem = byId;
            } else {
                const { data: bySlug } = await supabase
                    .from('problems')
                    .select('*')
                    .eq('slug', problemId)
                    .maybeSingle();
                problem = bySlug;
            }
        }

        if (!problem) {
            const { data: firstProblem } = await supabase
                .from('problems')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle();
            problem = firstProblem;
        }

        if (!problem) {
            return NextResponse.json({
                success: false,
                message: "Problem not found"
            }, { status: 404 });
        }

        const rawTestCases = problem.test_cases;
        let testCasesList: any[] = [];
        if (Array.isArray(rawTestCases)) {
            testCasesList = rawTestCases;
        } else if (rawTestCases && typeof rawTestCases === "object" && Array.isArray(rawTestCases.visible)) {
            testCasesList = rawTestCases.visible;
        }

        const formattedProblem = {
            ...problem,
            _id: problem.id,
            testCases: testCasesList,
            test_cases: problem.test_cases,
            topics: Array.isArray(problem.topics) ? problem.topics.join(",") : problem.topics || "",
            companies: Array.isArray(problem.companies) ? problem.companies.join(",") : problem.companies || "",
            similarQuestions: [],
            solutions: problem.official_solutions || []
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