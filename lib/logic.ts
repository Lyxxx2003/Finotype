import { questions } from './data';
import { FinancialType } from '@/types';

export function calculateFinotype(answers: Record<number, string>): FinancialType {
  let spendingScore = 0; // Negative for F, Positive for L
  let riskScore = 0;     // Negative for C, Positive for A

  questions.forEach(q => {
    const answer = answers[q.id];
    if (!answer) return;

    // F/L questions (1-5)
    if (q.id <= 5) {
      if (answer === 'F') spendingScore--;
      if (answer === 'L') spendingScore++;
    }
    // C/A questions (6-10)
    else {
      if (answer === 'C') riskScore--;
      if (answer === 'A') riskScore++;
    }
  });

  const spending = spendingScore >= 0 ? 'L' : 'F'; // Default to L if tie? Or F? Let's say >= 0 is L (Lavish), < 0 is F (Frugal).
  // Actually, let's look at the mapping. 
  // If answers are mixed, say 3 Fs and 2 Ls -> -1 score -> F.
  // If 5 Ls -> +5 score -> L.
  // 0 score (impossible with 5 Qs unless skipped, but if they skipped, handle it).
  
  const risk = riskScore >= 0 ? 'A' : 'C';

  return `${spending}${risk}` as FinancialType;
}
