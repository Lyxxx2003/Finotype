import { locales } from "@/i18n";

export type FinancialType = `${'A' | 'G'}${'F' | 'P'}${'D' | 'I'}${'E' | 'N'}`;

export type AnswerValue = string | string[];

export type FeedbackValue = 'down' | 'up' | 'heart' | 'skip' | null;

export type LessonProgress = {
  id: string;
  user_id: string;
  answers: Record<string, string>;
  scores: Scores;
  modules_completed: string[];
  is_finished: boolean;
  total_score: number;
  highest_total_score: number;
  learning_curve: number[];
  latest_finished_scores: Scores | null;
  latest_finished_total_score: number | null;
  latest_finished_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveLessonProgressInput = {
  answers: Record<string, string>;
  scores: Scores;
  modulesCompleted: string[];
  isFinished: boolean;
};

export type ResourceSubmoduleDefinition = {
  id: string;
  url: string;
};

export type ResourceModuleDefinition = {
  id: string;
  imageUrl: string;
  submodules: ResourceSubmoduleDefinition[];
};

export type LocalizedResourceSubmodule = {
  id: string;
  title: string;
  summary: string;
};

export type LocalizedResourceModule = {
  id: string;
  title: string;
  description: string;
  submodules: LocalizedResourceSubmodule[];
};

export type ResourceSubmodule = LocalizedResourceSubmodule & {
  url: string;
};

export type ResourceModule = Omit<LocalizedResourceModule, 'submodules'> & {
  imageUrl: string;
  submodules: ResourceSubmodule[];
};

export type SkillKey =
  | 'paycheckLiteracy'
  | 'housingBills'
  | 'spendingControl'
  | 'creditDebt'
  | 'safetyNet'
  | 'fraudSafety';

export type Scores = Record<SkillKey, number>;

export type Choice = {
  id: string;
  text: string;
  impact: Partial<Record<SkillKey, number>>;
};

export type Question = {
  id: string;
  title: string;
  context?: string;
  prompt: string;
  choices: Choice[];
  correctChoiceId: string;
  explanation: string;
};

export type LessonBlock = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  questions: Question[];
};

export type Module = {
  id: string;
  title: string;
  shortDescription: string;
  lessonBlocks: LessonBlock[];
  takeaway: string[];
};

export type GlossaryPopoverState = {
  term: string;
  left: number;
  top: number;
  placement: 'top' | 'bottom';
};

export type Locale = typeof locales[number];
