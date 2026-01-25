'use client';

import { usePathname, useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { clearAnswers } from '@/lib/storage';
import LanguageSwitcher from './LanguageSwitcher';

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
  
  // Check if we're in a /pro or /standard route
  const isProRoute = pathname?.includes('/pro') || false;
  const isStandardRoute = pathname?.includes('/standard') || false;

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
    // Pro navbar
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/${locale}`} className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Finotype Pro
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <Link
                    href={`/${locale}/pro/account`}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {t('account')}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {t('signOut')}
                  </button>
                </>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (isStandardRoute) {
    // Standard navbar
    return (
      <>
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button 
                  onClick={() => setShowReturnHomeConfirm(true)}
                  className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Finotype Standard
                </button>
              </div>
              <div className="flex items-center">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </nav>

        {/* Return Home Confirmation Popup */}
        {showReturnHomeConfirm && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReturnHomeConfirm(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-yellow-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-yellow-500 text-4xl mb-4 text-center">⚠️</div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{tStart('returnHomeTitle')}</h3>
              <p className="text-center text-gray-500 mb-6">{tStart('returnHomeMessage')}</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowReturnHomeConfirm(false);
                    clearAnswers();
                    router.push(`/${locale}`);
                  }} 
                  className="w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold transition"
                >
                  {tStart('continueButton')}
                </button>
                <button 
                  onClick={() => setShowReturnHomeConfirm(false)} 
                  className="w-full py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-medium transition"
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

  // Default navbar
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Finotype
            </Link>
          </div>
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
