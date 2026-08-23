import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/lib/supabaseClient";
import { GeneratedProblem } from "@/types/generatedProblem";

export const runtime = "nodejs";

const SYSTEM_PROMPT_TEMPLATE = (difficulty: string, topic: string, focus: string, model: string, customInstructions: string, memoryContext: string) => `
You are a Principal AI Competitive Programming & Algorithmic Problem Setter for LeetCode.
Your task is to generate a comprehensive, production-grade, LeetCode-style algorithmic challenge in strict JSON format.

Difficulty: ${difficulty}
Topic: ${topic || "Algorithms"}
Focus: ${focus || "Generate Problem"}
Model: ${model}
${customInstructions ? `Custom User Preferences: ${customInstructions}` : ""}
${memoryContext}

You MUST return ONLY a valid JSON object (no markdown backticks, no trailing explanation, no conversational filler).
Follow this EXACT JSON schema:
{
  "title": "Concise LeetCode Problem Title",
  "level": "${difficulty}",
  "topics": ["${topic || "Algorithms"}", "Data Structures", "Dynamic Programming"],
  "description": "Clear, rigorous problem statement explaining input types, target return value, and technical invariants. Use inline math or variable names like nums, target, k where relevant.",
  "constraints": [
    "1 <= nums.length <= 10^5",
    "-10^9 <= nums[i] <= 10^9",
    "0 <= k <= nums.length"
  ],
  "examples": [
    {
      "id": 1,
      "input": "nums = [1,2,3,4,5], k = 2",
      "output": "3",
      "explanation": "Detailed step-by-step reasoning explaining why output 3 is produced."
    },
    {
      "id": 2,
      "input": "nums = [10,-5,20,1], k = 1",
      "output": "20",
      "explanation": "Explanation for example 2."
    },
    {
      "id": 3,
      "input": "nums = [0], k = 0",
      "output": "0",
      "explanation": "Explanation for minimum boundary case."
    }
  ],
  "testCases": {
    "visible": [
      { "input": "nums = [1,2,3,4,5], k = 2", "output": "3", "explanation": "Sample test 1" },
      { "input": "nums = [10,-5,20,1], k = 1", "output": "20", "explanation": "Sample test 2" },
      { "input": "nums = [0], k = 0", "output": "0", "explanation": "Sample test 3" }
    ],
    "hidden": [
      { "input": "nums = [100000 elements all -1], k = 50", "output": "..." },
      { "input": "nums = [1, 1, 1, 1], k = 2", "output": "..." },
      { "input": "nums = [-10^9, 10^9], k = 1", "output": "..." }
    ]
  },
  "edgeCases": [
    {
      "category": "Empty or Minimal Input",
      "scenario": "Array has 1 element or k equals 0",
      "expectedBehavior": "Should return the single element or base identity in O(1) without indexing out of bounds."
    },
    {
      "category": "Extreme Bounds & Overflow",
      "scenario": "Elements equal -10^9 or 10^9 causing integer overflow during accumulation",
      "expectedBehavior": "Algorithm uses 64-bit integer accumulation or modulo arithmetic as appropriate."
    },
    {
      "category": "Duplicate Values",
      "scenario": "Array contains all identical elements",
      "expectedBehavior": "Handles tie-breaking or duplicate counting without infinite loops or invalid states."
    }
  ],
  "starterCode": {
    "python": "class Solution:\\n    def solveProblem(self, nums: list[int], k: int) -> int:\\n        # Your implementation here\\n        pass",
    "cpp": "class Solution {\\npublic:\\n    int solveProblem(vector<int>& nums, int k) {\\n        // Your implementation here\\n        return 0;\\n    }\\n};",
    "javascript": "/**\\n * @param {number[]} nums\\n * @param {number} k\\n * @return {number}\\n */\\nvar solveProblem = function(nums, k) {\\n    // Your implementation here\\n};",
    "typescript": "function solveProblem(nums: number[], k: number): number {\\n    // Your implementation here\\n    return 0;\\n};",
    "java": "class Solution {\\n    public int solveProblem(int[] nums, int k) {\\n        // Your implementation here\\n        return 0;\\n    }\\n}"
  },
  "hints": [
    "Consider brute force first: can we simulate the process or check all valid subsets/subarrays?",
    "Notice the monotonic property or structure: could a two-pointer, hash table, or monotonic stack reduce repeated work?",
    "Use dynamic programming or prefix sums to transition state in O(1) time per element."
  ],
  "followUp": {
    "prompt": "Could you solve this in O(N) time and O(1) auxiliary space without modifying the input array?",
    "hintOrDirection": "Think about in-place state encoding or two-pointer parity."
  },
  "expectedComplexity": {
    "time": "O(N log N) or O(N)",
    "space": "O(N) or O(1)",
    "explanation": "Single pass iteration through the array with constant time lookup per step."
  }
}
`;

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

function normalizeGeneratedProblem(parsed: any, difficulty: string, topic: string): GeneratedProblem {
  return {
    title: parsed.title || "Algorithmic Challenge",
    level: (parsed.level || parsed.difficulty || difficulty || "Medium") as "Easy" | "Medium" | "Hard",
    difficulty: (parsed.level || parsed.difficulty || difficulty || "Medium") as "Easy" | "Medium" | "Hard",
    topics: Array.isArray(parsed.topics) && parsed.topics.length > 0 ? parsed.topics : [topic || "Algorithms", "Optimization"],
    description: parsed.description || "Solve the problem according to the specifications and constraints.",
    constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [parsed.constraints || "1 <= n <= 10^5"],
    examples: Array.isArray(parsed.examples)
      ? parsed.examples.map((ex: any, idx: number) => ({
          id: ex.id || idx + 1,
          input: ex.input || "",
          output: ex.output || "",
          explanation: ex.explanation || "",
        }))
      : [
          { id: 1, input: "nums = [1, 2, 3]", output: "6", explanation: "Sum of elements" }
        ],
    testCases: {
      visible: Array.isArray(parsed.testCases?.visible)
        ? parsed.testCases.visible
        : Array.isArray(parsed.testCases)
        ? parsed.testCases
        : [{ input: "nums = [1, 2, 3]", output: "6" }],
      hidden: Array.isArray(parsed.testCases?.hidden) ? parsed.testCases.hidden : [],
    },
    edgeCases: Array.isArray(parsed.edgeCases)
      ? parsed.edgeCases
      : [
          { category: "Empty / Single Item", scenario: "Input length = 1", expectedBehavior: "Handled gracefully in O(1)" }
        ],
    starterCode: parsed.starterCode || {
      python: "class Solution:\n    def solve(self, nums: list[int]) -> int:\n        pass",
      cpp: "class Solution {\npublic:\n    int solve(vector<int>& nums) {\n        return 0;\n    }\n};",
      javascript: "var solve = function(nums) {\n    // Implementation\n};",
      typescript: "function solve(nums: number[]): number {\n    return 0;\n};",
    },
    hints: Array.isArray(parsed.hints) ? parsed.hints : [
      "Think about the most direct baseline solution first.",
      "Can you use an optimal data structure to avoid redundant computation?"
    ],
    followUp: parsed.followUp || {
      prompt: "Can you optimize time or space complexity further?",
    },
    expectedComplexity: parsed.expectedComplexity || {
      time: "O(N)",
      space: "O(1)",
      explanation: "Single linear pass with constant extra memory.",
    },
    companies: parsed.companies || ["Google", "Meta", "Amazon", "Apple", "Microsoft"],
  };
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await req.json();
    const {
      prompt,
      difficulty = "Medium",
      topic = "Algorithms",
      focus = "Generate Problem",
      model = "gemini-2.5-flash",
      customInstructions = "",
      customKeys = {},
      memories = []
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ success: false, message: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const memoryContext = Array.isArray(memories) && memories.length > 0
      ? `\nUser Learning Context & Background:\n` + memories.map((m: any) => `- [${m.category || 'Context'}]: ${m.content}`).join('\n')
      : "";

    const systemPrompt = SYSTEM_PROMPT_TEMPLATE(difficulty, topic, focus, model, customInstructions, memoryContext) + `\nUser Prompt Request:\n"${prompt}"`;

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (eventData: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
        };

        try {
          sendEvent({ type: "start", message: `Initiating problem synthesis using ${model}...` });

          let rawResponseText = "";

          // 1. Google Gemini Provider
          if (model.startsWith("gemini")) {
            const apiKey = customKeys.gemini || process.env.GEMINI_API_KEY;
            if (!apiKey || apiKey.startsWith("your_") || apiKey.length < 5) {
              throw new Error("No valid Gemini API key configured. Please add your key in Settings.");
            }

            const ai = new GoogleGenAI({ apiKey });
            let candidates = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
            if (model.includes("2.5-pro")) candidates = ["gemini-2.5-pro", "gemini-1.5-pro", "gemini-2.0-flash"];
            else if (model.includes("thinking")) candidates = ["gemini-2.0-flash-thinking-exp-01-21", "gemini-2.0-flash-thinking-exp", "gemini-2.0-flash"];
            else if (model.includes("1.5-pro")) candidates = ["gemini-1.5-pro", "gemini-2.0-flash"];
            else if (model.includes("1.5-flash")) candidates = ["gemini-1.5-flash", "gemini-2.0-flash"];

            sendEvent({ type: "chunk", section: "title", content: "Synthesizing challenge architecture..." });

            let lastGeminiErr: any = null;
            for (const targetModel of candidates) {
              try {
                const streamResult = await ai.models.generateContentStream({
                  model: targetModel,
                  contents: systemPrompt
                });

                for await (const chunk of streamResult) {
                  const chunkText = chunk.text || "";
                  rawResponseText += chunkText;
                  sendEvent({ type: "chunk", content: chunkText });
                }

                if (rawResponseText.trim()) break;
              } catch (streamErr: any) {
                lastGeminiErr = streamErr;
                console.warn(`Gemini ${targetModel} stream failed, trying unary or next candidate...`);
                try {
                  const unaryResult = await ai.models.generateContent({
                    model: targetModel,
                    contents: systemPrompt
                  });
                  rawResponseText = unaryResult.text || "";
                  if (rawResponseText.trim()) break;
                } catch (unaryErr) {
                  lastGeminiErr = unaryErr;
                }
              }
            }

            if (!rawResponseText.trim()) {
              throw lastGeminiErr || new Error("Failed to generate content from Gemini models.");
            }
          }

          // 2. Anthropic Claude Provider
          else if (model.startsWith("claude")) {
            const apiKey = customKeys.anthropic || process.env.ANTHROPIC_API_KEY;
            if (!apiKey) throw new Error("No Anthropic API key configured.");

            let targetModel = "claude-3-5-sonnet-20241022";
            if (model.includes("3.7")) targetModel = "claude-3-7-sonnet-20250219";
            else if (model.includes("haiku")) targetModel = "claude-3-5-haiku-20241022";

            const res = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
              },
              body: JSON.stringify({
                model: targetModel,
                max_tokens: 3000,
                messages: [{ role: "user", content: systemPrompt }]
              })
            });

            const data = await res.json();
            rawResponseText = data.content?.[0]?.text || "";
          }

          // 3. OpenAI / Groq / DeepSeek / Moonshot / OpenRouter / Custom endpoints
          else {
            let endpoint = "https://api.openai.com/v1/chat/completions";
            let apiKey = customKeys.openai || process.env.OPENAI_API_KEY;
            let targetModel = model;

            if (model.startsWith("groq")) {
              endpoint = "https://api.groq.com/openai/v1/chat/completions";
              apiKey = customKeys.groq || process.env.GROQ_API_KEY;
              targetModel = model.includes("r1") ? "deepseek-r1-distill-llama-70b" : "llama-3.3-70b-versatile";
            } else if (model.startsWith("deepseek")) {
              endpoint = "https://api.deepseek.com/chat/completions";
              apiKey = customKeys.deepseek || process.env.DEEPSEEK_API_KEY;
              targetModel = model.includes("r1") ? "deepseek-reasoner" : "deepseek-chat";
            } else if (model.startsWith("kimi") || model.startsWith("moonshot")) {
              endpoint = "https://api.moonshot.cn/v1/chat/completions";
              apiKey = customKeys.kimi || process.env.KIMI_API_KEY;
              targetModel = "moonshot-v1-32k";
            } else if (model.startsWith("openrouter")) {
              endpoint = "https://openrouter.ai/api/v1/chat/completions";
              apiKey = customKeys.openrouter || process.env.OPENROUTER_API_KEY;
              targetModel = "auto";
            } else if (customKeys.customBaseUrl) {
              endpoint = `${customKeys.customBaseUrl.replace(/\/$/, '')}/chat/completions`;
              apiKey = customKeys.customApiKey;
              targetModel = customKeys.customModelName || model;
            }

            if (!apiKey && !model.startsWith("ollama")) {
              throw new Error(`No API key configured for model "${model}". Add your key in Settings.`);
            }

            const res = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {})
              },
              body: JSON.stringify({
                model: targetModel,
                messages: [{ role: "user", content: systemPrompt }],
                response_format: { type: "json_object" }
              })
            });

            const data = await res.json();
            rawResponseText = data.choices?.[0]?.message?.content || "";
          }

          // Parse and normalize the generated problem
          const cleanedJson = cleanJsonString(rawResponseText);
          let parsedProblemJson: any = null;

          try {
            parsedProblemJson = JSON.parse(cleanedJson);
          } catch (pErr) {
            console.error("JSON parse failure from model output:", pErr, rawResponseText);
            // Fallback emergency regex extraction if slightly malformed
            const jsonMatch = rawResponseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedProblemJson = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error("Model returned invalid JSON structure.");
            }
          }

          const structuredProblem = normalizeGeneratedProblem(parsedProblemJson, difficulty, topic);

          // Save to Supabase problems table if available
          try {
            await supabase.from("problems").insert({
              title: structuredProblem.title,
              level: structuredProblem.level,
              description: structuredProblem.description,
              examples: JSON.stringify(structuredProblem.examples),
              constraints: structuredProblem.constraints.join("\n"),
              test_cases: structuredProblem.testCases.visible,
              code_templates: structuredProblem.starterCode,
              topics: structuredProblem.topics,
              companies: structuredProblem.companies || ["Google", "Meta", "Amazon"],
            });
          } catch (dbErr) {
            console.warn("Supabase background persistence note:", dbErr);
          }

          // Send final completion payload
          sendEvent({
            type: "complete",
            problem: structuredProblem,
            progress: 100
          });

          controller.close();
        } catch (error: any) {
          console.error("Live streaming route error:", error);
          sendEvent({
            type: "error",
            message: error.message || "Failed to generate problem stream."
          });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      }
    });
  } catch (error: any) {
    console.error("Stream initialization error:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || "Stream init error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
