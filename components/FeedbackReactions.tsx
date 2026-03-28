'use client';

import { FeedbackValue } from '@/types';

interface FeedbackReactionsProps {
  feedback: FeedbackValue;
  submitting: boolean;
  question: string;
  thumbsDownLabel: string;
  thumbsUpLabel: string;
  heartLabel: string;
  skipLabel: string;
  thanksText: string;
  onSubmit: (feedback: Exclude<FeedbackValue, null>) => void;
}

export function FeedbackReactions({
  feedback,
  submitting,
  question,
  thumbsDownLabel,
  thumbsUpLabel,
  heartLabel,
  skipLabel,
  thanksText,
  onSubmit,
}: FeedbackReactionsProps) {
  if (feedback !== null) {
    return (
      <div className="alert-success text-center" data-html2canvas-ignore>
        {thanksText}
      </div>
    );
  }

  const options = [
    {
      key: 'up' as const,
      label: thumbsUpLabel,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 10V4a1 1 0 0 0-1.8-.6L10 6.6a2 2 0 0 1-1.6.9H6a2 2 0 0 0-2 2v1.4a3 3 0 0 0 .2 1l1.4 3.5A2 2 0 0 0 7.4 17H12a2 2 0 0 0 2-2v-5z" />
          <path d="M18 17h2a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-2z" />
        </svg>
      ),
    },
    {
      key: 'down' as const,
      label: thumbsDownLabel,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 14V20a1 1 0 0 0 1.8.6l2.2-3.2a2 2 0 0 1 1.6-.9H18a2 2 0 0 0 2-2v-1.4a3 3 0 0 0-.2-1l-1.4-3.5A2 2 0 0 0 16.6 7H12a2 2 0 0 0-2 2v5z" />
          <path d="M6 7H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2z" />
        </svg>
      ),
    },
    {
      key: 'heart' as const,
      label: heartLabel,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="card-professional p-5 text-center" data-html2canvas-ignore>
      <p className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
        {question}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {options.map(option => {
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onSubmit(option.key)}
              disabled={submitting}
              aria-label={option.label}
              title={option.label}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition"
              style={{
                borderColor: 'var(--color-neutral-300)',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'transparent',
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {option.icon}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onSubmit('skip')}
          disabled={submitting}
          className="px-4 py-2 rounded-xl font-semibold border"
          style={{
            borderColor: 'var(--color-neutral-300)',
            color: 'var(--color-text)',
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {skipLabel}
        </button>
      </div>
    </div>
  );
}
