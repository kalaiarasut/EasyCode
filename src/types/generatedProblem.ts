/**
 * Structured LeetCode Problem Types for Animated Live Generation
 */

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export interface GeneratedProblemExample {
  id: number;
  input: string;
  output: string;
  explanation?: string;
}

export interface GeneratedTestCase {
  input: string;
  output: string;
  explanation?: string;
  isHidden?: boolean;
}

export interface GeneratedProblemTestCases {
  visible: GeneratedTestCase[];
  hidden: GeneratedTestCase[];
}

export interface GeneratedEdgeCase {
  category: string; // e.g. "Empty / Single Element", "Extreme Bounds", "Duplicate Values", "Negative Numbers"
  scenario: string;
  expectedBehavior: string;
}

export interface GeneratedStarterCode {
  python?: string;
  cpp?: string;
  javascript?: string;
  typescript?: string;
  java?: string;
  csharp?: string;
  go?: string;
  rust?: string;
}

export interface GeneratedFollowUp {
  prompt: string;
  hintOrDirection?: string;
}

export interface GeneratedComplexity {
  time: string; // e.g. "O(N log N)"
  space: string; // e.g. "O(N)"
  explanation?: string;
}

export interface GeneratedProblem {
  title: string;
  level: ProblemDifficulty;
  difficulty?: ProblemDifficulty; // alias for level
  topics: string[];
  description: string;
  constraints: string[];
  examples: GeneratedProblemExample[];
  testCases: GeneratedProblemTestCases;
  edgeCases: GeneratedEdgeCase[];
  starterCode: GeneratedStarterCode;
  hints: string[];
  followUp: GeneratedFollowUp;
  expectedComplexity: GeneratedComplexity;
  companies?: string[];
  similarQuestions?: Array<{ title: string; difficulty: ProblemDifficulty }>;
  rawMarkdown?: string;
}

export type GenerationSectionKey =
  | "title"
  | "difficulty"
  | "topics"
  | "description"
  | "constraints"
  | "examples"
  | "testCases"
  | "edgeCases"
  | "starterCode"
  | "expectedComplexity"
  | "hints"
  | "followUp";

export interface GenerationSectionMeta {
  key: GenerationSectionKey;
  label: string;
  iconName: string;
  order: number;
  description: string;
}

export const GENERATION_SECTIONS: GenerationSectionMeta[] = [
  { key: "title", label: "Title", iconName: "Heading", order: 1, description: "Ideating problem title and algorithmic theme" },
  { key: "difficulty", label: "Difficulty & Tags", iconName: "Tag", order: 2, description: "Classifying difficulty rating and categorization" },
  { key: "description", label: "Problem Statement", iconName: "FileText", order: 3, description: "Drafting technical problem statement & objectives" },
  { key: "constraints", label: "Constraints", iconName: "ShieldAlert", order: 4, description: "Defining input boundaries and runtime limits" },
  { key: "examples", label: "Walkthrough Examples", iconName: "Layers", order: 5, description: "Synthesizing input/output examples with explanations" },
  { key: "testCases", label: "Test Cases Matrix", iconName: "TestTube", order: 6, description: "Assembling visible samples and hidden stress suites" },
  { key: "edgeCases", label: "Edge Cases & Pitfalls", iconName: "AlertTriangle", order: 7, description: "Analyzing extreme bounds and edge conditions" },
  { key: "starterCode", label: "Starter Code Stubs", iconName: "Code2", order: 8, description: "Generating multi-language function signatures" },
  { key: "expectedComplexity", label: "Target Complexity", iconName: "Zap", order: 9, description: "Calculating optimal time and space bounds" },
  { key: "hints", label: "Progressive Hints", iconName: "Lightbulb", order: 10, description: "Constructing step-by-step algorithmic hints" },
  { key: "followUp", label: "Follow-up Optimization", iconName: "Sparkles", order: 11, description: "Formulating advanced variants and challenges" },
];

export type StreamEventType =
  | "start"
  | "chunk"
  | "section_start"
  | "section_complete"
  | "complete"
  | "error";

export interface StreamEvent {
  type: StreamEventType;
  section?: GenerationSectionKey;
  content?: string;
  data?: any;
  problem?: GeneratedProblem;
  message?: string;
  progress?: number;
}
