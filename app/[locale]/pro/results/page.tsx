'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { simulateYear } from '@/lib/gemini';
import { PersonaCard } from '@/components/pro/results/PersonaCard';
import { TipsSection } from '@/components/pro/results/TipsSection';
import { FamiliarityForm } from '@/components/pro/results/FamiliarityForm';
import { generateShareImage } from '@/components/ShareUtil';
import { AnalysisState } from '@/types';
import { ResultsButtons } from '@/components/ResultsButtons';

const DEMO_ANALYSIS = {
  profile: "Strategic Wealth Builder",
  summary: "This is a demo analysis. You demonstrate a balanced approach to risk and reward.",
  tips: [
    "Consider automating your savings to reduce decision fatigue.",
    "Diversify your portfolio to hedge against market volatility.",
    "Set clear long-term goals to maintain focus during market dips."
  ]
};

function ResultsContent() {
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [loading, setLoading] = useState(true);
  const [netWorth, setNetWorth] = useState<string>('0');
  const [displayName, setDisplayName] = useState<string>('');

  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('analysis');
  const tGame = useTranslations('game');
  const id = searchParams.get('id');
  const isDemo = searchParams.get('demo') === 'true';
  const supabase = createClient();

  const handlePostFamiliaritySubmit = async (familiarity: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        post_familiarity: familiarity
      }).eq('id', user.id);
    }
  };

  const handleShare = async () => {
    if (!analysis) return;

    const shareUrl = `https://finotype.vercel.app/${locale}`;

    await generateShareImage({
      gradientColors: ['#0f172a', '#1e293b'],
      circleColor1: 'rgba(59, 130, 246, 0.1)',
      circleColor2: 'rgba(34, 197, 94, 0.1)',
      mascot: '💰',
      title: 'Simulate your financial future',
      titleFontSize: 56,
      subtitle: 'finotype.vercel.app',
      brandText: 'Interactive financial personality game',
      filename: `finotype-pro-${Date.now()}.png`,
      shareTitle: "Finotype - Financial Personality Game",
      shareText: `Simulate your financial future! ${shareUrl}`,
    });
  };

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (profile?.display_name) {
          setDisplayName(profile.display_name);
        }
      }

      if (id) {
        const { data } = await supabase
          .from('simulations')
          .select('*')
          .eq('id', id)
          .single();

        if (data) {
          setNetWorth(data.final_balance?.toFixed(2) || '0');

          // If analysis exists, use it
          if (data.gemini_analysis) {
            const analysisData = data.gemini_analysis as any;
            if (analysisData.finotype) {
              setAnalysis({
                profile: analysisData.finotype,
                summary: analysisData.narrative,
                tips: Array.isArray(analysisData.tips) ? analysisData.tips : [],
                analysisByTopic: analysisData.analysisByTopic
              });
            } else {
              setAnalysis({ ...analysisData, tips: Array.isArray(analysisData.tips) ? analysisData.tips : [] } as AnalysisState);
            }
            setLoading(false);
            return;
          }

          // No analysis yet - need to run simulation
          const gameHistory = data.game_history;
          if (gameHistory?.profile && gameHistory?.job && gameHistory?.choices) {
            const forceDemo = isDemo || gameHistory.isDemo;
            const res = await simulateYear(
              gameHistory.profile,
              gameHistory.job,
              gameHistory.choices,
              forceDemo,
              locale
            );

            if (res.error && res.error !== 'SIMULATION_ERROR') {
              console.error('Simulation error:', res.error);
              // Still show results with fallback data if available
            }

            const result = {
              profile: res.finotype,
              summary: res.narrative,
              tips: res.tips,
              analysisByTopic: res.analysisByTopic
            };

            setNetWorth(res.finalBalance.toFixed(2));
            setAnalysis(result);

            // Update DB with the analysis
            if (!isDemo) {
              await supabase.from('simulations').update({
                gemini_analysis: res,
                final_balance: res.finalBalance
              }).eq('id', id);
            }
          }
        }
      } else if (isDemo) {
        setAnalysis(DEMO_ANALYSIS);
      }

      setLoading(false);
    };

    loadData();
  }, [id, isDemo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-professional flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full animate-pulse" style={{ background: 'rgba(14,165,233,0.1)' }}>
            <div className="h-2 w-2 rounded-full animate-ping" style={{ background: 'var(--color-accent)' }}></div>
            <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
              {t('loading')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-12 px-4">
      {displayName && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">{t('hey', { name: displayName })} {t('title')}</h1>
        </div>
      )}

      {analysis && (
        <div className="card-professional rounded-3xl overflow-hidden border-0">
          <PersonaCard profile={analysis.profile} netWorth={netWorth} t={t} />

          <div className="p-8 md:p-12 space-y-10">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-neutral-900">{t('behavioralSummary')}</h3>
              <p className="leading-relaxed text-lg" style={{ color: 'var(--color-text-secondary)' }}>{analysis.summary}</p>
            </div>

            <TipsSection tips={analysis.tips} />

            <FamiliarityForm onSubmit={handlePostFamiliaritySubmit} t={t} />
          </div>
        </div>
      )}

      <ResultsButtons
        locale={locale}
        onShare={handleShare}
        t={t}
        secondaryButtonText={t('playAgain')}
        secondaryButtonHref={`/${locale}/pro/game?newGame=true`}
      />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
