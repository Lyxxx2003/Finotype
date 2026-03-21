import { Module, Scores } from './data';

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

export async function getLessonProgress(locale: string): Promise<LessonProgress | null> {
  const response = await fetch(`/${locale}/api/lessons`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch lesson progress');
  }

  const data = await response.json();
  return (data.progress ?? null) as LessonProgress | null;
}

export async function saveLessonProgress(
  locale: string,
  input: SaveLessonProgressInput
): Promise<LessonProgress> {
  const response = await fetch(`/${locale}/api/lessons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to save lesson progress');
  }

  const data = await response.json();
  return data.progress as LessonProgress;
}

export function isModuleComplete(module: Module, answers: Record<string, string>): boolean {
  const allQuestions = module.lessonBlocks.flatMap((block) => block.questions);
  return allQuestions.every((question) => Boolean(answers[question.id]));
}

export function getCompletedModules(modules: Module[], answers: Record<string, string>): string[] {
  return modules.filter((module) => isModuleComplete(module, answers)).map((module) => module.id);
}

export function areAllModulesComplete(modules: Module[], answers: Record<string, string>): boolean {
  return modules.every((module) => isModuleComplete(module, answers));
}

export function getFirstUnfinishedModuleId(modules: Module[], answers: Record<string, string>): string | null {
  const nextModule = modules.find((module) => !isModuleComplete(module, answers));
  return nextModule?.id ?? null;
}
