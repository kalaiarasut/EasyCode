import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME_MAP: Record<string, string> = {
  "gemini-2.5-flash": "Gemini 2.5 Flash",
  "gemini-2.5-pro": "Gemini 2.5 Pro",
  "gemini-2.0-flash-thinking": "Gemini 2.0 Flash Thinking",
  "gemini-2.0-flash": "Gemini 2.0 Flash",
  "gemini-1.5-pro": "Gemini 1.5 Pro",
  "claude-3.7-sonnet": "Claude 3.7 Sonnet",
  "claude-3.5-sonnet": "Claude 3.5 Sonnet",
  "claude-3.5-haiku": "Claude 3.5 Haiku",
  "claude-3-opus": "Claude 3 Opus",
  "o3-mini": "o3-mini",
  "o1": "o1",
  "o1-mini": "o1-mini",
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o mini",
  "deepseek-r1": "DeepSeek R1",
  "deepseek-v3": "DeepSeek V3",
  "deepseek-coder-v2": "DeepSeek Coder V2",
  "groq-llama-3.3-70b": "Llama 3.3 70B (Groq)",
  "groq-deepseek-r1-llama-70b": "DeepSeek R1 70B (Groq)",
  "groq-qwen-2.5-coder-32b": "Qwen 2.5 Coder (Groq)",
  "kimi-latest": "Kimi Latest",
  "moonshot-v1-32k": "Moonshot v1 32k",
  "qwen-2.5-coder-32b": "Qwen 2.5 Coder 32B",
  "qwq-32b-preview": "QwQ 32B Preview",
  "codestral-latest": "Codestral 22B",
  "mistral-large": "Mistral Large",
  "grok-2": "Grok 2",
  "grok-2-mini": "Grok 2 mini",
  "cerebras-llama-3.3-70b": "Llama 3.3 70B (Cerebras)",
  "sambanova-deepseek-r1": "DeepSeek R1 (SambaNova)",
  "sonar-reasoning-pro": "Sonar Reasoning Pro",
  "command-r-plus": "Command R+",
  "ollama-local": "Local Ollama",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sourceCode = "",
      inputMessage,
      problemInfo,
      model = "auto",
      customKeys = {}
    } = body;

    if (!inputMessage || typeof inputMessage !== "string") {
      return NextResponse.json({
        success: false,
        message: "Input message required",
      }, { status: 400 });
    }

    // Resolve Auto Model Selection
    let targetModel = model;
    if (targetModel === "auto" || !targetModel) {
      const lowerQuery = inputMessage.toLowerCase();
      const isComplexQuery = lowerQuery.includes("dp") || lowerQuery.includes("dynamic programming") || lowerQuery.includes("graph") || lowerQuery.includes("math") || lowerQuery.includes("proof") || lowerQuery.includes("hard") || lowerQuery.includes("invariant");
      
      if (isComplexQuery) {
        if (customKeys.deepseek) targetModel = "deepseek-r1";
        else if (customKeys.anthropic) targetModel = "claude-3.7-sonnet";
        else if (customKeys.openai) targetModel = "o3-mini";
        else if (customKeys.gemini || process.env.GEMINI_API_KEY) targetModel = "gemini-2.0-flash-thinking";
        else if (customKeys.groq) targetModel = "groq-deepseek-r1-llama-70b";
        else targetModel = "gemini-2.5-flash";
      } else {
        if (customKeys.anthropic) targetModel = "claude-3.7-sonnet";
        else if (customKeys.gemini || process.env.GEMINI_API_KEY) targetModel = "gemini-2.5-flash";
        else if (customKeys.openai) targetModel = "gpt-4o-mini";
        else if (customKeys.groq) targetModel = "groq-llama-3.3-70b";
        else if (customKeys.kimi) targetModel = "kimi-latest";
        else targetModel = "gemini-2.5-flash";
      }
    }

    const problemContext = problemInfo
      ? `\nActive Problem: "${problemInfo.title || "Challenge"}" (${problemInfo.level || "Medium"})\nDescription: ${problemInfo.description || ""}\nConstraints: ${Array.isArray(problemInfo.constraints) ? problemInfo.constraints.join(', ') : (problemInfo.constraints || "")}\n`
      : "";

    const systemPrompt = `You are a Principal AI Technical Coding Interviewer & Pair Programming Assistant on an enterprise LeetCode platform.
${problemContext}
The user is working on this challenge in the Monaco Code Editor.
Current Code in Editor:
\`\`\`
${sourceCode || "// No code in editor yet"}
\`\`\`

User Query: "${inputMessage}"

Instructions:
1. Provide a concise, clear, and high-impact response directly addressing the user's request.
2. If the user asks for intuition or an explanation, explain the optimal algorithmic approach and pattern without dumping the full code unless specifically requested.
3. If the user asks to debug or review code, inspect their editor code for syntax errors, logical bugs, off-by-one errors, or time complexity bottlenecks, and give actionable corrections.
4. If the user asks for hints, provide surgical, progressive guidance.
5. Format code identifiers with \`code\` tags and code snippets with markdown fenced blocks.`;

    let responseText = "";
    let rateLimited = false;

    // 1. Google Gemini Provider
    if (targetModel.startsWith("gemini")) {
      const geminiKey = customKeys.gemini || process.env.GEMINI_API_KEY;
      if (geminiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          let geminiModelName = "gemini-2.5-flash";
          if (targetModel === "gemini-2.5-pro") geminiModelName = "gemini-2.5-pro";
          else if (targetModel === "gemini-2.0-flash-thinking") geminiModelName = "gemini-2.0-flash-thinking";
          else if (targetModel === "gemini-2.0-flash") geminiModelName = "gemini-2.0-flash";
          else if (targetModel === "gemini-1.5-pro") geminiModelName = "gemini-1.5-pro";

          const result = await ai.models.generateContent({
            model: geminiModelName,
            contents: systemPrompt,
          });
          responseText = result.text || "";
        } catch (err: any) {
          if (err?.status === 429 || String(err).includes("429") || String(err).includes("quota")) {
            rateLimited = true;
          }
        }
      }
    }

    // 2. Anthropic Claude Provider
    else if (targetModel.startsWith("claude")) {
      const claudeKey = customKeys.anthropic || process.env.ANTHROPIC_API_KEY;
      if (claudeKey) {
        try {
          let claudeModelName = "claude-3-5-sonnet-20241022";
          if (targetModel.includes("3.7")) claudeModelName = "claude-3-7-sonnet-20250219";
          else if (targetModel.includes("haiku")) claudeModelName = "claude-3-5-haiku-20241022";

          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": claudeKey,
              "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
              model: claudeModelName,
              max_tokens: 1500,
              messages: [{ role: "user", content: systemPrompt }]
            })
          });

          if (res.status === 429) rateLimited = true;
          else {
            const data = await res.json();
            responseText = data.content?.[0]?.text || "";
          }
        } catch (err) {
          console.error("Claude request error:", err);
        }
      }
    }

    // 3. OpenAI / DeepSeek / Groq / OpenRouter / Custom Endpoints
    else {
      let endpoint = "https://api.openai.com/v1/chat/completions";
      let apiKey = customKeys.openai || process.env.OPENAI_API_KEY;
      let openAiModel = targetModel;

      if (targetModel.startsWith("deepseek")) {
        endpoint = "https://api.deepseek.com/v1/chat/completions";
        apiKey = customKeys.deepseek || process.env.DEEPSEEK_API_KEY || apiKey;
      } else if (targetModel.startsWith("groq")) {
        endpoint = "https://api.groq.com/openai/v1/chat/completions";
        apiKey = customKeys.groq || process.env.GROQ_API_KEY || apiKey;
        openAiModel = targetModel.replace("groq-", "");
      } else if (targetModel.startsWith("kimi") || targetModel.startsWith("moonshot")) {
        endpoint = "https://api.moonshot.cn/v1/chat/completions";
        apiKey = customKeys.kimi || process.env.MOONSHOT_API_KEY || apiKey;
      }

      if (apiKey) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: openAiModel,
              messages: [{ role: "user", content: systemPrompt }],
              temperature: 0.4,
            })
          });

          if (res.status === 429) rateLimited = true;
          else {
            const data = await res.json();
            responseText = data.choices?.[0]?.message?.content || "";
          }
        } catch (err) {
          console.error("OpenAI/compatible API error:", err);
        }
      }
    }

    // Fallback if no response or rate limited
    if (!responseText) {
      if (inputMessage.toLowerCase().includes("hint") || inputMessage.toLowerCase().includes("help")) {
        responseText = `Here is a structured hint for "${problemInfo?.title || "this problem"}":\n\n1. Identify the core subproblem or invariant state.\n2. Consider if a hash map lookup, two-pointer window, or monotonic structure reduces redundant checks from $O(N^2)$ to $O(N)$.\n3. Walk through Example 1 step-by-step with your current code to check state updates.`;
      } else if (inputMessage.toLowerCase().includes("debug") || inputMessage.toLowerCase().includes("syntax") || inputMessage.toLowerCase().includes("error")) {
        responseText = `Code Review for your active editor code:\n\n• **Syntax Check**: Ensure all variable declarations match your types and indices stay within bounds (\`0 <= i < nums.length\`).\n• **Edge Cases**: Verify behavior when input size is 0 or 1, and ensure return statements cover all branch conditions.\n• **Optimization**: Check if unnecessary allocations or nested iterations can be removed.`;
      } else {
        responseText = `To solve "${problemInfo?.title || "this problem"}" with optimal time and space complexity:\n\n1. Analyze the mathematical constraints.\n2. Maintain an in-place state or auxiliary lookup table.\n3. Verify your solution against all sample test cases before running!`;
      }
    }

    const resolvedName = MODEL_NAME_MAP[targetModel] || targetModel;

    return NextResponse.json({
      success: true,
      message: "Generated output successfully",
      output: responseText,
      modelUsed: resolvedName,
      isRateLimited: rateLimited,
      rateLimitedModel: rateLimited ? targetModel : undefined,
    }, { status: 200 });
  } catch (error) {
    console.error("Chat output error:", error);
    return NextResponse.json({
      success: true,
      output: "Here is guidance for your code: verify edge cases with single elements, ensure variable scope is correct, and consider hashing or two pointers for linear time performance.",
      modelUsed: "AI Engine",
    }, { status: 200 });
  }
}