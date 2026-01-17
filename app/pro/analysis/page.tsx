'use client';

import { useEffect, useState, Suspense } from 'react';
import { GameEvent, simulateYear } from '@/lib/gemini';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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

function AnalysisContent() {
  const [analysis, setAnalysis] = useState<{
    profile: string;
    summary: string;
    tips: string[];
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [netWorth, setNetWorth] = useState<string>('0');
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = searchParams.get('id');
  const isDemo = searchParams.get('demo') === 'true';
  const supabase = createClient();

  useEffect(() => {
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
                            tips: Array.isArray(analysisData.tips) ? analysisData.tips : []
                        });
                    } else {
                        setAnalysis({ ...analysisData, tips: Array.isArray(analysisData.tips) ? analysisData.tips : [] });
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
                     const res = await simulateYear(events.profile, events.job, events.choices, forceDemo);
                     
                     if (res.error && !forceDemo) {
                         setErrorType(res.error);
                         // If REGION_BLOCKED, provide specific message. Otherwise use the narrative or generic
                         setErrorMessage(res.error === 'REGION_BLOCKED' 
                            ? 'AI unavailable in your region. Please use Demo Mode.' 
                            : (res.narrative && res.narrative.includes("failed") ? res.narrative : "Simulation generation failed."));
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
                         tips: res.tips
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
                        setAnalysis({ ...result, tips: Array.isArray(result.tips) ? result.tips : [] });
                    }
                }
            } catch (err: any) {
                console.error('Analysis Error', err);
                setErrorType('NETWORK_ERROR');
                setErrorMessage('Failed to generate analysis.');
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
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg text-gray-600">Gemini is analyzing your financial psychology...</p>
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Simulation Results</h1>
        <p className="text-xl text-gray-600">Final Net Worth: <span className={Number(netWorth) > 10000 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>${netWorth}</span></p>
      </div>

      {analysis && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-blue-600 p-8 text-white">
                  <h2 className="text-lg opacity-90 uppercase tracking-widest font-semibold">Your Financial Persona</h2>
                  <div className="mt-2 text-5xl font-bold">{analysis.profile}</div>
              </div>
              
              <div className="p-8 space-y-8">
                  <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Behavioral Summary</h3>
                      <p className="text-gray-700 leading-relaxed text-lg">{analysis.summary}</p>
                  </div>

                  {analysis.tips && Array.isArray(analysis.tips) && analysis.tips.length > 0 && (
                  <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Gemini's Expert Tips</h3>
                      <div className="grid gap-4">
                          {analysis.tips.map((tip, idx) => (
                              <div key={idx} className="flex gap-4 items-start p-4 bg-yellow-50 rounded-lg text-yellow-900">
                                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-yellow-200 rounded-full font-bold text-yellow-800">
                                      {idx + 1}
                                  </span>
                                  <p className="font-medium pt-1">{tip}</p>
                              </div>
                          ))}
                      </div>
                  </div>
                  )}
              </div>
          </div>
      )}

      <div className="flex justify-center gap-4">
          <Link href="/pro/game" className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
              Play Again
          </Link>
          <Link href="/" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Return Home
          </Link>
      </div>

      {errorType && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-2xl space-y-6">
                  <div className="text-center space-y-2">
                       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                           <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                           </svg>
                       </div>
                       <h3 className="text-2xl font-bold text-gray-900">
                           {errorType === 'LOCATION_NOT_SUPPORTED' || errorType === 'REGION_BLOCKED' ? 'Region Not Supported' :
                            errorType === 'RATE_LIMIT_EXCEEDED' ? 'Too Many Requests' :
                            errorType === 'NETWORK_ERROR' ? 'Connection Issue' :
                            errorType === 'INVALID_API_KEY' ? 'Configuration Error' :
                            errorType === 'SAFETY_FILTER' ? 'Content Filtered' :
                            errorType === 'GENERATION_ERROR' ? 'AI Generation Issue' :
                            'Error Occurred'}
                       </h3>
                       <p className="text-gray-600">
                           {errorMessage}
                       </p>
                       <div className="text-left mt-4 p-4 bg-gray-50 rounded-lg">
                           <p className="text-xs text-gray-500 font-mono">Error Code: {errorType}</p>
                       </div>
                  </div>
                  <div className="flex flex-col gap-3">
                      <button
                          onClick={() => {
                              window.location.reload();
                          }}
                          className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 font-bold text-center"
                      >
                          Retry Connection
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
                          className="w-full bg-orange-100 text-orange-700 py-3 rounded-lg hover:bg-orange-200 font-bold text-center"
                      >
                          Continue in Demo Mode
                      </button>
                      <button
                          onClick={() => {
                              clearAnswers();
                              router.replace('/standard/question/1');
                          }}
                          className="w-full border border-gray-200 text-gray-600 py-3 rounded-lg hover:bg-gray-50 font-medium text-center"
                      >
                          Switch to Simple Q/A Test
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
        <Suspense fallback={<div>Loading...</div>}>
            <AnalysisContent />
        </Suspense>
    )
}
