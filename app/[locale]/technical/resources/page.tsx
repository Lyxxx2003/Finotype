'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ResourceCard from '@/components/ResourceCard';

const NUMBER_OF_RESOURCE_CARDS = 6;

const RESOURCE_DATA = [
  {
    titleKey: 'resources.card1.title',
    descriptionKey: 'resources.card1.description',
    blogUrl: 'https://example.com/blog/understanding-financial-personality',
  },
  {
    titleKey: 'resources.card2.title',
    descriptionKey: 'resources.card2.description',
    blogUrl: 'https://example.com/blog/guardian-vs-maverick',
  },
  {
    titleKey: 'resources.card3.title',
    descriptionKey: 'resources.card3.description',
    blogUrl: 'https://example.com/blog/improving-financial-literacy',
  },
  {
    titleKey: 'resources.card4.title',
    descriptionKey: 'resources.card4.description',
    blogUrl: 'https://example.com/blog/behavioral-finance-basics',
  },
  {
    titleKey: 'resources.card5.title',
    descriptionKey: 'resources.card5.description',
    blogUrl: 'https://example.com/blog/investment-strategies',
  },
  {
    titleKey: 'resources.card6.title',
    descriptionKey: 'resources.card6.description',
    blogUrl: 'https://example.com/blog/risk-management-guide',
  },
];

const getMascotImage = (index: number): string => {
  const mascots = [
    '/mascot/afde.png',
    '/mascot/gpin.png',
    '/mascot/apie.png',
    '/mascot/gfdn.png',
    '/mascot/afin.png',
    '/mascot/gpde.png',
  ];
  return mascots[index % mascots.length];
};

export default function TechnicalResourcesPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            {t('resources.title')}
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {t('resources.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: NUMBER_OF_RESOURCE_CARDS }).map((_, index) => {
            const resourceData = RESOURCE_DATA[index] || RESOURCE_DATA[0];
            return (
              <ResourceCard
                key={index}
                title={t(resourceData.titleKey)}
                description={t(resourceData.descriptionKey)}
                imageUrl={getMascotImage(index)}
                blogUrl={resourceData.blogUrl}
                index={index}
              />
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href={`/${locale}/technical/question`}
            className="group cursor-pointer rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto flex items-center gap-2 justify-center"
            style={{
              background: 'var(--gradient-accent)',
              color: 'white',
              border: '2px solid rgba(14,165,233,0.5)',
              boxShadow: '0 8px 24px rgba(14,165,233,0.3), 0 2px 8px rgba(14,165,233,0.15)'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {t('home.proSimulation')}
          </Link>
        </div>
      </div>
    </div>
  );
}
