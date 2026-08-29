"use client";

import React from "react";
import { Code2, FolderKanban, Cpu, ArrowRight, GraduationCap, Trophy, Briefcase } from "lucide-react";
import Link from "next/link";

const PERSONAS = [
  {
    id: "job-seekers",
    icon: GraduationCap,
    title: "Job Seekers & Students",
    description: "Crack technical interviews at FAANG and top-tier tech companies with curated problem sets, company tags, and progressive AI hints when you get stuck.",
    actionText: "Practice Interview Sets",
    href: "/problems"
  },
  {
    id: "competitive-programmers",
    icon: Trophy,
    title: "Competitive Programmers",
    description: "Benchmark your solutions across C, C++, Java, Python, and JS with JudgeAPI, explore optimal data structures, and sharpen your algorithmic intuition.",
    actionText: "Open Coding Sandbox",
    href: "/problems"
  },
  {
    id: "software-engineers",
    icon: Cpu,
    title: "Software Engineers",
    description: "Deepen core Computer Science fundamentals, practice system design, and master optimal Big-O memory and runtime trade-offs with 20+ frontier AI models.",
    actionText: "Launch AI Workspace",
    href: "/workspace"
  }
];

export default function PersonaStrip() {
  return (
    <section id="personas" className="pt-10 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans scroll-mt-20">
      
      {/* Section Header */}
      <div className="text-center space-y-3 mb-14">
        <div className="text-xs sm:text-[13px] font-sans font-semibold text-neutral-950 dark:text-white tracking-wide">
          Who It's For
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-neutral-950 dark:text-white">
          Crafted for engineers{" "}
          <br className="hidden sm:inline" />
          <span className="font-serif italic font-normal text-neutral-700 dark:text-neutral-300">
            who value algorithmic depth.
          </span>
        </h2>
      </div>

      {/* 3 Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PERSONAS.map((persona) => {
          const IconComponent = persona.icon;

          return (
            <div
              key={persona.id}
              className="p-7 rounded-2xl bg-white dark:bg-[#201E1C] border border-[#E8E4DB] dark:border-[#383531] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-neutral-800 dark:text-neutral-200 group-hover:scale-105 transition-transform">
                  <IconComponent className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>

                <div>
                  <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
                    {persona.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                    {persona.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-black/[0.04] dark:border-white/[0.06] mt-6">
                <Link
                  href={persona.href}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <span>{persona.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
