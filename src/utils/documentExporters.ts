import { toast } from "sonner";

/**
 * Universal File Download Helper
 */
export function downloadRawFile(filename: string, content: string, mimeType = "text/plain;charset=utf-8") {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  } catch (err) {
    console.error("Download error:", err);
    toast.error("Failed to download file");
  }
}

/**
 * Export as Presentation Slide Deck (Self-contained interactive HTML presentation compatible with PPT export)
 */
export function exportAsHtmlPresentation(title: string, slidesContent: string) {
  try {
    const rawSlides = slidesContent.split(/\n---\n|\n(?=# )/).filter((s) => s.trim().length > 0);
    const slides = rawSlides.length > 0 ? rawSlides : [slidesContent];

    const slidesHtml = slides
      .map(
        (slide, idx) => `
      <section class="slide" id="slide-${idx + 1}">
        <div class="slide-inner">
          <div class="slide-badge">EasyCode AI • Slide ${idx + 1} of ${slides.length}</div>
          <div class="slide-body">
            ${slide
              .replace(/^# (.*$)/gim, '<h1 class="slide-title">$1</h1>')
              .replace(/^## (.*$)/gim, '<h2 class="slide-subtitle">$1</h2>')
              .replace(/^### (.*$)/gim, '<h3 class="slide-heading">$1</h3>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/`([^`]+)`/g, '<code>$1</code>')
              .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
              .replace(/\n\n/g, '<p></p>')
              .replace(/\n- (.*$)/gim, '<li>$1</li>')}
          </div>
        </div>
      </section>`
      )
      .join("\n");

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - EasyCode AI Presentation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg: #11100F;
      --card-bg: #1C1B19;
      --text: #F3F2F0;
      --accent: #E87A38;
      --subtext: #9E9A91;
      --border: rgba(255, 255, 255, 0.08);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      overflow-x: hidden;
    }
    .slides-container {
      display: flex;
      flex-direction: column;
      gap: 32px;
      padding: 40px 20px;
      max-width: 1000px;
      margin: 0 auto;
    }
    .slide {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 48px;
      min-height: 520px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      position: relative;
    }
    .slide-badge {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent);
      font-weight: 700;
      margin-bottom: 24px;
    }
    .slide-title {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 20px;
      color: #FFF;
    }
    .slide-subtitle {
      font-size: 20px;
      font-weight: 600;
      color: #D6D3CD;
      margin-bottom: 16px;
    }
    .slide-body {
      font-size: 16px;
      line-height: 1.6;
      color: #E2DFD8;
    }
    .slide-body p { margin-bottom: 14px; }
    .slide-body li { margin-left: 24px; margin-bottom: 8px; }
    code {
      font-family: Menlo, Monaco, monospace;
      background: rgba(255,255,255,0.06);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 14px;
      color: #F8B070;
    }
    pre {
      background: #0D0C0B;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      overflow-x: auto;
      margin: 16px 0;
    }
    pre code { background: none; padding: 0; color: #E8E4DB; }
    .header-bar {
      text-align: center;
      padding: 24px 0 10px 0;
    }
    .btn-print {
      background: var(--text);
      color: var(--bg);
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
      margin-top: 10px;
    }
    @media print {
      body { background: white; color: black; }
      .slides-container { padding: 0; }
      .slide {
        page-break-after: always;
        min-height: 100vh;
        border: none;
        box-shadow: none;
        background: white;
        color: black;
      }
      .btn-print, .header-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF / PPT</button>
  </div>
  <div class="slides-container">
    ${slidesHtml}
  </div>
</body>
</html>`;

    const sanitizedTitle = (title || "presentation").replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    downloadRawFile(`${sanitizedTitle}_presentation.html`, fullHtml, "text/html;charset=utf-8");
    toast.success("Generated presentation deck! Open to view or print to PDF/PPT.");
  } catch (err) {
    console.error("Presentation export error:", err);
    toast.error("Failed to generate presentation deck");
  }
}

/**
 * Export as Printable PDF Layout Document
 */
export function exportAsPrintableDocument(title: string, content: string) {
  try {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1A1918;
      background: #FFF;
      padding: 30px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { font-size: 22pt; margin-bottom: 8px; border-bottom: 2px solid #E8E4DB; padding-bottom: 8px; }
    h2 { font-size: 15pt; margin-top: 24px; margin-bottom: 8px; color: #2D2B28; }
    h3 { font-size: 12pt; margin-top: 18px; margin-bottom: 6px; }
    p { margin-bottom: 12px; }
    ul, ol { margin-left: 24px; margin-bottom: 12px; }
    li { margin-bottom: 4px; }
    pre {
      background: #F6F4EE;
      border: 1px solid #E5E0D4;
      border-radius: 6px;
      padding: 12px;
      font-family: Menlo, monospace;
      font-size: 9.5pt;
      overflow-x: auto;
      margin: 14px 0;
    }
    code { font-family: Menlo, monospace; background: #F0EDE6; padding: 2px 4px; border-radius: 4px; font-size: 10pt; }
    pre code { background: none; padding: 0; }
    .doc-header { margin-bottom: 24px; }
    .doc-meta { font-size: 9pt; color: #78746E; text-transform: uppercase; letter-spacing: 0.05em; }
    .btn-print {
      display: inline-block;
      background: #1C1B19;
      color: #FFF;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
      cursor: pointer;
    }
    @media print { .btn-print { display: none; } }
  </style>
</head>
<body>
  <button class="btn-print" onclick="window.print()">🖨️ Print / Save to PDF</button>
  <div class="doc-header">
    <div class="doc-meta">EasyCode AI Technical Specification • Generated on ${new Date().toLocaleDateString()}</div>
    <h1>${title}</h1>
  </div>
  <div class="doc-body">
    ${content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/\n\n/g, '<p></p>')
      .replace(/\n- (.*$)/gim, '<li>$1</li>')}
  </div>
</body>
</html>`;

    const sanitizedTitle = (title || "document").replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    downloadRawFile(`${sanitizedTitle}_report.html`, htmlContent, "text/html;charset=utf-8");
    toast.success("Ready! Open the exported document and click Print to save as PDF.");
  } catch (err) {
    console.error("PDF export error:", err);
    toast.error("Failed to generate document");
  }
}

/**
 * Export as Microsoft Word Document (.doc / .docx compatible HTML package)
 */
export function exportAsWordDocument(title: string, content: string) {
  try {
    const wordHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${title}</title>
  <style>
    body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #333333; }
    h1 { font-size: 20pt; font-weight: bold; color: #1F497D; margin-bottom: 12pt; }
    h2 { font-size: 14pt; font-weight: bold; color: #4F81BD; margin-top: 18pt; margin-bottom: 6pt; }
    h3 { font-size: 12pt; font-weight: bold; color: #595959; margin-top: 12pt; margin-bottom: 4pt; }
    p { margin-bottom: 8pt; }
    pre { font-family: 'Consolas', 'Courier New', monospace; font-size: 9.5pt; background: #F2F2F2; padding: 8pt; border: 1pt solid #D9D9D9; }
    code { font-family: 'Consolas', 'Courier New', monospace; font-size: 10pt; background: #F2F2F2; }
    table { border-collapse: collapse; width: 100%; margin-top: 10pt; margin-bottom: 10pt; }
    th, td { border: 1pt solid #BFBFBF; padding: 6pt; text-align: left; }
    th { background: #F2F2F2; font-weight: bold; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p><em>Generated by EasyCode AI Assistant • ${new Date().toLocaleString()}</em></p>
  <hr style="border: none; border-top: 1pt solid #D9D9D9; margin: 12pt 0;" />
  ${content
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/\n\n/g, '<p></p>')
    .replace(/\n- (.*$)/gim, '<li>$1</li>')}
</body>
</html>`;

    const sanitizedTitle = (title || "document").replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    downloadRawFile(`${sanitizedTitle}_document.doc`, wordHtml, "application/msword");
    toast.success(`Exported ${sanitizedTitle}_document.doc for Microsoft Word`);
  } catch (err) {
    console.error("Word export error:", err);
    toast.error("Failed to generate Word document");
  }
}
