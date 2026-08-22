"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { signOut, useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─── Exact LeetCode FontAwesome / custom SVG icons extracted via DevTools ─── */

const IconIndent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor" className="h-[1em] w-[0.875em]">
    <path d="M0 64C0 77.3 10.7 88 24 88H424c13.3 0 24-10.7 24-24s-10.7-24-24-24H24C10.7 40 0 50.7 0 64zM192 192c0 13.3 10.7 24 24 24H424c13.3 0 24-10.7 24-24s-10.7-24-24-24H216c-13.3 0-24 10.7-24 24zm24 104c-13.3 0-24 10.7-24 24s10.7 24 24 24H424c13.3 0 24-10.7 24-24s-10.7-24-24-24H216zM0 448c0 13.3 10.7 24 24 24H424c13.3 0 24-10.7 24-24s-10.7-24-24-24H24c-13.3 0-24 10.7-24 24zM121 268.4c7.8-6.4 7.8-18.3 0-24.7L26.2 165.6C15.7 157 0 164.4 0 177.9V334.1c0 13.5 15.7 20.9 26.2 12.4L121 268.4z" />
  </svg>
);

const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="0.625em" height="1em" fill="currentColor">
    <path d="M15 239c-9.4 9.4-9.4 24.6 0 33.9L207 465c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L65.9 256 241 81c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L15 239z" />
  </svg>
);

const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="0.625em" height="1em" fill="currentColor">
    <path d="M305 239c9.4 9.4 9.4 24.6 0 33.9L113 465c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l175-175L79 81c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L305 239z" />
  </svg>
);

const IconShuffle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
    <path d="M425 31l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39H352c-12.6 0-24.4 5.9-32 16l-46 61.3-30-40 37.6-50.1C298.2 117 324.3 104 352 104h78.1L391 65c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0zM204 322.7l-37.6 50.1C149.8 395 123.7 408 96 408H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H96c12.6 0 24.4-5.9 32-16l46-61.3 30 40zM391 287c9.4-9.4 24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39H352c-27.7 0-53.8-13-70.4-35.2L128 168c-7.6-10.1-19.4-16-32-16H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H96c27.7 0 53.8 13 70.4 35.2L320 344c7.6 10.1 19.4 16 32 16h78.1l-39-39c-9.4-9.4-9.4-24.6 0-33.9z" />
  </svg>
);

const IconPlay = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="0.75em" height="1em" fill="currentColor">
    <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
  </svg>
);

const IconCloudArrowUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="1.25em" height="1em" fill="currentColor">
    <path d="M354.9 121.7c13.8 16 36.5 21.1 55.9 12.5c8.9-3.9 18.7-6.2 29.2-6.2c39.8 0 72 32.2 72 72c0 4-.3 7.9-.9 11.7c-3.5 21.6 8.1 42.9 28.1 51.7C570.4 276.9 592 308 592 344c0 46.8-36.6 85.2-82.8 87.8c-.6 0-1.3 .1-1.9 .2H504 144c-53 0-96-43-96-96c0-41.7 26.6-77.3 64-90.5c19.2-6.8 32-24.9 32-45.3l0-.2v0 0c0-66.3 53.7-120 120-120c36.3 0 68.8 16.1 90.9 41.7zM512 480v-.2c71.4-4.1 128-63.3 128-135.8c0-55.7-33.5-103.7-81.5-124.7c1-6.3 1.5-12.8 1.5-19.3c0-66.3-53.7-120-120-120c-17.4 0-33.8 3.7-48.7 10.3C360.4 54.6 314.9 32 264 32C171.2 32 96 107.2 96 200l0 .2C40.1 220 0 273.3 0 336c0 79.5 64.5 144 144 144H464h40 8zM223 255c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V384c0 13.3 10.7 24 24 24s24-10.7 24-24V249.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
  </svg>
);

const IconNoteSticky = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="0.875em" height="1em" fill="currentColor">
    <path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H288V352c0-17.7 14.3-32 32-32h80V96c0-8.8-7.2-16-16-16H64zM288 480H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V320v5.5c0 17-6.7 33.3-18.7 45.3l-90.5 90.5c-12 12-28.3 18.7-45.3 18.7H288z" />
  </svg>
);

const IconSparkleGradient = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
    <path d="M10.2188 2.6875L12 2L12.6562 0.25C12.6875 0.09375 12.8438 0 13 0C13.125 0 13.2812 0.09375 13.3125 0.25L14 2L15.75 2.6875C15.9062 2.71875 16 2.875 16 3C16 3.15625 15.9062 3.3125 15.75 3.34375L14 4L13.3125 5.78125C13.2812 5.90625 13.125 6 13 6C12.8438 6 12.6875 5.90625 12.6562 5.78125L12 4L10.2188 3.34375C10.0938 3.3125 10 3.15625 10 3C10 2.875 10.0938 2.71875 10.2188 2.6875ZM6.40625 2.3125L8.03125 5.875L11.5938 7.5C11.7812 7.59375 11.9062 7.78125 11.9062 7.96875C11.9062 8.15625 11.7812 8.34375 11.5938 8.40625L8.03125 10.0625L6.40625 13.625C6.3125 13.8125 6.125 13.9375 5.9375 13.9375C5.75 13.9375 5.5625 13.8125 5.5 13.625L3.84375 10.0625L0.28125 8.4375C0.09375 8.34375 0 8.15625 0 7.96875C0 7.78125 0.09375 7.59375 0.28125 7.5L3.84375 5.875L5.5 2.3125C5.5625 2.125 5.75 2 5.9375 2C6.125 2 6.3125 2.125 6.40625 2.3125ZM12 12L12.6562 10.25C12.6875 10.0938 12.8438 10 13 10C13.125 10 13.2812 10.0938 13.3125 10.25L14 12L15.75 12.6875C15.9062 12.7188 16 12.875 16 13C16 13.1562 15.9062 13.3125 15.75 13.3438L14 14L13.3125 15.7812C13.2812 15.9062 13.125 16 13 16C12.8438 16 12.6875 15.9062 12.6562 15.7812L12 14L10.2188 13.3438C10.0938 13.3125 10 13.1562 10 13C10 12.875 10.0938 12.7188 10.2188 12.6875L12 12Z" fill="#007AFF" />
    <path d="M10.2188 2.6875L12 2L12.6562 0.25C12.6875 0.09375 12.8438 0 13 0C13.125 0 13.2812 0.09375 13.3125 0.25L14 2L15.75 2.6875C15.9062 2.71875 16 2.875 16 3C16 3.15625 15.9062 3.3125 15.75 3.34375L14 4L13.3125 5.78125C13.2812 5.90625 13.125 6 13 6C12.8438 6 12.6875 5.90625 12.6562 5.78125L12 4L10.2188 3.34375C10.0938 3.3125 10 3.15625 10 3C10 2.875 10.0938 2.71875 10.2188 2.6875ZM6.40625 2.3125L8.03125 5.875L11.5938 7.5C11.7812 7.59375 11.9062 7.78125 11.9062 7.96875C11.9062 8.15625 11.7812 8.34375 11.5938 8.40625L8.03125 10.0625L6.40625 13.625C6.3125 13.8125 6.125 13.9375 5.9375 13.9375C5.75 13.9375 5.5625 13.8125 5.5 13.625L3.84375 10.0625L0.28125 8.4375C0.09375 8.34375 0 8.15625 0 7.96875C0 7.78125 0.09375 7.59375 0.28125 7.5L3.84375 5.875L5.5 2.3125C5.5625 2.125 5.75 2 5.9375 2C6.125 2 6.3125 2.125 6.40625 2.3125ZM12 12L12.6562 10.25C12.6875 10.0938 12.8438 10 13 10C13.125 10 13.2812 10.0938 13.3125 10.25L14 12L15.75 12.6875C15.9062 12.7188 16 12.875 16 13C16 13.1562 15.9062 13.3125 15.75 13.3438L14 14L13.3125 15.7812C13.2812 15.9062 13.125 16 13 16C12.8438 16 12.6875 15.9062 12.6562 15.7812L12 14L10.2188 13.3438C10.0938 13.3125 10 13.1562 10 13C10 12.875 10.0938 12.7188 10.2188 12.6875L12 12Z" fill="url(#lc_sparkle_grad)" />
    <defs>
      <linearGradient id="lc_sparkle_grad" x1="0.498" y1="3" x2="28" y2="15.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#AF52DE" />
        <stop offset="1" stopColor="#007AFF" />
      </linearGradient>
    </defs>
  </svg>
);

const IconObjectsColumn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="0.875em" height="1em" fill="currentColor">
    <path d="M48 80V240h96V80H48zM0 80C0 53.5 21.5 32 48 32h96c26.5 0 48 21.5 48 48V240c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80zM304 272V432h96V272H304zm-48 0c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H304c-26.5 0-48-21.5-48-48V272zM144 368H48v64h96V368zM48 320h96c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V368c0-26.5 21.5-48 48-48zM304 80v64h96V80H304zm-48 0c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H304c-26.5 0-48-21.5-48-48V80z" />
  </svg>
);

const IconGear = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
    <path d="M256 0c17 0 33.6 1.7 49.8 4.8c7.9 1.5 21.8 6.1 29.4 20.1c2 3.7 3.6 7.6 4.6 11.8l9.3 38.5C350.5 81 360.3 86.7 366 85l38-11.2c4-1.2 8.1-1.8 12.2-1.9c16.1-.5 27 9.4 32.3 15.4c22.1 25.1 39.1 54.6 49.9 86.3c2.6 7.6 5.6 21.8-2.7 35.4c-2.2 3.6-4.9 7-8 10L459 246.3c-4.2 4-4.2 15.5 0 19.5l28.7 27.3c3.1 3 5.8 6.4 8 10c8.2 13.6 5.2 27.8 2.7 35.4c-10.8 31.7-27.8 61.1-49.9 86.3c-5.3 6-16.3 15.9-32.3 15.4c-4.1-.1-8.2-.8-12.2-1.9L366 427c-5.7-1.7-15.5 4-16.9 9.8l-9.3 38.5c-1 4.2-2.6 8.2-4.6 11.8c-7.7 14-21.6 18.5-29.4 20.1C289.6 510.3 273 512 256 512s-33.6-1.7-49.8-4.8c-7.9-1.5-21.8-6.1-29.4-20.1c-2-3.7-3.6-7.6-4.6-11.8l-9.3-38.5c-1.4-5.8-11.2-11.5-16.9-9.8l-38 11.2c-4 1.2-8.1 1.8-12.2 1.9c-16.1 .5-27-9.4-32.3-15.4c-22-25.1-39.1-54.6-49.9-86.3c-2.6-7.6-5.6-21.8 2.7-35.4c2.2-3.6 4.9-7 8-10L53 265.7c4.2-4 4.2-15.5 0-19.5L24.2 218.9c-3.1-3-5.8-6.4-8-10C8 195.3 11 181.1 13.6 173.6c10.8-31.7 27.8-61.1 49.9-86.3c5.3-6 16.3-15.9 32.3-15.4c4.1 .1 8.2 .8 12.2 1.9L146 85c5.7 1.7 15.5-4 16.9-9.8l9.3-38.5c1-4.2 2.6-8.2 4.6-11.8c7.7-14 21.6-18.5 29.4-20.1C222.4 1.7 239 0 256 0zM218.1 51.4l-8.5 35.1c-7.8 32.3-45.3 53.9-77.2 44.6L97.9 120.9c-16.5 19.3-29.5 41.7-38 65.7l26.2 24.9c24 22.8 24 66.2 0 89L59.9 325.4c8.5 24 21.5 46.4 38 65.7l34.6-10.2c31.8-9.4 69.4 12.3 77.2 44.6l8.5 35.1c24.6 4.5 51.3 4.5 75.9 0l8.5-35.1c7.8-32.3 45.3-53.9 77.2-44.6l34.6 10.2c16.5-19.3 29.5-41.7 38-65.7l-26.2-24.9c-24-22.8-24-66.2 0-89l26.2-24.9c-8.5-24-21.5-46.4-38-65.7l-34.6 10.2c-31.8 9.4-69.4-12.3-77.2-44.6l-8.5-35.1c-24.6-4.5-51.3-4.5-75.9 0zM208 256a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm48 96a96 96 0 1 1 0-192 96 96 0 1 1 0 192z" />
  </svg>
);

const IconStopwatch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="0.875em" height="1em" fill="currentColor">
    <path d="M144 24c0-13.3 10.7-24 24-24H280c13.3 0 24 10.7 24 24s-10.7 24-24 24H248V97.4c43.4 5 82.8 23.3 113.8 50.9L391 119c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-31 31c24 33.9 38.1 75.3 38.1 120c0 114.9-93.1 208-208 208S16 418.9 16 304C16 197.2 96.4 109.3 200 97.4V48H168c-13.3 0-24-10.7-24-24zm80 440a160 160 0 1 0 0-320 160 160 0 1 0 0 320zm24-248V320c0 13.3-10.7 24-24 24s-24-10.7-24-24V216c0-13.3 10.7-24 24-24s24 10.7 24 24z" />
  </svg>
);

/* ─── Component ─── */

interface ProblemHeaderProps {
  problemId: string;
  allProblemIds?: string[];
  isCodeRunning: boolean;
  isSubmitLoading: boolean;
  onRunCode: () => void;
  onSubmitCode: () => void;
  onOpenAi: () => void;
}

export default function ProblemHeader({
  problemId,
  allProblemIds = [],
  isCodeRunning,
  isSubmitLoading,
  onRunCode,
  onSubmitCode,
  onOpenAi,
}: ProblemHeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  // Timer state
  const [seconds, setSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isTimerRunning && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setSeconds(0);
  };

  // Problem Navigation (Prev, Next, Random)
  const currentIndex = allProblemIds.indexOf(problemId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allProblemIds.length - 1;

  const handlePrevProblem = () => {
    if (hasPrev) router.push(`/problem/${allProblemIds[currentIndex - 1]}`);
  };
  const handleNextProblem = () => {
    if (hasNext) router.push(`/problem/${allProblemIds[currentIndex + 1]}`);
  };
  const handleRandomProblem = () => {
    if (allProblemIds.length > 0) {
      const remaining = allProblemIds.filter((id) => id !== problemId);
      const randomId = remaining.length > 0
        ? remaining[Math.floor(Math.random() * remaining.length)]
        : allProblemIds[0];
      router.push(`/problem/${randomId}`);
    }
  };

  /* ─── LeetCode-style icon button helper ─── */
  const NavIconBtn = ({ children, onClick, disabled, title, className = '' }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    title?: string;
    className?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          title={title}
          className={`relative flex items-center justify-center p-[9px] rounded-none cursor-pointer text-[rgb(119,119,119)] dark:text-[rgb(153,153,153)] hover:text-[rgb(26,26,26)] dark:hover:text-white disabled:opacity-30 disabled:cursor-default transition-colors ${className}`}
          style={{ height: '32px' }}
        >
          {children}
        </button>
      </TooltipTrigger>
      {title && <TooltipContent>{title}</TooltipContent>}
    </Tooltip>
  );

  return (
    <header
      className="relative flex h-[48px] w-full shrink-0 items-center justify-between gap-2 px-2.5 z-50 bg-white dark:bg-[#1a1a1a] border-b border-neutral-200/80 dark:border-neutral-800"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', fontSize: '14px' }}
    >
      {/* ═══ Left section: Logo + Problem List + Prev/Next/Shuffle ═══ */}
      <div className="flex min-w-[240px] flex-1 items-center overflow-hidden">
        {/* Logo */}
        <Link href="/" className="mr-2 self-center">
          <div className="mb-0.5 pl-1">
            <div className="hidden h-5 dark:flex">
              <img src="/navLogo dark.png" className="h-full" alt="Logo" />
            </div>
            <div className="flex h-5 dark:hidden">
              <img src="/navLogo light.png" className="h-full" alt="Logo" />
            </div>
          </div>
        </Link>

        {/* Problem List button */}
        <Link
          href="/problems"
          className="no-underline truncate rounded p-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <IconIndent />
        </Link>

        {/* Prev / Next / Shuffle */}
        <div className="flex items-center ml-2 text-neutral-500 dark:text-neutral-400">
          <NavIconBtn onClick={handlePrevProblem} disabled={!hasPrev} title="Prev Question">
            <IconChevronLeft />
          </NavIconBtn>
          <NavIconBtn onClick={handleNextProblem} disabled={!hasNext} title="Next Question">
            <IconChevronRight />
          </NavIconBtn>
          <NavIconBtn onClick={handleRandomProblem} title="Pick one">
            <IconShuffle />
          </NavIconBtn>
        </div>
      </div>

      {/* ═══ Center section: Run + Submit + Note + AI ═══ */}
      <div className="h-full py-2">
        <div className="flex h-full items-center rounded-lg bg-neutral-100 dark:bg-neutral-800/60 overflow-hidden">
          {/* Run */}
          <NavIconBtn
            onClick={onRunCode}
            disabled={isCodeRunning}
            title="Run"
            className="text-[rgb(26,26,26)] dark:text-white"
          >
            {isCodeRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <IconPlay />
            )}
          </NavIconBtn>

          {/* Submit */}
          <button
            onClick={onSubmitCode}
            disabled={isSubmitLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none font-medium text-[rgb(1,179,40)] dark:text-[rgb(43,212,82)] cursor-pointer bg-transparent hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors disabled:opacity-50 whitespace-nowrap"
            style={{ height: '32px', fontSize: '14px' }}
          >
            {isSubmitLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <IconCloudArrowUp />
            )}
            <span>Submit</span>
          </button>

          {/* Note */}
          <NavIconBtn title="Note">
            <IconNoteSticky />
          </NavIconBtn>

          {/* AI Sparkle */}
          <NavIconBtn onClick={onOpenAi} title="Ask AI">
            <IconSparkleGradient />
          </NavIconBtn>
        </div>
      </div>

      {/* ═══ Right section: Layouts + Settings + Timer + Auth + Premium ═══ */}
      <div className="relative flex flex-1 items-center justify-end">
        {/* Layouts */}
        <NavIconBtn title="Layouts">
          <IconObjectsColumn />
        </NavIconBtn>

        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex items-center justify-center p-[9px] rounded-none cursor-pointer text-[rgb(119,119,119)] dark:text-[rgb(153,153,153)] hover:text-[rgb(26,26,26)] dark:hover:text-white transition-colors"
              style={{ height: '32px' }}
            >
              <IconGear />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Stopwatch / Timer */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex items-center justify-center p-[9px] rounded-none cursor-pointer text-[rgb(119,119,119)] dark:text-[rgb(153,153,153)] hover:text-[rgb(26,26,26)] dark:hover:text-white transition-colors"
              style={{ height: '32px' }}
            >
              <IconStopwatch />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-3 min-w-[180px]">
            <div className="flex items-center justify-center gap-3 font-mono text-sm text-neutral-700 dark:text-neutral-300">
              <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-1 hover:text-neutral-900 dark:hover:text-white cursor-pointer rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
                {isTimerRunning ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="0.625em" height="1em" fill="currentColor"><path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>
                ) : (
                  <IconPlay />
                )}
              </button>
              <span className="tabular-nums text-base">{formatTimer(seconds)}</span>
              <button onClick={handleResetTimer} className="p-1 hover:text-neutral-900 dark:hover:text-white cursor-pointer rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor"><path d="M496 200c0 13.3-10.7 24-24 24h0H360 328c-13.3 0-24-10.7-24-24s10.7-24 24-24h32 54.1l-52.1-52.1C333.8 95.8 295.7 80 256 80c-72.7 0-135.2 44.1-162 107.1c-5.2 12.2-19.3 17.9-31.5 12.7s-17.9-19.3-12.7-31.5C83.9 88.2 163.4 32 256 32c52.5 0 102.8 20.8 139.9 57.9L448 142.1V88l0-.4V56c0-13.3 10.7-24 24-24s24 10.7 24 24V200zM40 288H152c13.3 0 24 10.7 24 24s-10.7 24-24 24H97.9l52.1 52.1C178.2 416.2 216.3 432 256 432c72.6 0 135-43.9 161.9-106.8c5.2-12.2 19.3-17.8 31.5-12.6s17.8 19.3 12.6 31.5C427.8 424 348.5 480 256 480c-52.5 0-102.8-20.8-139.9-57.9L64 369.9V424c0 13.3-10.7 24-24 24s-24-10.7-24-24V312c0-13.3 10.7-24 24-24z"/></svg>
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Auth: user avatar (logged in) or Register / Log in (logged out) */}
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-6 h-6 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center cursor-pointer border border-neutral-300 dark:border-neutral-600 ml-1">
                {session?.user?.avatar ? (
                  <img src={session.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-xs">
                    {session.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs">
              <div className="px-2 py-1.5 font-semibold text-neutral-600 dark:text-neutral-300">
                {session.user?.username || 'User'}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${session.user?._id}`}>Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/profile/${session.user?._id}`}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-red-500">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-1.5 ml-2 text-neutral-500 dark:text-neutral-400 text-sm">
            <Link href="/sign-up" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Register</Link>
            <span className="text-neutral-400">or</span>
            <Link href="/sign-in" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Log in</Link>
          </div>
        )}

        {/* Premium Badge */}
        <Link
          href="/store"
          className="hidden sm:flex items-center ml-2 px-2.5 py-0.5 rounded-full text-amber-600 dark:text-amber-400 font-semibold text-[11px] transition-colors"
          style={{ backgroundColor: 'rgba(255, 175, 56, 0.15)', border: '1px solid rgba(255, 175, 56, 0.3)' }}
        >
          Premium
        </Link>
      </div>
    </header>
  );
}
