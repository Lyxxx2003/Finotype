'use client';

import { useTranslations } from 'next-intl';
import TypesCard from '@/components/TypesCard';

export default function TypesPage() {
  const t = useTranslations('personas');
  const tCommon = useTranslations('types');

  const typeGroups = {
    Pioneers: ['AFDE', 'AFDN', 'AFIN', 'AFIE'],
    Guardians: ['GFDE', 'GFIN', 'GFIE', 'GFDN'],
    Players: ['APDE', 'APIN', 'APIE', 'APDN'],
    Pragmatists: ['GPDE', 'GPDN', 'GPIE', 'GPIN'],
  };

  const groupLabels: Record<string, string> = {
    Pioneers: tCommon('pioneers'),
    Guardians: tCommon('guardians'),
    Players: tCommon('players'),
    Pragmatists: tCommon('pragmatists'),
  };

  const groupColors: Record<string, string> = {
    Pioneers: '#F59E0B',
    Guardians: '#10B981',
    Players: '#EC4899',
    Pragmatists: '#3B82F6',
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-background)' }}>
      {/* Bold Slashes & Sawtooth Geometric Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* SVG covering full viewport - colors aligned with card rows */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 2000" preserveAspectRatio="none" style={{ opacity: 1 }}>
          <defs>
            <linearGradient id="p-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#F59E0B', stopOpacity: 0.18 }} />
              <stop offset="100%" style={{ stopColor: '#F59E0B', stopOpacity: 0.08 }} />
            </linearGradient>
            <linearGradient id="g-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 0.18 }} />
              <stop offset="100%" style={{ stopColor: '#10B981', stopOpacity: 0.08 }} />
            </linearGradient>
            <linearGradient id="pl-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#EC4899', stopOpacity: 0.18 }} />
              <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 0.08 }} />
            </linearGradient>
            <linearGradient id="pr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.18 }} />
              <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0.08 }} />
            </linearGradient>
          </defs>

          {/* Pioneers - Large diagonal slash with irregular wider sawtooth */}
          <polygon points="0,170 100,130 200,210 320,145 420,225 540,110 670,200 800,160 920,240 1000,155 1000,180 900,420 0,520" fill="url(#p-grad)" />
          
          {/* Guardians - Sawtooth middle section */}
          <polygon points="0,520 900,420 1000,680 800,800 1000,920 0,1000" fill="url(#g-grad)" />
          <polygon points="80,820 320,840 150,1000 0,1000" fill="url(#g-grad)" />
          
          {/* Players - Diagonal slash right to left (shortened) */}
          <polygon points="0,1000 1000,920 1000,1180 200,1280" fill="url(#pl-grad)" />
          <polygon points="200,1280 1000,1180 950,1420 0,1500" fill="url(#pl-grad)" />
          
          {/* Pragmatists - Irregular bottom with sawtooth */}
          <polygon points="0,1500 950,1420 1000,1750 850,2000 0,2000" fill="url(#pr-grad)" />
          <polygon points="0,1500 200,1700 0,2000" fill="url(#pr-grad)" />
          <polygon points="400,1850 600,1700 800,2000" fill="url(#pr-grad)" opacity="0.6" />
          
          {/* Players - Diagonal slash right to left (shortened) */}
          <polygon points="0,1000 1000,920 1000,1180 200,1280" fill="url(#pl-grad)" />
          <polygon points="200,1280 1000,1180 950,1420 0,1500" fill="url(#pl-grad)" />
          
          {/* Pragmatists - Irregular bottom with sawtooth */}
          <polygon points="0,1500 950,1420 1000,1750 850,2000 0,2000" fill="url(#pr-grad)" />
          <polygon points="0,1500 200,1700 0,2000" fill="url(#pr-grad)" />
          <polygon points="400,1850 600,1700 800,2000" fill="url(#pr-grad)" opacity="0.6" />
        </svg>

        {/* Group Labels - Centered, aligned with sections */}
        <div className="absolute left-1/2 top-[15%] -translate-x-1/2 pointer-events-none">
          <h3 className="text-7xl md:text-8xl font-black uppercase tracking-tighter select-none text-center" style={{
            color: groupColors.Pioneers,
            opacity: 0.22,
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
          }}>
            {groupLabels.Pioneers}
          </h3>
        </div>
        <div className="absolute left-1/2 top-[35%] -translate-x-1/2 pointer-events-none">
          <h3 className="text-7xl md:text-8xl font-black uppercase tracking-tighter select-none text-center" style={{
            color: groupColors.Guardians,
            opacity: 0.22,
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
          }}>
            {groupLabels.Guardians}
          </h3>
        </div>
        <div className="absolute left-1/2 top-[54%] -translate-x-1/2 pointer-events-none">
          <h3 className="text-7xl md:text-8xl font-black uppercase tracking-tighter select-none text-center" style={{
            color: groupColors.Players,
            opacity: 0.22,
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
          }}>
            {groupLabels.Players}
          </h3>
        </div>
        <div className="absolute left-1/2 bottom-[12%] -translate-x-1/2 pointer-events-none">
          <h3 className="text-7xl md:text-8xl font-black uppercase tracking-tighter select-none text-center" style={{
            color: groupColors.Pragmatists,
            opacity: 0.22,
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
          }}>
            {groupLabels.Pragmatists}
          </h3>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            {tCommon('title')}
          </h1>
          <p
            className="text-lg md:text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {tCommon('subtitle')}
          </p>
        </div>

        {/* Types Grid */}
        <div className="space-y-20">
          {Object.entries(typeGroups).map(([group, types]) => (
            <div key={group}>
              {/* Group Header */}
              <div className="text-center mb-8">
                <h2
                  className="text-4xl font-bold mb-2"
                  style={{ color: groupColors[group] }}
                >
                  {groupLabels[group]}
                </h2>
                <div
                  className="w-24 h-1 mx-auto rounded-full"
                  style={{ background: groupColors[group] }}
                />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {types.map((type) => (
                  <TypesCard
                    key={type}
                    type={type}
                    name={t(`${type}.name`)}
                    description={t(`${type}.description`)}
                    group={group}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20 mb-10">
          <p
            className="text-lg mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {tCommon('cta')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="./psych/start"
              className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--gradient-primary)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              {tCommon('takeTest')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
