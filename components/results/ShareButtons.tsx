'use client';

import Link from 'next/link';

interface ShareButtonsProps {
  locale: string;
  onShare: () => void;
  t: any;
}

export function ShareButtons({ locale, onShare, t }: ShareButtonsProps) {
  return (
    <div data-html2canvas-ignore className="flex flex-col sm:flex-row justify-center gap-4">
      <button 
        onClick={onShare}
        className="btn-morandi-primary flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        {t('shareResult')}
      </button>
      <Link href={`/${locale}/pro/game`} className="btn-morandi-accent text-center">
        {t('playAgain')}
      </Link>
      <Link href={`/${locale}`} className="btn-morandi-outline text-center">
        {t('returnHome')}
      </Link>
    </div>
  );
}
