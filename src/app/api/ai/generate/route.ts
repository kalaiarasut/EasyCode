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
Model: ${model}
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
    "Can you utilize an optimal data structure (e.g. Hash Map, Heap, or Binary Search) to optimize time complexity?"
  ]
}`;

        let generatedProblem = null;

        // 1. Moonshot AI (Kimi)
        if (model.startsWith("kimi") || model.startsWith("moonshot")) {
            const apiKey = customKeys.kimi || process.env.KIMI_API_KEY;
            if (apiKey) {
                try {
                    let targetModel = "moonshot-v1-8k";
                    if (model.includes("32k")) targetModel = "moonshot-v1-32k";
                    else if (model.includes("128k")) targetModel = "moonshot-v1-128k";
                    else if (model.includes("latest")) targetModel = "moonshot-v1-auto";

                    const res = await fetch("https://api.moonshot.cn/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("Moonshot Kimi error:", err);
                }
            }
        }

        // 2. Google Gemini Provider Family
        else if (model.startsWith("gemini")) {
            const apiKey = customKeys.gemini || process.env.GEMINI_API_KEY;
            if (apiKey && !apiKey.startsWith("your_") && apiKey.length > 10) {
                try {
                    const ai = new GoogleGenAI({ apiKey });
                    let targetModel = "gemini-2.5-flash";
                    if (model.includes("2.5-pro")) targetModel = "gemini-2.5-pro";
                    else if (model.includes("thinking")) targetModel = "gemini-2.0-flash-thinking-exp";
                    else if (model.includes("1.5-pro")) targetModel = "gemini-1.5-pro";
                    else if (model.includes("1.5-flash")) targetModel = "gemini-1.5-flash";

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

        // 3. Anthropic Claude Provider Family
        else if (model.startsWith("claude")) {
            const apiKey = customKeys.anthropic || process.env.ANTHROPIC_API_KEY;
            if (apiKey && apiKey.startsWith("sk-ant-")) {
                try {
                    let targetModel = "claude-3-5-sonnet-20241022";
                    if (model.includes("3.7")) targetModel = "claude-3-7-sonnet-20250219";
                    else if (model.includes("haiku")) targetModel = "claude-3-5-haiku-20241022";
                    else if (model.includes("opus")) targetModel = "claude-3-opus-20240229";

                    const res = await fetch("https://api.anthropic.com/v1/messages", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-api-key": apiKey,
                            "anthropic-version": "2023-06-01"
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            max_tokens: 2500,
                            messages: [{ role: "user", content: systemPrompt }]
                        })
                    });
                    const data = await res.json();
                    const text = data.content?.[0]?.text || "";
                    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    generatedProblem = JSON.parse(cleanJson);
                } catch (err) {
                    console.warn("Anthropic API error:", err);
                }
            }
        }

        // 4. OpenAI Provider Family (GPT-4o, o1, o3-mini)
        else if (model.startsWith("gpt") || model.startsWith("o1") || model.startsWith("o3")) {
            const apiKey = customKeys.openai || process.env.OPENAI_API_KEY;
            if (apiKey) {
                try {
                    const res = await fetch("https://api.openai.com/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: model === "o1" ? "o1" : model === "o3-mini" ? "o3-mini" : model === "o1-mini" ? "o1-mini" : model === "gpt-4o-mini" ? "gpt-4o-mini" : "gpt-4o",
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("OpenAI API error:", err);
                }
            }
        }

        // 5. DeepSeek Provider Family (R1, V3, Coder)
        else if (model.startsWith("deepseek")) {
            const apiKey = customKeys.deepseek || process.env.DEEPSEEK_API_KEY;
            if (apiKey) {
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
                    console.warn("DeepSeek API error:", err);
                }
            }
        }

        // 6. Groq LPU Provider Family
        else if (model.startsWith("groq")) {
            const apiKey = customKeys.groq || process.env.GROQ_API_KEY;
            if (apiKey) {
                try {
                    let targetModel = "llama-3.3-70b-versatile";
                    if (model.includes("r1")) targetModel = "deepseek-r1-distill-llama-70b";
                    else if (model.includes("qwen")) targetModel = "qwen-2.5-coder-32b";

                    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("Groq API error:", err);
                }
            }
        }

        // 7. Alibaba Cloud (Qwen) DashScope
        else if (model.startsWith("qwen") || model.startsWith("qwq")) {
            const apiKey = customKeys.qwen || process.env.DASHSCOPE_API_KEY;
            if (apiKey) {
                try {
                    let targetModel = "qwen-2.5-coder-32b-instruct";
                    if (model.includes("qwq")) targetModel = "qwq-32b-preview";
                    else if (model.includes("72b")) targetModel = "qwen-2.5-72b-instruct";

                    const res = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("Alibaba DashScope Qwen error:", err);
                }
            }
        }

        // 8. Cerebras Systems
        else if (model.startsWith("cerebras")) {
            const apiKey = customKeys.cerebras || process.env.CEREBRAS_API_KEY;
            if (apiKey) {
                try {
                    const targetModel = model.includes("r1") ? "deepseek-r1-distill-llama-70b" : "llama-3.3-70b";
                    const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("Cerebras API error:", err);
                }
            }
        }

        // 9. SambaNova Systems
        else if (model.startsWith("sambanova")) {
            const apiKey = customKeys.sambanova || process.env.SAMBANOVA_API_KEY;
            if (apiKey) {
                try {
                    const targetModel = model.includes("r1") ? "DeepSeek-R1" : "Meta-Llama-3.3-70B-Instruct";
                    const res = await fetch("https://api.sambanova.ai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("SambaNova API error:", err);
                }
            }
        }

        // 10. Zhipu AI (GLM)
        else if (model.startsWith("glm") || model.startsWith("codegeex") || model.startsWith("zhipu")) {
            const apiKey = customKeys.zhipu || process.env.ZHIPU_API_KEY;
            if (apiKey) {
                try {
                    const targetModel = model.includes("codegeex") ? "codegeex-4" : "glm-4-plus";
                    const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("Zhipu AI GLM error:", err);
                }
            }
        }

        // 11. 01.AI (Yi)
        else if (model.startsWith("yi")) {
            const apiKey = customKeys.yi || process.env.YI_API_KEY;
            if (apiKey) {
                try {
                    const targetModel = model.includes("lightning") ? "yi-lightning" : "yi-large";
                    const res = await fetch("https://api.lingyiwanwu.com/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("01.AI Yi error:", err);
                }
            }
        }

        // 12. SiliconFlow
        else if (model.startsWith("siliconflow")) {
            const apiKey = customKeys.siliconflow || process.env.SILICONFLOW_API_KEY;
            if (apiKey) {
                try {
                    const targetModel = model.includes("r1") ? "deepseek-ai/DeepSeek-R1" : "Qwen/Qwen2.5-Coder-32B-Instruct";
                    const res = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("SiliconFlow error:", err);
                }
            }
        }

        // 13. Mistral AI
        else if (model.startsWith("codestral") || model.startsWith("mistral") || model.startsWith("pixtral")) {
            const apiKey = customKeys.mistral || process.env.MISTRAL_API_KEY;
            if (apiKey) {
                try {
                    const targetModel = model.includes("codestral") ? "codestral-latest" : "mistral-large-latest";
                    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("Mistral API error:", err);
                }
            }
        }

        // 14. xAI (Grok)
        else if (model.startsWith("grok")) {
            const apiKey = customKeys.grok || process.env.XAI_API_KEY;
            if (apiKey) {
                try {
                    const res = await fetch("https://api.x.ai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: "grok-2-latest",
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("xAI Grok error:", err);
                }
            }
        }

        // 15. Together AI
        else if (model.startsWith("together")) {
            const apiKey = customKeys.together || process.env.TOGETHER_API_KEY;
            if (apiKey) {
                try {
                    const targetModel = model.includes("r1") ? "deepseek-ai/DeepSeek-R1" : "meta-llama/Llama-3.3-70B-Instruct-Turbo";
                    const res = await fetch("https://api.together.xyz/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("Together AI error:", err);
                }
            }
        }

        // 16. Fireworks AI
        else if (model.startsWith("fireworks")) {
            const apiKey = customKeys.fireworks || process.env.FIREWORKS_API_KEY;
            if (apiKey) {
                try {
                    const targetModel = model.includes("r1") ? "accounts/fireworks/models/deepseek-r1" : "accounts/fireworks/models/llama-v3p3-70b-instruct";
                    const res = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("Fireworks AI error:", err);
                }
            }
        }

        // 17. Perplexity AI
        else if (model.startsWith("sonar") || model.startsWith("perplexity")) {
            const apiKey = customKeys.perplexity || process.env.PERPLEXITY_API_KEY;
            if (apiKey) {
                try {
                    const res = await fetch("https://api.perplexity.ai/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: "sonar-reasoning-pro",
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("Perplexity AI error:", err);
                }
            }
        }

        // 18. OpenRouter Universal Gateway (300+ Models)
        else if (model.startsWith("openrouter")) {
            const apiKey = customKeys.openrouter || process.env.OPENROUTER_API_KEY;
            if (apiKey) {
                try {
                    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`,
                            "HTTP-Referer": "http://localhost:3000",
                            "X-Title": "EasyCode"
                        },
                        body: JSON.stringify({
                            model: "auto",
                            messages: [{ role: "user", content: systemPrompt }],
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await res.json();
                    if (data.choices?.[0]?.message?.content) {
                        generatedProblem = JSON.parse(data.choices[0].message.content);
                    }
                } catch (err) {
                    console.warn("OpenRouter API error:", err);
                }
            }
        }

        // 19. Local Ollama Endpoint
        else if (model.startsWith("ollama")) {
            const endpoint = customKeys.ollamaUrl || "http://localhost:11434";
            try {
                const res = await fetch(`${endpoint}/api/generate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: "qwen2.5-coder:latest",
                        prompt: systemPrompt,
                        format: "json",
                        stream: false
                    })
                });
                const data = await res.json();
                if (data.response) {
                    generatedProblem = JSON.parse(data.response);
                }
            } catch (err) {
                console.warn("Local Ollama endpoint error:", err);
            }
        }

        // 20. Custom OpenAI-Compatible Base URL
        else if (customKeys.customBaseUrl) {
            try {
                const endpoint = `${customKeys.customBaseUrl.replace(/\/$/, '')}/chat/completions`;
                const headers: Record<string, string> = { "Content-Type": "application/json" };
                if (customKeys.customApiKey) {
                    headers["Authorization"] = `Bearer ${customKeys.customApiKey}`;
                }
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        model: customKeys.customModelName || model,
                        messages: [{ role: "user", content: systemPrompt }],
                        response_format: { type: "json_object" }
                    })
                });
                const data = await res.json();
                if (data.choices?.[0]?.message?.content) {
                    generatedProblem = JSON.parse(data.choices[0].message.content);
                }
            } catch (err) {
                console.warn("Custom endpoint error:", err);
            }
        }

        if (!generatedProblem) {
            return NextResponse.json({
                success: false,
                message: `No active API key configured for model "${model}". Please add your API key in Settings & API Keys to generate challenges.`
            }, { status: 400 });
        }

        // Save challenge to Supabase
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
                companies: ["Google", "Meta", "Amazon", "Apple"]
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
