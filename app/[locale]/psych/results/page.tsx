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
  const [stats, setStats] = useState<{ total: number; typeCount: number; percentage: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [hasSaved, setHasSaved] = useState(false);
  const params = useParams();
  const locale = params.locale as string;
  const tPersonas = useTranslations('personas');
  const tAnalysis = useTranslations('analysis');
  const tResults = useTranslations('results');
  const tTraits = useTranslations('traits');

  useEffect(() => {
    if (hasSaved) return; // Prevent double execution

    const answers = getAnswers();
    const result = calculateFinotype(answers);
    const finotype = result.type;
    setPersona(personas[finotype]);
    setPercentages(result.percentages);

    const name = getDisplayName();
    if (name) {
      setDisplayName(name);
    }

    // Save the type to database and fetch statistics
    const saveAndFetchStats = async () => {
      try {
        // Save the finotype
        console.log('Saving finotype:', finotype);
        const saveResponse = await fetch(`/${locale}/api/type-stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ finotype }),
        });

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          console.error('Failed to save finotype:', errorData);
        } else {
          console.log('Successfully saved finotype');
        }

        // Fetch statistics
        const response = await fetch(`/${locale}/api/type-stats?finotype=${finotype}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Stats fetched:', data);
          setStats(data);
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch stats:', errorData);
        }
        
        setHasSaved(true); // Mark as saved
      } catch (error) {
        console.error('Error saving/fetching type stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    saveAndFetchStats();
  }, [locale, hasSaved]);

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
            <div className="relative text-center">
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
            {/* Statistics Section */}
            <div className="text-center pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              {statsLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" style={{ color: 'var(--color-primary)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {tResults('loading')}
                  </span>
                </div>
              ) : stats ? (
                stats.total === 0 ? (
                  <p className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                    🎉 {tResults('firstTest')}
                  </p>
                ) : (
                  <p className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                    {tResults('percentageLike', { percentage: stats.percentage })}
                  </p>
                )
              ) : null}
            </div>

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
