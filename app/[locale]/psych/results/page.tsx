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
import { FeedbackReactions } from '@/components/FeedbackReactions';

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
  const tHome = useTranslations('home');
  const [standardFeedback, setStandardFeedback] = useState<string | null>(null);
  const [submittingStandardFeedback, setSubmittingStandardFeedback] = useState(false);
  const [hasExistingStandardFeedback, setHasExistingStandardFeedback] = useState(false);

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
          setStandardFeedback(data?.sessionFeedback ?? null);
          setHasExistingStandardFeedback((data?.sessionFeedback ?? null) !== null);
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

  const handleStandardFeedback = async (feedback: 'down' | 'up' | 'heart' | 'skip') => {
    if (submittingStandardFeedback) return;

    setSubmittingStandardFeedback(true);
    try {
      const response = await fetch(`/${locale}/api/type-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finotype: persona?.id, standardFeedback: feedback }),
      });

      if (response.ok) {
        setStandardFeedback(feedback);
      }
    } catch (error) {
      console.error('Failed to save standard feedback:', error);
    } finally {
      setSubmittingStandardFeedback(false);
    }
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
            <div className="grid gap-6 md:grid-cols-2 items-stretch">
              <div className="space-y-4 w-full flex flex-col items-center">
                {displayName ? (
                  <p className="text-2xl md:text-3xl font-extrabold text-center leading-tight" style={{ color: 'var(--color-primary)' }}>
                    {tResults('hey', { name: displayName })}
                  </p>
                ) : null}
                <div
                  className="inline-flex w-full flex-col items-center text-center rounded-2xl px-6 py-4 border gap-2"
                  style={{
                    borderColor: 'var(--color-neutral-200)',
                    background: 'linear-gradient(145deg, rgba(30,64,175,0.08) 0%, rgba(14,165,233,0.06) 100%)',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)'
                  }}
                >
                  <span
                    className="text-xs uppercase tracking-[0.25em] font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'var(--gradient-primary)', color: 'white' }}
                  >
                    {tResults('yourFinotype')}
                  </span>
                  <span className="text-4xl font-bold tracking-[0.28em]" style={{ color: 'var(--color-text)' }}>
                    {persona.id}
                  </span>
                  <span className="text-base font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    {finotypeName}
                  </span>
                </div>
              </div>

              <div
                className="relative w-full h-full min-h-0 overflow-hidden rounded-3xl"
                style={{
                  background: 'linear-gradient(165deg, rgba(30,64,175,0.08) 0%, rgba(14,165,233,0.1) 45%, rgba(255,255,255,0.7) 100%)'
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at 50% 8%, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.08) 34%, rgba(255,255,255,0) 72%)'
                  }}
                ></div>
                <div
                  className="absolute left-1/2 top-0 -translate-x-1/2 w-56 h-full"
                  style={{
                    clipPath: 'polygon(50% 0%, 8% 100%, 92% 100%)',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.14) 45%, rgba(255,255,255,0.02) 100%)',
                    filter: 'blur(0.2px)'
                  }}
                ></div>
                <div
                  className="absolute left-1/2 bottom-4 -translate-x-1/2 w-[64%] h-10 rounded-full"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.24) 0%, rgba(14,165,233,0.1) 55%, rgba(14,165,233,0) 100%)',
                    filter: 'blur(1px)'
                  }}
                ></div>
                <div className="relative z-10 h-full flex items-center justify-center">
                  <img
                    src={`/${persona.mascot}`}
                    alt={`${persona.name} Mascot`}
                    className="w-36 h-36 md:w-40 md:h-40 object-contain"
                    style={{
                      filter: 'drop-shadow(0 14px 18px rgba(15,23,42,0.24)) drop-shadow(0 2px 3px rgba(255,255,255,0.28))'
                    }}
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
                    className="text-lg font-semibold"
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
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    {tResults('aboutYourFinotype')}
                  </h3>
                  <p className="leading-relaxed text-base font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
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
          extraAction={{
            href: `/${locale}/technical/question`,
            label: tHome('proSimulation'),
          }}
        />

        {!hasExistingStandardFeedback && (
          <FeedbackReactions
            feedback={standardFeedback as 'down' | 'up' | 'heart' | 'skip' | null}
            submitting={submittingStandardFeedback}
            question={tResults('feedbackQuestion')}
            thumbsDownLabel={tResults('feedbackThumbsDown')}
            thumbsUpLabel={tResults('feedbackThumbsUp')}
            heartLabel={tResults('feedbackHeart')}
            skipLabel={tResults('feedbackSkip')}
            thanksText={tResults('feedbackThanks')}
            onSubmit={handleStandardFeedback}
          />
        )}
      </div>
    </div>
  );
}
