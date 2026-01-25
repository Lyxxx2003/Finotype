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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-sans bg-gray-50 text-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {t('welcome')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('prompt')}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleStart}>
          <div>
            <input
              type="text"
              required
              maxLength={50}
              className="relative block w-full rounded-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('startButton')}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500">
          {t('nameNote')}
        </p>
      </div>
    </div>
  );
}
