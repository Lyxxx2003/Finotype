'use client';

import { LifeOption } from '@/types';

interface OptionCardProps {
  option: LifeOption;
  onSelect: (option: LifeOption) => void;
  selected: boolean;
  disabled?: boolean;
  t: any;
}

export function OptionCard({ option, onSelect, selected, disabled, t }: OptionCardProps) {
  return (
    <div
      className={`h-80 w-full group ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      onClick={() => {
        if (!disabled && !selected) {
          onSelect(option);
        }
      }}
    >
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all h-full flex flex-col" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-neutral-200)' }}>
        <div className="flex justify-between items-start mb-3 w-full">
          <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--color-text)' }}>{option.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${option.type === 'monthly' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
            {option.type === 'monthly' ? t('monthlyTag') : t('oneTimeTag')}
          </span>
        </div>
        <p className="text-sm mb-6 flex-grow" style={{ color: 'var(--color-text-secondary)' }}>{option.description}</p>
        <div className="text-xl font-bold border-t pt-4 w-full" style={{ color: 'var(--color-primary)', borderColor: 'var(--color-neutral-200)' }}>
          ${option.cost.toLocaleString()}
        </div>
        <div className="mt-4 text-center text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          {t('tapToSelect')}
        </div>
      </div>
    </div>
  );
}
