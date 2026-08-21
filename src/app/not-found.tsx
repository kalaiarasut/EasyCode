import React from "react";
import type { Metadata } from "next";
import MacropadNotFound from "@/components/MacropadNotFound";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "It seems the page you're looking for doesn't exist. Let's get you back on track.",
};

export default function NotFound() {
  return (
    <main className="w-full min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center bg-[#F9F9FB] dark:bg-[#0B0B0E]">
      <MacropadNotFound />
    </main>
  );
}
