'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

interface ResultsButtonsProps {
  locale: string;
  onShare: () => void;
  onDownload: () => void;
  t: any;
  secondaryButtonText: string;
  secondaryButtonHref: string;
}

export function ResultsButtons({ locale, onShare, onDownload, t, secondaryButtonText, secondaryButtonHref }: ResultsButtonsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  const handleShareClick = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleShareOption = async (type: 'share' | 'download') => {
    setShowShareMenu(false);
    if (type === 'share') {
      onShare();
    } else {
      onDownload();
    }
  };

  return (
    <div data-html2canvas-ignore className="flex flex-col sm:flex-row justify-center gap-4">
      <div className="relative" ref={menuRef}>
        <button
          onClick={handleShareClick}
          className="btn-professional-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          {t('shareResult')}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showShareMenu ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {showShareMenu && (
          <div className="absolute bottom-full mb-2 left-0 w-full sm:w-auto sm:min-w-[240px] card-professional overflow-hidden">
            <button
              onClick={() => handleShareOption('share')}
              className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors"
              style={{ color: 'var(--color-text)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-neutral-100)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>{t('shareViaSystem')}</span>
            </button>
            <button
              onClick={() => handleShareOption('download')}
              className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors border-t"
              style={{ color: 'var(--color-text)', borderColor: 'var(--color-neutral-200)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-neutral-100)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>{t('downloadImage')}</span>
            </button>
          </div>
        )}
      </div>
      <Link href={secondaryButtonHref} className="btn-professional-accent text-center">
        {secondaryButtonText}
      </Link>
      <Link href={`/${locale}`} className="btn-professional-outline text-center">
        {t('returnHome')}
      </Link>
    </div>
  );
}
