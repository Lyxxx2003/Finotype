'use client';

/* this is error modal happening when gemini issues */

interface ErrorModalProps {
  errorMessage: string;
  onRetry: () => void;
  onDemo: () => void;
  onQA: () => void;
  t: any;
}

export function ErrorModal({ errorMessage, onRetry, onDemo, onQA, t }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ background: 'rgba(42,38,34,0.5)' }}>
      <div className="card-professional p-8 max-w-md w-full border" style={{ borderColor: 'var(--color-terracotta)', boxShadow: '0 20px 40px rgba(196,148,139,0.2)' }}>
        <div className="text-4xl mb-4 text-center" style={{ color: 'var(--color-terracotta)' }}>⚠️</div>
        <h3 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--color-text)' }}>{t('errorTitle')}</h3>
        <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>{errorMessage}</p>

        <div className="space-y-3">
          <button onClick={onRetry} className="btn-professional-accent w-full">
            {t('retry')}
          </button>
          <button onClick={onDemo} className="btn-professional-outline w-full">
            {t('continueWithDemo')}
          </button>
          <button onClick={onQA} className="btn-professional-outline w-full">
            {t('tryStandardMode')}
          </button>
        </div>
      </div>
    </div>
  );
}
