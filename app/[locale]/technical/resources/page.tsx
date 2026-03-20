'use client';

import { useTranslations } from 'next-intl';
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
      </div>
    </div>
  );
}
