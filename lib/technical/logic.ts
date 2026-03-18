import { MODULES, type Module, type Scores, type SkillKey } from './data';

export function flattenQuestions(modules: Module[]) {
  return modules.flatMap(module =>
    module.lessonBlocks.flatMap(block => block.questions)
  );
}

function clampScore(n: number) {
  return Math.max(0, Math.min(100, n));
}

export function computeScoresFromAnswers(
  answers: Record<string, string>,
  modules: Module[] = MODULES
): Scores {
  const base: Scores = {
    paycheckLiteracy: 0,
    housingBills: 0,
    spendingControl: 0,
    creditDebt: 0,
    safetyNet: 0,
    fraudSafety: 0,
  };

  const maxPoints: Record<SkillKey, number> = {
    paycheckLiteracy: 0,
    housingBills: 0,
    spendingControl: 0,
    creditDebt: 0,
    safetyNet: 0,
    fraudSafety: 0,
  };

  for (const module of modules) {
    for (const block of module.lessonBlocks) {
      for (const q of block.questions) {
        const skillsTouched = new Set<SkillKey>();
        q.choices.forEach(choice => {
          Object.keys(choice.impact).forEach(key => skillsTouched.add(key as SkillKey));
        });

        skillsTouched.forEach(skill => {
          const best = Math.max(...q.choices.map(c => c.impact[skill] ?? 0));
          maxPoints[skill] += best;
        });

        const chosenId = answers[q.id];
        if (!chosenId) continue;

        const chosen = q.choices.find(c => c.id === chosenId);
        if (!chosen) continue;

        for (const [skill, pts] of Object.entries(chosen.impact) as [SkillKey, number][]) {
          base[skill] += pts;
        }
      }
    }
  }

  const normalized = { ...base };
  (Object.keys(normalized) as SkillKey[]).forEach(skill => {
    const denom = maxPoints[skill] || 1;
    normalized[skill] = clampScore(Math.round((base[skill] / denom) * 100));
  });

  return normalized;
}

export interface BenchmarkResult {
  key: 'rockSolid' | 'strong' | 'gettingThere' | 'needsBoost';
  tone: string;
}

export function benchmarkLabel(score: number): BenchmarkResult {
  if (score >= 80) return { key: 'rockSolid', tone: 'var(--color-primary)' };
  if (score >= 60) return { key: 'strong', tone: 'var(--color-accent)' };
  if (score >= 40) return { key: 'gettingThere', tone: 'var(--color-text)' };
  return { key: 'needsBoost', tone: 'var(--color-text-muted)' };
}
