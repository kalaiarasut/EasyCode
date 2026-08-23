export async function performWebSearch(query: string): Promise<string> {
  try {
    const cleanQuery = query.replace(/^@\w+\s*/, "").trim();
    if (!cleanQuery) return "";

    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQuery)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return "";
    const html = await res.text();

    const snippets: string[] = [];
    const regex = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    let count = 0;
    while ((match = regex.exec(html)) !== null && count < 5) {
      const clean = match[1].replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&").trim();
      if (clean && clean.length > 20) {
        snippets.push(clean);
        count++;
      }
    }

    if (snippets.length > 0) {
      return `\n\n--- REAL-TIME WEB SEARCH RESULTS FOR: "${cleanQuery}" ---\n` +
        snippets.map((s, i) => `[Source ${i + 1}]: ${s}`).join("\n\n") +
        `\n--- END OF SEARCH RESULTS ---\nIncorporate these latest facts and cite relevant sources in your answer.\n`;
    }
  } catch (e) {
    console.warn("Web search lookup failed, continuing without search context:", e);
  }
  return "";
}
