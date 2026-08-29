"use client";
import React, { useEffect, useState, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  Braces,
  Code2,
  Copy,
  Lock,
  Maximize2,
  Minimize2,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  Check,
  Info,
  FileText,
  X,
  Heading,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProblemPageCodeEditorProps {
  theme: string | undefined;
  selectedLanguage: string;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<string>>;
  setSelectedLanguageCode: React.Dispatch<React.SetStateAction<number>>;
  sourceCode: string;
  setSourceCode: React.Dispatch<React.SetStateAction<string>>;
  problemId?: string;
  problemInfo?: any;
  isNoteOpen?: boolean;
  activeEditorTab?: 'code' | 'note';
  setActiveEditorTab?: (tab: 'code' | 'note') => void;
  onCloseNote?: () => void;
}


export const codingLanguages = {
  // Column 1
  "C++": {
    compilerId: "cpp",
    apiId: 54,
    defaultBoilerplate: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`,
  },
  "Java": {
    compilerId: "java",
    apiId: 62,
    defaultBoilerplate: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,
  },
  "Python3": {
    compilerId: "python",
    apiId: 71,
    defaultBoilerplate: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        `,
  },
  "Python": {
    compilerId: "python",
    apiId: 70,
    defaultBoilerplate: `class Solution(object):
    def twoSum(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: List[int]
        """
        `,
  },
  "JavaScript": {
    compilerId: "javascript",
    apiId: 93,
    defaultBoilerplate: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};`,
  },
  "TypeScript": {
    compilerId: "typescript",
    apiId: 94,
    hasInfo: true,
    defaultBoilerplate: `function twoSum(nums: number[], target: number): number[] {
    
};`,
  },
  "C#": {
    compilerId: "csharp",
    apiId: 51,
    defaultBoilerplate: `public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        
    }
}`,
  },
  "C": {
    compilerId: "c",
    apiId: 50,
    defaultBoilerplate: `/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    
}`,
  },

  // Column 2
  "Go": {
    compilerId: "go",
    apiId: 60,
    defaultBoilerplate: `func twoSum(nums []int, target int) []int {
    
}`,
  },
  "Kotlin": {
    compilerId: "kotlin",
    apiId: 78,
    defaultBoilerplate: `class Solution {
    fun twoSum(nums: IntArray, target: Int): IntArray {
        
    }
}`,
  },
  "Swift": {
    compilerId: "swift",
    apiId: 83,
    defaultBoilerplate: `class Solution {
    func twoSum(_ nums: [Int], _ target: Int) -> [Int] {
        
    }
}`,
  },
  "Rust": {
    compilerId: "rust",
    apiId: 73,
    defaultBoilerplate: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        
    }
}`,
  },
  "Ruby": {
    compilerId: "ruby",
    apiId: 72,
    defaultBoilerplate: `# @param {Integer[]} nums
# @param {Integer} target
# @return {Integer[]}
def two_sum(nums, target)
    
end`,
  },
  "PHP": {
    compilerId: "php",
    apiId: 68,
    defaultBoilerplate: `class Solution {

    /**
     * @param Integer[] $nums
     * @param Integer $target
     * @return Integer[]
     */
    function twoSum($nums, $target) {
        
    }
}`,
  },
  "Dart": {
    compilerId: "dart",
    apiId: 90,
    defaultBoilerplate: `class Solution {
  List<int> twoSum(List<int> nums, int target) {
    
  }
}`,
  },
  "Scala": {
    compilerId: "scala",
    apiId: 81,
    defaultBoilerplate: `object Solution {
    def twoSum(nums: Array[Int], target: Int): Array[Int] = {
        
    }
}`,
  },

  // Column 3
  "Elixir": {
    compilerId: "elixir",
    apiId: 57,
    defaultBoilerplate: `defmodule Solution do
  @spec two_sum(nums :: [integer], target :: integer) :: [integer]
  def two_sum(nums, target) do
    
  end
end`,
  },
  "Erlang": {
    compilerId: "erlang",
    apiId: 58,
    defaultBoilerplate: `-spec two_sum(Nums :: [integer()], Target :: integer()) -> [integer()].
two_sum(Nums, Target) ->
  .`,
  },
  "Racket": {
    compilerId: "scheme",
    apiId: 89,
    defaultBoilerplate: `(define/contract (two-sum nums target)
  (-> (listof exact-integer?) exact-integer? (listof exact-integer?))
  )`,
  },
};

type LanguageName = keyof typeof codingLanguages;

const column1Languages: LanguageName[] = ["C++", "Java", "Python3", "Python", "JavaScript", "TypeScript", "C#", "C"];
const column2Languages: LanguageName[] = ["Go", "Kotlin", "Swift", "Rust", "Ruby", "PHP", "Dart", "Scala"];
const column3Languages: LanguageName[] = ["Elixir", "Erlang", "Racket"];

// Helper to resolve starter boilerplate from problemInfo code_templates or fallback to language defaults
function getBoilerplateForLang(lang: string, pInfo?: any): string {
  const langConfig = codingLanguages[lang as LanguageName] || codingLanguages["Python"] || codingLanguages["C++"];
  
  if (pInfo?.code_templates && typeof pInfo.code_templates === "object") {
    const templates = pInfo.code_templates;
    const lower = lang.toLowerCase();
    
    if (lower === "python3" && templates.python3) return templates.python3;
    if (lower === "python" && (templates.python || templates.python3)) return templates.python || templates.python3;
    if ((lower === "c++" || lower === "cpp") && templates.cpp) return templates.cpp;
    if (lower === "java" && templates.java) return templates.java;
    if (lower === "javascript" && templates.javascript) return templates.javascript;
    if (lower === "typescript" && templates.typescript) return templates.typescript;
    if (lower === "c" && templates.c) return templates.c;
    if ((lower === "c#" || lower === "csharp") && templates.csharp) return templates.csharp;
    if ((lower === "go" || lower === "golang") && templates.golang) return templates.golang;
    if (lower === "rust" && templates.rust) return templates.rust;
    if (lower === "swift" && templates.swift) return templates.swift;
    if (lower === "kotlin" && templates.kotlin) return templates.kotlin;
    if (lower === "dart" && templates.dart) return templates.dart;
    if (lower === "php" && templates.php) return templates.php;
    if (lower === "ruby" && templates.ruby) return templates.ruby;
    if (lower === "scala" && templates.scala) return templates.scala;
    if (lower === "racket" && templates.racket) return templates.racket;
    if (lower === "erlang" && templates.erlang) return templates.erlang;
    if (lower === "elixir" && templates.elixir) return templates.elixir;
  }
  
  return langConfig?.defaultBoilerplate || "";
}

// Helper to check if specific language has synthesized template
function hasCustomStarterCodeForLang(lang: string, pInfo?: any): boolean {
  if (!pInfo) return false;
  const templates = pInfo.code_templates || pInfo.starterCode;
  if (!templates || typeof templates !== "object") return false;
  const lower = lang.toLowerCase();
  
  if (lower === "python3" && (templates.python3 || templates.python)) return true;
  if (lower === "python" && (templates.python || templates.python3)) return true;
  if ((lower === "c++" || lower === "cpp") && (templates.cpp || templates["c++"])) return true;
  if (lower === "java" && templates.java) return true;
  if (lower === "javascript" && templates.javascript) return true;
  if (lower === "typescript" && templates.typescript) return true;
  if (lower === "c" && templates.c) return true;
  if ((lower === "c#" || lower === "csharp") && (templates.csharp || templates["c#"])) return true;
  if ((lower === "go" || lower === "golang") && (templates.golang || templates.go)) return true;
  if (lower === "rust" && templates.rust) return true;
  if (lower === "swift" && templates.swift) return true;
  if (lower === "kotlin" && templates.kotlin) return true;
  if (lower === "dart" && templates.dart) return true;
  if (lower === "php" && templates.php) return true;
  if (lower === "ruby" && templates.ruby) return true;
  if (lower === "scala" && templates.scala) return true;
  if (lower === "racket" && templates.racket) return true;
  if (lower === "erlang" && templates.erlang) return true;
  if (lower === "elixir" && templates.elixir) return true;
  
  return false;
}



export default function ProblemPageCodeEditor({
  theme,
  selectedLanguage,
  setSelectedLanguage,
  setSelectedLanguageCode,
  sourceCode,
  setSourceCode,
  problemId = "default_problem",
  problemInfo,
  isNoteOpen = false,
  activeEditorTab = 'code',
  setActiveEditorTab,
  onCloseNote,
}: ProblemPageCodeEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  // Agent Diff Highlights State (Like Antigravity / Cursor / Copilot)
  const [activeDiffMeta, setActiveDiffMeta] = useState<{
    additions: number;
    deletions: number;
    oldCode: string;
  } | null>(null);

  // Language Selection & AI Template Generator State
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);
  const [pendingGenLang, setPendingGenLang] = useState<LanguageName | null>(null);
  const [isGeneratingStarterCode, setIsGeneratingStarterCode] = useState<boolean>(false);

  // Agent Active Editing & Oceanic Shimmer State
  const [isAgentEditing, setIsAgentEditing] = useState<boolean>(false);
  const [agentActionVerb, setAgentActionVerb] = useState<string>("Synthesizing Code...");

  // Listen to Agent status and code apply events to render oceanic shimmer & green added lines
  useEffect(() => {
    const handleAgentStatus = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      if (detail.isAgentMode && detail.isGenerating) {
        setIsAgentEditing(true);
        setAgentActionVerb(detail.verb ? `${detail.verb} Code...` : "Agent Synthesizing Code...");
      } else if (!detail.isGenerating && !activeDiffMeta) {
        setIsAgentEditing(false);
      }
    };

    const handleDiffApplied = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      if (detail.isReviewModeAccept) {
        // User already accepted in chat - do NOT pop up the secondary Keep/Revert prompt!
        setActiveDiffMeta(null);
      } else {
        setActiveDiffMeta({
          additions: detail.additions || 0,
          deletions: detail.deletions || 0,
          oldCode: typeof detail.oldCode === "string" ? detail.oldCode : (sourceCode || ""),
        });
      }

      // Trigger oceanic shimmer for 3.5s on direct apply
      setIsAgentEditing(true);
      setAgentActionVerb(detail.isReviewModeAccept ? "⚡ Code Applied" : "⚡ Agent Applied Changes");
      setTimeout(() => {
        setIsAgentEditing(false);
      }, 3500);

      if (editorRef.current && monacoRef.current && Array.isArray(detail.addedLineIndices) && detail.addedLineIndices.length > 0) {
        const monaco = monacoRef.current;
        const newDecorations = detail.addedLineIndices.map((lineNum: number) => ({
          range: new monaco.Range(lineNum, 1, lineNum, 1),
          options: {
            isWholeLine: true,
            className: 'monaco-diff-line-added',
            linesDecorationsClassName: 'monaco-diff-gutter-added',
          },
        }));
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
      }
    };

    window.addEventListener("easycode-agent-status-change" as any, handleAgentStatus);
    window.addEventListener("easycode-agent-diff-applied" as any, handleDiffApplied);
    return () => {
      window.removeEventListener("easycode-agent-status-change" as any, handleAgentStatus);
      window.removeEventListener("easycode-agent-diff-applied" as any, handleDiffApplied);
    };
  }, [sourceCode, activeDiffMeta]);

  const handleDismissDiff = () => {
    if (editorRef.current) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
    setActiveDiffMeta(null);
  };

  const handleRevertDiff = () => {
    if (activeDiffMeta && typeof activeDiffMeta.oldCode === "string") {
      setSourceCode(activeDiffMeta.oldCode);
      toast.info("Reverted to previous code");
    }
    handleDismissDiff();
  };

  // Note Tab State
  const [noteContent, setNoteContent] = useState<string>("");
  const [isNotePreview, setIsNotePreview] = useState<boolean>(false);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved note
  useEffect(() => {
    if (!problemId) return;
    try {
      const saved = localStorage.getItem(`easycode_note_${problemId}`);
      if (saved !== null) {
        setNoteContent(saved);
      }
    } catch (e) {}
  }, [problemId]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteContent(val);
    try {
      localStorage.setItem(`easycode_note_${problemId}`, val);
    } catch (e) {}
  };

  const insertNoteFormat = (prefix: string, suffix: string = "") => {
    const textarea = noteTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = noteContent.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const next = noteContent.substring(0, start) + replacement + noteContent.substring(end);
    setNoteContent(next);
    try {
      localStorage.setItem(`easycode_note_${problemId}`, next);
    } catch (e) {}
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 0);
  };

  useEffect(() => {
    const langConfig = codingLanguages[selectedLanguage as LanguageName] || codingLanguages["Java"] || codingLanguages["C++"];
    setSelectedLanguageCode(langConfig.apiId);
    
    // Automatically populate boilerplate from problemInfo code_templates or language defaults
    if (!sourceCode && problemId !== "new" && problemId !== "generate" && !problemId.startsWith("c0000000")) {
      const starter = getBoilerplateForLang(selectedLanguage, problemInfo);
      setSourceCode(starter);
    }
  }, [selectedLanguage, problemInfo]);

  const handleLanguageChange = (lang: LanguageName) => {
    setSelectedLanguage(lang);
    const langConfig = codingLanguages[lang];
    setSelectedLanguageCode(langConfig.apiId);
    if (problemId !== "new" && problemId !== "generate" && !problemId.startsWith("c0000000")) {
      const starter = getBoilerplateForLang(lang, problemInfo);
      setSourceCode(starter);
    }
  };

  const isAiProblem = problemInfo && (problemInfo._id?.toString().startsWith("gen-") || problemInfo.starterCode);

  const handleLanguageItemClick = (lang: LanguageName) => {
    setIsLangMenuOpen(false); // Menu closes immediately upon selection

    const isAvailable = !isAiProblem || hasCustomStarterCodeForLang(lang, problemInfo);

    if (isAvailable) {
      handleLanguageChange(lang);
    } else {
      // Prompt user with modal to generate starter code for this language
      setPendingGenLang(lang);
    }
  };

  const handleGenerateLanguageCode = async (targetLang: LanguageName) => {
    // 1. Immediately close modal so user can see live synthesis in Monaco
    setPendingGenLang(null);
    setIsGeneratingStarterCode(true);

    const langConfig = codingLanguages[targetLang];
    const previousCode = sourceCode;

    // 2. Immediately switch language and show live synthesis comment
    setSelectedLanguage(targetLang);
    if (langConfig?.apiId) {
      setSelectedLanguageCode(langConfig.apiId);
    }
    setSourceCode(`// EasyCode AI: Synthesizing ${targetLang} solution stub...\n// Initializing typed signatures, imports & class structure...`);

    // 3. Dispatch agent status event for live oceanic wave feedback on editor
    window.dispatchEvent(
      new CustomEvent("easycode-agent-status-change", {
        detail: { isAgentMode: true, isGenerating: true, verb: `Synthesizing ${targetLang}` },
      })
    );

    try {
      let apiKeys: Record<string, string> = {};
      try {
        const saved = localStorage.getItem("easycode_custom_keys");
        if (saved) apiKeys = JSON.parse(saved);
      } catch (e) {}

      const prompt = `You are an expert LeetCode problem template generator.
Generate the standard LeetCode starter code template for the problem "${problemInfo?.title || "Problem"}" in ${targetLang}.
Problem Description:
${problemInfo?.description || ""}

Existing Starter Code (Python reference):
${problemInfo?.starterCode?.python || problemInfo?.code_templates?.python || previousCode || ""}

Constraints & Types:
${Array.isArray(problemInfo?.constraints) ? problemInfo.constraints.join("\n") : ""}

Return ONLY the clean starter code class/function definition enclosed in a single \`\`\`${codingLanguages[targetLang]?.compilerId || "text"} ... \`\`\` markdown code block. Include proper type annotations and standard imports. Do NOT provide the solution implementation or extra explanation.`;

      const res = await fetch("/api/code/chat-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputMessage: prompt,
          targetModel: localStorage.getItem("easycode_last_active_model") || "gemini-3.6-flash",
          stream: false,
          customKeys: apiKeys,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate language starter code");
      }

      const data = await res.json();
      const rawOutput = data.output || "";
      const codeMatch = rawOutput.match(/```(?:[a-zA-Z0-9_+#-]+)?\s*([\s\S]*?)```/i);
      const generatedCode = codeMatch ? codeMatch[1].trim() : rawOutput.trim();

      if (generatedCode) {
        if (!problemInfo.code_templates) problemInfo.code_templates = {};
        if (!problemInfo.starterCode) problemInfo.starterCode = {};
        
        const lower = targetLang.toLowerCase();
        const codeKey = lower.includes("python3") ? "python3" : lower.includes("python") ? "python" : lower.includes("c++") ? "cpp" : lower.includes("java") && !lower.includes("script") ? "java" : lower.includes("typescript") ? "typescript" : lower.includes("javascript") ? "javascript" : targetLang;
        
        problemInfo.code_templates[codeKey] = generatedCode;
        problemInfo.starterCode[codeKey] = generatedCode;

        setSourceCode(generatedCode);

        // Dispatch applied event for green diff highlight and oceanic pulse
        window.dispatchEvent(
          new CustomEvent("easycode-agent-diff-applied", {
            detail: {
              isReviewModeAccept: true,
              additions: generatedCode.split("\n").length,
              deletions: 0,
            },
          })
        );

        toast.success(`Generated ${targetLang} starter template!`);
      } else {
        setSourceCode(previousCode);
        toast.error("Could not parse generated code template");
      }
    } catch (err: any) {
      console.error("Error generating starter code:", err);
      setSourceCode(previousCode);
      toast.error(err?.message || "Error generating starter code");
    } finally {
      window.dispatchEvent(
        new CustomEvent("easycode-agent-status-change", {
          detail: { isAgentMode: false, isGenerating: false },
        })
      );
      setIsGeneratingStarterCode(false);
    }
  };

  const handleResetCode = () => {
    if (problemId !== "new" && problemId !== "generate" && !problemId.startsWith("c0000000")) {
      const starter = getBoilerplateForLang(selectedLanguage, problemInfo);
      setSourceCode(starter);
    } else {
      setSourceCode("");
    }
    toast.info("Editor reset to starter template");
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
      toast.success("Code formatted");
    }
  };

  const handleCopyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(sourceCode);
      toast.success("Code copied to clipboard");
    }
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define exact LeetCode syntax themes
    monaco.editor.defineTheme('leetcode-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '0000FF' },
        { token: 'type', foreground: '267F99' },
        { token: 'identifier', foreground: '000000' },
        { token: 'function', foreground: '795E26' },
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'string', foreground: 'A31515' },
        { token: 'number', foreground: '098658' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
        'editorLineNumber.foreground': '#237893',
        'editorLineNumber.activeForeground': '#0B216F',
        'editorGutter.background': '#FFFFFF',
      }
    });

    monaco.editor.defineTheme('leetcode-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569CD6' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'identifier', foreground: 'D4D4D4' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1a1a1a',
        'editor.foreground': '#D4D4D4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#C6C6C6',
        'editorGutter.background': '#1a1a1a',
      }
    });

    monaco.editor.setTheme(theme === 'dark' ? 'leetcode-dark' : 'leetcode-light');

    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPos({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });
  };

  const currentLangConfig = codingLanguages[selectedLanguage as LanguageName] || codingLanguages["Java"] || codingLanguages["C++"];

  const renderLangItem = (lang: LanguageName) => {
    const isSelected = selectedLanguage === lang;
    const isAvailable = !isAiProblem || hasCustomStarterCodeForLang(lang, problemInfo);
    const hasInfo = (codingLanguages[lang] as any).hasInfo;

    return (
      <div
        key={lang}
        onClick={() => handleLanguageItemClick(lang)}
        className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13.5px] cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
          isSelected
            ? 'font-semibold text-neutral-900 dark:text-white'
            : isAvailable
            ? 'text-neutral-700 dark:text-neutral-300'
            : 'text-neutral-400 dark:text-neutral-500'
        }`}
      >
        <div className="flex items-center gap-2">
          {isSelected ? (
            <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
          ) : (
            <div className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className={!isAvailable ? "text-neutral-400 dark:text-neutral-500" : ""}>{lang}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {!isAvailable && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 border border-neutral-200/60 dark:border-neutral-700/60">
              <Sparkles className="w-2.5 h-2.5 text-amber-500/80" />
              AI
            </span>
          )}
          {hasInfo && (
            <Info className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#1a1a1a] overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', fontSize: '14px', color: 'rgb(38, 38, 38)' }}>
      {/* Tab bar - LeetCode style: Code tab + Optional Note tab */}
      <div
        className="w-full flex items-center justify-between px-1.5 shrink-0 group"
        style={{
          height: '36px',
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <div className="flex items-center gap-1">
          {/* Code Tab */}
          <button
            onClick={() => setActiveEditorTab?.('code')}
            className={`relative flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeEditorTab === 'code'
                ? 'text-neutral-900 dark:text-white font-medium'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            style={{
              padding: '4px 8px',
              borderRadius: '5px',
              height: '28px',
              fontSize: '14px',
              lineHeight: '21px',
              backgroundColor: 'transparent',
              border: 'none',
            }}
          >
            <Code2 style={{ width: '14px', height: '14px', opacity: activeEditorTab === 'code' ? 0.9 : 0.6 }} />
            <span>Code</span>
          </button>

          {/* Note Tab (Matching Image 3) */}
          {isNoteOpen && (
            <div
              onClick={() => setActiveEditorTab?.('note')}
              className={`relative flex items-center gap-1.5 cursor-pointer rounded px-2 py-1 transition-colors ${
                activeEditorTab === 'note'
                  ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
              }`}
              style={{ height: '28px', fontSize: '14px' }}
            >
              <FileText style={{ width: '13px', height: '13px', color: '#eab308' }} />
              <span>Note</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseNote?.();
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-rose-500 transition-colors"
                title="Close note"
              >
                <X style={{ width: '11px', height: '11px' }} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Maximize & Fold/Collapse Options on Hover */}
        <div className="flex items-center gap-1 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
          <button
            onClick={() => {
              if (!document.fullscreenElement) { document.documentElement.requestFullscreen?.(); setIsFullScreen(true); }
              else { document.exitFullscreen?.(); setIsFullScreen(false); }
            }}
            className="p-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title="Maximize tabset"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title="Collapse tabset"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {activeEditorTab === 'note' ? (
        /* Note Editor View - 100% Matching Reference Image 3 */
        <div className="flex-1 w-full flex flex-col bg-white dark:bg-[#1a1a1a] overflow-hidden select-none">
          {/* Note Formatting Toolbar */}
          <div
            className="w-full flex items-center gap-1.5 px-3 py-1 border-b border-black/[0.06] dark:border-white/[0.06] bg-transparent text-neutral-600 dark:text-neutral-400 text-xs shrink-0"
            style={{ height: '36px' }}
          >
            {/* H (Heading) */}
            <button
              onClick={() => insertNoteFormat("### ")}
              className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold cursor-pointer text-xs transition-colors"
              title="Heading"
            >
              H
            </button>

            {/* B (Bold) */}
            <button
              onClick={() => insertNoteFormat("**", "**")}
              className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold cursor-pointer text-xs transition-colors"
              title="Bold"
            >
              B
            </button>

            {/* I (Italic) */}
            <button
              onClick={() => insertNoteFormat("*", "*")}
              className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 italic cursor-pointer text-xs transition-colors"
              title="Italic"
            >
              I
            </button>

            {/* S (Strikethrough) */}
            <button
              onClick={() => insertNoteFormat("~~", "~~")}
              className="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 line-through cursor-pointer text-xs transition-colors"
              title="Strikethrough"
            >
              S
            </button>

            {/* Bullet List */}
            <button
              onClick={() => insertNoteFormat("- ")}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            {/* Numbered List */}
            <button
              onClick={() => insertNoteFormat("1. ")}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            {/* Quote */}
            <button
              onClick={() => insertNoteFormat("> ")}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              title="Quote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            {/* Code */}
            <button
              onClick={() => insertNoteFormat("```\n", "\n```")}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              title="Code block"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            {/* Divider */}
            <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />

            {/* Preview Toggle */}
            <button
              onClick={() => setIsNotePreview(!isNotePreview)}
              className={`p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors ${
                isNotePreview ? 'text-blue-500 font-semibold' : ''
              }`}
              title="Toggle Markdown Preview"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Note Area */}
          <div className="flex-1 w-full p-4 overflow-y-auto select-text">
            {!isNotePreview ? (
              <textarea
                ref={noteTextareaRef}
                value={noteContent}
                onChange={handleNoteChange}
                placeholder="Type here... (Markdown is supported)"
                className="w-full h-full resize-none bg-transparent outline-none font-mono text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
            ) : (
              <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-neutral-700 dark:text-neutral-300">
                {noteContent || (
                  <span className="text-neutral-400 italic">No notes written yet. Type your solution thoughts above.</span>
                )}
              </div>
            )}
          </div>

          {/* Note Footer */}
          <div
            className="w-full flex items-center justify-between select-none shrink-0"
            style={{
              height: '32px',
              padding: '4px 12px',
              color: 'rgb(115, 115, 115)',
              fontSize: '12px',
              borderTop: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <span>Saved</span>
            <span>{noteContent.length} characters</span>
          </div>
        </div>
      ) : (
        /* Standard Monaco Code Editor & Toolbar */
        <>
          {/* Toolbar row: Language selector + Auto | right-side icons - 36px height */}
          <div
            className="w-full flex items-center justify-between shrink-0 select-none"
            style={{
              height: '36px',
              padding: '0 4px',
              backgroundColor: 'transparent',
            }}
          >
            {/* Left: Language selector + Auto */}
            <div className="flex items-center gap-1.5">
              {/* 3-Column Language Selector Dropdown */}
              <DropdownMenu open={isLangMenuOpen} onOpenChange={setIsLangMenuOpen}>
                <DropdownMenuTrigger
                  className="flex items-center gap-1 cursor-pointer outline-none"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: 'rgb(38, 38, 38)',
                    background: 'transparent',
                    border: 'none',
                  }}
                >
                  <span>{selectedLanguage}</span>
                  <ChevronDown style={{ width: '12px', height: '12px', opacity: 0.5 }} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="p-3 bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 min-w-[340px] sm:min-w-[480px]">
                    <div className="space-y-0.5 border-r border-neutral-100 dark:border-neutral-800 pr-2">
                      {column1Languages.map(renderLangItem)}
                    </div>
                    <div className="space-y-0.5 border-r border-neutral-100 dark:border-neutral-800 pr-2">
                      {column2Languages.map(renderLangItem)}
                    </div>
                    <div className="space-y-0.5">
                      {column3Languages.map(renderLangItem)}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Auto Lock Badge */}
              <div className="flex items-center gap-1" style={{ fontSize: '14px', color: 'rgba(0,0,0,0.55)' }}>
                <Lock style={{ width: '12px', height: '12px' }} />
                <span>Auto</span>
              </div>
            </div>

            {/* Right: Actions - exact LeetCode toolbar: padding 0 4px, gap 4px */}
            <div className="flex items-center" style={{ padding: '0 4px', gap: '4px' }}>
              {[
                { icon: Braces, label: 'Format', action: handleFormatCode },
                { icon: Bookmark, label: 'Bookmark', action: () => toast.info("Bookmark added") },
                { icon: Copy, label: 'Copy', action: handleCopyToClipboard },
                { icon: RotateCcw, label: 'Reset', action: handleResetCode },
                { icon: isFullScreen ? Minimize2 : Maximize2, label: isFullScreen ? 'Exit Fullscreen' : 'Fullscreen', action: () => {
                  if (!document.fullscreenElement) { document.documentElement.requestFullscreen?.(); setIsFullScreen(true); }
                  else { document.exitFullscreen?.(); setIsFullScreen(false); }
                }},
              ].map((item, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={item.action}
                      className="cursor-pointer"
                      style={{
                        padding: '4px',
                        borderRadius: '5px',
                        color: 'rgba(0,0,0,0.4)',
                        background: 'transparent',
                        border: 'none',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <item.icon style={{ width: '14px', height: '14px' }} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Floating Agent Diff Status Bar (Like Antigravity / Cursor / Copilot) */}
          {activeDiffMeta && (
            <div className="bg-[#1C1B19] dark:bg-[#252321] text-white px-3 py-1.5 flex items-center justify-between text-xs border-b border-white/[0.08] shadow-sm animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Agent Changes Applied:
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">+{activeDiffMeta.additions}</span>
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">-{activeDiffMeta.deletions}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDismissDiff}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 text-white"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Keep Changes</span>
                </button>
                <button
                  onClick={handleRevertDiff}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 text-neutral-300 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Revert</span>
                </button>
              </div>
            </div>
          )}

          {/* Monaco Code Editor Container with Oceanic Wave Shimmer on Agent Edit */}
          <div
            className={`flex-1 w-full relative min-h-0 transition-all ${
              isAgentEditing
                ? "border-l-[3.5px] border-emerald-500 shadow-[inset_0_0_25px_rgba(16,185,129,0.1)]"
                : ""
            }`}
          >
            {/* Oceanic Wave Shimmer Overlay (Bottom-Left to Top-Right fluid wave) */}
            <AnimatePresence>
              {isAgentEditing && (
                <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0.35, 0.75, 0.45, 0.85, 0.35],
                      backgroundPosition: ["0% 100%", "100% 0%"],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      background:
                        "linear-gradient(135deg, transparent 0%, rgba(16, 185, 129, 0.08) 25%, rgba(6, 182, 212, 0.16) 50%, rgba(16, 185, 129, 0.08) 75%, transparent 100%)",
                      backgroundSize: "250% 250%",
                    }}
                    className="absolute inset-0"
                  />

                  {/* Floating Agent Status Badge in Monaco Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute top-2 right-4 z-40 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/90 dark:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono shadow-xl backdrop-blur-xs select-none"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="font-semibold">{agentActionVerb}</span>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <Editor
              height="100%"
              language={currentLangConfig.compilerId}
              value={sourceCode}
              onChange={(value) => setSourceCode(value ?? "")}
              theme={theme === 'dark' ? 'leetcode-dark' : 'leetcode-light'}
              onMount={handleEditorMount}
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 18,
                fontFamily: 'Consolas, "Courier New", monospace',
                tabSize: 4,
                scrollBeyondLastLine: false,
                folding: true,
                glyphMargin: false,
                fixedOverflowWidgets: true,
                padding: { top: 6, bottom: 6 },
              }}
            />
          </div>

          {/* Editor Status Footer Bar */}
          <div
            className="w-full flex items-center justify-between select-none shrink-0"
            style={{
              height: '32px',
              padding: '4px 12px',
              color: 'rgb(115, 115, 115)',
              fontSize: '12px',
              borderTop: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <span>Saved</span>
            <span>
              Ln {cursorPos.line}, Col {cursorPos.column}
            </span>
          </div>
        </>
      )}

      {/* AI Language Starter Code Synthesis Modal (Adaptive Obsidian/Cream Theme) */}
      <AnimatePresence>
        {pendingGenLang && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="w-full max-w-md rounded-2xl bg-[#FAF8F5] dark:bg-[#1C1B19] border border-[#DFDAD0] dark:border-[#383532] text-[#1C1B19] dark:text-[#EDEDEB] shadow-2xl p-5 space-y-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Generate {pendingGenLang} Code?</h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">AI Starter Code Synthesis</p>
                  </div>
                </div>
                <button
                  disabled={isGeneratingStarterCode}
                  onClick={() => !isGeneratingStarterCode && setPendingGenLang(null)}
                  className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                <p>
                  This problem was generated with starter code in <strong className="text-neutral-900 dark:text-white font-semibold">{selectedLanguage}</strong>.
                </p>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Would you like EasyCode AI to synthesize the tailored <strong className="text-amber-600 dark:text-amber-300 font-semibold">{pendingGenLang}</strong> class signature, parameter typing, and imports?
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  disabled={isGeneratingStarterCode}
                  onClick={() => setPendingGenLang(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isGeneratingStarterCode}
                  onClick={() => handleGenerateLanguageCode(pendingGenLang)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingStarterCode ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing {pendingGenLang}...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate {pendingGenLang} Code</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global CSS for Agent Diff Highlights in Monaco Editor */}
      <style jsx global>{`
        .monaco-diff-line-added {
          background-color: rgba(16, 185, 129, 0.18) !important;
        }
        .monaco-diff-gutter-added {
          background-color: #10b981 !important;
          width: 4px !important;
          margin-left: 2px !important;
        }
      `}</style>
    </div>
  );
}
