"use client";
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Lock, Tag, Lightbulb } from 'lucide-react';
import ProblemPageCollapseButton from './ProblemPageCollapseButton';
import { IUser } from '@/models/User';
import { Session } from 'next-auth';
import axios from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { ObjectId } from 'mongoose';
import { IProblem } from '@/models/Problem';

export default function ProblemPageDescription({
  problemInfo,
  session,
}: {
  problemInfo: IProblem;
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
    if (!fullUserInfo || !fullUserInfo.solvedQuestions) return true;
    return fullUserInfo.solvedQuestions.some(
      (sq) => ((sq._id as string | ObjectId)?.toString() || "") === problemId
    );
  };

  // LeetCode exact colors for difficulty (darker, rich tones)
  const levelColorMap: Record<string, string> = {
    Easy: "rgb(0, 184, 163)",     // Darker teal #00b8a3
    Medium: "rgb(255, 184, 0)",   // Darker amber #ffb800
    Hard: "rgb(255, 45, 85)",     // Darker red #ff2d55
  };

  const levelColor = levelColorMap[problemInfo.level] || levelColorMap["Easy"];

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
            color: 'rgb(26, 26, 26)',
            margin: 0,
            padding: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          }}
        >
          {problemInfo.title || "1. Two Sum"}
        </h1>
        {isProblemSolved((problemInfo._id as string) || "") ? (
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
        ) : (
          <div
            className="flex items-center gap-1 shrink-0 select-none"
            style={{
              fontSize: '13px',
              color: 'rgb(255, 184, 0)',
              fontWeight: 600,
            }}
          >
            <span>Attempted</span>
          </div>
        )}
      </div>

      {/* Badges row */}
      <div className="flex items-center flex-wrap gap-2 mb-4">
        {/* Easy badge */}
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
        >
          {problemInfo.level || "Easy"}
        </span>

        <button
          className="flex items-center gap-1 cursor-pointer"
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
          <span>Topics</span>
        </button>

        <button
          className="flex items-center gap-1 cursor-pointer"
          style={{
            fontSize: '12px',
            color: 'rgb(255, 176, 24)',
            backgroundColor: 'rgba(0, 0, 0, 0.06)',
            borderRadius: '9999px',
            padding: '4px 8px',
            height: '24px',
            border: 'none',
          }}
        >
          <Lock style={{ width: '12px', height: '12px', color: 'rgb(255, 176, 24)' }} />
          <span>Companies</span>
        </button>

        <button
          className="flex items-center gap-1 cursor-pointer"
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
          <Lightbulb style={{ width: '12px', height: '12px' }} />
          <span>Hint</span>
        </button>
      </div>

      {/* Description paragraphs */}
      <p style={pStyle}>
        You are given an array of integers <code style={codeStyle}>nums</code>&nbsp;and an integer <code style={codeStyle}>target</code>, return <em>indices of the two numbers such that they add up to <code style={codeStyle}>target</code></em>.
      </p>

      <p style={pStyle}>
        You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.
      </p>

      <p style={pStyle}>
        You can return the answer in any order.
      </p>

      <p style={{ margin: '8px 0' }}>&nbsp;</p>

      {/* Example 1 */}
      <p style={{ ...pStyle, margin: '0 0 2px 0' }}>
        <strong style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', fontWeight: 700, color: 'rgb(38, 38, 38)', fontSize: '14px' }}>Example 1:</strong>
      </p>
      <pre style={preStyle}>
<strong style={strongInPreStyle}>Input:</strong> nums = [2,7,11,15], target = 9{'\n'}
<strong style={strongInPreStyle}>Output:</strong> [0,1]{'\n'}
<strong style={strongInPreStyle}>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
      </pre>

      {/* Example 2 */}
      <p style={{ ...pStyle, margin: '0 0 2px 0' }}>
        <strong style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', fontWeight: 700, color: 'rgb(38, 38, 38)', fontSize: '14px' }}>Example 2:</strong>
      </p>
      <pre style={preStyle}>
<strong style={strongInPreStyle}>Input:</strong> nums = [3,2,4], target = 6{'\n'}
<strong style={strongInPreStyle}>Output:</strong> [1,2]
      </pre>

      {/* Example 3 */}
      <p style={{ ...pStyle, margin: '0 0 2px 0' }}>
        <strong style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', fontWeight: 700, color: 'rgb(38, 38, 38)', fontSize: '14px' }}>Example 3:</strong>
      </p>
      <pre style={{ ...preStyle, margin: '4px 0 28px 0' }}>
<strong style={strongInPreStyle}>Input:</strong> nums = [3,3], target = 6{'\n'}
<strong style={strongInPreStyle}>Output:</strong> [0,1]
      </pre>

      {/* Constraints section with generous LeetCode spacing (User request) */}
      <p style={{ ...pStyle, margin: '0 0 12px 0' }}>
        <strong style={{ fontWeight: 700, color: 'rgb(38, 38, 38)' }}>Constraints:</strong>
      </p>
      <ul style={{ margin: '0 0 32px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <li style={{ ...pStyle, listStyle: 'disc', marginLeft: '18px', margin: '0' }}>
          <code style={codeStyle}>2 &lt;= nums.length &lt;= 10<sup>4</sup></code>
        </li>
        <li style={{ ...pStyle, listStyle: 'disc', marginLeft: '18px', margin: '0' }}>
          <code style={codeStyle}>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code>
        </li>
        <li style={{ ...pStyle, listStyle: 'disc', marginLeft: '18px', margin: '0' }}>
          <code style={codeStyle}>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code>
        </li>
        <li style={{ ...pStyle, listStyle: 'disc', marginLeft: '18px', margin: '0' }}>
          <strong style={{ fontWeight: 700, color: 'rgb(38, 38, 38)' }}>Only one valid answer exists.</strong>
        </li>
      </ul>

      {/* Follow-up with generous spacing (User request) */}
      <p style={{ ...pStyle, margin: '0 0 32px 0' }}>
        <strong style={{ fontWeight: 700, color: 'rgb(38, 38, 38)' }}>Follow-up:&nbsp;</strong>
        <span>Can you come up with an algorithm that is less than </span>
        <code style={codeStyle}>O(n<sup>2</sup>)</code>
        <span> time complexity?</span>
      </p>

      {/* Acceptance stats with generous margin */}
      <div className="flex items-center gap-4 mb-6" style={{ fontSize: '13px', color: 'rgb(38, 38, 38)' }}>
        <div>
          <span style={{ color: 'rgba(0,0,0,0.55)' }}>Accepted</span>
          <span style={{ fontWeight: 600, marginLeft: '6px' }}>23,180,403</span>
          <span style={{ color: 'rgba(0,0,0,0.35)', marginLeft: '4px' }}>/</span>
          <span style={{ color: 'rgba(0,0,0,0.55)', marginLeft: '4px' }}>39.9M</span>
        </div>
        <div>
          <span style={{ color: 'rgba(0,0,0,0.55)' }}>Acceptance Rate</span>
          <span style={{ fontWeight: 600, marginLeft: '6px' }}>58.0%</span>
        </div>
      </div>

      {/* Expandable Accordions */}
      <ProblemPageCollapseButton problemInfo={problemInfo} />
    </div>
  );
}
