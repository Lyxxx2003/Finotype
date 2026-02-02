'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

interface ResultsButtonsProps {
  locale: string;
  onShare: () => void;
  onDownload: () => void;
  onShareLink: () => void;
  onShareX: () => void;
  onShareFacebook: () => void;
  t: any;
  secondaryButtonText: string;
  secondaryButtonHref: string;
}

export function ResultsButtons({ locale, onShare, onDownload, onShareLink, onShareX, onShareFacebook, t, secondaryButtonText, secondaryButtonHref }: ResultsButtonsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
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

  const handleShareOption = async (type: 'native' | 'download' | 'link' | 'x' | 'facebook') => {
    if (type === 'link') {
      onShareLink();
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      // Don't close menu immediately so user sees the "copied" message
      setTimeout(() => setShowShareMenu(false), 1500);
    } else {
      setShowShareMenu(false);
      if (type === 'native') {
        onShare();
      } else if (type === 'download') {
        onDownload();
      } else if (type === 'x') {
        onShareX();
      } else if (type === 'facebook') {
        onShareFacebook();
      }
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
          <div className="absolute bottom-full mb-2 left-0 w-full sm:w-auto sm:min-w-[240px] card-professional overflow-hidden z-10">
            <button
              onClick={() => handleShareOption('link')}
              className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors"
              style={{ color: 'var(--color-text)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-neutral-100)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <span>{linkCopied ? t('linkCopied') : t('copyLink')}</span>
            </button>
            
            <button
              onClick={() => handleShareOption('native')}
              className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors border-t"
              style={{ color: 'var(--color-text)', borderColor: 'var(--color-neutral-200)' }}
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

            <div className="border-t" style={{ borderColor: 'var(--color-neutral-200)' }}>
              <button
                onClick={() => handleShareOption('x')}
                className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors"
                style={{ color: 'var(--color-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-neutral-100)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>{t('shareToX')}</span>
              </button>

              <button
                onClick={() => handleShareOption('facebook')}
                className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors border-t"
                style={{ color: 'var(--color-text)', borderColor: 'var(--color-neutral-200)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-neutral-100)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>{t('shareToFacebook')}</span>
              </button>
            </div>
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
