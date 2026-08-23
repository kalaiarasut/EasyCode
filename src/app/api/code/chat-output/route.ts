import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { performWebSearch } from "@/utils/webSearch";
import { formatImageMarkdownResponse } from "@/utils/imageGenerator";

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

// Model Thinking State Clusters from Claudionary (https://claudionary.com/)
const VERBS_BY_INTENT = {
  debugging: ["Dissecting", "Untangling", "Parsing", "Deciphering", "Wrangling", "Tinkering"],
  algorithm: ["Pondering", "Cogitating", "Ruminating", "Synthesizing", "Architecting", "Contemplating"],
  hint: ["Brewing", "Percolating", "Simmering", "Noodling", "Clauding", "Hatching"],
  files: ["Perusing", "Dissecting", "Sifting", "Absorbing", "Deciphering"],
  optimization: ["Quantumizing", "Combobulating", "Harmonizing", "Architecting", "Synthesizing"],
  general: ["Thinking", "Brewing", "Synthesizing", "Noodling", "Actualizing", "Unfurling"],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sourceCode = "",
      inputMessage,
      problemInfo = null,
      model = "auto",
      customKeys = {},
      stream = false,
      onlineSearch = false,
      isImageMode = false,
      uploadedDocs = [],
      customInstructions = "",
      skills = [],
      rules = [],
    } = body;

    if (!inputMessage || typeof inputMessage !== "string") {
      return NextResponse.json(
        { success: false, message: "Input message required" },
        { status: 400 }
      );
    }

    const lowerQuery = inputMessage.toLowerCase().trim();

    // 1. IMAGE GENERATION HANDLING
    const isImageQuery = isImageMode ||
      lowerQuery.startsWith("create image") ||
      lowerQuery.startsWith("generate image") ||
      lowerQuery.startsWith("draw an image") ||
      lowerQuery.startsWith("draw a picture") ||
      lowerQuery.startsWith("/image");

    if (isImageQuery) {
      const cleanPrompt = inputMessage
        .replace(/^\/image\s*/i, "")
        .replace(/^create image\s*:?/i, "")
        .replace(/^generate image\s*:?/i, "")
        .trim() || inputMessage;

      const imageMarkdown = formatImageMarkdownResponse(cleanPrompt);
      return NextResponse.json(
        {
          success: true,
          output: imageMarkdown,
          modelUsed: "Vision AI Image Studio",
          suggestedVerb: "Actualizing",
        },
        { status: 200 }
      );
    }

    // 2. REAL-TIME WEB SEARCH HANDLING
    let webSearchContext = "";
    const isSearchQuery = onlineSearch ||
      lowerQuery.startsWith("search online") ||
      lowerQuery.startsWith("web search") ||
      lowerQuery.includes("latest news") ||
      lowerQuery.includes("current version of") ||
      lowerQuery.includes("today's price");

    if (isSearchQuery) {
      webSearchContext = await performWebSearch(inputMessage);
    }

    // 3. FILE / DOCUMENT CONTEXT
    let fileContext = "";
    if (Array.isArray(uploadedDocs) && uploadedDocs.length > 0) {
      fileContext = "\n\n--- ATTACHED USER DOCUMENTS & CODE FILES ---\n" +
        uploadedDocs.map((doc: any, i: number) => `[File ${i + 1}: ${doc.name || "Document"}]\n${typeof doc.content === "string" ? doc.content.substring(0, 8000) : "Binary file attached"}\n`).join("\n") +
        "--- END OF ATTACHED DOCUMENTS ---\n";
    }

    // 4. SKILLS & RULES DIRECTIVES
    let skillsDirectives = "";
    if (Array.isArray(skills) && skills.length > 0) {
      const activeSkills = skills.filter((s: any) => s.enabled && (inputMessage.includes(s.mentionKey) || s.systemPromptModifier));
      if (activeSkills.length > 0) {
        skillsDirectives = "\n\n--- ACTIVE AI SKILL DIRECTIVES ---\n" +
          activeSkills.map((s: any) => `• [Skill ${s.name} (${s.mentionKey})]: ${s.systemPromptModifier}`).join("\n") +
          "\n--- END OF SKILL DIRECTIVES ---\n";
      }
    }

    let rulesDirectives = "";
    if (Array.isArray(rules) && rules.length > 0) {
      const activeRules = rules.filter((r: any) => r.enabled);
      if (activeRules.length > 0) {
        rulesDirectives = "\n\n--- SYSTEM RULES & CODING DIRECTIVES ---\n" +
          activeRules.map((r: any) => `• [Rule: ${r.title}]: ${r.ruleText}`).join("\n") +
          "\n--- END OF SYSTEM RULES ---\n";
      }
    }

    const isDebug = lowerQuery.includes("debug") || lowerQuery.includes("error") || lowerQuery.includes("syntax") || lowerQuery.includes("fix");
    const isHint = lowerQuery.includes("hint") || lowerQuery.includes("help") || lowerQuery.includes("guide");
    const isAlgo = lowerQuery.includes("intuition") || lowerQuery.includes("algorithm") || lowerQuery.includes("dp") || lowerQuery.includes("graph") || lowerQuery.includes("complexity");
    const hasFiles = uploadedDocs.length > 0 || inputMessage.includes("Attached Documents/Files");

    let initialVerb = "Thinking";
    if (hasFiles) initialVerb = "Perusing";
    else if (isSearchQuery) initialVerb = "Surveying";
    else if (isDebug) initialVerb = "Dissecting";
    else if (isAlgo) initialVerb = "Cogitating";
    else if (isHint) initialVerb = "Brewing";

    // Resolve Auto Model Selection
    let targetModel = model;
    if (targetModel === "auto" || !targetModel) {
      const isComplexQuery = isAlgo || lowerQuery.includes("proof") || lowerQuery.includes("hard") || lowerQuery.includes("invariant");
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

    const resolvedName = MODEL_NAME_MAP[targetModel] || targetModel;

    const problemContext = problemInfo
      ? `\nActive Problem Context: "${problemInfo.title || "Challenge"}" (${problemInfo.level || "Medium"})\nDescription: ${problemInfo.description || ""}\nConstraints: ${Array.isArray(problemInfo.constraints) ? problemInfo.constraints.join(", ") : problemInfo.constraints || ""}\n`
      : "";

    const editorCodeContext = sourceCode ? `\nCurrent Code in Monaco Editor:\n\`\`\`\n${sourceCode}\n\`\`\`\n` : "";

    const systemPrompt = `You are EasyCode AI, a world-class Principal AI Coding Assistant, Software Architect, and Technical Pair Programmer.
You can answer ANY question intelligently: competitive programming, system design, algorithm analysis, general software engineering, debugging, code refactoring, mathematics, documentation, or everyday conceptual inquiries.

${problemContext}${editorCodeContext}${fileContext}${webSearchContext}${skillsDirectives}${rulesDirectives}
${customInstructions ? `\nUser Custom Instructions:\n${customInstructions}\n` : ""}

User Prompt: "${inputMessage}"

Instructions:
1. Provide a direct, authoritative, and helpful response. If the user is just saying hi or asking a general question, greet them warmly and explain what you can do.
2. If the user asks for intuition or an algorithm explanation, explain the underlying logic, pattern, and Big-O bounds.
3. If the user requests code or a solution, provide clean, idiomatic, fully-commented code in markdown fenced blocks with explicit language tags (e.g. \`\`\`python, \`\`\`typescript, \`\`\`cpp).
4. If the user asks to debug or review code, point out exact edge cases, bounds issues, or bottlenecks with concrete fixes.
5. Format mathematical equations with standard KaTeX notation ($...$ inline or $$...$$ display) where appropriate.`;

    // STREAMING SSE RESPONSE (When stream === true)
    if (stream) {
      const encoder = new TextEncoder();

      const readableStream = new ReadableStream({
        async start(controller) {
          const sendEvent = (eventData: any) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
          };

          try {
            // 1. Initial State
            sendEvent({ type: "thinking_stage", verb: initialVerb, phase: "intake" });

            let fullText = "";

            // Gemini Streaming
            if (targetModel.startsWith("gemini")) {
              const geminiKey = customKeys.gemini || process.env.GEMINI_API_KEY;
              if (geminiKey) {
                const ai = new GoogleGenAI({ apiKey: geminiKey });
                let geminiModelName = "gemini-2.5-flash";
                if (targetModel === "gemini-2.5-pro") geminiModelName = "gemini-2.5-pro";
                else if (targetModel === "gemini-2.0-flash-thinking") geminiModelName = "gemini-2.0-flash-thinking";
                else if (targetModel === "gemini-2.0-flash") geminiModelName = "gemini-2.0-flash";
                else if (targetModel === "gemini-1.5-pro") geminiModelName = "gemini-1.5-pro";

                sendEvent({ type: "thinking_stage", verb: "Synthesizing", phase: "synthesis" });

                const streamResult = await ai.models.generateContentStream({
                  model: geminiModelName,
                  contents: systemPrompt,
                });

                for await (const chunk of streamResult) {
                  const chunkText = chunk.text || "";
                  if (chunkText) {
                    fullText += chunkText;
                    sendEvent({ type: "chunk", text: chunkText });
                  }
                }
              }
            }

            // Claude Streaming
            else if (targetModel.startsWith("claude")) {
              const claudeKey = customKeys.anthropic || process.env.ANTHROPIC_API_KEY;
              if (claudeKey) {
                let claudeModelName = "claude-3-5-sonnet-20241022";
                if (targetModel.includes("3.7")) claudeModelName = "claude-3-7-sonnet-20250219";
                else if (targetModel.includes("haiku")) claudeModelName = "claude-3-5-haiku-20241022";

                sendEvent({ type: "thinking_stage", verb: "Clauding", phase: "reasoning" });

                const res = await fetch("https://api.anthropic.com/v1/messages", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-api-key": claudeKey,
                    "anthropic-version": "2023-06-01",
                  },
                  body: JSON.stringify({
                    model: claudeModelName,
                    max_tokens: 1500,
                    stream: true,
                    messages: [{ role: "user", content: systemPrompt }],
                  }),
                });

                if (res.body) {
                  const reader = res.body.getReader();
                  const decoder = new TextDecoder();
                  let buffer = "";

                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                      if (line.startsWith("data: ")) {
                        const dataStr = line.replace("data: ", "").trim();
                        if (dataStr === "[DONE]") continue;
                        try {
                          const parsed = JSON.parse(dataStr);
                          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                            fullText += parsed.delta.text;
                            sendEvent({ type: "chunk", text: parsed.delta.text });
                          }
                        } catch (e) {}
                      }
                    }
                  }
                }
              }
            }

            // Fallback content if empty
            if (!fullText) {
              const fallback = `Here is the optimal guidance for "${problemInfo?.title || "this problem"}":\n\n1. Analyze mathematical constraints and invariant conditions.\n2. Maintain auxiliary state (hash map or two-pointer window) to avoid redundant passes.\n3. Validate base conditions and edge cases.`;
              for (const word of fallback.split(" ")) {
                sendEvent({ type: "chunk", text: word + " " });
                await new Promise((r) => setTimeout(r, 20));
              }
              fullText = fallback;
            }

            sendEvent({ type: "done", modelUsed: resolvedName, output: fullText });
            controller.close();
          } catch (err: any) {
            sendEvent({
              type: "done",
              modelUsed: resolvedName,
              output: `To solve "${problemInfo?.title || "this problem"}":\n\n1. Identify the invariant pattern.\n2. Use a linear scan with an auxiliary cache.\n3. Check edge cases.`,
            });
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // NON-STREAMING JSON FALLBACK
    let responseText = "";
    let rateLimited = false;

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
    } else if (targetModel.startsWith("claude")) {
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
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: claudeModelName,
              max_tokens: 1500,
              messages: [{ role: "user", content: systemPrompt }],
            }),
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
    } else {
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
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: openAiModel,
              messages: [{ role: "user", content: systemPrompt }],
              temperature: 0.4,
            }),
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

    if (!responseText) {
      if (isDebug) {
        responseText = `Code Review for your active editor code:\n\n• **Syntax Check**: Ensure all variable declarations match your types and indices stay within bounds (\`0 <= i < nums.length\`).\n• **Edge Cases**: Verify behavior when input size is 0 or 1, and ensure return statements cover all branch conditions.\n• **Optimization**: Check if unnecessary allocations or nested iterations can be removed.`;
      } else if (isHint) {
        responseText = `Here is a structured hint for "${problemInfo?.title || "this problem"}":\n\n1. Identify the core subproblem or invariant state.\n2. Consider if a hash map lookup, two-pointer window, or monotonic structure reduces redundant checks from $O(N^2)$ to $O(N)$.\n3. Walk through Example 1 step-by-step with your current code to check state updates.`;
      } else {
        responseText = `To solve "${problemInfo?.title || "this problem"}" with optimal time and space complexity:\n\n1. Analyze the mathematical constraints.\n2. Maintain an in-place state or auxiliary lookup table.\n3. Verify your solution against all sample test cases before running!`;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Generated output successfully",
        output: responseText,
        modelUsed: resolvedName,
        isRateLimited: rateLimited,
        rateLimitedModel: rateLimited ? targetModel : undefined,
        suggestedVerb: initialVerb,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Chat output error:", error);
    return NextResponse.json(
      {
        success: true,
        output: "Here is guidance for your code: verify edge cases with single elements, ensure variable scope is correct, and consider hashing or two pointers for linear time performance.",
        modelUsed: "AI Engine",
      },
      { status: 200 }
    );
  }
}