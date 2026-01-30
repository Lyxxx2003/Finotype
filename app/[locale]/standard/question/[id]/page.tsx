'use client';

import { questions } from '@/lib/data';
import { saveAnswer, getAnswers } from '@/lib/storage';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const t = useTranslations('questions');
  const tResults = useTranslations('results');

  // Parse ID safely
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const questionId = parseInt(idParam || '1', 10);
  const locale = params.locale as string;

  const question = questions.find(q => q.id === questionId);

  // Load existing answer if any
  useEffect(() => {
    const answers = getAnswers();
    if (answers[questionId]) {
      setSelectedOption(answers[questionId]);
    } else {
      setSelectedOption(null);
    }
  }, [questionId]);

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Question not found.</p>
        <button onClick={() => router.push(`/${locale}`)} className="mt-4 text-blue-600 underline">Go Home</button>
      </div>
    );
  }

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    saveAnswer(questionId, value);

    // Small delay for better UX
    setTimeout(() => {
      if (questionId < questions.length) {
        router.push(`/${locale}/standard/question/${questionId + 1}`);
      } else {
        router.push(`/${locale}/standard/results`);
      }
    }, 300);
  };

  const currentStep = questionId;
  const totalSteps = questions.length;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gradient-professional">
      <div className="w-full max-w-xl mt-10">
        {/* Progress Bar */}
        <div className="w-full rounded-full h-2.5 mb-8" style={{ backgroundColor: 'var(--color-neutral-200)' }}>
          <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="card-professional p-8">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">{tResults('questionOf', { current: currentStep, total: totalSteps })}</span>
          <h2 className="text-2xl font-bold text-neutral-900 mt-4 mb-8">
            {t(`${questionId}.text`)}
          </h2>

          <div className="flex flex-col gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${selectedOption === option.value
                    ? 'text-white bg-gradient-professional-blue'
                    : 'hover:scale-[1.02]'
                  }`}
                style={{
                  borderColor: selectedOption === option.value ? 'var(--color-primary)' : 'var(--color-neutral-200)',
                  color: selectedOption === option.value ? 'white' : 'var(--color-text)'
                }}
              >
                {t(`${questionId}.options.${option.value}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          {questionId > 1 && (
            <button
              onClick={() => router.push(`/${locale}/standard/question/${questionId - 1}`)}
              className="font-medium cursor-pointer"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            >
              {tResults('back')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
