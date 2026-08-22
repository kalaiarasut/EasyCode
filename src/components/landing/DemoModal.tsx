"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Calendar, Users, Cpu, ArrowRight, Shield, Terminal, Code2 } from "lucide-react";
import { toast } from "sonner";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student / Job Seeker");
  const [language, setLanguage] = useState("C++ / Python 3");
  const [primaryGoal, setPrimaryGoal] = useState("FAANG & Top Tech Coding Interview Prep");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }
    setIsSubmitted(true);
    toast.success("Tour request received! We'll send the platform walkthrough guide to your email.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#FBF9F4] dark:bg-[#1C1B19] border border-[#E8E4DB] dark:border-[#383531] shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#1C1B19] dark:bg-white flex items-center justify-center text-white dark:text-[#1C1B19] font-bold text-xs font-mono">
                E
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">EasyCode Platform Tour</span>
            </div>

            <h3 className="text-2xl font-serif tracking-tight font-medium text-neutral-900 dark:text-white mb-1">
              Master algorithms with EasyCode.
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed font-normal">
              Learn how 3,500+ LeetCode problems, Monaco Editor, remote JudgeAPI execution, and 20+ frontier AI models accelerate your technical mastery.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-500 mb-1 uppercase tracking-wide">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Avijit Sharma"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#252321] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-500 mb-1 uppercase tracking-wide">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="avijit@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#252321] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-500 mb-1 uppercase tracking-wide">
                    Your Focus
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#252321] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Student / Job Seeker">Student / Job Seeker</option>
                    <option value="Competitive Programmer">Competitive Programmer</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Educator / Coding Club">Educator / Coding Club</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-500 mb-1 uppercase tracking-wide">
                    Primary Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#252321] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="C++ / Python 3">C++ / Python 3</option>
                    <option value="Java 17 / OpenJDK">Java 17 / OpenJDK</option>
                    <option value="JavaScript / TypeScript">JavaScript / TypeScript</option>
                    <option value="C (Standard 99)">C (Standard 99)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-500 mb-1 uppercase tracking-wide">
                  Goal
                </label>
                <select
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#252321] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                >
                  <option value="FAANG & Top Tech Coding Interview Prep">FAANG & Top Tech Coding Interview Prep</option>
                  <option value="Mastering Dynamic Programming & Graph Theory">Mastering Dynamic Programming & Graph Theory</option>
                  <option value="JudgeAPI Sandbox Execution Benchmarking">JudgeAPI Sandbox Execution Benchmarking</option>
                  <option value="Exploring 20+ Frontier AI Coding Models">Exploring 20+ Frontier AI Coding Models</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                  <span>JudgeAPI & Monaco Powered</span>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Request Tour</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-serif font-medium text-neutral-900 dark:text-white mb-1">
                Welcome to EasyCode!
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed font-normal">
                Thank you, <strong className="text-neutral-900 dark:text-white">{name}</strong>. We've sent your platform access walkthrough and curated question sets to <span className="font-mono text-neutral-800 dark:text-neutral-200">{email}</span>.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-[#1C1B19] text-white dark:bg-white dark:text-[#1C1B19] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Start Practicing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
