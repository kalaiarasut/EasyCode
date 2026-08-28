import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { data: allProblems, error } = await supabase
            .from('problems')
            .select('*')
            .order('frontend_id', { ascending: true, nullsFirst: false });

        if (error) throw error;

        // Map Supabase fields (_id compatible) for frontend components
        const formattedProblems = (allProblems || []).map((p) => {
            const rawTestCases = p.test_cases;
            let testCasesList: any[] = [];
            if (Array.isArray(rawTestCases)) {
                testCasesList = rawTestCases;
            } else if (rawTestCases && typeof rawTestCases === "object" && Array.isArray(rawTestCases.visible)) {
                testCasesList = rawTestCases.visible;
            }

            return {
                ...p,
                _id: p.id,
                testCases: testCasesList,
                test_cases: p.test_cases,
                topics: Array.isArray(p.topics) ? p.topics.join(",") : p.topics || "",
                companies: Array.isArray(p.companies) ? p.companies.join(",") : p.companies || ""
            };
        });


        return NextResponse.json({
            success: true,
            message: "All problems fetched successfully",
            allProblems: formattedProblems
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error fetching all problems from Supabase:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Something went wrong while fetching all problems"
        }, { status: 500 });
    }
}
