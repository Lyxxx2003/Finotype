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
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('analysis');
  const tPersonas = useTranslations('personas');

  useEffect(() => {
    const answers = getAnswers();
    const type = calculateFinotype(answers);
    setPersona(personas[type]);
    
  }, []);

  if (!persona) return <div className="p-8 text-center">{t('loadingAnalysis')}</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 md:p-12 font-sans bg-gradient-professional">
      <div className="max-w-4xl w-full">
        <header className="mb-12 border-b pb-8 flex justify-between items-center" style={{ borderColor: 'var(--color-neutral-200)' }}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{persona.mascot}</span>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{t('typeAnalysis', { name: tPersonas(`${persona.id}.name`) })}</h1>
              <p style={{ color: 'var(--color-text-secondary)' }}>{t('finotypeLabel', { type: persona.id })}</p>
            </div>
          </div>
          <Link href={`/${locale}/standard/results`} className="text-primary font-medium hover:underline cursor-pointer">
            {t('backToSummary')}
          </Link>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Strengths */}
          <section className="p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02]" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'var(--color-success)' }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
              {t('yourStrengths')}
            </h2>
            <ul className="space-y-4">
              {persona.strengths.map((_, i) => (
                <li key={i} className="flex items-start gap-3" style={{ color: 'var(--color-neutral-700)' }}>
                  <span className="mt-1 block w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-success)' }}></span>
                  {tPersonas(`${persona.id}.strengths.${i}`)}
                </li>
              ))}
            </ul>
          </section>

          {/* Pitfalls */}
          <section className="p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02]" style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'var(--color-warning)' }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-warning)' }}>
              {t('commonPitfalls')}
            </h2>
            <ul className="space-y-4">
              {persona.pitfalls.map((_, i) => (
                <li key={i} className="flex items-start gap-3" style={{ color: 'var(--color-neutral-700)' }}>
                  <span className="mt-1 block w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-warning)' }}></span>
                  {tPersonas(`${persona.id}.pitfalls.${i}`)}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Actionable Tips */}
        <section className="p-8 rounded-2xl border mb-12" style={{ background: 'rgba(14,165,233,0.08)', borderColor: 'var(--color-accent)' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
            {t('tipsForYou')}
          </h2>
          <div className="grid gap-4">
            {persona.tips.map((_, i) => (
              <div key={i} className="card-professional p-4 flex gap-4 items-center">
                 <span className="font-bold text-2xl bg-clip-text" style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>0{i+1}</span>
                 <span style={{ color: 'var(--color-text)' }}>{tPersonas(`${persona.id}.tips.${i}`)}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center">
          <Link
             href={`/${locale}`}
             className="btn-professional-primary inline-block"
          >
            {t('returnHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
