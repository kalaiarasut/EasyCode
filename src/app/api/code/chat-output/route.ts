import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { performWebSearch } from "@/utils/webSearch";
import { formatImageMarkdownResponse } from "@/utils/imageGenerator";

const MODEL_NAME_MAP: Record<string, string> = {
  "gemini-3.6-flash": "Gemini 3.6 Flash",
  "gemini-3.5-flash": "Gemini 3.5 Flash",
  "gemini-flash-latest": "Gemini Flash Latest",
  "gemini-3.7-flash": "Gemini 3.7 Flash",
  "gemini-3.1-pro-preview": "Gemini 3.1 Pro",
  "gemini-2.0-flash": "Gemini 3.6 Flash",
  "gemini-2.5-flash": "Gemini 3.6 Flash",
  "gemini-2.5-pro": "Gemini 3.1 Pro",
  "groq/compound": "Groq Compound (MoE)",
  "groq/compound-mini": "Groq Compound Mini",
  "qwen/qwen3.6-27b": "Qwen 3.6 27B (Groq)",
  "openai/gpt-oss-120b": "GPT-OSS 120B (Groq)",
  "openai/gpt-oss-20b": "GPT-OSS 20B (Groq)",
  "allam-2-7b": "Allam 2 7B (Groq)",
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

// Dynamic resolution using Google ListModels API to guarantee model exists for user's key
async function resolveWorkingGeminiModel(
  apiKey: string,
  preferredModel: string
): Promise<{ modelName: string; availableModels: string[]; error?: string }> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { method: "GET" }
    );
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error?.message || `Google API error (Status ${res.status}): ${res.statusText}`;
      return { modelName: "", availableModels: [], error: msg };
    }

    const data = await res.json();
    const models: any[] = data.models || [];
    const supported = models
      .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: any) => m.name.replace(/^models\//, ""));

    if (supported.length === 0) {
      return {
        modelName: "",
        availableModels: [],
        error: "Your Google API key has no models enabled for generateContent. Please ensure 'Generative Language API' is enabled on your project in Google Cloud / Google AI Studio.",
      };
    }

    // Direct match
    if (supported.includes(preferredModel)) {
      return { modelName: preferredModel, availableModels: supported };
    }

    // Match without prefixes/suffixes
    const cleanPreferred = preferredModel.replace("-exp", "").replace("-latest", "").replace("-001", "").replace("-002", "");
    const match = supported.find((m) => m.includes(cleanPreferred) || cleanPreferred.includes(m));
    if (match) {
      return { modelName: match, availableModels: supported };
    }

    // Priority fallback from supported list
    const priorityList = [
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-flash-latest",
      "gemini-3.7-flash",
      "gemini-3.1-pro-preview",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-pro-latest",
      "gemini-pro",
    ];

    for (const p of priorityList) {
      if (supported.includes(p)) {
        return { modelName: p, availableModels: supported };
      }
    }

    return { modelName: supported[0], availableModels: supported };
  } catch (e: any) {
    return { modelName: preferredModel, availableModels: [], error: e?.message || String(e) };
  }
}

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
    const isImageQuery =
      isImageMode ||
      lowerQuery.startsWith("create image") ||
      lowerQuery.startsWith("generate image") ||
      lowerQuery.startsWith("draw an image") ||
      lowerQuery.startsWith("draw a picture") ||
      lowerQuery.startsWith("/image");

    if (isImageQuery) {
      const cleanPrompt =
        inputMessage
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
    const isSearchQuery =
      onlineSearch ||
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
      fileContext =
        "\n\n--- ATTACHED USER DOCUMENTS & CODE FILES ---\n" +
        uploadedDocs
          .map(
            (doc: any, i: number) =>
              `[File ${i + 1}: ${doc.name || "Document"}]\n${
                typeof doc.content === "string"
                  ? doc.content.substring(0, 8000)
                  : "Binary file attached"
              }\n`
          )
          .join("\n") +
        "--- END OF ATTACHED DOCUMENTS ---\n";
    }

    // 4. SKILLS & RULES DIRECTIVES
    let skillsDirectives = "";
    if (Array.isArray(skills) && skills.length > 0) {
      const activeSkills = skills.filter(
        (s: any) =>
          s.enabled &&
          (inputMessage.includes(s.mentionKey) || s.systemPromptModifier)
      );
      if (activeSkills.length > 0) {
        skillsDirectives =
          "\n\n--- ACTIVE AI SKILL DIRECTIVES ---\n" +
          activeSkills
            .map(
              (s: any) =>
                `• [Skill ${s.name} (${s.mentionKey})]: ${s.systemPromptModifier}`
            )
            .join("\n") +
          "\n--- END OF SKILL DIRECTIVES ---\n";
      }
    }

    let rulesDirectives = "";
    if (Array.isArray(rules) && rules.length > 0) {
      const activeRules = rules.filter((r: any) => r.enabled);
      if (activeRules.length > 0) {
        rulesDirectives =
          "\n\n--- SYSTEM RULES & CODING DIRECTIVES ---\n" +
          activeRules
            .map((r: any) => `• [Rule: ${r.title}]: ${r.ruleText}`)
            .join("\n") +
          "\n--- END OF SYSTEM RULES ---\n";
      }
    }

    const isDebug =
      lowerQuery.includes("debug") ||
      lowerQuery.includes("error") ||
      lowerQuery.includes("syntax") ||
      lowerQuery.includes("fix");
    const isHint =
      lowerQuery.includes("hint") ||
      lowerQuery.includes("help") ||
      lowerQuery.includes("guide");
    const isAlgo =
      lowerQuery.includes("intuition") ||
      lowerQuery.includes("algorithm") ||
      lowerQuery.includes("dp") ||
      lowerQuery.includes("graph") ||
      lowerQuery.includes("complexity");
    const hasFiles =
      uploadedDocs.length > 0 || inputMessage.includes("Attached Documents/Files");

    let initialVerb = "Thinking";
    if (hasFiles) initialVerb = "Perusing";
    else if (isSearchQuery) initialVerb = "Surveying";
    else if (isDebug) initialVerb = "Dissecting";
    else if (isAlgo) initialVerb = "Cogitating";
    else if (isHint) initialVerb = "Brewing";

    // Resolve Auto Model Selection
    let targetModel = model;
    if (targetModel === "auto" || !targetModel) {
      const isComplexQuery =
        isAlgo ||
        lowerQuery.includes("proof") ||
        lowerQuery.includes("hard") ||
        lowerQuery.includes("invariant");
      if (isComplexQuery) {
        if (customKeys.deepseek) targetModel = "deepseek-r1";
        else if (customKeys.anthropic) targetModel = "claude-3.7-sonnet";
        else if (customKeys.openai) targetModel = "o3-mini";
        else if (customKeys.gemini || process.env.GEMINI_API_KEY)
          targetModel = "gemini-2.0-flash-thinking";
        else if (customKeys.groq) targetModel = "groq-deepseek-r1-llama-70b";
        else targetModel = "gemini-2.0-flash";
      } else {
        if (customKeys.anthropic) targetModel = "claude-3.7-sonnet";
        else if (customKeys.gemini || process.env.GEMINI_API_KEY)
          targetModel = "gemini-2.0-flash";
        else if (customKeys.openai) targetModel = "gpt-4o-mini";
        else if (customKeys.groq) targetModel = "groq-llama-3.3-70b";
        else if (customKeys.kimi) targetModel = "kimi-latest";
        else targetModel = "gemini-2.0-flash";
      }
    }

    const resolvedName = MODEL_NAME_MAP[targetModel] || targetModel;

    const problemContext = problemInfo
      ? `\nActive Problem Context: "${problemInfo.title || "Challenge"}" (${
          problemInfo.level || "Medium"
        })\nDescription: ${problemInfo.description || ""}\nConstraints: ${
          Array.isArray(problemInfo.constraints)
            ? problemInfo.constraints.join(", ")
            : problemInfo.constraints || ""
        }\n`
      : "";

    const editorCodeContext = sourceCode
      ? `\nCurrent Code in Monaco Editor:\n\`\`\`\n${sourceCode}\n\`\`\`\n`
      : "";

    const systemPrompt = `You are EasyCode AI, a world-class Principal AI Coding Assistant, Software Architect, and Technical Pair Programmer.
You can answer ANY question intelligently: competitive programming, system design, algorithm analysis, general software engineering, debugging, code refactoring, mathematics, documentation, or everyday conceptual inquiries.

${problemContext}${editorCodeContext}${fileContext}${webSearchContext}${skillsDirectives}${rulesDirectives}
${customInstructions ? `\nUser Custom Instructions:\n${customInstructions}\n` : ""}

User Prompt: "${inputMessage}"

Instructions:
1. Provide a direct, authoritative, and helpful response. If the user is just saying hi or asking a general question, greet them warmly and answer directly.
2. If the user asks for a problem, generate full problem details (title, difficulty, description, examples, constraints, optimal algorithm intuition, and starter code stub).
3. If the user asks for code or a solution, provide clean, idiomatic, fully-commented code in markdown fenced blocks with explicit language tags (e.g. \`\`\`python, \`\`\`typescript, \`\`\`cpp).
4. If the user asks to debug or review code, point out exact edge cases, bounds issues, or bottlenecks with concrete fixes.
5. Format mathematical equations with standard KaTeX notation ($...$ inline or $$...$$ display) where appropriate.`;

    // STREAMING SSE RESPONSE (When stream === true)
    if (stream) {
      const encoder = new TextEncoder();

      const readableStream = new ReadableStream({
        async start(controller) {
          const sendEvent = (eventData: any) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`)
            );
          };

          try {
            sendEvent({ type: "thinking_stage", verb: initialVerb, phase: "intake" });

            let fullText = "";

            // 1. Google Gemini Streaming
            if (targetModel.startsWith("gemini")) {
              const geminiKey = customKeys.gemini || process.env.GEMINI_API_KEY;
              if (!geminiKey || geminiKey.trim().length < 5) {
                throw new Error(
                  "Gemini API key is not configured. Please add your Gemini API key in Settings or set GEMINI_API_KEY in your .env file."
                );
              }

              sendEvent({ type: "thinking_stage", verb: "Synthesizing", phase: "synthesis" });

              // Resolve verified working model for this user's API key
              const { modelName: activeGeminiModel, error: geminiResolveErr } = await resolveWorkingGeminiModel(geminiKey, targetModel);

              if (!activeGeminiModel) {
                throw new Error(geminiResolveErr || "No working Gemini model available for this API key.");
              }

              const ai = new GoogleGenAI({ apiKey: geminiKey });
              try {
                const streamResult = await ai.models.generateContentStream({
                  model: activeGeminiModel,
                  contents: systemPrompt,
                });

                for await (const chunk of streamResult) {
                  const chunkText = chunk.text || "";
                  if (chunkText) {
                    fullText += chunkText;
                    sendEvent({ type: "chunk", text: chunkText });
                  }
                }
              } catch (sdkErr: any) {
                console.warn(`Gemini SDK stream failed with ${activeGeminiModel}, attempting direct REST stream...`, sdkErr?.message || sdkErr);
                // Try direct REST endpoint
                const restRes = await fetch(
                  `https://generativelanguage.googleapis.com/v1beta/models/${activeGeminiModel}:generateContent?key=${geminiKey}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: systemPrompt }] }],
                    }),
                  }
                );
                if (restRes.ok) {
                  const data = await restRes.json();
                  const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                  if (txt) {
                    fullText = txt;
                    sendEvent({ type: "chunk", text: txt });
                  }
                } else {
                  const errData = await restRes.json().catch(() => ({}));
                  throw new Error(errData?.error?.message || sdkErr?.message || `Google API error ${restRes.status}`);
                }
              }

              if (!fullText.trim()) {
                throw new Error(`Failed to generate response from Gemini model ${activeGeminiModel}.`);
              }
            }

            // 2. Anthropic Claude Streaming
            else if (targetModel.startsWith("claude")) {
              const claudeKey = customKeys.anthropic || process.env.ANTHROPIC_API_KEY;
              if (!claudeKey || claudeKey.trim().length < 5) {
                throw new Error(
                  "Anthropic Claude API key is not configured. Please add your Anthropic API key in Settings."
                );
              }

              let claudeModelName = "claude-3-5-sonnet-20241022";
              if (targetModel.includes("3.7")) claudeModelName = "claude-3-7-sonnet-20250219";
              else if (targetModel.includes("haiku")) claudeModelName = "claude-3-5-haiku-20241022";
              else if (targetModel.includes("opus")) claudeModelName = "claude-3-opus-20240229";

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
                  max_tokens: 2500,
                  stream: true,
                  messages: [{ role: "user", content: systemPrompt }],
                }),
              });

              if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(
                  errJson?.error?.message || `Anthropic API error (status ${res.status}): ${res.statusText}`
                );
              }

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

            // 3. OpenAI & Compatible Providers (DeepSeek, Groq, Kimi, Moonshot, Cerebras, Ollama)
            else {
              let endpoint = "https://api.openai.com/v1/chat/completions";
              let apiKey = customKeys.openai || process.env.OPENAI_API_KEY;
              let openAiModel = targetModel;

              if (targetModel.startsWith("deepseek")) {
                endpoint = "https://api.deepseek.com/v1/chat/completions";
                apiKey = customKeys.deepseek || process.env.DEEPSEEK_API_KEY || apiKey;
              } else if (
                targetModel.startsWith("groq") ||
                targetModel.startsWith("qwen/") ||
                targetModel.startsWith("openai/gpt-oss") ||
                targetModel.startsWith("allam-")
              ) {
                endpoint = "https://api.groq.com/openai/v1/chat/completions";
                apiKey = customKeys.groq || process.env.GROQ_API_KEY || apiKey;
                if (targetModel === "groq/compound" || targetModel === "groq/compound-mini" || targetModel.startsWith("qwen/") || targetModel.startsWith("openai/gpt-oss") || targetModel.startsWith("allam-")) {
                  openAiModel = targetModel;
                } else if (targetModel.includes("compound-mini")) {
                  openAiModel = "groq/compound-mini";
                } else if (targetModel.includes("compound")) {
                  openAiModel = "groq/compound";
                } else if (targetModel.includes("qwen")) {
                  openAiModel = "qwen/qwen3.6-27b";
                } else {
                  openAiModel = "groq/compound";
                }
              } else if (targetModel.startsWith("kimi") || targetModel.startsWith("moonshot")) {
                endpoint = "https://api.moonshot.cn/v1/chat/completions";
                apiKey = customKeys.kimi || process.env.MOONSHOT_API_KEY || apiKey;
              } else if (targetModel.startsWith("sambanova")) {
                endpoint = "https://api.sambanova.ai/v1/chat/completions";
                apiKey = customKeys.sambanova || process.env.SAMBANOVA_API_KEY;
                openAiModel = "DeepSeek-R1";
              } else if (targetModel.startsWith("cerebras")) {
                endpoint = "https://api.cerebras.ai/v1/chat/completions";
                apiKey = customKeys.cerebras || process.env.CEREBRAS_API_KEY;
                openAiModel = "llama3.3-70b";
              } else if (targetModel === "ollama-local") {
                endpoint = "http://localhost:11434/v1/chat/completions";
                apiKey = "ollama";
                openAiModel = "llama3";
              }

              if (!apiKey || apiKey.trim().length < 5) {
                throw new Error(
                  `API key for ${resolvedName} is not configured. Please add your key in Settings.`
                );
              }

              sendEvent({ type: "thinking_stage", verb: "Synthesizing", phase: "synthesis" });

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
                  stream: true,
                }),
              });

              if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(
                  errJson?.error?.message || `${resolvedName} API error (status ${res.status}): ${res.statusText}`
                );
              }

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
                        const delta = parsed.choices?.[0]?.delta?.content;
                        if (delta) {
                          fullText += delta;
                          sendEvent({ type: "chunk", text: delta });
                        }
                      } catch (e) {}
                    }
                  }
                }
              }
            }

            sendEvent({ type: "done", modelUsed: resolvedName, output: fullText });
            controller.close();
          } catch (err: any) {
            const errorMsg =
              err?.message || "An unexpected error occurred while communicating with the AI service.";
            const formattedError = `❌ **Error (${resolvedName})**:\n\`\`\`\n${errorMsg}\n\`\`\`\n*Please verify your API key and connection settings.*`;

            sendEvent({ type: "chunk", text: formattedError });
            sendEvent({
              type: "done",
              modelUsed: resolvedName,
              output: formattedError,
              isError: true,
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

    // NON-STREAMING JSON PATH
    let responseText = "";
    let rateLimited = false;

    if (targetModel.startsWith("gemini")) {
      const geminiKey = customKeys.gemini || process.env.GEMINI_API_KEY;
      if (!geminiKey || geminiKey.trim().length < 5) {
        throw new Error(
          "Gemini API key is not configured. Please add your Gemini API key in Settings or set GEMINI_API_KEY in your .env file."
        );
      }

      const { modelName: activeGeminiModel, error: geminiResolveErr } = await resolveWorkingGeminiModel(geminiKey, targetModel);

      if (!activeGeminiModel) {
        throw new Error(geminiResolveErr || "No working Gemini model available for this API key.");
      }

      const ai = new GoogleGenAI({ apiKey: geminiKey });
      try {
        const result = await ai.models.generateContent({
          model: activeGeminiModel,
          contents: systemPrompt,
        });
        responseText = result.text || "";
      } catch (err: any) {
        if (err?.status === 429 || String(err).includes("429") || String(err).includes("quota")) {
          rateLimited = true;
        }
        // Fallback to direct REST endpoint
        try {
          const restRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${activeGeminiModel}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
              }),
            }
          );
          if (restRes.ok) {
            const data = await restRes.json();
            responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          } else {
            const errData = await restRes.json().catch(() => ({}));
            throw new Error(errData?.error?.message || err?.message || `Google API error ${restRes.status}`);
          }
        } catch (restErr: any) {
          throw restErr || err;
        }
      }

      if (!responseText.trim()) {
        throw new Error(`Failed to generate response from Gemini model ${activeGeminiModel}.`);
      }
    } else if (targetModel.startsWith("claude")) {
      const claudeKey = customKeys.anthropic || process.env.ANTHROPIC_API_KEY;
      if (!claudeKey || claudeKey.trim().length < 5) {
        throw new Error(
          "Anthropic Claude API key is not configured. Please add your Anthropic API key in Settings."
        );
      }

      let claudeModelName = "claude-3-5-sonnet-20241022";
      if (targetModel.includes("3.7")) claudeModelName = "claude-3-7-sonnet-20250219";
      else if (targetModel.includes("haiku")) claudeModelName = "claude-3-5-haiku-20241022";
      else if (targetModel.includes("opus")) claudeModelName = "claude-3-opus-20240229";

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: claudeModelName,
          max_tokens: 2500,
          messages: [{ role: "user", content: systemPrompt }],
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson?.error?.message || `Anthropic API error (status ${res.status}): ${res.statusText}`
        );
      }

      const data = await res.json();
      responseText = data.content?.[0]?.text || "";
    } else {
      let endpoint = "https://api.openai.com/v1/chat/completions";
      let apiKey = customKeys.openai || process.env.OPENAI_API_KEY;
      let openAiModel = targetModel;

      if (targetModel.startsWith("deepseek")) {
        endpoint = "https://api.deepseek.com/v1/chat/completions";
        apiKey = customKeys.deepseek || process.env.DEEPSEEK_API_KEY || apiKey;
      } else if (
        targetModel.startsWith("groq") ||
        targetModel.startsWith("qwen/") ||
        targetModel.startsWith("openai/gpt-oss") ||
        targetModel.startsWith("allam-")
      ) {
        endpoint = "https://api.groq.com/openai/v1/chat/completions";
        apiKey = customKeys.groq || process.env.GROQ_API_KEY || apiKey;
        if (targetModel === "groq/compound" || targetModel === "groq/compound-mini" || targetModel.startsWith("qwen/") || targetModel.startsWith("openai/gpt-oss") || targetModel.startsWith("allam-")) {
          openAiModel = targetModel;
        } else if (targetModel.includes("compound-mini")) {
          openAiModel = "groq/compound-mini";
        } else if (targetModel.includes("compound")) {
          openAiModel = "groq/compound";
        } else if (targetModel.includes("qwen")) {
          openAiModel = "qwen/qwen3.6-27b";
        } else {
          openAiModel = "groq/compound";
        }
      } else if (targetModel.startsWith("kimi") || targetModel.startsWith("moonshot")) {
        endpoint = "https://api.moonshot.cn/v1/chat/completions";
        apiKey = customKeys.kimi || process.env.MOONSHOT_API_KEY || apiKey;
      }

      if (!apiKey || apiKey.trim().length < 5) {
        throw new Error(
          `API key for ${resolvedName} is not configured. Please add your key in Settings.`
        );
      }

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

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson?.error?.message || `${resolvedName} API error (status ${res.status}): ${res.statusText}`
        );
      }

      const data = await res.json();
      responseText = data.choices?.[0]?.message?.content || "";
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
  } catch (error: any) {
    console.error("Chat output error:", error);
    const errorMsg = error?.message || "An unexpected error occurred while communicating with the AI service.";
    const formattedError = `❌ **Error**:\n\`\`\`\n${errorMsg}\n\`\`\`\n*Please verify your API key and connection settings in Settings (⚙️).*`;

    return NextResponse.json(
      {
        success: false,
        output: formattedError,
        modelUsed: "AI Engine",
        error: errorMsg,
      },
      { status: 200 }
    );
  }
}