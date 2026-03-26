'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clearAnswers } from '@/lib/psych/storage';

export function FinotypeLogoWithConfirm({ locale }: { locale: string }) {
  const [showReturnHomeConfirm, setShowReturnHomeConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const tStart = useTranslations('start');

  const isTechnicalRoute = pathname?.includes('/technical') ?? false;
  const isPsychRoute = pathname?.includes('/psych') ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoClick = () => {
    if (isTechnicalRoute) {
      router.push(`/${locale}`);
      return;
    }
    setShowReturnHomeConfirm(true);
  };

  const popup = showReturnHomeConfirm && mounted ? (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.4)', zIndex: 2000 }}
      onClick={() => setShowReturnHomeConfirm(false)}
    >
      <div
        className="rounded-3xl p-8 max-w-md w-full"
        style={{
          background: 'var(--color-surface)',
          boxShadow: '0 20px 60px rgba(15,23,42,0.2)',
          border: '2px solid var(--color-neutral-200)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(14,165,233,0.1)' }}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-accent)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-text)' }}>
          {tStart('returnHomeTitle')}
        </h3>
        <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {tStart('returnHomeMessage')}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              setShowReturnHomeConfirm(false);
              clearAnswers();
              router.push(`/${locale}`);
            }}
            className="w-full py-3 px-4 text-white rounded-xl font-bold transition-all duration-300 cursor-pointer"
            style={{
              background: 'var(--gradient-primary)',
              boxShadow: '0 4px 16px rgba(30,64,175,0.3)',
            }}
          >
            {tStart('continueButton')}
          </button>
          <button
            onClick={() => setShowReturnHomeConfirm(false)}
            className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 cursor-pointer"
            style={{
              border: '2px solid var(--color-neutral-300)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {tStart('cancelButton')}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-2 text-xl font-bold transition-all cursor-pointer"
        style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
      >
        {isPsychRoute ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
        Finotype
      </button>

      {mounted && showReturnHomeConfirm && createPortal(popup, document.body)}
    </>
  );
}

export function FinotypeLogo({ locale }: { locale: string }) {
  return (
    <Link
      href={`/${locale}`}
      className="flex items-center gap-2 text-xl font-bold transition-all"
      style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)' }}>
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" fill="currentColor" />
      </svg>
      Finotype
    </Link>
  );
}
