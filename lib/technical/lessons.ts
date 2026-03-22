import { Module, LessonProgress, SaveLessonProgressInput } from '@/types';

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
