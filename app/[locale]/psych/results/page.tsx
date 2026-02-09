'use client';

import { useEffect, useState } from 'react';
import { getAnswers, getDisplayName } from '@/lib/psych/storage';
import { calculateFinotype, TraitPercentages } from '@/lib/psych/logic';
import { personas } from '@/lib/psych/data';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { downloadShareImage } from '@/components/ShareUtil';
import { nativeShare, copyShareLink, shareToX, shareToFacebook } from '@/components/ShareUtil';
import { Persona, FinancialType } from '@/types';
import { ResultsButtons } from '@/components/ResultsButtons';

export default function ResultsPage() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [percentages, setPercentages] = useState<TraitPercentages | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const params = useParams();
  const locale = params.locale as string;
  const tPersonas = useTranslations('personas');
  const tAnalysis = useTranslations('analysis');
  const tResults = useTranslations('results');
  const tTraits = useTranslations('traits');

  useEffect(() => {
    const answers = getAnswers();
    const result = calculateFinotype(answers);
    setPersona(personas[result.type]);
    setPercentages(result.percentages);

    const name = getDisplayName();
    if (name) {
      setDisplayName(name);
    }
  }, []);

  const getShareImageOptions = () => ({
    gradientColors: ['#2563eb', '#1e40af'] as [string, string],
    circleColor1: 'rgba(255, 255, 255, 0.05)',
    circleColor2: 'rgba(255, 255, 255, 0.08)',
    mascot: persona?.mascot || 'image/AFDE.png',
    title: "What's your Finotype?",
    subtitle: 'finotype.vercel.app',
    brandText: 'Discover your financial personality',
    filename: `finotype-${persona?.id}-${Date.now()}.png`,
    shareTitle: "What's your Finotype?",
    shareText: `I just discovered my Finotype: ${persona?.name}! Discover your financial personality at https://finotype.vercel.app`,
    shareUrl: `https://finotype.vercel.app/`,
  });

  const handleShare = async () => {
    if (!persona) return;
    await nativeShare(getShareImageOptions());
  };

  const handleDownload = async () => {
    if (!persona) return;
    await downloadShareImage(getShareImageOptions());
  };

  const handleShareLink = async () => {
    const shareUrl = `https://finotype.vercel.app/`;
    await copyShareLink(shareUrl);
  };

  const handleShareX = () => {
    if (!persona) return;
    shareToX(getShareImageOptions());
  };

  const handleShareFacebook = () => {
    if (!persona) return;
    shareToFacebook(getShareImageOptions());
  };

  if (!persona || !percentages) return <div className="p-8 text-center">{tResults('calculating')}</div>;

  const traitDimensions = [
    { positive: 'A', negative: 'G' },
    { positive: 'F', negative: 'P' },
    { positive: 'D', negative: 'I' },
    { positive: 'E', negative: 'N' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 font-sans" style={{ background: 'var(--gradient-surface)' }}>
      <div className="max-w-3xl w-full space-y-4">
        {displayName && (
          <div className="text-center">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>{tResults('hey', { name: displayName })}, {tResults('yourResults')}</h1>
          </div>
        )}

        <div className="card-professional rounded-3xl overflow-hidden border-0">
          <div className="p-8 text-white relative overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
            <div className="relative z-10 text-center">
              <h2
                className="text-sm opacity-90 uppercase tracking-widest font-bold mb-2"
                style={{ opacity: 0.9 }}
              >
                {tResults('yourFinotype')}
              </h2>
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                  <img
                    src={`/${persona.mascot}`}
                    alt={`${persona.name} Mascot`}
                    className="w-24 h-24 object-cover rounded-full"
                  />
                </div>
              </div>

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
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{tResults('aboutYourType')}</h3>
              <p className="leading-relaxed text-lg" style={{ color: 'var(--color-text-secondary)' }}>{tPersonas(`${persona.id}.description`)}</p>
            </div>

            {/* Trait Percentages */}
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>{tResults('yourTraits')}</h3>
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
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
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
          </div>
        </div>

        <ResultsButtons
          locale={locale}
          onShare={handleShare}
          onDownload={handleDownload}
          onShareLink={handleShareLink}
          onShareX={handleShareX}
          onShareFacebook={handleShareFacebook}
          t={tAnalysis}
        />
      </div>
    </div>
  );
}
