"use client";
import React, { useEffect, useState, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
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

export default function ProblemPageCodeEditor({
  theme,
  selectedLanguage,
  setSelectedLanguage,
  setSelectedLanguageCode,
  sourceCode,
  setSourceCode,
}: ProblemPageCodeEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const langConfig = codingLanguages[selectedLanguage as LanguageName] || codingLanguages["Java"] || codingLanguages["C++"];
    setSelectedLanguageCode(langConfig.apiId);
    if (!sourceCode) {
      setSourceCode(langConfig.defaultBoilerplate);
    }
  }, [selectedLanguage]);

  const handleLanguageChange = (lang: LanguageName) => {
    setSelectedLanguage(lang);
    const langConfig = codingLanguages[lang];
    setSelectedLanguageCode(langConfig.apiId);
    setSourceCode(langConfig.defaultBoilerplate);
  };

  const handleResetCode = () => {
    const langConfig = codingLanguages[selectedLanguage as LanguageName] || codingLanguages["Java"] || codingLanguages["C++"];
    setSourceCode(langConfig.defaultBoilerplate);
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
    const hasInfo = (codingLanguages[lang] as any).hasInfo;
    return (
      <div
        key={lang}
        onClick={() => handleLanguageChange(lang)}
        className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13.5px] cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
          isSelected ? 'font-semibold text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {isSelected ? (
            <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
          ) : (
            <div className="w-3.5 h-3.5" />
          )}
          <span>{lang}</span>
        </div>
        {hasInfo && (
          <Info className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#1a1a1a] overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', fontSize: '14px', color: 'rgb(38, 38, 38)' }}>
      {/* Tab bar - same style as LeetCode flexlayout: 36px, rgba(0,0,0,0.02) bg */}
      <div
        className="w-full flex items-center justify-between px-1.5 shrink-0 group"
        style={{
          height: '36px',
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <button
          className="relative flex items-center gap-1.5 cursor-default"
          style={{
            padding: '4px 8px',
            borderRadius: '5px',
            height: '28px',
            fontWeight: 500,
            color: 'rgb(26, 26, 26)',
            fontSize: '14px',
            lineHeight: '21px',
            backgroundColor: 'transparent',
            border: 'none',
          }}
        >
          <Code2 style={{ width: '14px', height: '14px', opacity: 0.7 }} />
          <span>Code</span>
        </button>

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
          <DropdownMenu>
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

      {/* Monaco Code Editor */}
      <div className="flex-1 w-full relative min-h-0">
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

      {/* Editor Status Footer Bar - exact LeetCode: h-8 (32px), color rgb(115,115,115), padding 4px */}
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
    </div>
  );
}
