"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Linkedin, Twitter, Sparkles, Star, Github } from "lucide-react";

const TESTIMONIALS = [
  {
    id: "avijit-hira",
    name: "Avijit Hira",
    role: "Full-Stack Engineer & Creator of EasyCode",
    avatar: "A",
    bgColor: "bg-amber-600",
    quote: "I created EasyCode to solve the pain of practicing DSA with slow, clunky tools. Bringing the full Monaco editor, JudgeAPI, and 20+ AI models together made algorithm practice truly enjoyable.",
    linkedinUrl: "https://www.linkedin.com/in/avijit-hira-819a99258/",
    githubUrl: "https://github.com/Avijit200318/"
  },
  {
    id: "rohit-sharma",
    name: "Rohit Sharma",
    role: "Incoming SDE @ Amazon",
    avatar: "R",
    bgColor: "bg-emerald-600",
    quote: "The combination of the Monaco VS Code editor and the AI Leet Bot helped me understand Dynamic Programming state transitions in hours instead of weeks. Cleared all 4 rounds at Amazon!",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com"
  },
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    role: "Candidate Master, Codeforces",
    avatar: "S",
    bgColor: "bg-blue-600",
    quote: "JudgeAPI's execution feedback is blisteringly fast. Testing edge cases against C++20 and Python 3 without leaving the browser is the cleanest setup I've used.",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com"
  },
  {
    id: "david-kim",
    name: "David Kim",
    role: "Software Engineer @ Google",
    avatar: "D",
    bgColor: "bg-purple-600",
    quote: "The Community Solutions Hub with LaTeX math formatting makes reading editorials actually understandable. It's like having high-quality textbook proofs for every LeetCode problem.",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com"
  },
  {
    id: "priya-patel",
    name: "Priya Patel",
    role: "CS Senior @ University of Waterloo",
    avatar: "P",
    bgColor: "bg-rose-600",
    quote: "Being able to bring my own DeepSeek R1 and Claude keys into the AI Workspace for deep step-by-step intuition checks gave me the confidence to pass every technical interview this season.",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com"
  }
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans scroll-mt-20">
      
      {/* Section Header with Navigation Arrows */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-6 border-b border-[#E8E4DB] dark:border-[#2D2B28]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] text-xs font-mono text-neutral-600 dark:text-neutral-300">
            <span>Testimonials</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-neutral-900 dark:text-white">
            Loved by engineers{" "}
            <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-neutral-700 dark:text-neutral-300">
              who care about the craft.
            </span>
          </h2>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#201E1C] flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
            aria-label="Previous testimonial"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#201E1C] flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
            aria-label="Next testimonial"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Testimonials Carousel Grid / Viewport */}
      <div ref={carouselRef} className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            TESTIMONIALS[currentIndex % TESTIMONIALS.length],
            TESTIMONIALS[(currentIndex + 1) % TESTIMONIALS.length],
            TESTIMONIALS[(currentIndex + 2) % TESTIMONIALS.length],
          ].map((item, idx) => (
            <motion.div
              key={`${item.id}-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="p-7 sm:p-8 rounded-2xl bg-white dark:bg-[#201E1C] border border-[#E8E4DB] dark:border-[#383531] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Quote Text */}
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, sIdx) => (
                    <Star key={sIdx} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal">
                  "{item.quote}"
                </p>
              </div>

              {/* User Profile Info & Social Links */}
              <div className="pt-6 border-t border-black/[0.04] dark:border-white/[0.06] mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${item.bgColor} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                    {item.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 leading-tight font-mono">
                      {item.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-neutral-400">
                  <a
                    href={item.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:text-blue-600 transition-colors"
                    aria-label="LinkedIn Profile"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={item.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    aria-label="GitHub Profile"
                  >
                    <Github className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
