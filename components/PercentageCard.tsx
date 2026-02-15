'use client';

import { TraitPercentages } from '@/lib/psych/logic';

interface PercentageCardProps {
  percentages: TraitPercentages;
  tResults: (key: string) => string;
  tTraits: (key: string) => string;
}

const traitDimensions = [
  { positive: 'A', negative: 'G' },
  { positive: 'F', negative: 'P' },
  { positive: 'D', negative: 'I' },
  { positive: 'E', negative: 'N' },
];

export function PercentageCard({ percentages, tResults, tTraits }: PercentageCardProps) {
  return (
    <div
      className="card-professional p-6"
      style={{
        background: 'linear-gradient(145deg, rgba(30,64,175,0.18) 0%, rgba(14,165,233,0.08) 100%)',
        borderColor: 'rgba(30, 64, 175, 0.25)'
      }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
        {tResults('yourTraits')}
      </h3>
      <div className="space-y-4">
        {traitDimensions.map(({ positive, negative }) => {
          const posPercent = percentages[positive as keyof TraitPercentages];
          const negPercent = percentages[negative as keyof TraitPercentages];

          return (
            <div key={`${positive}-${negative}`} className="space-y-2">
              <div className="flex justify-between text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                <span>{tTraits(positive)}</span>
                <span>{tTraits(negative)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold min-w-[3rem]" style={{ color: 'var(--color-text-secondary)' }}>
                  {posPercent}%
                </span>
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-neutral-200)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${posPercent}%`,
                      background: 'var(--gradient-primary)',
                    }}
                  ></div>
                </div>
                <span className="text-xs font-bold min-w-[3rem] text-right" style={{ color: 'var(--color-text-secondary)' }}>
                  {negPercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
