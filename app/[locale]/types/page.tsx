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

  const groupPositions: Record<string, string> = {
    Pioneers: 'top-0 left-0',
    Guardians: 'top-0 right-0',
    Players: 'bottom-0 left-0',
    Pragmatists: 'bottom-0 right-0',
  };

  const groupColors: Record<string, string> = {
    Pioneers: '#F59E0B',
    Guardians: '#10B981',
    Players: '#EC4899',
    Pragmatists: '#3B82F6',
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-background)' }}>
      {/* Geometric Background Division */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Background Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--color-neutral-200) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-neutral-200) 1px, transparent 1px)
            `,
            backgroundSize: '50% 50%',
            opacity: 0.3,
          }}
        />

        {/* Group Labels with Diagonal Divisions */}
        {Object.entries(typeGroups).map(([group, _]) => (
          <div
            key={group}
            className={`absolute w-1/2 h-1/2 flex items-center justify-center ${groupPositions[group]}`}
            style={{
              borderRight: group === 'Pioneers' || group === 'Players' ? '2px solid var(--color-neutral-200)' : 'none',
              borderBottom: group === 'Pioneers' || group === 'Guardians' ? '2px solid var(--color-neutral-200)' : 'none',
            }}
          >
            <div
              className="text-8xl md:text-9xl font-bold uppercase tracking-wider select-none"
              style={{
                color: groupColors[group],
                opacity: 0.08,
                transform: 'rotate(-5deg)',
                textShadow: '0 0 40px rgba(0, 0, 0, 0.05)',
              }}
            >
              {group}
            </div>
          </div>
        ))}

        {/* Decorative Geometric Shapes */}
        <div
          className="absolute w-96 h-96 rounded-full"
          style={{
            top: '10%',
            left: '5%',
            background: `radial-gradient(circle, ${groupColors.Pioneers}15 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full"
          style={{
            top: '10%',
            right: '5%',
            background: `radial-gradient(circle, ${groupColors.Guardians}15 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full"
          style={{
            bottom: '10%',
            left: '5%',
            background: `radial-gradient(circle, ${groupColors.Players}15 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full"
          style={{
            bottom: '10%',
            right: '5%',
            background: `radial-gradient(circle, ${groupColors.Pragmatists}15 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
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
                  {group}
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
            <a
              href="./resources"
              className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              style={{
                border: '2px solid var(--color-primary)',
                color: 'var(--color-primary)',
                background: 'transparent',
              }}
            >
              {tCommon('learnMore')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
