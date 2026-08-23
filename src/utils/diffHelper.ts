export interface DiffLine {
  type: "add" | "delete" | "unchanged";
  line: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffResult {
  additions: number;
  deletions: number;
  lines: DiffLine[];
  hasChanges: boolean;
  addedLineIndices: number[]; // 1-indexed for Monaco
}

export function computeLineDiff(originalCode: string, modifiedCode: string): DiffResult {
  const oldLines = originalCode.replace(/\r\n/g, "\n").split("\n");
  const newLines = modifiedCode.replace(/\r\n/g, "\n").split("\n");

  const lines: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  const addedLineIndices: number[] = [];

  // Simple and robust LCS diff
  const n = oldLines.length;
  const m = newLines.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const reversedDiff: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      reversedDiff.push({
        type: "unchanged",
        line: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      reversedDiff.push({
        type: "add",
        line: newLines[j - 1],
        newLineNumber: j,
      });
      additions++;
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      reversedDiff.push({
        type: "delete",
        line: oldLines[i - 1],
        oldLineNumber: i,
      });
      deletions++;
      i--;
    }
  }

  const resultLines = reversedDiff.reverse();

  resultLines.forEach((l) => {
    if (l.type === "add" && l.newLineNumber) {
      addedLineIndices.push(l.newLineNumber);
    }
  });

  return {
    additions,
    deletions,
    lines: resultLines,
    hasChanges: additions > 0 || deletions > 0,
    addedLineIndices,
  };
}
