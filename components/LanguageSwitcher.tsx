'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n';
import { useState, useRef, useEffect } from 'react';

export function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = params.locale as Locale;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const switchLocale = (newLocale: Locale) => {
    if (!pathname) return;

    // Replace the locale in the pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    router.push(newPath);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block z-[60]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-xl px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-300 border-2 hover:shadow-md flex items-center gap-2"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-neutral-300)',
          color: 'var(--color-text)'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
        }}
        onBlur={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = 'var(--color-neutral-300)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        <span>{localeNames[currentLocale]}</span>
        <svg 
          className="w-4 h-4 transition-transform duration-300" 
          style={{
            color: 'var(--color-primary)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full mt-1 left-0 rounded-xl shadow-lg border-2 min-w-max z-[70]"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-neutral-300)',
          }}
        >
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className="w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-200 first:rounded-t-[9px] last:rounded-b-[9px]"
              style={{
                background: locale === currentLocale ? 'var(--color-primary)' : 'transparent',
                color: locale === currentLocale ? 'white' : 'var(--color-text)',
              }}
              onMouseEnter={(e) => {
                if (locale !== currentLocale) {
                  e.currentTarget.style.background = 'var(--color-neutral-100)';
                }
              }}
              onMouseLeave={(e) => {
                if (locale !== currentLocale) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
