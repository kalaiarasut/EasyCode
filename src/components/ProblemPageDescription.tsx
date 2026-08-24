"use client";
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Tag, Building2, Lightbulb } from 'lucide-react';
import ProblemPageCollapseButton from './ProblemPageCollapseButton';
import { IUser } from '@/models/User';
import { Session } from 'next-auth';
import axios from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { ObjectId } from 'mongoose';
import { IProblem } from '@/models/Problem';

// Clean LaTeX and math markup into clean LeetCode styled text
function cleanLatexMath(raw: string): string {
  if (!raw) return "";
  return raw
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
    .replace(/\\alpha/g, "alpha")
    .replace(/\\beta/g, "beta")
    .replace(/\\gamma/g, "gamma")
    .replace(/\\epsilon/g, "epsilon")
    .replace(/\\Delta/g, "delta")
    .replace(/\\approx/g, "≈")
    .replace(/\\quad/g, " ")
    .replace(/\\qquad/g, "  ")
    .replace(/\\_/g, "_");
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
    .replace(/\\alpha/g, "alpha")
    .replace(/\\beta/g, "beta")
    .replace(/\\gamma/g, "gamma")
    .replace(/\\epsilon/g, "epsilon")
    .replace(/\\Delta/g, "delta")
    .replace(/\\approx/g, "≈")
    .replace(/\\quad/g, " ")
    .replace(/\\qquad/g, "  ")
    .replace(/\\_/g, "_")
    .replace(/_\{([^}]+)\}/g, "[$1]")
    .replace(/_([a-zA-Z0-9])/g, "[$1]")
    .replace(/\^\{([^}]+)\}/g, "^$1")
    .trim();
  return `\`${cleaned}\``;
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

  // LeetCode exact colors for difficulty (darker, rich tones)
  const levelColorMap: Record<string, string> = {
    Easy: "rgb(0, 184, 163)",     // Teal #00b8a3
    Medium: "rgb(255, 184, 0)",   // Amber #ffb800
    Hard: "rgb(255, 45, 85)",     // Red #ff2d55
  };

  const levelColor = levelColorMap[problemInfo?.level] || levelColorMap["Medium"];

  // Exact LeetCode code tag styles
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

  // Exact LeetCode example pre container styles
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

  // Exact LeetCode paragraph style
  const pStyle: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '21px',
    color: 'rgb(38, 38, 38)',
    margin: '0 0 16px 0',
    padding: 0,
  };

  // Exact LeetCode dark label style inside pre
  const strongInPreStyle: React.CSSProperties = {
    fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: 700,
    color: 'rgb(38, 38, 38)',
    letterSpacing: '0.015em',
  };

  // Helper to render paragraph with formatted backtick codes and bold/italic text
  const renderFormattedParagraph = (rawParagraph: string, pIdx: number) => {
    const cleaned = cleanLatexMath(rawParagraph);
    const segments = cleaned.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return (
      <p key={pIdx} style={pStyle} className="dark:text-[#d1d1d1]">
        {segments.map((seg, sIdx) => {
          if (seg.startsWith("`") && seg.endsWith("`")) {
            const innerCode = seg.slice(1, -1);
            return (
              <code key={sIdx} style={codeStyle} className="dark:bg-white/[0.08] dark:text-[#e0e0e0] dark:border-white/[0.08]">
                {innerCode}
              </code>
            );
          }
          if (seg.startsWith("**") && seg.endsWith("**")) {
            return <strong key={sIdx} className="font-bold text-neutral-900 dark:text-neutral-100">{seg.slice(2, -2)}</strong>;
          }
          if (seg.startsWith("*") && seg.endsWith("*")) {
            return <em key={sIdx}>{seg.slice(1, -1)}</em>;
          }
          return <span key={sIdx}>{seg}</span>;
        })}
      </p>
    );
  };

  const rawDescription = problemInfo?.description || "";
  const paragraphs = rawDescription.split(/\n+/).filter(Boolean);
  const examples: Array<{ id?: number; input: string; output: string; explanation?: string }> = problemInfo?.examples || [];
  const constraints: string[] = problemInfo?.constraints || [];
  const followUpPrompt = typeof problemInfo?.followUp === "object" ? problemInfo?.followUp?.prompt : problemInfo?.followUp;

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

      {/* Description paragraphs (dynamically rendered) */}
      <div className="space-y-3 mb-4">
        {paragraphs.length > 0 ? (
          paragraphs.map((p: string, idx: number) => renderFormattedParagraph(p, idx))
        ) : (
          <p style={pStyle} className="dark:text-[#d1d1d1]">{rawDescription}</p>
        )}
      </div>

      <p style={{ margin: '8px 0' }}>&nbsp;</p>

      {/* Examples (dynamically rendered) */}
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

      {/* Constraints section (dynamically rendered) */}
      {constraints.length > 0 && (
        <>
          <p style={{ ...pStyle, margin: '0 0 12px 0' }}>
            <strong style={{ fontWeight: 700 }} className="text-[#262626] dark:text-[#f0f0f0]">
              Constraints:
            </strong>
          </p>
          <ul style={{ margin: '0 0 32px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {constraints.map((constraint, idx) => (
              <li key={idx} style={{ ...pStyle, listStyle: 'disc', marginLeft: '18px', margin: '0' }} className="dark:text-[#d1d1d1]">
                <code style={codeStyle} className="dark:bg-white/[0.08] dark:text-[#e0e0e0] dark:border-white/[0.08]">
                  {cleanLatexMath(constraint).replace(/`/g, "")}
                </code>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Follow-up section (dynamically rendered) */}
      {followUpPrompt && (
        <p style={{ ...pStyle, margin: '0 0 32px 0' }} className="dark:text-[#d1d1d1]">
          <strong style={{ fontWeight: 700 }} className="text-[#262626] dark:text-[#f0f0f0]">Follow-up:&nbsp;</strong>
          <span>{cleanLatexMath(followUpPrompt)}</span>
        </p>
      )}

      {/* Expandable Accordions for Hints, Topics, Companies */}
      <div className="mt-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
        <ProblemPageCollapseButton problemInfo={problemInfo} />
      </div>
    </div>
  );
}
