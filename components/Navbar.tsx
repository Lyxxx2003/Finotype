'use client';

import { usePathname, useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { clearAnswers } from '@/lib/psych/storage';
import LanguageSwitcher from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations('common');
  const tStart = useTranslations('start');
  const [user, setUser] = useState<any>(null);
  const [showReturnHomeConfirm, setShowReturnHomeConfirm] = useState(false);
  const supabase = createClient();

  // Check if we're in a /technical or /psych route
  const isProRoute = pathname?.includes('/technical') || false;
  const isStandardRoute = pathname?.includes('/psych') || false;

  useEffect(() => {
    if (isProRoute) {
      checkUser();
    }
  }, [isProRoute]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  if (isProRoute) {
    // Pro navbar with Professional aesthetics
    return (
      <nav className="backdrop-blur-lg border-b sticky top-0 z-50" style={{ background: 'rgba(248,250,252,0.95)', borderColor: 'var(--color-neutral-200)', boxShadow: '0 1px 3px rgba(15,23,42,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/${locale}`} className="flex items-center gap-2 text-xl font-bold transition-all" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Finotype
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <Link
                    href={`/${locale}/technical/account`}
                    className="text-sm font-semibold transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                  >
                    {t('account')}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-semibold transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-dark)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                  >
                    {t('signOut')}
                  </button>
                </>
              )}
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (isStandardRoute) {
    // Standard navbar with Professional aesthetics
    return (
      <>
        <nav className="backdrop-blur-lg border-b sticky top-0 z-50" style={{ background: 'rgba(248,250,252,0.95)', borderColor: 'var(--color-neutral-200)', boxShadow: '0 1px 3px rgba(15,23,42,0.08)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setShowReturnHomeConfirm(true)}
                  className="flex items-center gap-2 text-xl font-bold transition-all cursor-pointer"
                  style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Finotype
                </button>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </nav>

        {/* Return Home Confirmation Popup - professional styled */}
        {showReturnHomeConfirm && (
          <div
            className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.4)' }}
            onClick={() => setShowReturnHomeConfirm(false)}
          >
            <div
              className="rounded-3xl p-8 max-w-md w-full"
              style={{
                background: 'var(--color-surface)',
                boxShadow: '0 20px 60px rgba(15,23,42,0.2)',
                border: '2px solid var(--color-neutral-200)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(14,165,233,0.1)' }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-text)' }}>{tStart('returnHomeTitle')}</h3>
              <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>{tStart('returnHomeMessage')}</p>

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
                    boxShadow: '0 4px 16px rgba(30,64,175,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(30,64,175,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,64,175,0.3)';
                  }}
                >
                  {tStart('continueButton')}
                </button>
                <button
                  onClick={() => setShowReturnHomeConfirm(false)}
                  className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 cursor-pointer"
                  style={{
                    border: '2px solid var(--color-neutral-300)',
                    color: 'var(--color-text-secondary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-neutral-100)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {tStart('cancelButton')}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default navbar with Professional aesthetics
  return (
    <nav className="backdrop-blur-lg border-b sticky top-0 z-50" style={{ background: 'rgba(248,250,252,0.95)', borderColor: 'var(--color-neutral-200)', boxShadow: '0 1px 3px rgba(15,23,42,0.08)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center gap-2 text-xl font-bold transition-all" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)' }}>
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" fill="currentColor" />
              </svg>
              Finotype
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
