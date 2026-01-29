'use client';

import { useEffect, useState } from 'react';
import { getAnswers, getDisplayName } from '@/lib/storage';
import { calculateFinotype } from '@/lib/logic';
import { personas } from '@/lib/data';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { generateShareImage } from '@/components/ShareUtil';
import { Persona } from '@/types';
import { ResultsButtons } from '@/components/ResultsButtons';

export default function ResultsPage() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const params = useParams();
  const locale = params.locale as string;
  const tPersonas = useTranslations('personas');
  const tResults = useTranslations('results');

  useEffect(() => {
    const answers = getAnswers();
    const type = calculateFinotype(answers);
    setPersona(personas[type]);
    
    const name = getDisplayName();
    if (name) {
      setDisplayName(name);
    }
  }, []);

  const handleShare = async () => {
    if (!persona) return;

    const shareUrl = `https://finotype.vercel.app/${locale}`;

    await generateShareImage({
      gradientColors: ['#2563eb', '#1e40af'],
      circleColor1: 'rgba(255, 255, 255, 0.05)',
      circleColor2: 'rgba(255, 255, 255, 0.08)',
      mascot: persona.mascot,
      title: "What's your Finotype?",
      subtitle: 'finotype.vercel.app',
      brandText: 'Discover your financial personality',
      filename: `finotype-${persona.id}-${Date.now()}.png`,
      shareTitle: "What's your Finotype?",
      shareText: `Discover your financial personality! ${shareUrl}`,
    });
  };

  if (!persona) return <div className="p-8 text-center">{tResults('calculating')}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 font-sans bg-gradient-professional">
      <div className="max-w-3xl w-full space-y-4">
        {displayName && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-900">{tResults('hey', { name: displayName })}, {tResults('yourResults')}</h1>
          </div>
        )}

        <div className="card-professional rounded-3xl overflow-hidden border-0">
          <div className="p-8 text-white relative overflow-hidden bg-gradient-professional-blue">
            <div className="relative z-10 text-center">
              <h2 
                className="text-sm opacity-90 uppercase tracking-widest font-bold mb-2"
                style={{ opacity: 0.9 }}
              >
                {tResults('yourFinotype')}
              </h2>
              <div className="text-6xl mb-4">{persona.mascot}</div>
              <div className="text-4xl md:text-5xl font-bold mb-6">{tPersonas(`${persona.id}.name`)}</div>
              
              <div 
                className="inline-block backdrop-blur-sm rounded-xl px-6 py-3 border"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <p 
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#dbeafe' }}
                >
                  {persona.id}
                </p>
              </div>
            </div>
            {/* Decorative circles */}
            <div 
              className="absolute top-0 left-0 w-64 h-64 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }}
            ></div>
            <div 
              className="absolute bottom-0 right-0 w-48 h-48 rounded-full translate-x-1/3 translate-y-1/3 opacity-20"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }}
            ></div>
          </div>
          
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900">{tResults('aboutYourType')}</h3>
              <p className="leading-relaxed text-lg" style={{ color: 'var(--color-text-secondary)' }}>{tPersonas(`${persona.id}.description`)}</p>
            </div>
          </div>
        </div>

        <ResultsButtons
          locale={locale}
          onShare={handleShare}
          t={tResults}
          secondaryButtonText={tResults('seePitfallsAndTips')}
          secondaryButtonHref={`/${locale}/standard/resources`}
        />
      </div>
    </div>
  );
}
