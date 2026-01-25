'use client';

import { useEffect, useState, Suspense } from 'react';
import { GameEvent, simulateYear } from '@/lib/gemini';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { clearAnswers } from '@/lib/storage';

const DEMO_ANALYSIS = {
  profile: "Strategic Wealth Builder",
  summary: "This is a demo analysis. You demonstrate a balanced approach to risk and reward. You make calculated decisions but sometimes hesitate when market volatility increases. Your financial psychology suggests a strong foundation with room for more aggressive growth strategies.",
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

function AnalysisContent() {
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [loading, setLoading] = useState(true);
  const [netWorth, setNetWorth] = useState<string>('0');
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [postFamiliarity, setPostFamiliarity] = useState<string>('');
  const [familiaritySubmitted, setFamiliaritySubmitted] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
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
      // Create a simplified share card with just mascot + branding + link
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size (Instagram post friendly: 1080x1080)
      canvas.width = 1080;
      canvas.height = 1080;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Decorative circles
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.arc(150, 150, 300, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.beginPath();
      ctx.arc(900, 900, 250, 0, Math.PI * 2);
      ctx.fill();

      // Financial emoji (generic for pro mode)
      ctx.font = 'bold 280px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('💰', canvas.width / 2, 420);

      // Simulate your financial future text
      ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Simulate your financial future', canvas.width / 2, 680);

      // Website URL
      ctx.font = '48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('finotype.vercel.app', canvas.width / 2, 820);

      // Small branding at bottom
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('Interactive financial personality game', canvas.width / 2, 950);

      // Convert to blob and share
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
          // Fallback download
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
    const loadDisplayName = async () => {
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
    };
    
    loadDisplayName();
    
    const fetchData = async () => {
        let events: any = null;
        let finalBalance = 0;

        // 1. Try fetching from Supabase if ID exists
        if (id) {
            const { data, error } = await supabase
                .from('simulations')
                .select('*')
                .eq('id', id)
                .single();
            
            if (data) {
                finalBalance = data.final_balance;
                setNetWorth(finalBalance?.toFixed(2) || '0');
                
                // If analysis already exists, use it
                // BUT if we are forcing demo now (e.g. user clicked "Check Demo" on error), 
                // we might want to regenerate purely locally instead of showing the old (potentially empty/error) analysis
                // implicitly, if isDemo is true, we might want to re-run simulation locally.
                // However, usually existing analysis is better. 
                // Let's stick to: use existing if avail, unless it's null.
                if (data.gemini_analysis && !isDemo) {
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
                
                events = data.game_history;
            }
        } 
        
        // 2. Fallback to localStorage if no ID or DB fetch failed
        if (!events) {
            try {
                const historyData = localStorage.getItem('gameHistory');
                const finalNetWorth = localStorage.getItem('finalNetWorth');
                if (finalNetWorth) setNetWorth(Number(finalNetWorth).toFixed(2));
                if (historyData) events = JSON.parse(historyData);
            } catch (e) {
               console.error("Error parsing local storage", e);
            }
        }

        // 3. Logic Branch
        if (events) {
            try {
                const isProSimulation = !Array.isArray(events) && events.profile && events.job;
                let result: any = null;

                if (isProSimulation) {
                     // Check if we should use demo mode (local simulation)
                     const forceDemo = isDemo || events.isDemo;
                     
                     // Run simulation (Gemini or Fallback/Demo)
                     const res = await simulateYear(events.profile, events.job, events.choices, forceDemo, locale);
                     
                     if (res.error && !forceDemo) {
                         setErrorType(res.error);
                         // If REGION_BLOCKED, provide specific message. Otherwise use the narrative or generic
                         setErrorMessage(res.error === 'REGION_BLOCKED' 
                            ? t('regionBlocked') 
                            : (res.narrative && res.narrative.includes("failed") ? res.narrative : t('simulationFailed')));
                         setLoading(false);
                         return;
                     }

                     if (res.error === 'SIMULATION_ERROR') {
                         console.warn("Simulation fell back to local calculation");
                     }

                     result = {
                         ...res,
                         profile: res.finotype,
                         summary: res.narrative,
                         tips: res.tips,
                         analysisByTopic: res.analysisByTopic
                     };
                     
                     // Update state
                     setNetWorth(res.finalBalance.toFixed(2));
                     setAnalysis(result);
                     
                     // Update DB if not just a demo view
                     if (id && !isDemo) { // Don't overwrite real analysis with demo analysis unless intended
                         await supabase.from('simulations').update({ 
                             gemini_analysis: res,
                             final_balance: res.finalBalance
                         }).eq('id', id);
                     }

                } else {
                    // Legacy code for simple QA game...
                    if (isDemo) {
                         setAnalysis(DEMO_ANALYSIS);
                         setLoading(false);
                         return;
                    }

                    // ... existing legacy fetch logic ...
                    const res = await fetch('/api/analysis/ai', {
                        method: 'POST',
                        body: JSON.stringify({ events })
                    });
                     // (Keep existing error handling for legacy if needed, or simplify)
                    if (res.ok) {
                        result = await res.json();
                        setAnalysis({ ...result, tips: Array.isArray(result.tips) ? result.tips : [] } as AnalysisState);
                    }
                }
            } catch (err: any) {
                console.error('Analysis Error', err);
                setErrorType('NETWORK_ERROR');
                setErrorMessage(t('analysisGenerationFailed'));
            } finally {
                setLoading(false);
            }
        } else {
            // No events found.
            if (isDemo) {
                // If checking demo without game data, show static content
                setAnalysis(DEMO_ANALYSIS);
                setLoading(false);
            } else {
                setLoading(false);
                // Optionally show "No data found" state
            }
        }
    };
    fetchData();
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
          <h2 className="text-3xl font-bold text-morandi-dark">{t('hey', {name: displayName})}</h2>
        </div>
      )}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-morandi-dark">{t('title')}</h1>
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
                  {/* Decorative elements - Morandi style */}
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
                      <h3 className="text-2xl font-bold mb-4 text-morandi-dark">{t('behavioralSummary')}</h3>
                      <p className="leading-relaxed text-lg" style={{ color: 'var(--color-text-secondary)' }}>{analysis.summary}</p>
                  </div>

                  {analysis.tips && Array.isArray(analysis.tips) && analysis.tips.length > 0 && (
                  <div>
                      <h3 className="text-2xl font-bold mb-6 text-morandi-dark">{t('expertTips')}</h3>
                      <div className="grid gap-4">
                          {analysis.tips.map((tip, idx) => (
                              <div 
                                key={idx} 
                                className="flex gap-4 items-start p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                style={{ 
                                  background: 'linear-gradient(135deg, rgba(245,217,168,0.3) 0%, rgba(232,184,125,0.2) 100%)',
                                  borderColor: 'var(--color-accent)',
                                  border: '1px solid',
                                  color: 'var(--color-neutral-700)',
                                  boxShadow: '0 2px 8px rgba(232,184,125,0.1)'
                                }}
                              >
                                  <span 
                                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg text-white bg-gradient-morandi-warm"
                                    style={{ boxShadow: '0 2px 8px rgba(232,184,125,0.3)' }}
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

      {errorType && (
          <div className="modal-backdrop">
              <div className="modal-content space-y-6">
                  <div className="text-center space-y-2">
                       <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, rgba(196,148,139,0.2) 0%, rgba(196,148,139,0.1) 100%)' }}>
                           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-terracotta)' }}>
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                           </svg>
                       </div>
                       <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                           {errorType === 'LOCATION_NOT_SUPPORTED' || errorType === 'REGION_BLOCKED' ? 'Region Not Supported' :
                            errorType === 'RATE_LIMIT_EXCEEDED' ? 'Too Many Requests' :
                            errorType === 'NETWORK_ERROR' ? 'Connection Issue' :
                            errorType === 'INVALID_API_KEY' ? 'Configuration Error' :
                            errorType === 'SAFETY_FILTER' ? 'Content Filtered' :
                            errorType === 'GENERATION_ERROR' ? 'AI Generation Issue' :
                            'Error Occurred'}
                       </h3>
                       <p style={{ color: 'var(--color-text-secondary)' }}>
                           {errorMessage}
                       </p>
                       <div className="text-left mt-4 p-4 rounded-lg" style={{ background: 'var(--color-neutral-100)' }}>
                           <p className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>Error Code: {errorType}</p>
                       </div>
                  </div>
                  <div className="flex flex-col gap-3">
                      <button
                          onClick={() => {
                              window.location.reload();
                          }}
                          className="btn-morandi-secondary w-full py-3"
                      >
                          {t('retryConnection')}
                      </button>
                      <button
                          onClick={() => {
                              // Force demo mode for this analysis
                              const params = new URLSearchParams(searchParams);
                              params.set('demo', 'true');
                              router.push(`${pathname}?${params.toString()}`);
                              // The useEffect will re-run because searchParams changed (via router push potentially, but check dependency)
                              // Actually simple router push might not trigger re-render of useSearchParams instantly in some NextJS versions/app router setups
                              // But usually it does. 
                              // We also need to clear error so it re-fetches.
                              setErrorType(null); 
                              setLoading(true); // show loading while re-fetching
                          }}
                          className="btn-morandi-accent w-full py-3"
                      >
                          {t('continueDemo')}
                      </button>
                      <button
                          onClick={() => {
                              clearAnswers();
                              router.replace(`/${locale}/standard/question/1`);
                          }}
                          className="btn-morandi-outline w-full py-3"
                      >
                          {t('switchToQA')}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default function AnalysisPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>Loading...</div>}>
            <AnalysisContent />
        </Suspense>
    )
}
