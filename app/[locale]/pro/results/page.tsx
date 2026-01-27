'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { simulateYear } from '@/lib/gemini';

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
  const [postFamiliarity, setPostFamiliarity] = useState<string>('');
  const [familiaritySubmitted, setFamiliaritySubmitted] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('analysis');
  const id = searchParams.get('id');
  const isDemo = searchParams.get('demo') === 'true';
  const supabase = createClient();

  const handlePostFamiliaritySubmit = async () => {
    if (!postFamiliarity) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from('profiles').update({
            post_familiarity: postFamiliarity
        }).eq('id', user.id);
        setFamiliaritySubmitted(true);
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
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>{t('loadingAnalysis')}</p>
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
          <div className="p-8 md:p-12 text-white relative overflow-hidden bg-gradient-morandi-blue">
            <div className="relative z-10 text-center">
              <h2 
                className="text-sm uppercase tracking-widest font-bold mb-3"
                style={{ opacity: 0.95, letterSpacing: '0.1em' }}
              >
                {t('yourFinancialPersona')}
              </h2>
              <div className="text-4xl md:text-5xl font-bold mb-8 leading-tight">{analysis.profile}</div>
              
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
          
          <div className="p-8 md:p-12 space-y-10">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-neutral-900">{t('behavioralSummary')}</h3>
              <p className="leading-relaxed text-lg" style={{ color: 'var(--color-text-secondary)' }}>{analysis.summary}</p>
            </div>

            {analysis.tips && Array.isArray(analysis.tips) && analysis.tips.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-neutral-900">{t('expertTips')}</h3>
                <div className="grid gap-4">
                  {analysis.tips.map((tip, idx) => (
                    <div 
                      key={idx} 
                      className="flex gap-4 items-start p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      style={{ 
                        background: 'rgba(14,165,233,0.08)',
                        borderColor: 'var(--color-accent)',
                        border: '1px solid',
                        color: 'var(--color-neutral-700)',
                        boxShadow: '0 2px 8px rgba(14,165,233,0.1)'
                      }}
                    >
                      <span 
                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg text-white"
                        style={{ background: 'var(--gradient-accent)', boxShadow: '0 2px 8px rgba(14,165,233,0.3)' }}
                      >
                        {idx + 1}
                      </span>
                      <p className="font-medium pt-1.5 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!familiaritySubmitted ? (
              <div className="card-morandi p-6 mt-8" data-html2canvas-ignore>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>{t('confidenceQuestion')}</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={postFamiliarity}
                    onChange={(e) => setPostFamiliarity(e.target.value)}
                    className="input-morandi flex-1"
                  >
                    <option value="">{t('selectLevel')}</option>
                    <option value="Beginner">{t('beginnerLevel')}</option>
                    <option value="Intermediate">{t('intermediateLevel')}</option>
                    <option value="Advanced">{t('advancedLevel')}</option>
                  </select>
                  <button
                    onClick={handlePostFamiliaritySubmit}
                    disabled={!postFamiliarity}
                    className="btn-morandi-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('submit')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="alert-success p-6 mt-8 text-center font-medium" data-html2canvas-ignore>
                {t('thanksFeedback')}
              </div>
            )}
          </div>
        </div>
      )}

      <div data-html2canvas-ignore className="flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={handleShare}
          className="btn-morandi-primary flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          {t('shareResult')}
        </button>
        <Link href={`/${locale}/pro/game`} className="btn-morandi-accent text-center">
          {t('playAgain')}
        </Link>
        <Link href={`/${locale}`} className="btn-morandi-outline text-center">
          {t('returnHome')}
        </Link>
      </div>
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
