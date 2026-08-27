import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider") || "huggingface";
    const query = (searchParams.get("query") || "").trim();
    const category = (searchParams.get("category") || "all").toLowerCase();
    const limit = Math.min(parseInt(searchParams.get("limit") || "40", 10), 100);

    if (provider === "huggingface") {
      let searchUrl = "https://huggingface.co/api/models?";
      const params = new URLSearchParams();

      if (query) {
        params.append("search", query);
        params.append("sort", "downloads");
        params.append("direction", "-1");
      } else {
        if (category === "coding") {
          params.append("search", "coder");
          params.append("pipeline_tag", "text-generation");
        } else if (category === "reasoning") {
          params.append("search", "reasoning");
          params.append("pipeline_tag", "text-generation");
        } else if (category === "vision") {
          params.append("pipeline_tag", "image-text-to-text");
        } else if (category === "image") {
          params.append("pipeline_tag", "text-to-image");
        } else if (category === "audio") {
          params.append("pipeline_tag", "automatic-speech-recognition");
        } else {
          // All Trending / General LLMs
          params.append("pipeline_tag", "text-generation");
        }

        params.append("sort", "downloads");
        params.append("direction", "-1");
      }

      params.append("limit", String(limit));
      params.append("full", "false");

      searchUrl += params.toString();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(searchUrl, {
        headers: {
          "User-Agent": "EasyCode-Hub-Explorer/2.0",
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return NextResponse.json({
          success: false,
          models: [],
          message: `Hub returned status ${res.status}`,
        });
      }

      const rawModels = await res.json();
      if (!Array.isArray(rawModels)) {
        return NextResponse.json({ success: true, models: [] });
      }

      const formatted = rawModels.map((m: any) => {
        const id = m.id || m._id || "";
        const name = id.includes("/") ? id.split("/")[1] : id;
        const author = id.includes("/") ? id.split("/")[0] : "Community";
        const downloadsNum = m.downloads || 0;
        const likesNum = m.likes || 0;
        const downloads =
          downloadsNum > 1000000
            ? `${(downloadsNum / 1000000).toFixed(1)}M dl`
            : downloadsNum > 1000
            ? `${(downloadsNum / 1000).toFixed(1)}k dl`
            : downloadsNum > 0
            ? `${downloadsNum} dl`
            : "";
        const likes = likesNum > 0 ? `${likesNum} likes` : "";
        const badge = downloads || likes || "1M+ Hub";
        const tag = (m.pipeline_tag || "text-generation").toLowerCase();

        let modelCategory: "Coding" | "Reasoning" | "Frontier" | "Speed" | "Universal" | "Image" = "Coding";
        if (tag.includes("image") || tag.includes("diffusion")) modelCategory = "Image";
        else if (id.toLowerCase().includes("r1") || id.toLowerCase().includes("reason") || id.toLowerCase().includes("math")) modelCategory = "Reasoning";
        else if (id.toLowerCase().includes("1b") || id.toLowerCase().includes("3b") || id.toLowerCase().includes("mini") || id.toLowerCase().includes("fast")) modelCategory = "Speed";
        else if (id.toLowerCase().includes("70b") || id.toLowerCase().includes("72b") || id.toLowerCase().includes("405b") || id.toLowerCase().includes("v3")) modelCategory = "Frontier";

        return {
          id,
          name: name.replace(/[-_]/g, " "),
          author,
          provider: "Hugging Face",
          category: modelCategory,
          badge,
          downloads: downloadsNum,
          likes: likesNum,
          pipelineTag: m.pipeline_tag || "text-generation",
          contextWindow: "Hub Endpoint",
          description: `Open repository by ${author}. Pipeline: ${m.pipeline_tag || "text-generation"}.`,
          requiredKey: "huggingface",
          isLiveSearchResult: true,
        };
      });

      return NextResponse.json({
        success: true,
        models: formatted,
        totalInHub: "1,000,000+",
      });
    }

    return NextResponse.json({ success: true, models: [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to search models from hub" },
      { status: 500 }
    );
  }
}
