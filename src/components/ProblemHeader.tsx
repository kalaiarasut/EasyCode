"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { signOut, useSession } from 'next-auth/react';
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  List,
  Play,
  CloudUpload,
  Sparkles,
  Flame,
  Pause,
  RotateCcw,
  Settings,
  Sun,
  Moon,
  Loader2,
  LayoutGrid,
  Lock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [seconds, setSeconds] = useState<number>(2382);
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
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setSeconds(0);
  };

  // Problem Navigation (Prev, Next, Random)
  const currentIndex = allProblemIds.indexOf(problemId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allProblemIds.length - 1;

  const handlePrevProblem = () => {
    if (hasPrev) {
      router.push(`/problem/${allProblemIds[currentIndex - 1]}`);
    }
  };

  const handleNextProblem = () => {
    if (hasNext) {
      router.push(`/problem/${allProblemIds[currentIndex + 1]}`);
    }
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

  return (
    <header className="w-full h-12 bg-white dark:bg-[#1a1a1a] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-2.5 text-xs select-none z-50">
      {/* Left section: Logo + Problem List + Navigation */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Link href="/problems" className="flex items-center gap-1.5 font-bold text-sm mr-1 hover:opacity-85 transition-opacity">
          <img src="/navLogo dark.png" alt="EasyCode" className="h-5 w-auto hidden dark:block" />
          <img src="/navLogo light.png" alt="EasyCode" className="h-5 w-auto block dark:hidden" />
        </Link>

        <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700 mx-1" />

        <Link
          href="/problems"
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
        >
          <List className="w-4 h-4 text-neutral-500" />
          <span className="hidden md:inline font-medium">Problem List</span>
        </Link>

        <div className="flex items-center text-neutral-500 dark:text-neutral-400">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handlePrevProblem}
                disabled={!hasPrev}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Previous Problem</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleNextProblem}
                disabled={!hasNext}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Next Problem</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleRandomProblem}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Random Problem</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Center section: Run & Submit & Tools (Exact LeetCode Style) */}
      <div className="flex items-center gap-2">
        {/* Run Button Group */}
        <div className="flex items-center rounded-md bg-neutral-100 dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/60 overflow-hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onRunCode}
                disabled={isCodeRunning || !session}
                className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium transition-all cursor-pointer disabled:opacity-50"
              >
                {isCodeRunning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current text-neutral-700 dark:text-neutral-300" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>{!session ? 'Sign in to run code' : 'Run Code (Ctrl+Enter)'}</TooltipContent>
          </Tooltip>
          <div className="h-3.5 w-[1px] bg-neutral-200 dark:bg-neutral-700" />
          <div className="px-1 py-1 text-neutral-400">
            <Lock className="w-3 h-3 text-amber-500" />
          </div>
        </div>

        {/* Submit Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onSubmitCode}
              disabled={isSubmitLoading || !session}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              ) : (
                <CloudUpload className="w-3.5 h-3.5 text-emerald-500" />
              )}
              <span>Submit</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>{!session ? 'Sign in to submit' : 'Submit Code'}</TooltipContent>
        </Tooltip>

        {/* AI Assistant Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenAi}
              className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-purple-600 dark:text-purple-400 cursor-pointer transition-colors"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Ask AI for Help / Debug</TooltipContent>
        </Tooltip>
      </div>

      {/* Right section: Grid + Settings + Streak + Timer + Profile + Premium */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Apps Grid */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 cursor-pointer">
              <LayoutGrid className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>More Apps</TooltipContent>
        </Tooltip>

        {/* Theme / Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 cursor-pointer">
              <Settings className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 mr-2" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" /> Dark Mode
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Streak */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 px-1.5 py-1 text-neutral-600 dark:text-neutral-400 cursor-pointer">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">0</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Daily Problem Streak</TooltipContent>
        </Tooltip>

        {/* Timer Widget Matching Screenshot */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono text-xs">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="p-0.5 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
          </button>
          <span>{formatTimer(seconds)}</span>
          <button
            onClick={handleResetTimer}
            className="p-0.5 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* User / Auth Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-6 h-6 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center cursor-pointer border border-neutral-300 dark:border-neutral-600">
              {session?.user?.avatar ? (
                <img src={session.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : session?.user ? (
                <span className="font-bold text-xs">
                  {session.user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              ) : (
                <User className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-xs">
            {session ? (
              <>
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
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/sign-in">Sign In</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/sign-up">Create Account</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Premium Badge */}
        <Link
          href="/store"
          className="hidden sm:flex items-center px-2.5 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-[11px] border border-amber-500/30 transition-colors"
        >
          Premium
        </Link>
      </div>
    </header>
  );
}
