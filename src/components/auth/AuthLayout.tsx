"use client";

import React, { ReactNode } from "react";
import AuthHero from "./AuthHero";
import { ModeToggle } from "../modeToggle";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0a0a0c] text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-3 sm:p-4 lg:p-5 antialiased">
      {/* Top right quick utilities */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2.5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100/80 dark:bg-neutral-800/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 backdrop-blur-md transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ModeToggle />
      </div>

      <div className="w-full max-w-[1400px] h-full min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-2.5rem)] flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
        {/* Left Side: Animated Hero Showcase Panel */}
        <div className="hidden lg:block w-1/2 h-[calc(100vh-2.5rem)] max-h-[860px]">
          <AuthHero />
        </div>

        {/* Right Side: Form Container */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-8 py-6 max-h-[100vh] overflow-y-auto">
          {/* Mobile-only Brand Header */}
          <Link href="/" className="lg:hidden mb-6 flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold tracking-wider text-sm uppercase">EASYCODE</span>
          </Link>

          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
