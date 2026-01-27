'use client';

import { useState } from 'react';

interface FamiliarityFormProps {
  onSubmit: (familiarity: string) => void;
  t: any;
}

export function FamiliarityForm({ onSubmit, t }: FamiliarityFormProps) {
  const [postFamiliarity, setPostFamiliarity] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!postFamiliarity) return;
    onSubmit(postFamiliarity);
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
    <div className="card-morandi p-6 mt-8" data-html2canvas-ignore>
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>{t('confidenceQuestion')}</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={postFamiliarity}
          onChange={(e) => setPostFamiliarity(e.target.value)}
          className="input-morandi flex-1"
        >
          <option value="">{t('selectLevel')}</option>
          <option value="Beginner">{t('beginnerLevel')}</option>
          <option value="Intermediate">{t('intermediateLevel')}</option>
          <option value="Advanced">{t('advancedLevel')}</option>
        </select>
        <button
          onClick={handleSubmit}
          disabled={!postFamiliarity}
          className="btn-morandi-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('submit')}
        </button>
      </div>
    </div>
  );
}
