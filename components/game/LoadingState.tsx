'use client';

interface LoadingStateProps {
  t: any;
  message?: string;
}

export function LoadingState({ t, message }: LoadingStateProps) {
  return (
    <div className="py-32 text-center flex flex-col items-center">
      <div className="mb-8 relative">
        <div className="w-20 h-20 rounded-full animate-spin" style={{ border: '4px solid var(--color-neutral-200)', borderTopColor: 'var(--color-accent)' }}></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">✨</div>
      </div>
      <h3 className="text-2xl font-bold text-neutral-900 mb-3">
        {message || t('generatingOptions')}
      </h3>
      <p className="text-lg mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {t('aiGeneratingMessage')}
      </p>
      <div className="flex items-center gap-3 px-6 py-3 rounded-full animate-pulse" style={{ background: 'rgba(14,165,233,0.1)' }}>
        <div className="h-2 w-2 rounded-full animate-ping" style={{ background: 'var(--color-accent)' }}></div>
        <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
          {t('loading')}
        </span>
      </div>
    </div>
  );
}
