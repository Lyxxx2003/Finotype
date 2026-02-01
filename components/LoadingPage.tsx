import { useTranslations } from 'next-intl';

export default function LoadingPage() {
    const t = useTranslations('game');

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-surface)' }}>
            <div className="text-center">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full animate-pulse" style={{ background: 'rgba(14,165,233,0.1)' }}>
                    <div className="h-2 w-2 rounded-full animate-ping" style={{ background: 'var(--color-accent)' }}></div>
                    <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
                        {t('loading')}
                    </span>
                </div>
            </div>
        </div>
    );
}