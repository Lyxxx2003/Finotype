'use client';

import { useEffect, useState } from 'react';
import { getAnswers, getDisplayName } from '@/lib/psych/storage';
import { calculateFinotype, TraitPercentages } from '@/lib/psych/logic';
import { personas } from '@/lib/psych/data';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { downloadShareImage } from '@/components/ShareUtil';
import { nativeShare, copyShareLink, shareToX, shareToFacebook } from '@/components/ShareUtil';
import { Persona } from '@/lib/psych/data';
import { ResultsButtons } from '@/components/ResultsButtons';
import { PercentageCard } from '@/components/PercentageCard';

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

  const finotypeCode = persona?.id ?? '';
  const finotypeName = persona && tPersonas.has(`${persona.id}.name`) ? tPersonas(`${persona.id}.name`) : finotypeCode;

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
    mascot: persona?.mascot || '💰',
    title: tResults('shareTitle'),
    subtitle: 'finotype.vercel.app',
    brandText: tResults('shareBrandText'),
    filename: `finotype-${persona?.id}-${Date.now()}.png`,
    shareTitle: tResults('shareTitle'),
    shareText: tResults('shareText', { code: finotypeCode, name: finotypeName }),
    finotypeCode,
    finotypeName,
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 font-sans" style={{ background: 'var(--gradient-surface)' }}>
      <div className="max-w-4xl w-full space-y-4">
        <div
          className="card-professional rounded-3xl overflow-hidden border-0"
          style={{ background: 'var(--gradient-surface)' }}
        >
          <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  {displayName ? (
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {tResults('hey', { name: displayName })}
                    </span>
                  ) : null}
                  <span
                    className="text-xs uppercase tracking-[0.3em] font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'var(--gradient-primary)', color: 'white' }}
                  >
                    {tResults('yourFinotype')}
                  </span>
                </div>
                <div
                  className="inline-flex flex-col items-start rounded-2xl px-6 py-3 border gap-1"
                  style={{
                    borderColor: 'var(--color-neutral-200)',
                    background: 'var(--gradient-primary)',
                    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)'
                  }}
                >
                  <span className="text-4xl font-bold tracking-[0.35em]" style={{ color: 'white' }}>
                    {persona.id}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                    {finotypeName}
                  </span>
                </div>
              </div>

              <div
                className="relative w-full md:w-[340px] min-h-[220px] overflow-hidden rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(30,64,175,0.2) 0%, rgba(14,165,233,0.08) 100%)',
                  border: '1px solid var(--color-neutral-200)'
                }}
              >
                <div
                  className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.15) 70%)',
                    boxShadow: '0 0 35px rgba(59,130,246,0.6)'
                  }}
                ></div>
                <div
                  className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-44"
                  style={{
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                    background: 'linear-gradient(180deg, rgba(59,130,246,0.35) 0%, rgba(14,165,233,0.05) 100%)'
                  }}
                ></div>
                <svg
                  className="absolute top-6 left-1/2 -translate-x-1/2"
                  width="170"
                  height="170"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <polygon
                    points="50,6 61,38 95,38 67,58 77,92 50,72 23,92 33,58 5,38 39,38"
                    fill="rgba(30,64,175,0.22)"
                  />
                </svg>
                <div className="relative z-10 h-full flex items-end justify-center pb-4">
                  <img
                    src={`/${persona.mascot}`}
                    alt={`${persona.name} Mascot`}
                    className="w-40 h-40 md:w-44 md:h-44 object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 items-stretch">
              <PercentageCard percentages={percentages} tResults={tResults} tTraits={tTraits} />
              <div className="flex flex-col gap-6 h-full">
                <div
                  className="card-professional p-6 flex-1 flex flex-col justify-center"
                  style={{
                    background: 'linear-gradient(145deg, rgba(14,165,233,0.12) 0%, rgba(125,211,252,0.08) 100%)',
                    borderColor: 'rgba(14, 165, 233, 0.25)'
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-[0.3em] font-semibold"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {tResults('peopleLikeYou')}
                  </p>
                  {statsLoading ? (
                    <div className="flex items-center gap-2 mt-4">
                      <svg className="animate-spin h-5 w-5" style={{ color: 'var(--color-primary)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {tResults('loading')}
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="text-4xl font-bold mt-4" style={{ color: 'var(--color-text)' }}>
                        {stats?.percentage ?? 0}%
                      </p>
                      {stats?.total === 0 ? (
                        <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                          {tResults('firstTest')}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>

                <div
                  className="card-professional p-6 flex-1"
                  style={{
                    background: 'linear-gradient(180deg, rgba(14,165,233,0.1) 0%, rgba(14,165,233,0) 70%), var(--color-surface)',
                    borderColor: 'var(--color-neutral-200)'
                  }}
                >
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    {tResults('aboutYourFinotype')}
                  </h3>
                  <p className="leading-relaxed text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                    {tPersonas(`${persona.id}.description`)}
                  </p>
                </div>
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
