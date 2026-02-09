'use client';

import { usePathname, useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { FinotypeLogo, FinotypeLogoWithConfirm } from './FinotypeLogo';

export default function Navbar() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations('common');
  const [user, setUser] = useState<any>(null);
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
      <nav className="backdrop-blur-lg border-b sticky top-0 z-50 bg-neutral-50/95 dark:bg-neutral-900/95" style={{ borderColor: 'var(--color-neutral-200)', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', isolation: 'isolate' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FinotypeLogoWithConfirm locale={locale} />
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/${locale}/resources`}
                className="text-sm font-semibold transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                {t('resources')}
              </Link>
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
      <nav className="backdrop-blur-lg border-b sticky top-0 z-50 bg-neutral-50/95 dark:bg-neutral-900/95" style={{ borderColor: 'var(--color-neutral-200)', boxShadow: '0 1px 3px rgba(15,23,42,0.08)', isolation: 'isolate' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FinotypeLogoWithConfirm locale={locale} />
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/${locale}/resources`}
                className="text-sm font-semibold transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                {t('resources')}
              </Link>
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Default navbar with Professional aesthetics
  return (
    <nav className="backdrop-blur-lg border-b sticky top-0 z-50 bg-neutral-50/95 dark:bg-neutral-900/95" style={{ borderColor: 'var(--color-neutral-200)', boxShadow: '0 1px 3px rgba(15,23,42,0.08)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <FinotypeLogo locale={locale} />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/resources`}
              className="text-sm font-semibold transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            >
              {t('resources')}
            </Link>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}