'use client';

interface PersonaCardProps {
  profile: string;
  netWorth: string;
  t: any;
}

export function PersonaCard({ profile, netWorth, t }: PersonaCardProps) {
  return (
    <div className="p-8 md:p-12 text-white relative overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
      <div className="relative z-10 text-center">
        <h2
          className="text-sm uppercase tracking-widest font-bold mb-3"
          style={{ opacity: 0.95, letterSpacing: '0.1em' }}
        >
          {t('yourFinancialPersona')}
        </h2>
        <div className="text-4xl md:text-5xl font-bold mb-8 leading-tight">{profile}</div>

        <div
          className="inline-block backdrop-blur-md rounded-2xl px-8 py-4 border"
          style={{
            background: 'rgba(255,255,255,0.25)',
            borderColor: 'rgba(255,255,255,0.4)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}
        >
          <p
            className="text-sm font-bold uppercase tracking-wider mb-2"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            {t('finalNetWorth')}
          </p>
          <p className="text-4xl font-bold text-white">${Number(netWorth).toLocaleString()}</p>
        </div>
      </div>
      <div
        className="absolute top-0 left-0 w-64 h-64 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-48 h-48 rounded-full translate-x-1/3 translate-y-1/3 opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }}
      />
    </div>
  );
}
