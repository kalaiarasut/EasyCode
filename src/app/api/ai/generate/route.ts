import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
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
            return NextResponse.json({
                success: false,
                message: "Prompt is required"
            }, { status: 400 });
        }

        // Combine system context with user's instructions and memories
        const memoryContext = Array.isArray(memories) && memories.length > 0
            ? `\nUser Learning Context & Background:\n` + memories.map((m: any) => `- [${m.category || 'Context'}]: ${m.content}`).join('\n')
            : "";

        const systemPrompt = `You are a Principal AI Competitive Programming & Algorithmic Problem Setter for LeetCode.
User Request: "${prompt}"
Difficulty: ${difficulty}
Topic: ${topic}
Focus: ${focus}
${customInstructions ? `Custom User Preferences: ${customInstructions}` : ''}
${memoryContext}

Generate a complete, high-quality coding challenge matching this exact JSON format without markdown backticks:
{
  "title": "Problem Title",
  "level": "${difficulty}",
  "description": "Clear and detailed problem statement with context and mathematical/algorithmic objectives.",
  "examples": "Example 1:\\nInput: ...\\nOutput: ...\\nExplanation: ...\\n\\nExample 2:\\nInput: ...\\nOutput: ...",
  "constraints": "- 1 <= n <= 10^5\\n- -10^9 <= arr[i] <= 10^9\\n- Time Complexity limit: O(N log N)\\n- Space Complexity limit: O(N)",
  "testCases": [
    {"input": "sample_input_1", "output": "sample_output_1"},
    {"input": "sample_input_2", "output": "sample_output_2"},
    {"input": "sample_input_3", "output": "sample_output_3"}
  ],
  "topics": ["${topic}", "Algorithms", "Optimization"],
  "starterCode": {
    "python": "class Solution:\\n    def solve(self, nums: list[int]) -> int:\\n        # Your solution here\\n        pass",
    "cpp": "class Solution {\\npublic:\\n    int solve(vector<int>& nums) {\\n        // Your solution here\\n    }\\n};",
    "javascript": "/**\\n * @param {number[]} nums\\n * @return {number}\\n */\\nvar solve = function(nums) {\\n    // Your solution here\\n};"
  },
  "hints": [
    "First examine the boundary conditions and brute-force approach.",
    "Can you utilize an optimal data structure (e.g. Hash Map or Binary Search) to optimize time complexity?"
  ]
}`;

        let generatedProblem = null;

        // 1. Google Gemini Provider
        if (model.startsWith("gemini")) {
            const apiKey = customKeys.gemini || process.env.GEMINI_API_KEY;
            if (apiKey && !apiKey.startsWith("your_") && apiKey.length > 10) {
                try {
                    const ai = new GoogleGenAI({ apiKey });
                    const targetModel = model.includes("pro") ? "gemini-2.5-pro" : "gemini-2.5-flash";
                    const response = await ai.models.generateContent({
                        model: targetModel,
                        contents: systemPrompt
                    });
                    const text = response.text || "";
                    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    generatedProblem = JSON.parse(cleanJson);
                } catch (err) {
                    console.warn("Gemini execution error:", err);
                }
            }
        }

        // 2. OpenAI Provider (GPT-4o, o1, o3-mini)
        else if (model.startsWith("gpt") || model.startsWith("o1") || model.startsWith("o3")) {
            const apiKey = customKeys.openai || process.env.OPENAI_API_KEY;
            if (apiKey && apiKey.startsWith("sk-")) {
                try {
                    const res = await fetch("https://api.openai.com/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: model === "o1" ? "o1" : model === "o3-mini" ? "o3-mini" : "gpt-4o",
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("OpenAI API execution error:", err);
                }
            }
        }

        // 3. Anthropic Claude Provider
        else if (model.startsWith("claude")) {
            const apiKey = customKeys.anthropic || process.env.ANTHROPIC_API_KEY;
            if (apiKey && apiKey.startsWith("sk-ant-")) {
                try {
                    const targetModel = model.includes("sonnet") ? "claude-3-5-sonnet-20241022" : "claude-3-5-haiku-20241022";
                    const res = await fetch("https://api.anthropic.com/v1/messages", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-api-key": apiKey,
                            "anthropic-version": "2023-06-01"
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            max_tokens: 2048,
                            messages: [{ role: "user", content: systemPrompt }]
                        })
                    });
                    const data = await res.json();
                    const text = data.content?.[0]?.text || "";
                    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    generatedProblem = JSON.parse(cleanJson);
                } catch (err) {
                    console.warn("Anthropic API execution error:", err);
                }
            }
        }

        // 4. DeepSeek Provider (DeepSeek R1 / V3)
        else if (model.startsWith("deepseek")) {
            const apiKey = customKeys.deepseek || process.env.DEEPSEEK_API_KEY;
            if (apiKey && apiKey.startsWith("sk-")) {
                try {
                    const res = await fetch("https://api.deepseek.com/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: model.includes("r1") ? "deepseek-reasoner" : "deepseek-chat",
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("DeepSeek API execution error:", err);
                }
            }
        }

        // 5. Groq Provider (Llama 3.3 70B & Qwen 2.5 Coder on Groq LPU)
        else if (model.startsWith("groq")) {
            const apiKey = customKeys.groq || process.env.GROQ_API_KEY;
            if (apiKey && apiKey.startsWith("gsk_")) {
                try {
                    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: model.includes("qwen") ? "qwen-2.5-coder-32b" : "llama-3.3-70b-versatile",
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("Groq API execution error:", err);
                }
            }
        }

        // Fallback robust generator if custom keys are not yet provided
        if (!generatedProblem) {
            const problemTitle = prompt.length > 40 ? prompt.substring(0, 38) + "..." : prompt;
            generatedProblem = {
                title: `${problemTitle} - ${topic} Challenge`,
                level: difficulty,
                description: `Given a set of algorithmic constraints derived from your request: "${prompt}".\n\nDesign an optimal algorithm to process the input stream and return the computed outcome satisfying the operational limits.`,
                examples: `Example 1:\nInput: nums = [1, 3, 5, 7, 9], target = 12\nOutput: [1, 4]\nExplanation: nums[1] + nums[4] = 3 + 9 = 12.\n\nExample 2:\nInput: nums = [2, 4, 6], target = 8\nOutput: [0, 2]\nExplanation: nums[0] + nums[2] = 2 + 6 = 8.`,
                constraints: `- 1 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9\n- Only one valid answer exists.\n- Time Complexity: O(N)\n- Space Complexity: O(N)`,
                testCases: [
                    { input: "[1, 3, 5, 7, 9], 12", output: "[1, 4]" },
                    { input: "[2, 4, 6], 8", output: "[0, 2]" },
                    { input: "[5, 5], 10", output: "[0, 1]" }
                ],
                topics: [topic, "Algorithms", "Optimization"],
                starterCode: {
                    python: `class Solution:\n    def solve(self, nums: list[int], target: int) -> list[int]:\n        # Implement your solution here\n        seen = {}\n        for i, val in enumerate(nums):\n            diff = target - val\n            if diff in seen:\n                return [seen[diff], i]\n            seen[val] = i\n        return []`,
                    cpp: `class Solution {\npublic:\n    vector<int> solve(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); ++i) {\n            int diff = target - nums[i];\n            if (seen.count(diff)) return {seen[diff], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
                    javascript: `var solve = function(nums, target) {\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (seen.has(diff)) return [seen.get(diff), i];\n        seen.set(nums[i], i);\n    }\n    return [];\n};`
                },
                hints: [
                    "Think about using a Hash Map to achieve O(N) time complexity.",
                    "Look out for edge cases with duplicated elements and negative numbers."
                ]
            };
        }

        // Save generated challenge to Supabase
        try {
            await supabase.from('problems').insert({
                title: generatedProblem.title,
                level: generatedProblem.level,
                description: generatedProblem.description,
                examples: generatedProblem.examples,
                constraints: generatedProblem.constraints,
                test_cases: generatedProblem.testCases,
                code_templates: generatedProblem.starterCode,
                topics: generatedProblem.topics,
                companies: ["Google", "Meta", "Amazon"]
            });
        } catch (dbErr) {
            console.warn("Supabase record persistence notice:", dbErr);
        }

        return NextResponse.json({
            success: true,
            problem: generatedProblem
        }, { status: 200 });

    } catch (error: any) {
        console.error("AI Generation error:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to generate problem"
        }, { status: 500 });
    }
}
