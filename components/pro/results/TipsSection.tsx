'use client';

interface TipsSectionProps {
  tips: string[];
}

export function TipsSection({ tips }: TipsSectionProps) {
  if (!tips || tips.length === 0) return null;

  return (
    <div>
      <div className="grid gap-4">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className="flex gap-4 items-start p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            style={{
              background: 'rgba(14,165,233,0.08)',
              borderColor: 'var(--color-accent)',
              border: '1px solid',
              color: 'var(--color-neutral-700)',
              boxShadow: '0 2px 8px rgba(14,165,233,0.1)'
            }}
          >
            <span
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg text-white"
              style={{ background: 'var(--gradient-accent)', boxShadow: '0 2px 8px rgba(14,165,233,0.3)' }}
            >
              {idx + 1}
            </span>
            <p className="font-medium pt-1.5 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
