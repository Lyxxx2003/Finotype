'use client';

import { useEffect, useState } from 'react';
import { getAnswers, getDisplayName } from '@/lib/storage';
import { calculateFinotype } from '@/lib/logic';
import { personas } from '@/lib/data';
import Link from 'next/link';
import { Persona } from '@/types';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function AnalysisPage() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('analysis');
  const tPersonas = useTranslations('personas');

  useEffect(() => {
    const answers = getAnswers();
    const type = calculateFinotype(answers);
    setPersona(personas[type]);
    
    const name = getDisplayName();
    if (name) {
      setDisplayName(name);
    }
  }, []);

  if (!persona) return <div className="p-8 text-center">{t('loadingAnalysis')}</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 md:p-12 font-sans bg-gradient-morandi">
      <div className="max-w-4xl w-full">
        {displayName && (
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-morandi-dark">{t('hey', { name: displayName })}</h2>
          </div>
        )}
        <header className="mb-12 border-b pb-8 flex justify-between items-center" style={{ borderColor: 'var(--color-neutral-200)' }}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{persona.mascot}</span>
            <div>
              <h1 className="text-3xl font-bold text-morandi-dark">{t('typeAnalysis', { name: tPersonas(`${persona.id}.name`) })}</h1>
              <p style={{ color: 'var(--color-text-secondary)' }}>{t('finotypeLabel', { type: persona.id })}</p>
            </div>
          </div>
          <Link href={`/${locale}/standard/results`} className="text-morandi-primary font-medium hover:underline cursor-pointer">
            {t('backToSummary')}
          </Link>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Strengths */}
          <section className="p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, rgba(167,184,168,0.15) 0%, rgba(167,184,168,0.08) 100%)', borderColor: 'var(--color-sage)' }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-sage)' }}>
              {t('yourStrengths')}
            </h2>
            <ul className="space-y-4">
              {persona.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3" style={{ color: 'var(--color-neutral-700)' }}>
                  <span className="mt-1 block w-2 h-2 rounded-full bg-morandi-sage flex-shrink-0"></span>
                  {s}
                </li>
              ))}
            </ul>
          </section>

          {/* Pitfalls */}
          <section className="p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, rgba(196,148,139,0.15) 0%, rgba(196,148,139,0.08) 100%)', borderColor: 'var(--color-terracotta)' }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-terracotta)' }}>
              {t('commonPitfalls')}
            </h2>
            <ul className="space-y-4">
              {persona.pitfalls.map((p, i) => (
                <li key={i} className="flex items-start gap-3" style={{ color: 'var(--color-neutral-700)' }}>
                  <span className="mt-1 block w-2 h-2 rounded-full bg-morandi-terracotta flex-shrink-0"></span>
                  {p}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Actionable Tips */}
        <section className="p-8 rounded-2xl border mb-12" style={{ background: 'linear-gradient(135deg, rgba(245,217,168,0.2) 0%, rgba(232,184,125,0.15) 100%)', borderColor: 'var(--color-accent)' }}>
          <h2 className="text-xl font-bold text-morandi-accent mb-6 flex items-center gap-2">
            {t('tipsForYou')}
          </h2>
          <div className="grid gap-4">
            {persona.tips.map((tip, i) => (
              <div key={i} className="card-morandi p-4 flex gap-4 items-center">
                 <span className="font-bold text-2xl bg-gradient-morandi-warm bg-clip-text" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>0{i+1}</span>
                 <span style={{ color: 'var(--color-text)' }}>{tip}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center">
          <Link
             href={`/${locale}`}
             className="btn-morandi-primary inline-block"
          >
            {t('startOver')}
          </Link>
        </div>
      </div>
    </div>
  );
}
