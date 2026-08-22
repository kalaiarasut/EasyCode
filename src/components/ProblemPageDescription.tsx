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

  // LeetCode exact colors for difficulty
  const levelColorMap: Record<string, string> = {
    Easy: "rgb(28, 184, 184)",    // #1cb8b8
    Medium: "rgb(255, 176, 24)",  // #ffb018
    Hard: "rgb(255, 55, 95)",     // #ff375f
  };

  const levelColor = levelColorMap[problemInfo.level] || levelColorMap["Easy"];

  // Exact LeetCode code tag styles
  const codeStyle: React.CSSProperties = {
    fontFamily: 'Menlo, Menlo-fallback, sans-serif',
    fontSize: '12px',
    lineHeight: '16px',
    color: 'rgba(38, 38, 38, 0.75)',
    backgroundColor: 'rgba(0, 10, 32, 0.03)',
    borderRadius: '5px',
    padding: '2px 5px',
    border: '0.8px solid rgba(0, 0, 0, 0.05)',
    display: 'inline',
  };

  // Exact LeetCode example pre container styles
  const preStyle: React.CSSProperties = {
    fontFamily: 'Menlo, Menlo-fallback, sans-serif',
    fontSize: '14px',
    lineHeight: '22px',
    color: 'rgba(0, 0, 0, 0.55)',
    backgroundColor: 'transparent',
    borderLeft: '1.6px solid rgba(0, 0, 0, 0.08)',
    padding: '0 0 0 16px',
    margin: '0 0 24px 0',
    borderRadius: '0',
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

  // Exact LeetCode dark label style
  const labelStyle: React.CSSProperties = {
    fontWeight: 700,
    color: 'rgb(38, 38, 38)',
    marginRight: '6px',
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
          1. Two Sum
        </h1>
        <div
          className="flex items-center gap-1 shrink-0 select-none"
          style={{
            fontSize: '13px',
            color: 'rgb(28, 184, 184)',
            fontWeight: 500,
          }}
        >
          <span>Solved</span>
          <CheckCircle2 style={{ width: '15px', height: '15px' }} />
        </div>
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
        You are given an array of integers <code style={codeStyle}>nums</code> and an integer <code style={codeStyle}>target</code>, return <em>indices of the two numbers such that they add up to</em> <code style={codeStyle}>target</code>.
      </p>

      <p style={pStyle}>
        You may assume that each input would have <strong style={{ fontWeight: 700, color: 'rgb(38, 38, 38)' }}><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.
      </p>

      {/* Increased spacing between problem description and examples (User request) */}
      <p style={{ ...pStyle, margin: '0 0 28px 0' }}>
        You can return the answer in any order.
      </p>

      {/* Example 1 */}
      <p style={{ ...pStyle, margin: '0 0 6px 0' }}>
        <strong style={{ fontWeight: 700, color: 'rgb(38, 38, 38)' }}>Example 1:</strong>
      </p>
      <div style={preStyle}>
        <div>
          <strong style={labelStyle}>Input:</strong>
          <span>nums = [2,7,11,15], target = 9</span>
        </div>
        <div>
          <strong style={labelStyle}>Output:</strong>
          <span>[0,1]</span>
        </div>
        <div>
          <strong style={labelStyle}>Explanation:</strong>
          <span>Because nums[0] + nums[1] == 9, we return [0, 1].</span>
        </div>
      </div>

      {/* Example 2 */}
      <p style={{ ...pStyle, margin: '0 0 6px 0' }}>
        <strong style={{ fontWeight: 700, color: 'rgb(38, 38, 38)' }}>Example 2:</strong>
      </p>
      <div style={preStyle}>
        <div>
          <strong style={labelStyle}>Input:</strong>
          <span>nums = [3,2,4], target = 6</span>
        </div>
        <div>
          <strong style={labelStyle}>Output:</strong>
          <span>[1,2]</span>
        </div>
      </div>

      {/* Example 3 */}
      <p style={{ ...pStyle, margin: '0 0 6px 0' }}>
        <strong style={{ fontWeight: 700, color: 'rgb(38, 38, 38)' }}>Example 3:</strong>
      </p>
      <div style={{ ...preStyle, margin: '0 0 32px 0' }}>
        <div>
          <strong style={labelStyle}>Input:</strong>
          <span>nums = [3,3], target = 6</span>
        </div>
        <div>
          <strong style={labelStyle}>Output:</strong>
          <span>[0,1]</span>
        </div>
      </div>

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
