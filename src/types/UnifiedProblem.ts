export interface ProblemCompanyTag {
  name: string;
  frequency: number;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemTestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemOfficialSolution {
  language: "python" | "java" | "cpp" | "golang" | "rust" | "javascript" | "typescript" | string;
  source_code: string;
  explanation?: string;
  time_complexity?: string;
  space_complexity?: string;
}

export interface ProblemStats {
  likes: number;
  dislikes: number;
  like_ratio: number;
  acceptance_rate: number;
  is_paid_only: boolean;
}

export interface SimilarProblemRef {
  frontend_id?: number;
  title: string;
  slug: string;
  difficulty: string;
}

export interface UnifiedProblem {
  id: string;
  frontend_id: number;
  title: string;
  slug: string;
  level: "Easy" | "Medium" | "Hard";
  elo_rating: number | null;
  category: string;
  topics: string[];
  patterns: string[];
  companies: ProblemCompanyTag[];
  description_html: string;
  description_markdown: string;
  constraints: string[];
  examples: ProblemExample[];
  hints: string[];
  code_templates: Record<string, string>;
  official_solutions: ProblemOfficialSolution[];
  test_cases: {
    visible: ProblemTestCase[];
    hidden: ProblemTestCase[];
    evaluation_suite?: string;
  };
  stats: ProblemStats;
  similar_questions: SimilarProblemRef[];
  created_at: string;
  updated_at: string;
}

export interface CompactProblem {
  id: string;
  frontend_id: number;
  title: string;
  slug: string;
  level: "Easy" | "Medium" | "Hard";
  elo_rating: number | null;
  category: string;
  topics: string[];
  patterns: string[];
  companies: ProblemCompanyTag[];
  stats: ProblemStats;
  has_code_templates: boolean;
  has_solutions: boolean;
  visible_test_cases_count: number;
  hidden_test_cases_count: number;
}
