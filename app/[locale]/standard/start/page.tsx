'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { saveDisplayName } from '@/lib/storage';
import { useTranslations } from 'next-intl';

export default function StartPage() {
  const [name, setName] = useState('');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('start');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveDisplayName(name.trim());
      router.push(`/${locale}/standard/question/1`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-sans bg-gradient-professional">
      <div className="w-full max-w-md space-y-8 rounded-3xl backdrop-blur-xl border p-10" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'var(--color-neutral-200)', boxShadow: '0 20px 40px rgba(42,38,34,0.12)' }}>
        <div>
          <div className="mx-auto w-16 h-16 bg-gradient-professional-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-primary">
            {t('welcome')}
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {t('prompt')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleStart}>
          <div>
            <input
              type="text"
              required
              maxLength={50}
              className="relative block w-full rounded-xl border-2 py-3 px-4 outline-none transition-all duration-300"
              style={{
                borderColor: 'var(--color-neutral-300)',
                color: 'var(--color-text)'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-professional-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('startButton')}
            </button>
          </div>
        </form>

        <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {t('nameNote')}
        </p>
      </div>
    </div>
  );
}
