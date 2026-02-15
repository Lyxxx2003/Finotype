'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import RadarChart from '@/components/RadarChart';

type SkillKey =
  | 'paycheckLiteracy'
  | 'housingBills'
  | 'spendingControl'
  | 'creditDebt'
  | 'safetyNet'
  | 'fraudSafety';

type Scores = Record<SkillKey, number>;

type Choice = {
  id: string; // "A" | "B" | "C" | "D"
  text: string;
  impact: Partial<Record<SkillKey, number>>;
};

type Question = {
  id: string;
  title: string;
  context?: string;
  prompt: string;
  choices: Choice[];
  tags: SkillKey[];
  correctChoiceId: string; // immediate correctness reveal
  explanation: string; // concise technical explanation
};

const SKILLS: { key: SkillKey; label: string; description: string }[] = [
  { key: 'paycheckLiteracy', label: 'Paycheck Literacy', description: 'Understanding paychecks, deductions, and net income' },
  { key: 'housingBills', label: 'Housing & Bills', description: 'Managing rent, utilities, and household expenses' },
  { key: 'spendingControl', label: 'Spending Control (Necessities)', description: 'Budgeting for essential expenses' },
  { key: 'creditDebt', label: 'Credit & Debt', description: 'Credit management and debt repayment strategies' },
  { key: 'safetyNet', label: 'Safety Net (Emergency Readiness)', description: 'Emergency fund and financial preparedness' },
  { key: 'fraudSafety', label: 'Fraud & Safety', description: 'Protecting against scams and financial fraud' },
];

// Technical, knowledge-focused questions (concise) with immediate reveal
const QUESTION_BANK: Question[] = [
  {
    id: 'q1_net_vs_gross',
    title: 'Q1: Net vs Gross Pay',
    prompt: 'Gross pay is $3,000 and net pay is $2,250. Which item is NOT a payroll deduction from gross pay?',
    tags: ['paycheckLiteracy'],
    correctChoiceId: 'C',
    explanation: 'Employer 401(k) match does not reduce your paycheck; taxes and employee benefits do.',
    choices: [
      { id: 'A', text: 'Federal income tax withholding', impact: { paycheckLiteracy: 6 } },
      { id: 'B', text: 'Social Security tax (FICA)', impact: { paycheckLiteracy: 6 } },
      { id: 'C', text: 'Employer 401(k) matching contribution', impact: { paycheckLiteracy: 20 } },
      { id: 'D', text: 'Employee health insurance premium', impact: { paycheckLiteracy: 6 } },
    ],
  },
  {
    id: 'q2_withholding',
    title: 'Q2: Withholding Basics',
    prompt: 'If your federal withholding goes down, which statement is most accurate?',
    tags: ['paycheckLiteracy'],
    correctChoiceId: 'B',
    explanation: 'Lower withholding typically means higher take-home pay per paycheck, but you may owe more at tax time.',
    choices: [
      { id: 'A', text: 'Your take-home pay will decrease each paycheck', impact: { paycheckLiteracy: 2 } },
      { id: 'B', text: 'Your take-home pay will increase each paycheck', impact: { paycheckLiteracy: 20 } },
      { id: 'C', text: 'Your Social Security tax rate changes', impact: { paycheckLiteracy: 0 } },
      { id: 'D', text: 'Your employer pays your federal taxes', impact: { paycheckLiteracy: 0 } },
    ],
  },
  {
    id: 'q3_overdraft',
    title: 'Q3: Overdraft Fee Effect',
    prompt: 'Your balance is $10. A $30 charge posts and the bank charges a $35 overdraft fee. What is your new balance (ignoring pending holds)?',
    tags: ['housingBills'],
    correctChoiceId: 'D',
    explanation: 'Balance changes by -$30 and -$35: $10 - 30 - 35 = -$55.',
    choices: [
      { id: 'A', text: '-$20', impact: { housingBills: 6 } },
      { id: 'B', text: '-$25', impact: { housingBills: 6 } },
      { id: 'C', text: '-$45', impact: { housingBills: 8 } },
      { id: 'D', text: '-$55', impact: { housingBills: 20 } },
    ],
  },
  {
    id: 'q4_fixed_variable',
    title: 'Q4: Fixed vs Variable Expense',
    prompt: 'Which is most likely a FIXED monthly expense?',
    tags: ['spendingControl'],
    correctChoiceId: 'A',
    explanation: 'Rent is typically fixed by lease; groceries and dining vary with usage.',
    choices: [
      { id: 'A', text: 'Rent', impact: { spendingControl: 20 } },
      { id: 'B', text: 'Groceries', impact: { spendingControl: 8 } },
      { id: 'C', text: 'Dining out', impact: { spendingControl: 4 } },
      { id: 'D', text: 'Ride-sharing', impact: { spendingControl: 4 } },
    ],
  },
  {
    id: 'q5_insurance_deductible',
    title: 'Q5: Insurance Deductible',
    prompt: 'In health insurance, what is a deductible?',
    tags: ['safetyNet'],
    correctChoiceId: 'B',
    explanation: 'The deductible is what you pay before the plan begins sharing costs (subject to plan rules).',
    choices: [
      { id: 'A', text: 'The monthly amount you pay for coverage', impact: { safetyNet: 6 } },
      { id: 'B', text: 'The amount you pay before insurance starts sharing costs', impact: { safetyNet: 20 } },
      { id: 'C', text: 'A fixed amount you pay for each visit', impact: { safetyNet: 8 } },
      { id: 'D', text: 'A discount if you use out-of-network doctors', impact: { safetyNet: 0 } },
    ],
  },
  {
    id: 'q6_credit_utilization',
    title: 'Q6: Credit Utilization',
    prompt: 'Your credit limit is $2,000 and your statement balance is $600. What is your utilization?',
    tags: ['creditDebt'],
    correctChoiceId: 'C',
    explanation: 'Utilization = balance / limit = 600 / 2000 = 0.30 = 30%.',
    choices: [
      { id: 'A', text: '15%', impact: { creditDebt: 6 } },
      { id: 'B', text: '20%', impact: { creditDebt: 6 } },
      { id: 'C', text: '30%', impact: { creditDebt: 20 } },
      { id: 'D', text: '40%', impact: { creditDebt: 6 } },
    ],
  },
  {
    id: 'q7_min_payment',
    title: 'Q7: Minimum Payment Math',
    prompt: 'A card balance is $900 and the minimum payment is 2%. What is the minimum payment?',
    tags: ['creditDebt'],
    correctChoiceId: 'B',
    explanation: '2% of 900 is 900 × 0.02 = $18.',
    choices: [
      { id: 'A', text: '$9', impact: { creditDebt: 6 } },
      { id: 'B', text: '$18', impact: { creditDebt: 20 } },
      { id: 'C', text: '$20', impact: { creditDebt: 10 } },
      { id: 'D', text: '$27', impact: { creditDebt: 6 } },
    ],
  },
  {
    id: 'q8_emergency_fund',
    title: 'Q8: Emergency Fund Guideline',
    prompt: 'A common guideline for emergency savings is:',
    tags: ['safetyNet'],
    correctChoiceId: 'C',
    explanation: 'Many guidelines recommend 3–6 months of essential expenses for emergencies.',
    choices: [
      { id: 'A', text: '1 week of expenses', impact: { safetyNet: 6 } },
      { id: 'B', text: '1 month of expenses', impact: { safetyNet: 10 } },
      { id: 'C', text: '3–6 months of expenses', impact: { safetyNet: 20 } },
      { id: 'D', text: '1 year of expenses', impact: { safetyNet: 10 } },
    ],
  },
  {
    id: 'q9_phishing',
    title: 'Q9: Phishing Detection',
    prompt: 'Which is LEAST likely to indicate a phishing attempt?',
    tags: ['fraudSafety'],
    correctChoiceId: 'C',
    explanation: 'A link you requested (through a trusted flow) is less suspicious than unsolicited urgency, attachments, or fake domains.',
    choices: [
      { id: 'A', text: 'Urgent request with consequences', impact: { fraudSafety: 6 } },
      { id: 'B', text: 'Misspelled or mismatched domain name', impact: { fraudSafety: 6 } },
      { id: 'C', text: 'A login link you requested through an official process', impact: { fraudSafety: 20 } },
      { id: 'D', text: 'Unsolicited attachment', impact: { fraudSafety: 6 } },
    ],
  },
  {
    id: 'q10_renters_insurance',
    title: 'Q10: Renters Insurance Coverage',
    prompt: 'Renters insurance most directly helps cover:',
    tags: ['safetyNet', 'fraudSafety'],
    correctChoiceId: 'A',
    explanation: 'Renters insurance commonly covers personal property losses (e.g., theft) and personal liability.',
    choices: [
      { id: 'A', text: 'Personal property and liability', impact: { safetyNet: 18, fraudSafety: 4 } },
      { id: 'B', text: 'Mortgage payments if you lose your job', impact: { safetyNet: 0 } },
      { id: 'C', text: 'Your credit card interest charges', impact: { safetyNet: 0 } },
      { id: 'D', text: 'Your student loan balance', impact: { safetyNet: 0 } },
    ],
  },
];

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function computeScoresFromAnswers(answers: Record<string, string>): Scores {
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

  for (const q of QUESTION_BANK) {
    // max possible for each skill in this question
    for (const skill of q.tags) {
      const best = Math.max(...q.choices.map(c => c.impact[skill] ?? 0));
      maxPoints[skill] += best;
    }

    const chosenId = answers[q.id];
    if (!chosenId) continue;

    const choice = q.choices.find(c => c.id === chosenId);
    if (!choice) continue;

    for (const [skill, pts] of Object.entries(choice.impact) as [SkillKey, number][]) {
      base[skill] += pts;
    }
  }

  const normalized: Scores = { ...base } as Scores;
  (Object.keys(normalized) as SkillKey[]).forEach((skill) => {
    const denom = maxPoints[skill] || 1;
    normalized[skill] = clamp(Math.round((base[skill] / denom) * 100));
  });

  return normalized;
}

function benchmarkLabel(score: number) {
  if (score >= 80) return { label: "Rock Solid", tone: "var(--color-primary)" };
  if (score >= 60) return { label: "Strong", tone: "var(--color-accent)" };
  if (score >= 40) return { label: "Getting There", tone: "var(--color-text)" };
  return { label: "Needs a Boost", tone: "var(--color-text-muted)" };
}

export default function TechnicalQuestionPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [user, setUser] = useState<any>(null);

  // Answers + immediate reveal
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(0);

  const totalQuestions = QUESTION_BANK.length;
  const isResultsStep = step >= totalQuestions;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }
      setUser(user);
    };
    checkUser();
  }, [locale, router, supabase]);

  const scores = useMemo(() => computeScoresFromAnswers(answers), [answers]);

  const currentQuestion = QUESTION_BANK[Math.min(step, totalQuestions - 1)];
  const chosen = currentQuestion ? answers[currentQuestion.id] : undefined;

  const isRevealed = currentQuestion ? !!revealed[currentQuestion.id] : false;
  const isCorrect = currentQuestion ? chosen === currentQuestion.correctChoiceId : false;

  const progressPct = Math.round((Math.min(step, totalQuestions) / totalQuestions) * 100);

  const canGoNext = isResultsStep || (currentQuestion ? !!revealed[currentQuestion.id] : false);

  const goNext = () => {
    if (!canGoNext) return;
    setStep((s) => Math.min(totalQuestions, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const restart = () => {
    setAnswers({});
    setRevealed({});
    setStep(0);
  };

  const setAnswer = (questionId: string, choiceId: string) => {
    // select + reveal immediately
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
    setRevealed(prev => ({ ...prev, [questionId]: true }));
  };

  return (
    <div className="min-h-screen p-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            Financial Literacy Assessment
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Technical quiz: select an answer to instantly see the correct solution.
          </p>
        </div>

        {/* Progress */}
        <div
          className="mb-8 p-4 rounded-xl shadow-lg"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderWidth: '1px',
            borderColor: 'var(--color-neutral-200)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {isResultsStep ? "Results" : `Question ${step + 1} of ${totalQuestions}`}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {progressPct}%
            </div>
          </div>
          <div className="w-full h-2 rounded-lg" style={{ backgroundColor: 'var(--color-neutral-200)' }}>
            <div
              className="h-2 rounded-lg"
              style={{
                width: `${progressPct}%`,
                backgroundColor: 'var(--color-primary)'
              }}
            />
          </div>
        </div>

        {/* Main */}
        {!isResultsStep ? (
          <div
            className="p-6 rounded-xl shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderWidth: '1px',
              borderColor: 'var(--color-neutral-200)'
            }}
          >
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              {currentQuestion.title}
            </h2>

            {currentQuestion.context && (
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                {currentQuestion.context}
              </p>
            )}

            <p className="font-medium mb-5" style={{ color: 'var(--color-text)' }}>
              {currentQuestion.prompt}
            </p>

            <div className="grid gap-3">
              {currentQuestion.choices.map((c) => {
                const selected = chosen === c.id;
                const correct = c.id === currentQuestion.correctChoiceId;

                // After reveal:
                // - highlight correct choice
                // - highlight selected wrong choice
                let borderColor = 'var(--color-neutral-300)';
                let bgColor = 'transparent';
                let textColor = 'var(--color-text)';

                if (!isRevealed) {
                  if (selected) {
                    borderColor = 'var(--color-primary)';
                    bgColor = 'var(--color-background)';
                  }
                } else {
                  // After reveal
                  if (correct) {
                    borderColor = '#22c55e';      // green-500
                    bgColor = '#dcfce7';          // green-100
                    textColor = '#166534';        // green-800
                  } else if (selected && !correct) {
                    borderColor = '#ef4444';      // red-500
                    bgColor = '#fee2e2';          // red-100
                    textColor = '#7f1d1d';        // red-800
                  }
                }


                return (
                  <button
                    key={c.id}
                    onClick={() => setAnswer(currentQuestion.id, c.id)}
                    disabled={isRevealed}
                    className="text-left p-4 rounded-lg border transition"
                    style={{
                      backgroundColor: bgColor,
                      borderColor: borderColor,
                      color: textColor,
                      cursor: isRevealed ? 'default' : 'pointer'
                    }}
                  >

                    <div className="flex items-start gap-3">
                      <div
                        className="w-7 h-7 flex items-center justify-center rounded-full font-bold"
                        style={{
                          backgroundColor: !isRevealed
                            ? (selected ? 'var(--color-primary)' : 'var(--color-neutral-200)')
                            : correct
                              ? '#22c55e'
                              : selected && !correct
                                ? '#ef4444'
                                : 'var(--color-neutral-200)',
                          color: !isRevealed
                            ? (selected ? 'white' : 'var(--color-text)')
                            : (correct || (selected && !correct) ? 'white' : 'var(--color-text)'),
                          flexShrink: 0,
                        }}
                      >
                        {c.id}
                      </div>

                      <div className="flex-1">
                        <div className="font-medium">{c.text}</div>
                        {isRevealed && correct && (
                          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            Correct answer
                          </div>
                        )}
                        {isRevealed && selected && !correct && (
                          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            Your choice
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Immediate Reveal Panel */}
            {isRevealed && (
              <div
                className="mt-6 p-4 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: isCorrect ? 'var(--color-primary)' : 'var(--color-neutral-300)'
                }}
              >
                <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  {isCorrect ? "✅ Correct" : "❌ Not quite"}
                </div>
                <div className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Correct answer: <span className="font-semibold">{currentQuestion.correctChoiceId}</span>
                </div>
                <div className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {currentQuestion.explanation}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={goBack}
                disabled={step === 0}
                className="px-4 py-2 rounded-lg font-semibold border"
                style={{
                  borderColor: 'var(--color-neutral-300)',
                  color: 'var(--color-text)',
                  opacity: step === 0 ? 0.5 : 1,
                }}
              >
                Back
              </button>

              <button
                onClick={goNext}
                disabled={!canGoNext}
                className="px-5 py-2 rounded-lg font-semibold"
                style={{
                  backgroundColor: canGoNext ? 'var(--color-primary)' : 'var(--color-neutral-200)',
                  color: canGoNext ? 'white' : 'var(--color-text-muted)',
                }}
              >
                Next
              </button>
            </div>

            {!isRevealed && (
              <div className="mt-3 text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
                Select an answer to reveal the correct solution.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results card */}
            <div
              className="p-8 rounded-xl shadow-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderWidth: '1px',
                borderColor: 'var(--color-neutral-200)'
              }}
            >
              <h2 className="text-2xl font-semibold mb-2 text-center" style={{ color: 'var(--color-text)' }}>
                Your Results
              </h2>
              <p className="text-center mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Radar scores summarize performance by topic area.
              </p>

              <RadarChart scores={scores} />

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                    {Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6)}
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Average Score
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                    {Math.max(...Object.values(scores))}
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Highest Score
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={restart}
                  className="px-5 py-2 rounded-lg font-semibold border"
                  style={{
                    borderColor: 'var(--color-neutral-300)',
                    color: 'var(--color-text)',
                  }}
                >
                  Retake
                </button>
                <button
                  onClick={() => router.push(`/${locale}`)}
                  className="px-5 py-2 rounded-lg font-semibold"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                  }}
                >
                  Back to Home
                </button>
              </div>
            </div>

            {/* Skill breakdown */}
            <div
              className="p-6 rounded-xl shadow-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderWidth: '1px',
                borderColor: 'var(--color-neutral-200)'
              }}
            >
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                Strengths & Growth Areas
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {SKILLS.map((s) => {
                  const b = benchmarkLabel(scores[s.key]);
                  return (
                    <div key={s.key} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
                            {s.label}
                          </div>
                          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            {s.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                            {scores[s.key]}
                          </div>
                          <div className="text-xs font-semibold" style={{ color: b.tone }}>
                            {b.label}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 w-full h-2 rounded-lg" style={{ backgroundColor: 'var(--color-neutral-200)' }}>
                        <div
                          className="h-2 rounded-lg"
                          style={{
                            width: `${scores[s.key]}%`,
                            backgroundColor: 'var(--color-primary)'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Tip: Focus on your lowest 1–2 areas and retry with the explanations in mind.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
