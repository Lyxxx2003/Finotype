'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { simulateYear } from '@/lib/gemini';
import { PersonaCard } from '@/components/results/PersonaCard';
import { TipsSection } from '@/components/results/TipsSection';
import { FamiliarityForm } from '@/components/results/FamiliarityForm';
import { ShareButtons } from '@/components/results/ShareButtons';

const DEMO_ANALYSIS = {
  profile: "Strategic Wealth Builder",
  summary: "This is a demo analysis. You demonstrate a balanced approach to risk and reward.",
  tips: [
    "Consider automating your savings to reduce decision fatigue.",
    "Diversify your portfolio to hedge against market volatility.",
    "Set clear long-term goals to maintain focus during market dips."
  ]
};

interface AnalysisState {
  profile: string;
  summary: string;
  tips: string[];
  analysisByTopic?: Record<string, string>;
  error?: string;
}

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

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1080;
      canvas.height = 1080;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.arc(150, 150, 300, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.beginPath();
      ctx.arc(900, 900, 250, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 280px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('💰', canvas.width / 2, 420);

      ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Simulate your financial future', canvas.width / 2, 680);

      ctx.font = '48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('finotype.vercel.app', canvas.width / 2, 820);

      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('Interactive financial personality game', canvas.width / 2, 950);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Could not generate image");
          return;
        }
        
        const filename = `finotype-pro-${Date.now()}.png`;
        const file = new File([blob], filename, { type: 'image/png' });
        const shareUrl = `https://finotype.vercel.app/${locale}`;
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: "Finotype - Financial Personality Game",
              text: `Simulate your financial future! ${shareUrl}`,
              files: [file]
            });
          } catch (err) {
            console.log('Share canceled or failed', err);
          }
        } else {
          const link = document.createElement('a');
          link.download = filename;
          link.href = canvas.toDataURL();
          link.click();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to generate share image', err);
      alert('Failed to generate share image. Please try again.');
    }
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
      } else {
        // Try localStorage fallback
        const historyStr = localStorage.getItem('gameHistory');
        if (historyStr) {
          const gameHistory = JSON.parse(historyStr);
          if (gameHistory?.profile && gameHistory?.job && gameHistory?.choices) {
            const forceDemo = isDemo || gameHistory.isDemo;
            const res = await simulateYear(
              gameHistory.profile,
              gameHistory.job,
              gameHistory.choices,
              forceDemo,
              locale
            );
            
            const result = {
              profile: res.finotype,
              summary: res.narrative,
              tips: res.tips,
              analysisByTopic: res.analysisByTopic
            };
            
            setNetWorth(res.finalBalance.toFixed(2));
            setAnalysis(result);
          }
        } else if (isDemo) {
          setAnalysis(DEMO_ANALYSIS);
        }
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [id, isDemo]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold text-neutral-900">{t('loadingAnalysis')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-12 px-4">
      {displayName && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900">{t('hey', {name: displayName})}</h2>
        </div>
      )}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-neutral-900">{t('title')}</h1>
      </div>

      {analysis && (
        <div className="card-morandi rounded-3xl overflow-hidden border-0">
          <PersonaCard profile={analysis.profile} netWorth={netWorth} t={t} />
          
          <div className="p-8 md:p-12 space-y-10">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-neutral-900">{t('behavioralSummary')}</h3>
              <p className="leading-relaxed text-lg" style={{ color: 'var(--color-text-secondary)' }}>{analysis.summary}</p>
            </div>

            <TipsSection tips={analysis.tips} t={t} />

            <FamiliarityForm onSubmit={handlePostFamiliaritySubmit} t={t} />
          </div>
        </div>
      )}

      <ShareButtons locale={locale} onShare={handleShare} t={t} />
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
