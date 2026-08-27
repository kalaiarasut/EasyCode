"use client";

import React, { useState } from "react";
import { Brain, X, Trash2, Check, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";

export interface MemoryInspectItem {
  id: string;
  content: string;
  category: "Goal" | "Language" | "Topic" | "Style";
  createdAt?: string;
}

interface InlineMemoryModalProps {
  memory: MemoryInspectItem | null;
  onClose: () => void;
  onUpdate?: (updated: MemoryInspectItem) => void;
  onDelete?: (id: string) => void;
}

const CATEGORIES: ("Goal" | "Language" | "Topic" | "Style")[] = [
  "Goal",
  "Language",
  "Topic",
  "Style",
];

export default function InlineMemoryModal({
  memory,
  onClose,
  onUpdate,
  onDelete,
}: InlineMemoryModalProps) {
  if (!memory) return null;

  const [content, setContent] = useState(memory.content);
  const [category, setCategory] = useState<"Goal" | "Language" | "Topic" | "Style">(
    memory.category || "Goal"
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (!content.trim()) return;
    try {
      const existing = JSON.parse(
        localStorage.getItem("easycode_user_memories") || "[]"
      );
      const updatedList = existing.map((m: any) =>
        m.id === memory.id ? { ...m, content: content.trim(), category } : m
      );
      // If not in list, append it
      if (!existing.some((m: any) => m.id === memory.id)) {
        updatedList.unshift({
          id: memory.id,
          content: content.trim(),
          category,
          createdAt: memory.createdAt || "Just now",
        });
      }
      localStorage.setItem("easycode_user_memories", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("easycode_memory_updated"));
    } catch (e) {}

    if (onUpdate) {
      onUpdate({ ...memory, content: content.trim(), category });
    }
    setIsSaved(true);
    toast.success("Memory updated successfully");
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 400);
  };

  const handleDelete = () => {
    try {
      const existing = JSON.parse(
        localStorage.getItem("easycode_user_memories") || "[]"
      );
      const updatedList = existing.filter((m: any) => m.id !== memory.id);
      localStorage.setItem("easycode_user_memories", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("easycode_memory_updated"));
    } catch (e) {}

    if (onDelete) {
      onDelete(memory.id);
    }
    toast.success("Memory removed");
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Memory copied to clipboard");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-[#FBF9F4] dark:bg-[#1C1B19] border border-[#E6E2D8] dark:border-[#2D2A26] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <span>AI Memory Entry</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono">
                  Active
                </span>
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Refined memory saved to your personal context bank
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Category Selector Pills */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    category === cat
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-800 dark:text-amber-200 font-semibold shadow-2xs"
                      : "bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Refined Content */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Refined Memory Statement</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[10px] text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors flex items-center gap-1 cursor-pointer font-normal normal-case"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full text-xs leading-relaxed p-3 rounded-xl bg-white dark:bg-[#141413] border border-black/[0.08] dark:border-white/[0.1] text-neutral-900 dark:text-neutral-100 outline-hidden focus:border-amber-500/60 transition-all resize-none font-sans"
              placeholder="Refined memory description..."
            />
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/15 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
            <p className="leading-relaxed">
              This memory is automatically applied across both Workspace and AI Chat to guide code style, problem focus, and explanations.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!content.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#1C1B19] dark:bg-[#EDEDEB] text-white dark:text-[#1C1B19] hover:opacity-90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
