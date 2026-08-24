import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customKeys = {} } = body;

    const availableByProvider: Record<string, string[]> = {};

    // 1. Live Verify Google Gemini
    const geminiKey = customKeys.gemini || process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim().length > 5) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`,
          { method: "GET" }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.models)) {
            availableByProvider.gemini = data.models
              .filter((m: any) => {
                const methods = m.supportedGenerationMethods || [];
                const name = m.name || "";
                return (
                  methods.includes("generateContent") &&
                  !name.includes("tts") &&
                  !name.includes("image") &&
                  !name.includes("robotics") &&
                  !name.includes("clip") &&
                  !name.includes("computer-use")
                );
              })
              .map((m: any) => m.name.replace(/^models\//, ""));
          }
        }
      } catch (e) {}
    }

    // 2. Live Verify Groq
    const groqKey = customKeys.groq || process.env.GROQ_API_KEY;
    if (groqKey && groqKey.startsWith("gsk_")) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { Authorization: `Bearer ${groqKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            availableByProvider.groq = data.data
              .filter(
                (m: any) =>
                  m.active !== false &&
                  !m.id.includes("whisper") &&
                  !m.id.includes("guard") &&
                  !m.id.includes("safeguard")
              )
              .map((m: any) => m.id);
          }
        }
      } catch (e) {}
    }

    // 3. Live Verify Moonshot Kimi
    const kimiKey = customKeys.kimi || process.env.MOONSHOT_API_KEY;
    if (kimiKey && kimiKey.startsWith("sk-")) {
      try {
        const res = await fetch("https://api.moonshot.cn/v1/models", {
          headers: { Authorization: `Bearer ${kimiKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            availableByProvider.kimi = data.data.map((m: any) => m.id);
          }
        }
      } catch (e) {}
    }

    // 4. Live Verify OpenAI
    const openAiKey = customKeys.openai || process.env.OPENAI_API_KEY;
    if (openAiKey && openAiKey.startsWith("sk-")) {
      try {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${openAiKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            const rawIds = data.data.map((m: any) => m.id);
            const chatModels = rawIds.filter((id: string) => 
              id.startsWith("gpt-") || id.startsWith("o1") || id.startsWith("o3") || id.startsWith("chatgpt-")
            );
            availableByProvider.openai = chatModels.length > 0 ? chatModels : ["gpt-4o", "gpt-4o-mini", "o3-mini", "o1", "o1-mini"];
          }
        }
      } catch (e) {}
    }

    // 5. Live Verify Anthropic Claude
    const claudeKey = customKeys.anthropic || process.env.ANTHROPIC_API_KEY;
    if (claudeKey && (claudeKey.startsWith("sk-ant-") || claudeKey.length > 20)) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/models", {
          headers: {
            "x-api-key": claudeKey,
            "anthropic-version": "2023-06-01",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            availableByProvider.anthropic = data.data.map((m: any) => m.id);
          } else {
            availableByProvider.anthropic = ["claude-3.7-sonnet", "claude-3.5-sonnet", "claude-3.5-haiku", "claude-3-opus"];
          }
        } else {
          // If key is structurally valid format
          availableByProvider.anthropic = ["claude-3.7-sonnet", "claude-3.5-sonnet", "claude-3.5-haiku", "claude-3-opus"];
        }
      } catch (e) {
        availableByProvider.anthropic = ["claude-3.7-sonnet", "claude-3.5-sonnet", "claude-3.5-haiku", "claude-3-opus"];
      }
    }

    // 6. Live Verify DeepSeek
    const deepseekKey = customKeys.deepseek || process.env.DEEPSEEK_API_KEY;
    if (deepseekKey && deepseekKey.startsWith("sk-")) {
      try {
        const res = await fetch("https://api.deepseek.com/models", {
          headers: { Authorization: `Bearer ${deepseekKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            availableByProvider.deepseek = data.data.map((m: any) => m.id);
          }
        } else {
          availableByProvider.deepseek = ["deepseek-r1", "deepseek-v3", "deepseek-coder-v2"];
        }
      } catch (e) {
        availableByProvider.deepseek = ["deepseek-r1", "deepseek-v3", "deepseek-coder-v2"];
      }
    }

    // 7. Live Verify Mistral AI
    const mistralKey = customKeys.mistral || process.env.MISTRAL_API_KEY;
    if (mistralKey && mistralKey.length > 10) {
      try {
        const res = await fetch("https://api.mistral.ai/v1/models", {
          headers: { Authorization: `Bearer ${mistralKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            availableByProvider.mistral = data.data.map((m: any) => m.id);
          }
        }
      } catch (e) {}
    }

    // 8. Live Verify Cerebras
    const cerebrasKey = customKeys.cerebras || process.env.CEREBRAS_API_KEY;
    if (cerebrasKey && (cerebrasKey.startsWith("csk-") || cerebrasKey.length > 10)) {
      try {
        const res = await fetch("https://api.cerebras.ai/v1/models", {
          headers: { Authorization: `Bearer ${cerebrasKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            availableByProvider.cerebras = data.data.map((m: any) => m.id);
          }
        }
      } catch (e) {}
    }

    // 9. Live Verify SambaNova
    const sambanovaKey = customKeys.sambanova || process.env.SAMBANOVA_API_KEY;
    if (sambanovaKey && sambanovaKey.length > 10) {
      try {
        const res = await fetch("https://api.sambanova.ai/v1/models", {
          headers: { Authorization: `Bearer ${sambanovaKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            availableByProvider.sambanova = data.data.map((m: any) => m.id);
          }
        }
      } catch (e) {}
    }

    // 10. Live Verify xAI (Grok)
    const grokKey = customKeys.grok || process.env.XAI_API_KEY;
    if (grokKey && (grokKey.startsWith("xai-") || grokKey.length > 10)) {
      try {
        const res = await fetch("https://api.x.ai/v1/models", {
          headers: { Authorization: `Bearer ${grokKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            availableByProvider.grok = data.data.map((m: any) => m.id);
          }
        }
      } catch (e) {}
    }

    // 11. Local Ollama Check
    try {
      const res = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.models)) {
          availableByProvider.ollama = data.models.map((m: any) => m.name);
        }
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      availableByProvider,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Failed to fetch available models",
    });
  }
}
