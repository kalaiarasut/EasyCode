import { z } from "zod";

export const generatedProblemExampleSchema = z.object({
  id: z.number().default(1),
  input: z.string().min(1, "Input cannot be empty"),
  output: z.string().min(1, "Output cannot be empty"),
  explanation: z.string().optional(),
});

export const generatedTestCaseSchema = z.object({
  input: z.string().min(1, "Input cannot be empty"),
  output: z.string().min(1, "Output cannot be empty"),
  explanation: z.string().optional(),
  isHidden: z.boolean().optional(),
});

export const generatedProblemTestCasesSchema = z.object({
  visible: z.array(generatedTestCaseSchema).default([]),
  hidden: z.array(generatedTestCaseSchema).default([]),
});

export const generatedEdgeCaseSchema = z.object({
  category: z.string().min(1),
  scenario: z.string().min(1),
  expectedBehavior: z.string().min(1),
});

export const generatedStarterCodeSchema = z.object({
  python: z.string().optional(),
  cpp: z.string().optional(),
  javascript: z.string().optional(),
  typescript: z.string().optional(),
  java: z.string().optional(),
  csharp: z.string().optional(),
  go: z.string().optional(),
  rust: z.string().optional(),
});

export const generatedFollowUpSchema = z.object({
  prompt: z.string(),
  hintOrDirection: z.string().optional(),
});

export const generatedComplexitySchema = z.object({
  time: z.string().default("O(N)"),
  space: z.string().default("O(1)"),
  explanation: z.string().optional(),
});

export const generatedProblemValidation = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  level: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  topics: z.array(z.string()).min(1, "At least one topic tag is required"),
  description: z.string().min(10, "Description must be detailed"),
  constraints: z.array(z.string()).min(1, "At least one constraint required"),
  examples: z.array(generatedProblemExampleSchema).min(1, "At least one example required"),
  testCases: generatedProblemTestCasesSchema.default({ visible: [], hidden: [] }),
  edgeCases: z.array(generatedEdgeCaseSchema).default([]),
  starterCode: generatedStarterCodeSchema.default({}),
  hints: z.array(z.string()).default([]),
  followUp: generatedFollowUpSchema.default({ prompt: "" }),
  expectedComplexity: generatedComplexitySchema.default({ time: "O(N)", space: "O(1)" }),
  companies: z.array(z.string()).optional(),
});

export type GeneratedProblemSchemaType = z.infer<typeof generatedProblemValidation>;
