import { Document, model, models, Schema, Types } from "mongoose";
import { ISimilarQuestion } from "./SimilarQuestion";
import { ISolution } from "./Solution";

export interface ITestCase {
    input: string;
    output: string;
    explanation?: string;
}

export interface ICompanyTag {
    name: string;
    frequency: number;
}

export interface IOfficialSolution {
    language: string;
    source_code: string;
    explanation?: string;
    time_complexity?: string;
    space_complexity?: string;
}

export interface IProblemStats {
    likes: number;
    dislikes: number;
    like_ratio: number;
    acceptance_rate: number;
    is_paid_only: boolean;
}

export interface IProblem extends Document {
    frontend_id?: number;
    title: string;
    slug?: string;
    level: string;
    elo_rating?: number;
    category?: string;
    description: string;
    description_html?: string;
    description_markdown?: string;
    examples: string;
    constraints: string;
    testCases: ITestCase[];
    test_cases?: {
        visible: ITestCase[];
        hidden: ITestCase[];
        evaluation_suite?: string;
    };
    code_templates?: Record<string, string>;
    topics: string;
    patterns?: string[];
    companies?: string;
    company_tags?: ICompanyTag[];
    hints?: string[];
    official_solutions?: IOfficialSolution[];
    stats?: IProblemStats;
    like?: number;
    dislike?: number;
    similarQuestions?: (Types.ObjectId[] | ISimilarQuestion[]);
    solutions?: (Types.ObjectId[] | ISolution[]);
    createdAt?: Date;
    updatedAt?: Date;
}

const problemSchema = new Schema<IProblem>({
    frontend_id: {
        type: Number,
        index: true
    },
    title: {
        type: String,
        unique: true,
        required: [true, "Title is required"],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    level: {
        type: String,
        required: [true, "Level is required"],
        enum: ["Easy", "Medium", "Hard"]
    },
    elo_rating: {
        type: Number,
        index: true
    },
    category: {
        type: String,
        default: "Algorithms"
    },
    description: {
        type: String,
        required: [true, "Description of the problem required"]
    },
    description_html: {
        type: String
    },
    description_markdown: {
        type: String
    },
    examples: {
        type: String,
        required: [true, "Example string is required"]
    },
    constraints: {
        type: String,
        required: [true, "Constraints string is required"]
    },
    testCases: [{
        input: {
            type: String,
            required: [true, "Input required"]
        },
        output: {
            type: String,
            required: [true, "Output required"]
        },
        explanation: {
            type: String
        }
    }],
    test_cases: {
        visible: [{
            input: String,
            output: String,
            explanation: String
        }],
        hidden: [{
            input: String,
            output: String
        }],
        evaluation_suite: String
    },
    code_templates: {
        type: Map,
        of: String
    },
    topics: {
        type: String,
        required: [true, "topics is required (is separated by ',')"]
    },
    patterns: [{
        type: String
    }],
    companies: {
        type: String
    },
    company_tags: [{
        name: String,
        frequency: Number
    }],
    hints: [{
        type: String
    }],
    official_solutions: [{
        language: String,
        source_code: String,
        explanation: String,
        time_complexity: String,
        space_complexity: String
    }],
    stats: {
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
        like_ratio: { type: Number, default: 100 },
        acceptance_rate: { type: Number, default: 50 },
        is_paid_only: { type: Boolean, default: false }
    },
    like: {
        type: Number,
        default: 0
    },
    dislike: {
        type: Number,
        default: 0
    },
    similarQuestions: [{
        type: Schema.Types.ObjectId,
        ref: "SimilarQuestion"
    }],
    solutions: [{
        type: Schema.Types.ObjectId,
        ref: "Solution"
    }]
}, { timestamps: true });

const Problem = models?.Problem || model<IProblem>("Problem", problemSchema);

export default Problem;