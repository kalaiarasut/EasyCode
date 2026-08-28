"use client";
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Tag, Building2 } from 'lucide-react';
import ProblemPageCollapseButton from './ProblemPageCollapseButton';
import { IUser } from '@/models/User';
import { Session } from 'next-auth';
import axios from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { ObjectId } from 'mongoose';
import { IProblem } from '@/models/Problem';

const superscriptMap: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', 'n': 'ⁿ', 'N': 'ᴺ'
};

// Convert powers, exponents and stripped HTML sup tags to proper unicode superscripts
function formatSuperscriptPowers(text: string): string {
  if (!text) return "";
  return text
    // 10<sup>4</sup> -> 10⁴
    .replace(/10\s*<\s*sup\s*>\s*([0-9+-nN]+)\s*<\s*\/\s*sup\s*>/gi, (_, p) => `10${p.split('').map((c: string) => superscriptMap[c] || c).join('')}`)
    .replace(/<\s*sup\s*>\s*([0-9+-nN]+)\s*<\s*\/\s*sup\s*>/gi, (_, p) => p.split('').map((c: string) => superscriptMap[c] || c).join(''))
    // base^{exp} or base^exp -> baseᵉˣᵖ
    .replace(/([0-9a-zA-Z]+)\s*\^\s*\{?([0-9+-nN]+)\}?/g, (_, base, exp) => `${base}${exp.split('').map((c: string) => superscriptMap[c] || c).join('')}`)
    // 10 4 or 10 9 or 10 10 -> 10⁴, 10⁹, 10¹⁰ (from stripped sup tags)
    .replace(/\b10\s+([2-9]|1[0-8])\b/g, (_, exp) => `10${exp.split('').map((c: string) => superscriptMap[c] || c).join('')}`)
    // -109 -> -10⁹, -104 -> -10⁴, -105 -> -10⁵
    .replace(/(-10)(4|5|6|7|8|9)\b/g, (_, prefix, exp) => `${prefix}${superscriptMap[exp]}`)
    // <= 109 or < 109 or = 109 -> <= 10⁹
    .replace(/([<=><=]\s*10)(4|5|6|7|8|9)\b/g, (_, prefix, exp) => `${prefix}${superscriptMap[exp]}`)
    // O(n2) -> O(n²)
    .replace(/O\(([a-zA-Z]+)(2|3)\)/g, (_, base, exp) => `O(${base}${superscriptMap[exp]})`);
}

// Clean LaTeX, HTML entities, and math markup into clean LeetCode styled text
function cleanLatexMath(raw: string): string {
  if (!raw) return "";
  let text = raw
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&le;/g, "<=")
    .replace(/&ge;/g, ">=")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => cleanMathFormula(math))
    .replace(/\$([^$\n]+)\$/g, (_, math) => cleanMathFormula(math))
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\mathrm\{([^}]+)\}/g, "$1")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\max/g, "max")
    .replace(/\\min/g, "min")
    .replace(/\\times/g, " * ")
    .replace(/\\cdot/g, " * ")
    .replace(/\\le/g, "<=")
    .replace(/\\ge/g, ">=")
    .replace(/\\ne/g, "!=")
    .replace(/\\in/g, " in ")
    .replace(/\\approx/g, "≈")
    .replace(/\\quad/g, " ")
    .replace(/\\qquad/g, "  ")
    .replace(/\\_/g, "_");

  return formatSuperscriptPowers(text);
}

function cleanMathFormula(math: string): string {
  let cleaned = math
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\mathrm\{([^}]+)\}/g, "$1")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\max/g, "max")
    .replace(/\\min/g, "min")
    .replace(/\\times/g, " * ")
    .replace(/\\cdot/g, " * ")
    .replace(/\\le/g, "<=")
    .replace(/\\ge/g, ">=")
    .replace(/\\ne/g, "!=")
    .replace(/\\in/g, " in ")
    .replace(/\\approx/g, "≈")
    .replace(/\\quad/g, " ")
    .replace(/\\qquad/g, "  ")
    .replace(/\\_/g, "_")
    .replace(/_\{([^}]+)\}/g, "[$1]")
    .replace(/_([a-zA-Z0-9])/g, "[$1]")
    .replace(/\^\{([^}]+)\}/g, "^$1")
    .trim();
  return `\`${formatSuperscriptPowers(cleaned)}\``;
}

// LeetCode exact code tag styles
const codeStyle: React.CSSProperties = {
  fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: '12.5px',
  lineHeight: '16px',
  letterSpacing: '0.025em',
  color: 'rgba(38, 38, 38, 0.75)',
  backgroundColor: 'rgba(0, 10, 32, 0.03)',
  borderRadius: '5px',
  padding: '2px 4px',
  border: '0.8px solid rgba(0, 0, 0, 0.05)',
  display: 'inline',
  fontFeatureSettings: '"tnum"',
};

// LeetCode example pre container styles
const preStyle: React.CSSProperties = {
  fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: '14px',
  lineHeight: '22px',
  letterSpacing: '0.015em',
  color: 'rgb(38, 38, 38)',
  backgroundColor: 'transparent',
  borderLeft: '1.6px solid rgba(0, 0, 0, 0.08)',
  padding: '0 0 0 16px',
  margin: '4px 0 20px 0',
  borderRadius: '0',
  whiteSpace: 'pre-wrap',
  fontFeatureSettings: '"tnum"',
};

// LeetCode paragraph style
const pStyle: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '21px',
  color: 'rgb(38, 38, 38)',
  margin: '0 0 16px 0',
  padding: 0,
};

// LeetCode dark label style inside pre
const strongInPreStyle: React.CSSProperties = {
  fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontWeight: 700,
  color: 'rgb(38, 38, 38)',
  letterSpacing: '0.015em',
};

// Recursive parser to render text with nested formatting (code, bold, italic, superscripts)
function parseFormattedTextToReact(rawText: string, keyPrefix: string = "p"): React.ReactNode[] {
  if (!rawText) return [];

  // Step 1: Normalize LaTeX math, HTML entities, and powers
  let text = cleanLatexMath(rawText)
    .replace(/<font[^>]*>([\s\S]*?)<\/font>/gi, '$1');

  // Step 2: Convert standard markdown patterns into unified HTML tags for recursive AST parsing
  text = text
    // Convert `code` to <code>code</code>
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Convert ***bold italic*** to <strong><em>bold italic</em></strong>
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Convert **bold** to <strong>bold</strong>
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>italic</em>
    .replace(/(?<![a-zA-Z0-9])\*([^*]+)\*(?![a-zA-Z0-9])/g, '<em>$1</em>')
    // Convert _italic_ to <em>italic</em>
    .replace(/(?<![a-zA-Z0-9])_([^_]+)_(?![a-zA-Z0-9])/g, '<em>$1</em>');

  // Step 3: Recursive tag parser
  function parseNodes(str: string, prefix: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    let remaining = str;
    let index = 0;

    while (remaining.length > 0) {
      // Find the first HTML tag opening
      const tagMatch = remaining.match(/<(code|strong|b|em|i|sup|sub)>([\s\S]*?)<\/\1>/i);
      if (!tagMatch || tagMatch.index === undefined) {
        if (remaining) {
          nodes.push(remaining.replace(/<[^>]+>/g, ''));
        }
        break;
      }

      // Add preceding plain text
      if (tagMatch.index > 0) {
        const plain = remaining.slice(0, tagMatch.index).replace(/<[^>]+>/g, '');
        if (plain) nodes.push(plain);
      }

      const tagName = tagMatch[1].toLowerCase();
      const innerContent = tagMatch[2];
      const nodeKey = `${prefix}-${index++}`;

      if (tagName === 'code') {
        nodes.push(
          <code key={nodeKey} style={codeStyle} className="dark:bg-white/[0.08] dark:text-[#e0e0e0] dark:border-white/[0.08]">
            {innerContent.replace(/<[^>]+>/g, '')}
          </code>
        );
      } else if (tagName === 'strong' || tagName === 'b') {
        nodes.push(
          <strong key={nodeKey} className="font-bold text-neutral-900 dark:text-neutral-100">
            {parseNodes(innerContent, `${nodeKey}-s`)}
          </strong>
        );
      } else if (tagName === 'em' || tagName === 'i') {
        nodes.push(
          <em key={nodeKey}>
            {parseNodes(innerContent, `${nodeKey}-e`)}
          </em>
        );
      } else if (tagName === 'sup') {
        nodes.push(
          <sup key={nodeKey} className="text-[10px]">
            {formatSuperscriptPowers(innerContent)}
          </sup>
        );
      } else {
        nodes.push(innerContent);
      }

      remaining = remaining.slice(tagMatch.index + tagMatch[0].length);
    }

    return nodes;
  }

  return parseNodes(text, keyPrefix);
}

// Extract pure problem description paragraphs from HTML or markdown
function extractPureDescriptionParagraphs(problemInfo: any): string[] {
  const html = problemInfo?.description_html;
  if (html && typeof html === "string" && html.includes("<p>")) {
    const cutIdx = html.search(/<strong[^>]*class=["']?example|<strong[^>]*>Example|Example\s*1/i);
    const pureHtml = cutIdx !== -1 ? html.slice(0, cutIdx) : html;
    const pMatches = pureHtml.match(/<p>([\s\S]*?)<\/p>/gi) || [];
    const extracted = pMatches
      .map(p => cleanLatexMath(p.replace(/<\/?p>/gi, '').trim()))
      .filter(p => p && p !== '&nbsp;' && p !== '<br>' && p !== '<br/>');
    if (extracted.length > 0) return extracted;
  }

  const raw = problemInfo?.description_markdown || problemInfo?.description || "";
  const match = raw.match(/\n\s*(?:Example\s*\d+:?|\*\*Example\s*\d+:?|<strong[^>]*>Example\s*\d+:?|Examples?:|Constraints?:|Follow-up:?)/i);
  const pureDesc = match && match.index !== undefined ? raw.slice(0, match.index).trim() : raw.trim();
  
  return pureDesc
    .split(/\n+/)
    .map((s: string) => cleanLatexMath(s.trim()))
    .filter((p: string) => {
      if (!p || p === "```" || p === "`" || /^Example\s*\d+:?$/i.test(p)) return false;
      return true;
    });
}

// Extract clean constraints list from HTML or fallback fields
function extractConstraintsList(problemInfo: any): string[] {
  const html = problemInfo?.description_html;
  if (html && typeof html === "string") {
    const ulMatch = html.match(/<ul>([\s\S]*?)<\/ul>/i);
    if (ulMatch) {
      const liMatches = ulMatch[1].match(/<li>([\s\S]*?)<\/li>/gi) || [];
      const extracted = liMatches
        .map(li => cleanLatexMath(li.replace(/<\/?li>/gi, '').trim()))
        .filter(Boolean);
      if (extracted.length > 0) return extracted;
    }
  }

  const raw = problemInfo?.constraints;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((c: any) => cleanLatexMath(String(c).trim().replace(/^[-*•]\s+/, ""))).filter(Boolean);
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((c: any) => cleanLatexMath(String(c).trim().replace(/^[-*•]\s+/, ""))).filter(Boolean);
      }
    } catch (_) {}
    return raw
      .split("\n")
      .map((s: string) => cleanLatexMath(s.trim().replace(/^[-*•]\s+/, "")))
      .filter(Boolean);
  }
  return [];
}

// Extract clean follow-up text from HTML or markdown
function extractFollowUpText(problemInfo: any): string | null {
  if (problemInfo?.followUp) {
    const rawF = typeof problemInfo.followUp === "object" ? problemInfo.followUp.prompt : problemInfo.followUp;
    if (rawF) return cleanLatexMath(rawF).replace(/^Follow-up:\s*/i, "").replace(/^\*+|\*+$/g, "").trim();
  }

  const html = problemInfo?.description_html;
  if (html && typeof html === "string") {
    const fMatch = html.match(/Follow-up:[ \t\u00a0]*([A-Z][\s\S]*?)(?:<\/p>|<\/div>|$)/i);
    if (fMatch) {
      return cleanLatexMath(fMatch[1]).replace(/^\*+|\*+$/g, "").trim();
    }
  }

  const raw = problemInfo?.description || problemInfo?.description_markdown || "";
  const match = raw.match(/Follow-up:[ \t\u00a0]*([\s\S]*?)(?=\n\s*(?:Example|Constraints)|\s*$)/i);
  if (match) {
    return cleanLatexMath(match[1]).replace(/^\*+|\*+$/g, "").trim();
  }
  return null;
}

export default function ProblemPageDescription({
  problemInfo,
  session,
}: {
  problemInfo: IProblem | any;
  session: Session | null;
}) {
  const [fullUserInfo, setFullUserInfo] = useState<IUser | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!session) return;
      try {
        const res = await axios.get<ApiResponse>(`/api/user/get-user?userId=${session?.user._id}`);
        setFullUserInfo(res.data.user || null);
      } catch (error) {
        console.error("Error while fetching user info: ", error);
      }
    };
    fetchUserInfo();
  }, [session]);

  const isProblemSolved = (problemId: string): boolean => {
    if (!fullUserInfo || !fullUserInfo.solvedQuestions) return false;
    return fullUserInfo.solvedQuestions.some(
      (sq) => ((sq._id as string | ObjectId)?.toString() || "") === problemId
    );
  };

  // LeetCode exact colors for difficulty
  const levelColorMap: Record<string, string> = {
    Easy: "rgb(0, 184, 163)",     // Teal #00b8a3
    Medium: "rgb(255, 184, 0)",   // Amber #ffb800
    Hard: "rgb(255, 45, 85)",     // Red #ff2d55
  };

  const levelColor = levelColorMap[problemInfo?.level] || levelColorMap["Medium"];

  // Clean problem description paragraphs
  const paragraphs = React.useMemo(() => {
    return extractPureDescriptionParagraphs(problemInfo);
  }, [problemInfo]);

  // Robust parsing for examples (handles object array, string array, JSON string, and plain text)
  const examples = React.useMemo(() => {
    const raw = problemInfo?.examples;
    if (!raw) return [];
    
    // Case 1: Array of objects or strings
    if (Array.isArray(raw)) {
      return raw.map((ex: any, idx: number) => {
        if (typeof ex === "string") {
          const inpMatch = ex.match(/Input:\s*([\s\S]*?)(?=\n\s*Output:|\n\s*Explanation:|$)/i);
          const outMatch = ex.match(/Output:\s*([\s\S]*?)(?=\n\s*Explanation:|$)/i);
          const expMatch = ex.match(/Explanation:\s*([\s\S]*)/i);
          return {
            id: idx,
            input: inpMatch ? inpMatch[1].trim() : ex,
            output: outMatch ? outMatch[1].trim() : "",
            explanation: expMatch ? expMatch[1].trim() : undefined,
          };
        }
        return {
          id: ex.id || idx,
          input: ex.input || "",
          output: ex.output || "",
          explanation: ex.explanation,
        };
      });
    }

    // Case 2: String representation (JSON or formatted text)
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((ex: any, idx: number) => ({
            id: ex.id || idx,
            input: ex.input || "",
            output: ex.output || "",
            explanation: ex.explanation,
          }));
        }
      } catch (_) {}

      // Split into example blocks
      const blocks = raw.split(/Example\s*\d+:?/i).filter(Boolean);
      if (blocks.length > 0) {
        return blocks.map((block, idx) => {
          const inpMatch = block.match(/Input:\s*([\s\S]*?)(?=\n\s*Output:|\n\s*Explanation:|$)/i);
          const outMatch = block.match(/Output:\s*([\s\S]*?)(?=\n\s*Explanation:|$)/i);
          const expMatch = block.match(/Explanation:\s*([\s\S]*)/i);
          return {
            id: idx,
            input: inpMatch ? inpMatch[1].trim() : block.trim(),
            output: outMatch ? outMatch[1].trim() : "",
            explanation: expMatch ? expMatch[1].trim() : undefined,
          };
        });
      }
    }
    return [];
  }, [problemInfo?.examples]);

  // Robust extraction for constraints
  const constraints = React.useMemo(() => {
    return extractConstraintsList(problemInfo);
  }, [problemInfo]);

  // Clean follow-up extraction
  const followUpPrompt = React.useMemo(() => {
    return extractFollowUpText(problemInfo);
  }, [problemInfo]);

  // Flatten and separate all topic tags individually
  const rawTopics = problemInfo?.topics;
  const topicsList: string[] = React.useMemo(() => {
    if (!rawTopics) return [];
    if (Array.isArray(rawTopics)) {
      return rawTopics.flatMap((t: string) => (typeof t === "string" ? t.split(",") : [t])).map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof rawTopics === "string") {
      return (rawTopics as string).split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [rawTopics]);

  return (
    <div
      className="w-full flex flex-col select-text"
      style={{
        padding: '16px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        fontSize: '14px',
        lineHeight: '21px',
        color: 'rgb(38, 38, 38)',
      }}
    >
      {/* Title */}
      <div className="w-full flex items-center justify-between gap-4 mb-2.5">
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 600,
            lineHeight: '32px',
            margin: 0,
            padding: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          }}
          className="text-[#1a1a1a] dark:text-[#f0f0f0]"
        >
          {problemInfo?.title || "Algorithmic Problem"}
        </h1>
        {isProblemSolved((problemInfo?._id as string) || "") ? (
          <div
            className="flex items-center gap-1 shrink-0 select-none"
            style={{
              fontSize: '13px',
              color: 'rgb(0, 184, 163)',
              fontWeight: 600,
            }}
          >
            <span>Solved</span>
            <CheckCircle2 style={{ width: '15px', height: '15px' }} />
          </div>
        ) : null}
      </div>

      {/* Badges row */}
      <div className="flex items-center flex-wrap gap-2 mb-4">
        {/* Difficulty badge */}
        <span
          style={{
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '16px',
            color: levelColor,
            backgroundColor: 'rgba(0, 0, 0, 0.06)',
            borderRadius: '9999px',
            padding: '4px 8px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          className="dark:bg-white/[0.08]"
        >
          {problemInfo?.level || "Medium"}
        </span>

        {/* Separated Topics Chips */}
        {topicsList.map((t) => (
          <button
            key={t}
            className="flex items-center gap-1 cursor-pointer dark:bg-white/[0.08] dark:text-[#a0a0a0]"
            style={{
              fontSize: '12px',
              color: 'rgba(0, 0, 0, 0.55)',
              backgroundColor: 'rgba(0, 0, 0, 0.06)',
              borderRadius: '9999px',
              padding: '4px 8px',
              height: '24px',
              border: 'none',
            }}
          >
            <Tag style={{ width: '12px', height: '12px' }} />
            <span>{t}</span>
          </button>
        ))}

        {/* Companies Chip */}
        {problemInfo?.companies && Array.isArray(problemInfo.companies) && problemInfo.companies.length > 0 && (
          <button
            className="flex items-center gap-1 cursor-pointer dark:bg-white/[0.08] dark:text-[#a0a0a0]"
            style={{
              fontSize: '12px',
              color: 'rgba(0, 0, 0, 0.55)',
              backgroundColor: 'rgba(0, 0, 0, 0.06)',
              borderRadius: '9999px',
              padding: '4px 8px',
              height: '24px',
              border: 'none',
            }}
          >
            <Building2 style={{ width: '12px', height: '12px' }} />
            <span>Companies</span>
          </button>
        )}
      </div>

      {/* Description paragraphs (clean problem statement only) */}
      <div className="space-y-3 mb-4">
        {paragraphs.length > 0 ? (
          paragraphs.map((p: string, idx: number) => (
            <p key={idx} style={pStyle} className="dark:text-[#d1d1d1]">
              {parseFormattedTextToReact(p, `p-${idx}`)}
            </p>
          ))
        ) : (
          <p style={pStyle} className="dark:text-[#d1d1d1]">
            {parseFormattedTextToReact(problemInfo?.description || "", "p-fallback")}
          </p>
        )}
      </div>

      <p style={{ margin: '8px 0' }}>&nbsp;</p>

      {/* Examples (cleanly rendered with pre container) */}
      {examples.map((example, idx) => (
        <div key={example.id || idx}>
          <p style={{ ...pStyle, margin: '0 0 2px 0' }} className="dark:text-[#d1d1d1]">
            <strong
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                fontWeight: 700,
                fontSize: '14px',
              }}
              className="text-[#262626] dark:text-[#f0f0f0]"
            >
              Example {idx + 1}:
            </strong>
          </p>
          <pre
            style={{
              ...preStyle,
              margin: idx === examples.length - 1 ? '4px 0 28px 0' : '4px 0 20px 0',
            }}
            className="dark:text-[#dcdcdc] dark:border-white/[0.12]"
          >
            <strong style={strongInPreStyle} className="dark:text-[#f0f0f0]">Input:</strong> {cleanLatexMath(example.input)}{'\n'}
            <strong style={strongInPreStyle} className="dark:text-[#f0f0f0]">Output:</strong> {cleanLatexMath(example.output)}
            {example.explanation && (
              <>
                {'\n'}<strong style={strongInPreStyle} className="dark:text-[#f0f0f0]">Explanation:</strong> {cleanLatexMath(example.explanation)}
              </>
            )}
          </pre>
        </div>
      ))}

      {/* Constraints section */}
      {constraints.length > 0 && (
        <>
          <p style={{ ...pStyle, margin: '0 0 12px 0' }}>
            <strong style={{ fontWeight: 700 }} className="text-[#262626] dark:text-[#f0f0f0]">
              Constraints:
            </strong>
          </p>
          <ul style={{ margin: '0 0 32px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {constraints.map((constraint, idx) => {
              const cleaned = cleanLatexMath(constraint).trim();
              const isBoldStatement = /^(\*\*|<strong>)(.*?)(\*\*|<\/strong>)$/i.test(cleaned);
              
              if (isBoldStatement) {
                const textContent = cleaned.replace(/^\*\*|^<strong>/i, '').replace(/\*\*|<\/strong>$/i, '').trim();
                return (
                  <li key={idx} style={{ ...pStyle, listStyle: 'disc', marginLeft: '18px', margin: '0' }} className="dark:text-[#d1d1d1]">
                    <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{textContent}</strong>
                  </li>
                );
              }

              // Check if constraint is plain text or code inequality
              const isMath = /[<>=]|in\b|\[\s*\d/.test(cleaned) || /\b(nums|target|matrix|grid|head|root|val|length|size|k|n|m|i|j)\b/.test(cleaned);
              
              if (!isMath && !cleaned.includes('`') && !cleaned.includes('<code>')) {
                return (
                  <li key={idx} style={{ ...pStyle, listStyle: 'disc', marginLeft: '18px', margin: '0' }} className="dark:text-[#d1d1d1]">
                    <span>{cleaned.replace(/\*\*/g, '').replace(/<\/?strong>/gi, '')}</span>
                  </li>
                );
              }

              const codeContent = cleaned
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&")
                .replace(/&nbsp;/g, " ")
                .replace(/`/g, "")
                .replace(/\*\*/g, "")
                .replace(/<\/?(?:code|strong|em)>/gi, "");

              return (
                <li key={idx} style={{ ...pStyle, listStyle: 'disc', marginLeft: '18px', margin: '0' }} className="dark:text-[#d1d1d1]">
                  <code style={codeStyle} className="dark:bg-white/[0.08] dark:text-[#e0e0e0] dark:border-white/[0.08]">
                    {codeContent}
                  </code>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Follow-up section */}
      {followUpPrompt && (
        <p style={{ ...pStyle, margin: '0 0 32px 0' }} className="dark:text-[#d1d1d1]">
          <strong style={{ fontWeight: 700 }} className="text-[#262626] dark:text-[#f0f0f0]">Follow-up:&nbsp;</strong>
          <span>{parseFormattedTextToReact(followUpPrompt, "follow-up")}</span>
        </p>
      )}

      {/* Expandable Accordions for Hints, Topics, Companies */}
      <div className="mt-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
        <ProblemPageCollapseButton problemInfo={problemInfo} />
      </div>
    </div>
  );
}
