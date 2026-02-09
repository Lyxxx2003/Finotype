import { FinancialType, AnswerValue } from '@/types';

type Trait = 'A' | 'G' | 'F' | 'P' | 'D' | 'I' | 'E' | 'N';

const HIGH_THRESHOLD = 5;
const LOW_THRESHOLD = 3;

const toArray = (answer?: AnswerValue): string[] => {
  if (!answer) return [];
  return Array.isArray(answer) ? answer : [answer];
};

const toScale = (answer?: AnswerValue): number | null => {
  if (!answer || Array.isArray(answer)) return null;
  const value = parseInt(answer, 10);
  return Number.isNaN(value) ? null : value;
};

const isHigh = (value: number | null) => value !== null && value >= HIGH_THRESHOLD;
const isLow = (value: number | null) => value !== null && value <= LOW_THRESHOLD;

export interface TraitPercentages {
  A: number;
  G: number;
  F: number;
  P: number;
  D: number;
  I: number;
  E: number;
  N: number;
}

export interface FinotypeResult {
  type: FinancialType;
  percentages: TraitPercentages;
}

export function calculateFinotype(answers: Record<number, AnswerValue>): FinotypeResult {
  const scores: Record<Trait, number> = {
    A: 0,
    G: 0,
    F: 0,
    P: 0,
    D: 0,
    I: 0,
    E: 0,
    N: 0,
  };

  const inc = (trait: Trait) => {
    scores[trait] += 1;
  };

  const q1 = toArray(answers[1]);
  if (q1.includes('B') || q1.includes('C')) inc('D');
  if (q1.includes('A')) inc('I');
  if (q1.includes('D')) inc('E');
  if (q1.includes('A') || q1.includes('B')) inc('N');

  const q2 = toArray(answers[2]);
  if (q2.includes('A')) inc('A');
  if (q2.includes('B')) inc('G');

  const q3 = toArray(answers[3]);
  if (q3.includes('A') || q3.includes('D')) inc('E');
  if (q3.includes('B') || q3.includes('C')) inc('N');

  const q4 = toArray(answers[4]);
  if (q4.includes('A')) inc('F');
  if (q4.includes('B') || q4.includes('C')) inc('P');

  const q5 = toArray(answers[5]);
  if (q5.includes('B')) inc('A');
  if (q5.includes('A')) inc('G');
  if (q5.includes('B')) inc('E');
  if (q5.includes('A')) inc('N');

  const q6Scale = toScale(answers[6]);
  if (isLow(q6Scale)) inc('F');
  if (isHigh(q6Scale)) inc('P');

  const q7Scale = toScale(answers[7]);
  if (isHigh(q7Scale)) inc('A');
  if (isLow(q7Scale)) inc('G');

  const q8Scale = toScale(answers[8]);
  if (isHigh(q8Scale)) inc('D');
  if (isLow(q8Scale)) inc('I');

  const q9 = toArray(answers[9]);
  if (q9.length >= 2) inc('E');
  if (q9.length <= 1 && q9.length > 0) inc('N');

  const q10 = toArray(answers[10]);
  if (q10.includes('A') || q10.includes('D')) inc('D');
  if (q10.includes('C')) inc('I');

  const q13 = toArray(answers[13]);
  if (q13.includes('Yes')) inc('D');
  if (q13.includes('No')) inc('I');

  const q14 = toArray(answers[14]);
  if (q14.includes('No')) inc('F');
  if (q14.includes('Yes')) inc('P');

  const q15 = toArray(answers[15]);
  if (q15.includes('No')) inc('A');
  if (q15.includes('Yes')) inc('G');

  const pick = (positive: Trait, negative: Trait, tie: Trait) =>
    scores[positive] === scores[negative] ? tie : scores[positive] > scores[negative] ? positive : negative;

  const ag = pick('A', 'G', 'A');
  const fp = pick('F', 'P', 'F');
  const di = pick('D', 'I', 'D');
  const en = pick('E', 'N', 'E');

  // Calculate percentages for each dimension (rescaled)
  const calculatePercentage = (trait1: Trait, trait2: Trait): [number, number] => {
    const total = scores[trait1] + scores[trait2];
    if (total === 0) return [50, 50]; // Default to 50/50 if no data
    const percent1 = Math.round((scores[trait1] / total) * 100);
    const percent2 = 100 - percent1;
    return [percent1, percent2];
  };

  const [aPercent, gPercent] = calculatePercentage('A', 'G');
  const [fPercent, pPercent] = calculatePercentage('F', 'P');
  const [dPercent, iPercent] = calculatePercentage('D', 'I');
  const [ePercent, nPercent] = calculatePercentage('E', 'N');

  const percentages: TraitPercentages = {
    A: aPercent,
    G: gPercent,
    F: fPercent,
    P: pPercent,
    D: dPercent,
    I: iPercent,
    E: ePercent,
    N: nPercent,
  };

  return {
    type: `${ag}${fp}${di}${en}` as FinancialType,
    percentages,
  };
}
