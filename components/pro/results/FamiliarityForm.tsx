'use client';

import { useState } from 'react';

interface FamiliarityFormProps {
  onSubmit: (familiarity: string) => void;
  t: any;
}

export function FamiliarityForm({ onSubmit, t }: FamiliarityFormProps) {
  const [postFamiliarity, setPostFamiliarity] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (postFamiliarity === 0) return;
    onSubmit(postFamiliarity.toString());
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="alert-success p-6 mt-8 text-center font-medium" data-html2canvas-ignore>
        {t('thanksFeedback')}
      </div>
    );
  }

  return (
    <div className="card-professional p-6 mt-8" data-html2canvas-ignore>
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>{t('confidenceQuestion')}</h3>
      <div className="space-y-4">
        <div className="flex justify-between text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span>{t('ratingLow')}</span>
          <span>{t('ratingHigh')}</span>
        </div>
        <div className="flex gap-2 justify-between">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <button
              key={rating}
              onClick={() => setPostFamiliarity(rating)}
              className={`flex-1 aspect-square flex items-center justify-center rounded-lg font-semibold text-lg transition-all ${
                postFamiliarity === rating
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={{
                minWidth: '40px',
                maxWidth: '60px',
              }}
            >
              {rating}
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={postFamiliarity === 0}
          className="btn-professional-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {t('submit')}
        </button>
      </div>
    </div>
  );
}
