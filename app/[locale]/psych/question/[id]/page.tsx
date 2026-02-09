'use client';

import { questions } from '@/lib/psych/data';
import { saveAnswer, getAnswers } from '@/lib/psych/storage';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | string[] | null>(null);
  const t = useTranslations('questions');
  const tResults = useTranslations('results');
  const tCommon = useTranslations('common');

  // Parse ID safely
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const questionId = parseInt(idParam || '1', 10);
  const locale = params.locale as string;

  const question = questions.find(q => q.id === questionId);
  const isMultiSelect = Boolean(question?.multiSelect);
  const isScale = question?.options.every(opt => /^[1-7]$/.test(opt.value));
  const isSingleChoice = !isMultiSelect && !isScale;
  const selectedValues = Array.isArray(selectedOption)
    ? selectedOption
    : selectedOption
      ? [selectedOption]
      : [];

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
    if (isMultiSelect) {
      const current = Array.isArray(selectedOption) ? selectedOption : [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      setSelectedOption(next);
      saveAnswer(questionId, next);
      return;
    }

    setSelectedOption(value);
    saveAnswer(questionId, value);

    // Small delay for better UX
    setTimeout(() => {
      if (questionId < questions.length) {
        router.push(`/${locale}/psych/question/${questionId + 1}`);
      } else {
        router.push(`/${locale}/psych/results`);
      }
    }, 300);
  };

  const handleContinue = () => {
    if (questionId < questions.length) {
      router.push(`/${locale}/psych/question/${questionId + 1}`);
    } else {
      router.push(`/${locale}/psych/results`);
    }
  };

  const currentStep = questionId;
  const totalSteps = questions.length;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex flex-col items-center min-h-screen p-6" style={{ background: 'var(--gradient-surface)' }}>
      <div className="w-full max-w-xl mt-10">
        {/* Progress Bar */}
        <div className="w-full rounded-full h-2.5 mb-8" style={{ backgroundColor: 'var(--color-neutral-200)' }}>
          <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="card-professional p-8">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>{tResults('questionOf', { current: currentStep, total: totalSteps })}</span>
          <h2 className="text-2xl font-bold mt-4 mb-6" style={{ color: 'var(--color-text)' }}>
            {t(`${questionId}.text`)}
          </h2>

          {/* Question Type Label */}
          {isSingleChoice && (
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {tCommon('singleChoice')}
            </p>
          )}
          {isMultiSelect && (
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {tCommon('selectAll')}
            </p>
          )}
          {isScale && (
            <div className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="flex justify-between">
                <span>1 = {tCommon('stronglyDisagree')}</span>
                <span>7 = {tCommon('stronglyAgree')}</span>
              </div>
            </div>
          )}

          {/* Scale Display */}
          {isScale ? (
            <div className="flex justify-center items-center gap-6 py-8">
              {question.options.map((option) => {
                const scaleValue = parseInt(option.value);
                // Symmetric sizing: 1 and 7 are biggest, 4 is smallest
                const distanceFromCenter = Math.abs(scaleValue - 4);
                const size = 40 + distanceFromCenter * 10.67; // 48px at center, 80px at extremes
                const isSelected = selectedValues.includes(option.value);
                
                return (
                  <div key={option.value} className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => handleOptionSelect(option.value)}
                      className="rounded-full transition-all duration-200 flex items-center justify-center font-semibold hover:scale-110"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-neutral-200)',
                        color: isSelected ? 'white' : 'var(--color-text-secondary)',
                        border: isSelected ? '3px solid var(--color-primary-dark)' : '2px solid transparent',
                        fontSize: `${14 + distanceFromCenter * 2}px`
                      }}
                    >
                      {scaleValue}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${selectedValues.includes(option.value)
                    ? 'text-white bg-gradient-professional-blue'
                    : 'hover:scale-[1.02]'
                  }`}
                style={{
                  borderColor: selectedValues.includes(option.value) ? 'var(--color-primary)' : 'var(--color-neutral-200)',
                  color: selectedValues.includes(option.value) ? 'white' : 'var(--color-text)'
                }}
              >
                {t(`${questionId}.options.${option.value}`)}
              </button>
            ))}
            </div>
          )}

          {isMultiSelect && (
            <button
              onClick={handleContinue}
              disabled={selectedValues.length === 0}
              className="btn-professional-primary mt-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tCommon('continue')}
            </button>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          {questionId > 1 && (
            <button
              onClick={() => router.push(`/${locale}/psych/question/${questionId - 1}`)}
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
