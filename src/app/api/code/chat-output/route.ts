import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { performWebSearch } from "@/utils/webSearch";
import { formatImageMarkdown, formatVideoMarkdown } from "@/utils/mediaGenerator";

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
  "qwen/qwen3.6-27b": "Qwen 3.6 27B",
  "openai/gpt-oss-120b": "GPT-OSS 120B",
  "openai/gpt-oss-20b": "GPT-OSS 20B",
  "allam-2-7b": "Allam 2 7B",
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
  "@cf/meta/llama-3.3-70b-instruct": "Llama 3.3 70B (Cloudflare)",
  "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b": "DeepSeek R1 Distill 32B (Cloudflare)",
  "@cf/qwen/qwen2.5-coder-32b-instruct": "Qwen 2.5 Coder 32B (Cloudflare)",
  "@cf/meta/llama-3.1-8b-instruct": "Llama 3.1 8B (Cloudflare)",
  "Qwen/Qwen2.5-Coder-32B-Instruct": "Qwen 2.5 Coder 32B (HuggingFace)",
  "meta-llama/Llama-3.3-70B-Instruct": "Llama 3.3 70B (HuggingFace)",
  "deepseek-ai/DeepSeek-R1": "DeepSeek R1 (HuggingFace)",
  "pollinations-flux": "FLUX.1 Schnell (Pollinations)",
  "pollinations-openai": "Pollinations Multimodal Chat",
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
      visualEngine = "",
      customKeys = {},
      stream = false,
      onlineSearch = false,
      isImageMode = false,
      uploadedDocs = [],
      customInstructions = "",
      skills = [],
      rules = [],
      memories = [],
      messages = [],
      chatHistory = [],
    } = body;

    if (!inputMessage || typeof inputMessage !== "string") {
      return NextResponse.json(
        { success: false, message: "Input message required" },
        { status: 400 }
      );
    }

    const lowerQuery = inputMessage.toLowerCase().trim();

    // 1. VIDEO GENERATION HANDLING
    const isVideoQuery =
      lowerQuery.startsWith("/video") ||
      lowerQuery.startsWith("create video") ||
      lowerQuery.startsWith("create a video") ||
      lowerQuery.startsWith("generate video") ||
      lowerQuery.startsWith("generate a video") ||
      lowerQuery.startsWith("generate an video") ||
      lowerQuery.startsWith("make a video") ||
      lowerQuery.startsWith("make video") ||
      lowerQuery.startsWith("render video") ||
      lowerQuery.startsWith("render a video") ||
      lowerQuery.includes("generate a video") ||
      lowerQuery.includes("create a video");

    if (isVideoQuery) {
      const cleanPrompt =
        inputMessage
          .replace(/^\/video\s*/i, "")
          .replace(/^create a video\s*:?/i, "")
          .replace(/^create video\s*:?/i, "")
          .replace(/^generate a video\s*:?/i, "")
          .replace(/^generate an video\s*:?/i, "")
          .replace(/^generate video\s*:?/i, "")
          .replace(/^make a video\s*:?/i, "")
          .replace(/^make video\s*:?/i, "")
          .replace(/^render a video\s*:?/i, "")
          .replace(/^render video\s*:?/i, "")
          .trim() || inputMessage;

      const videoMarkdown = formatVideoMarkdown(cleanPrompt, {
        customKeys,
        model: visualEngine || "pollinations-motion-video",
      });
      return NextResponse.json(
        {
          success: true,
          output: videoMarkdown,
          modelUsed: "Motion AI Video Studio",
          suggestedVerb: "Actualizing",
        },
        { status: 200 }
      );
    }

    // 2. IMAGE GENERATION HANDLING (Only for actual raster pictures/artwork, NOT vector SVG or flowchart diagrams)
    const isSvgOrFlowchartQuery =
      lowerQuery.includes("svg") ||
      lowerQuery.includes("flowchart") ||
      lowerQuery.includes("mermaid") ||
      lowerQuery.includes("vector") ||
      lowerQuery.includes("decision tree") ||
      lowerQuery.includes("state machine");

    const isImageQuery =
      !isSvgOrFlowchartQuery &&
      (isImageMode ||
        lowerQuery.startsWith("/image") ||
        lowerQuery.startsWith("create image") ||
        lowerQuery.startsWith("create a image") ||
        lowerQuery.startsWith("create an image") ||
        lowerQuery.startsWith("generate image") ||
        lowerQuery.startsWith("generate a image") ||
        lowerQuery.startsWith("generate an image") ||
        lowerQuery.startsWith("draw an image") ||
        lowerQuery.startsWith("draw a image") ||
        lowerQuery.startsWith("draw a picture") ||
        lowerQuery.startsWith("draw picture") ||
        lowerQuery.startsWith("render an image") ||
        lowerQuery.startsWith("render a image") ||
        lowerQuery.startsWith("render image") ||
        lowerQuery.includes("generate an image") ||
        lowerQuery.includes("generate a image") ||
        lowerQuery.includes("create an image of") ||
        lowerQuery.includes("generate image of") ||
        lowerQuery.includes("draw an image of"));

    if (isImageQuery) {
      let cleanPrompt = inputMessage
        .replace(/^\/image\s*/i, "")
        .replace(/^create an? image (?:of|for|explaining)?\s*:?/i, "")
        .replace(/^generate an? image (?:of|for|explaining)?\s*:?/i, "")
        .replace(/^draw an? (?:image|picture|diagram) (?:of|for|explaining)?\s*:?/i, "")
        .replace(/^make an? image (?:of|for|explaining)?\s*:?/i, "")
        .replace(/^render an? image (?:of|for|explaining)?\s*:?/i, "")
        .replace(/generate an? image for this problem/gi, "")
        .replace(/generate an? image/gi, "")
        .replace(/create an? image/gi, "")
        .replace(/for this problem/gi, "")
        .trim();

      if (!cleanPrompt) cleanPrompt = inputMessage;

      // Enhance short algorithm / coding prompts with high-fidelity visual keywords
      const lowerClean = cleanPrompt.toLowerCase();
      let synthesisPrompt = cleanPrompt;
      if (
        lowerClean.includes("binary search") ||
        lowerClean.includes("tree") ||
        lowerClean.includes("graph") ||
        lowerClean.includes("sort") ||
        lowerClean.includes("dynamic programming") ||
        lowerClean.includes("array") ||
        lowerClean.includes("linked list") ||
        lowerClean.includes("algorithm") ||
        lowerClean.includes("structure")
      ) {
        synthesisPrompt = `${cleanPrompt}, computer science algorithm diagram, step-by-step visual infographic, pointers and data structure breakdown, clean technical vector illustration, high resolution, dark background`;
      }

      const imageMarkdown = formatImageMarkdown(synthesisPrompt, {
        customKeys,
        model: visualEngine || "pollinations-flux-schnell",
      });
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

    const memoriesContext =
      Array.isArray(memories) && memories.length > 0
        ? `\n--- USER PERSISTENT MEMORIES & PREFERENCES ---\n${memories
            .map((m: any, i: number) => `[Memory ${i + 1} (${m.category || "General"})]: ${m.content}`)
            .join("\n")}\nAlways respect and tailor your solutions according to these persistent user memories.\n`
        : "";

    const historyList =
      Array.isArray(messages) && messages.length > 0
        ? messages
        : Array.isArray(chatHistory) && chatHistory.length > 0
        ? chatHistory
        : [];

    const dialogueHistoryContext =
      historyList.length > 0
        ? `\n--- PREVIOUS CONVERSATION TURNS (CONTEXT) ---\n${historyList
            .filter((m: any) => m.content && typeof m.content === "string" && m.content.trim())
            .slice(-10)
            .map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
            .join("\n\n")}\n--- END PREVIOUS CONVERSATION TURNS ---\n`
        : "";

    const systemPrompt = `You are EasyCode AI, a world-class Principal AI Coding Assistant, Software Architect, and Technical Pair Programmer.
You can answer ANY question intelligently: competitive programming, system design, algorithm analysis, general software engineering, debugging, code refactoring, mathematics, documentation, or everyday conceptual inquiries.

${problemContext}${editorCodeContext}${fileContext}${webSearchContext}${memoriesContext}${dialogueHistoryContext}${skillsDirectives}${rulesDirectives}
${customInstructions ? `\nUser Custom Instructions:\n${customInstructions}\n` : ""}

User Prompt: "${inputMessage}"

CRITICAL LEETCODE / ONLINE JUDGE CODING GUIDELINES:
1. When generating or completing code for algorithmic problems:
   - Output ONLY the clean \`class Solution:\` (or equivalent solution structure) containing the algorithm method.
   - STRICTLY FORBIDDEN: Do NOT include \`if __name__ == "__main__":\` driver code, test execution harnesses, or \`print(...)\` statements.
   - STRICTLY FORBIDDEN: Do NOT include verbose docstrings (e.g. \`\"\"\"\nCalculates...\n:param prices:...\n:return:...\n\"\"\"\`) inside methods. Keep code lean and professional.
   - Use concise single-line comments (\`# ...\`) only where necessary to clarify algorithmic state transitions.
   - The code must be immediately ready for direct insertion into the Monaco Editor and direct execution in Judge0.
2. If the user asks for code or a solution, provide clean, idiomatic code in markdown fenced blocks with explicit language tags (e.g. \`\`\`python, \`\`\`typescript, \`\`\`cpp).
3. If the user asks to debug or review code, point out exact edge cases, bounds issues, or bottlenecks with concrete fixes.
4. Format mathematical expressions cleanly (e.g. O(N) time, O(1) space, array indices like prices[i], bounds like 0 <= i < n). Avoid raw unparsed LaTeX math markup like $...$.
5. INTERACTIVE FLOWCHARTS & SYSTEM DIAGRAMS: When the user asks for a flowchart, logic diagram, state transition, sequence diagram, architecture overview, or algorithmic decision tree (or uses \`/flowchart\` / \`/diagram\` or \`@flowchart\`), ALWAYS generate a complete, valid Mermaid diagram wrapped in \`\`\`mermaid ... \`\`\` fenced code blocks. Use modern directional flowcharts (\`flowchart TD\` or \`flowchart LR\`). CRITICAL: ALWAYS enclose every node label in double quotes (e.g. A["Initialize pointers"] --> B{"low <= high"} --> C["mid = low + (high - low) / 2"]). Never place unquoted parentheses or mathematical operations directly inside node brackets.
6. ENTERPRISE SVG VECTOR DIAGRAMS: When the user asks for an SVG, vector diagram, visual execution trace, pointer trace, array memory layout, or uses \`@svg\` / \`@canvas-design\`, ALWAYS generate a publication-grade, ultra-clean standalone SVG enclosed in a single \`\`\`xml\\n<svg ...>\\n...\\n</svg>\\n\`\`\` fenced code block:
   - THEME & PALETTE (Strictly match EasyCode Obsidian / Warm Cream design system):
     * Canvas Background: \`#1C1B19\` (Obsidian Charcoal) with \`rx="16"\`. STRICTLY NEVER use generic navy blues like \`#0f172a\` or neon clashing colors unless explicitly asked.
     * Card / Node Containers: \`#242321\` fill, \`#383532\` stroke with \`stroke-width="1.2"\` and \`rx="8"\`.
     * Text: \`#EDEDEB\` for titles and primary data values; \`#8C877D\` for indices, variable names, and secondary labels.
     * Highlights & Pointers: Warm Amber (\`#F59E0B\` / \`#D97706\`) for active elements, middle pointers, or targets; Emerald (\`#10B981\`) for match found; Indigo (\`#6366F1\`) for boundary pointers (Low/High).
   - CONTAINER SIZING & RESPONSIVENESS:
     * Set \`viewBox="0 0 960 H"\` (e.g. \`viewBox="0 0 960 520"\`, height based on content).
     * Set \`width="100%" height="auto" preserveAspectRatio="xMidYMid meet"\` on root \`<svg>\`.
     * Fill the width: The array or system nodes should be spaced symmetrically across the container.
   - STRICT VERTICAL TIERS & ZERO TEXT OVERLAP:
       * For step-by-step traces (e.g. Binary Search, Two Pointers, Array Sorting), each step MUST occupy a 210px vertical band (baseY = 90 + stepIndex * 210):
         - Step Container Card: <rect x="30" y="\${baseY}" width="900" height="190" rx="12" ... />
         - y = baseY + 28: Step title (<text y="...">Step 1: low = 0, high = 9 | mid = 4 (Value = 16)</text>)
         - y = baseY + 54: Condition explanation (<text y="...">Condition: 16 < 23 -> Narrow search to right half</text>)
         - y = baseY + 86: Array index labels [0], [1], [2]... (font-size="11", fill="#8C877D")
         - y = baseY + 98: Array cell boxes (<rect y="..." height="40" ...>)
         - y = baseY + 124: Array numbers inside boxes (font-size="14", text-anchor="middle")
         - y = baseY + 154: Pointer badges LOW, MID, HIGH (pill rects at y="..." height="22" rx="4", text at y="...")
       * CRITICAL PROHIBITION: NEVER place condition subtitles, index labels [0], and pointer badges at the same Y coordinate! Every tier MUST have distinct vertical separation.
       * Pointer badges (e.g. Low, Mid, High) MUST be rendered as rounded pills (<rect rx="4" ...> with <text ...>) so letters NEVER collide with arrows or numbers.
      * Typography: \`font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"\` for headers and labels; \`font-family="ui-monospace, SFMono-Regular, Menlo, monospace"\` for array values and code variables.
      * Include clean \`<defs>\` with \`<marker id="arrow" ...>\` and \`<filter id="card-shadow" ...>\`.
7. STRICT ZERO-EMOJI POLICY: Never use emojis (such as 🚀, 🏗️, 📊, ⚡, 🧪, 📑, ✨, etc.) anywhere in your responses, greetings, lists, or headers. Use clean, elegant markdown typography and professional software engineering terminology only.
8. MEMORY REFINEMENT & PERSISTENCE RULE:
   - When the user asks you to remember, save, memorize, or record a preference, constraint, background, or goal (e.g. "remember that I prefer Python 3", "remember: explain recurrence relations first", "save memory: preparing for Meta E5", "remember my preference for O(1) space", "add memory ..."):
   - CRITICAL REQUIREMENT: Do NOT plainly or crudely copy poor, informal, or slang wording. You MUST refine, distill, and improve the user's statement into a polished, high-signal, professional memory statement written in concise instructional voice (e.g. 'Prefers concise Python 3 solutions with strict type annotations' or 'Targeting Meta E5 software engineering interviews with focus on optimal Big-O trade-offs').
   - Categorize into one of four categories: "Goal" | "Language" | "Topic" | "Style".
   - Emit an explicit structured memory tag in your response:
     :::memory-saved{"id": "${Date.now()}", "content": "<Refined high-quality memory>", "category": "Goal"|"Language"|"Topic"|"Style"}:::
   - Follow it with a concise confirmation explaining what has been committed to memory and how it will tailor all future sessions.`;

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
                  const rawErrMsg = errData?.error?.message || sdkErr?.message || `Google API error ${restRes.status}`;
                  const isRateLimit = restRes.status === 429 || rawErrMsg.includes("RESOURCE_EXHAUSTED") || rawErrMsg.includes("quota");
                  if (isRateLimit) {
                    if (!customKeys.gemini) {
                      throw new Error(
                        "EasyCode's shared Gemini free access is experiencing high traffic / rate limits. You can paste your own free Gemini API key in Settings -> API Keys for uninterrupted dedicated access, or retry in a few seconds."
                      );
                    } else {
                      throw new Error(
                        "Your custom Gemini API key hit a rate limit or quota constraint from Google AI Studio. Please check your quota in Google AI Studio or try again shortly."
                      );
                    }
                  }
                  throw new Error(rawErrMsg);
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
                  max_tokens: 8192,
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
              } else if (targetModel.startsWith("@cf/") || targetModel.includes("cloudflare")) {
                const cfToken = customKeys.cloudflare || process.env.CLOUDFLARE_API_TOKEN;
                const cfAccountId = customKeys.cloudflareAccountId || process.env.CLOUDFLARE_ACCOUNT_ID;
                if (!cfToken || !cfAccountId) {
                  throw new Error("Cloudflare API Token & Account ID are required. Please configure both in Settings.");
                }
                endpoint = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/v1/chat/completions`;
                apiKey = cfToken;
              } else if (
                targetModel.startsWith("Qwen/") ||
                targetModel.startsWith("meta-llama/") ||
                targetModel.startsWith("deepseek-ai/") ||
                targetModel.startsWith("mistralai/") ||
                targetModel.startsWith("black-forest-labs/") ||
                targetModel.startsWith("THUDM/") ||
                (targetModel.includes("/") && !targetModel.startsWith("groq/") && !targetModel.startsWith("openai/") && !targetModel.startsWith("@cf/"))
              ) {
                endpoint = "https://router.huggingface.co/hf-inference/v1/chat/completions";
                apiKey = customKeys.huggingface || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
                openAiModel = targetModel;
              } else if (targetModel.startsWith("pollinations")) {
                endpoint = "https://text.pollinations.ai/openai/chat/completions";
                apiKey = customKeys.pollinations || process.env.POLLINATIONS_API_KEY || "dummy";
                openAiModel = "openai";
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
            const formattedError = `**Error (${resolvedName})**:\n\`\`\`\n${errorMsg}\n\`\`\`\n*Please verify your API key and connection settings in Settings.*`;

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
          max_tokens: 8192,
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
      } else if (targetModel.startsWith("@cf/") || targetModel.includes("cloudflare")) {
        const cfToken = customKeys.cloudflare || process.env.CLOUDFLARE_API_TOKEN;
        const cfAccountId = customKeys.cloudflareAccountId || process.env.CLOUDFLARE_ACCOUNT_ID;
        if (!cfToken || !cfAccountId) {
          throw new Error("Cloudflare API Token & Account ID are required. Please configure both in Settings.");
        }
        endpoint = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/v1/chat/completions`;
        apiKey = cfToken;
        openAiModel = targetModel.startsWith("@cf/") ? targetModel : "@cf/meta/llama-3.3-70b-instruct";
      } else if (
        targetModel.startsWith("Qwen/") ||
        targetModel.startsWith("meta-llama/") ||
        targetModel.startsWith("deepseek-ai/") ||
        targetModel.startsWith("mistralai/") ||
        targetModel.startsWith("black-forest-labs/") ||
        targetModel.startsWith("THUDM/") ||
        (targetModel.includes("/") && !targetModel.startsWith("groq/") && !targetModel.startsWith("openai/") && !targetModel.startsWith("@cf/"))
      ) {
        endpoint = "https://router.huggingface.co/hf-inference/v1/chat/completions";
        apiKey = customKeys.huggingface || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
        openAiModel = targetModel;
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
    const formattedError = `**Error**:\n\`\`\`\n${errorMsg}\n\`\`\`\n*Please verify your API key and connection settings in Settings.*`;

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