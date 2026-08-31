import React, { Suspense } from "react";
import AiWorkspace from "@/components/workspace/AiWorkspace";

export const metadata = {
  title: "AI Workspace — Trx.ai",
  description: "Interactive AI problem generator, multi-model reasoning playground, and algorithmic sandbox.",
};

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-[#1C1B19]" />}>
      <AiWorkspace />
    </Suspense>
  );
}
