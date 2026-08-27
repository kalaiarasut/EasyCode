import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("file") as Blob | null;
    const customKeysRaw = formData.get("customKeys") as string | null;
    const requestedEngine = (formData.get("engine") as string | null) || "auto";

    if (!audioFile) {
      return NextResponse.json(
        { success: false, message: "Audio file is required for transcription." },
        { status: 400 }
      );
    }

    let customKeys: Record<string, string> = {};
    if (customKeysRaw) {
      try {
        customKeys = JSON.parse(customKeysRaw);
      } catch (e) {}
    }

    const codingPrompt =
      "Algorithmic coding, LeetCode data structures, Python, C++, Java, JavaScript, complexity analysis O(N), graphs, trees, dynamic programming.";
    const fileName =
      "recording." +
      (audioFile.type?.includes("ogg")
        ? "ogg"
        : audioFile.type?.includes("mp4")
        ? "m4a"
        : audioFile.type?.includes("wav")
        ? "wav"
        : "webm");

    // 1. ENGINE: GROQ WHISPER LARGE V3 TURBO
    const tryGroqWhisper = async () => {
      const groqKey = customKeys.groq || process.env.GROQ_API_KEY;
      if (!groqKey || groqKey.trim().length < 5) {
        throw new Error("Groq API key not configured");
      }

      const groqFormData = new FormData();
      groqFormData.append("file", audioFile, fileName);
      groqFormData.append("model", "whisper-large-v3-turbo");
      groqFormData.append("temperature", "0");
      groqFormData.append("prompt", codingPrompt);

      const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${groqKey}` },
        body: groqFormData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `Groq error (${res.status})`;
        const e: any = new Error(msg);
        e.status = res.status;
        throw e;
      }

      const data = await res.json();
      return {
        text: (data.text || "").trim(),
        model: "whisper-large-v3-turbo",
        provider: "Groq",
      };
    };

    // 2. ENGINE: CLOUDFLARE WORKERS AI WHISPER
    const tryCloudflareWhisper = async () => {
      const cfToken = customKeys.cloudflare || process.env.CLOUDFLARE_API_TOKEN;
      const cfAccountId = customKeys.cloudflareAccountId || process.env.CLOUDFLARE_ACCOUNT_ID;
      if (!cfToken || !cfAccountId) {
        throw new Error("Cloudflare API Token and Account ID required");
      }

      // Cloudflare Workers AI accepts audio buffer as binary or form data
      const arrayBuffer = await audioFile.arrayBuffer();
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/openai/whisper`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cfToken}`,
            "Content-Type": audioFile.type || "audio/webm",
          },
          body: arrayBuffer,
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.errors?.[0]?.message || `Cloudflare error (${res.status})`;
        const e: any = new Error(msg);
        e.status = res.status;
        throw e;
      }

      const data = await res.json();
      return {
        text: (data.result?.text || "").trim(),
        model: "@cf/openai/whisper",
        provider: "Cloudflare Workers AI",
      };
    };

    // 3. ENGINE: OPENAI WHISPER (whisper-1)
    const tryOpenAiWhisper = async () => {
      const openAiKey = customKeys.openai || process.env.OPENAI_API_KEY;
      if (!openAiKey || openAiKey.trim().length < 5) {
        throw new Error("OpenAI API key not configured");
      }

      const openAiFormData = new FormData();
      openAiFormData.append("file", audioFile, fileName);
      openAiFormData.append("model", "whisper-1");
      openAiFormData.append("temperature", "0");
      openAiFormData.append("prompt", codingPrompt);

      const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openAiKey}` },
        body: openAiFormData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `OpenAI error (${res.status})`;
        const e: any = new Error(msg);
        e.status = res.status;
        throw e;
      }

      const data = await res.json();
      return {
        text: (data.text || "").trim(),
        model: "whisper-1",
        provider: "OpenAI",
      };
    };

    // 4. ENGINE: CUSTOM / LOCAL WHISPER ENDPOINT
    const tryCustomWhisper = async () => {
      const customUrl = customKeys.customWhisperUrl || process.env.CUSTOM_WHISPER_URL;
      const customKey = customKeys.customWhisperApiKey || process.env.CUSTOM_WHISPER_API_KEY || "dummy";
      if (!customUrl) {
        throw new Error("Custom Whisper endpoint URL not configured");
      }

      const endpoint = customUrl.endsWith("/transcriptions")
        ? customUrl
        : customUrl.replace(/\/+$/, "") + "/v1/audio/transcriptions";

      const customFormData = new FormData();
      customFormData.append("file", audioFile, fileName);
      customFormData.append("model", "whisper");
      customFormData.append("prompt", codingPrompt);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${customKey}` },
        body: customFormData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `Custom Whisper error (${res.status})`;
        const e: any = new Error(msg);
        e.status = res.status;
        throw e;
      }

      const data = await res.json();
      return {
        text: (data.text || "").trim(),
        model: "custom-whisper",
        provider: "Custom Whisper Endpoint",
      };
    };

    // EXECUTION DISPATCHER
    let result: { text: string; model: string; provider: string } | null = null;
    let lastErrorMsg = "";

    if (requestedEngine === "groq") {
      result = await tryGroqWhisper();
    } else if (requestedEngine === "cloudflare") {
      result = await tryCloudflareWhisper();
    } else if (requestedEngine === "openai") {
      result = await tryOpenAiWhisper();
    } else if (requestedEngine === "custom") {
      result = await tryCustomWhisper();
    } else {
      // AUTO CASCADE: Groq -> Cloudflare -> OpenAI
      try {
        result = await tryGroqWhisper();
      } catch (e1: any) {
        lastErrorMsg = e1.message;
        try {
          result = await tryCloudflareWhisper();
        } catch (e2: any) {
          try {
            result = await tryOpenAiWhisper();
          } catch (e3: any) {
            throw new Error(`All cloud speech engines failed (${lastErrorMsg}). Fallback to browser speech engine.`);
          }
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        text: result.text,
        model: result.model,
        provider: result.provider,
        engineUsed: requestedEngine,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        fallbackRequired: true,
        isRateLimit: error?.status === 429,
        message: error?.message || "Speech transcription failed. Fallback to browser speech recognition.",
      },
      { status: error?.status || 500 }
    );
  }
}
