import { connectToDb } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import userModel from "@/models/User";
import problemModel from "@/models/Problem";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token || !token._id) {
            return NextResponse.json({
                success: true,
                submissions: []
            }, { status: 200 });
        }

        const { searchParams } = new URL(req.url);
        const problemId = searchParams.get("problemId");

        if (!problemId) {
            return NextResponse.json({
                success: true,
                submissions: []
            }, { status: 200 });
        }

        if (!mongoose.Types.ObjectId.isValid(problemId) || !mongoose.Types.ObjectId.isValid(token._id as string)) {
            return NextResponse.json({
                success: true,
                submissions: []
            }, { status: 200 });
        }

        await connectToDb();
        const existedProblem = await problemModel.findById(problemId);
        if (!existedProblem) {
            return NextResponse.json({
                success: true,
                submissions: []
            }, { status: 200 });
        }

        const submittedCodes = await userModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(token._id as string) } },
            {
                $lookup: {
                    from: "submissions",
                    let: {
                        subIds: "$submissions",
                        targetProblemId: new mongoose.Types.ObjectId(problemId)
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ["$_id", { $ifNull: ["$$subIds", []] }] },
                                        { $eq: ["$problemId", "$$targetProblemId"] }
                                    ]
                                }
                            }
                        },
                        { $sort: { createdAt: -1 } }
                    ],
                    as: "submissionDetails"
                }
            },
            {
                $project: {
                    submissionDetails: 1
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            message: "Submission fetched successfully",
            submissions: submittedCodes[0]?.submissionDetails || []
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return NextResponse.json({
            success: true,
            submissions: []
        }, { status: 200 });
    }
}