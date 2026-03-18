import { useTranslations } from 'next-intl';

export default function TechnicalResultsPage() {
  const t = useTranslations('technicalQuestion.ui');

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">{t('resultsPageTitle')}</h1>
        <p className="text-lg text-gray-600 mb-8">
          {t('resultsPageComingSoon')}
        </p>
      </div>
    </div>
  );
}
