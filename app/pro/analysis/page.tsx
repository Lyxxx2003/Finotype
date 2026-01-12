'use client';

import { useEffect, useState, Suspense } from 'react';
import { GameEvent } from '@/lib/gemini';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { clearAnswers } from '@/lib/storage';

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
  const id = searchParams.get('id');
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
        let events: GameEvent[] | null = null;
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
                setNetWorth(finalBalance.toFixed(2));
                
                // If analysis already exists, use it
                if (data.gemini_analysis) {
                    setAnalysis(data.gemini_analysis as any);
                    setLoading(false);
                    return;
                }
                
                events = data.game_history as any;
            }
        } 
        
        // 2. Fallback to localStorage if no ID or DB fetch failed
        if (!events) {
            const historyData = localStorage.getItem('gameHistory');
            const finalNetWorth = localStorage.getItem('finalNetWorth');
            if (finalNetWorth) setNetWorth(Number(finalNetWorth).toFixed(2));
            if (historyData) events = JSON.parse(historyData);
        }

        // 3. Run Analysis if we have events
        if (events) {
            try {
                const res = await fetch('/api/analysis/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ events })
                });

                if (!res.ok) {
                    console.error('[Fetch Error]', {
                        status: res.status,
                        statusText: res.statusText,
                        url: res.url
                    });
                    
                    if (res.status === 429) {
                        setErrorType('RATE_LIMIT_EXCEEDED');
                        setErrorMessage('Too many requests. Please try again in a few minutes.');
                    } else if (res.status === 401 || res.status === 403) {
                        setErrorType('AUTH_ERROR');
                        setErrorMessage('Authentication failed. Please refresh and try again.');
                    } else if (res.status >= 500) {
                        setErrorType('SERVER_ERROR');
                        setErrorMessage('Server error occurred. Please try again later.');
                    } else {
                        setErrorType('FETCH_ERROR');
                        setErrorMessage(`Request failed with status ${res.status}`);
                    }
                    setLoading(false);
                    return;
                }

                const result = await res.json();

                // Handle Gemini-specific errors
                if (result.error) {
                    console.error('[Gemini Error]', result.error);
                    setErrorType(result.error);
                    
                    switch(result.error) {
                        case 'LOCATION_NOT_SUPPORTED':
                            setErrorMessage('Gemini AI is not available in your region yet.');
                            break;
                        case 'RATE_LIMIT_EXCEEDED':
                            setErrorMessage('Too many requests. Please wait a few minutes.');
                            break;
                        case 'INVALID_API_KEY':
                            setErrorMessage('API configuration issue. Please contact support.');
                            break;
                        case 'NETWORK_ERROR':
                            setErrorMessage('Network connection issue. Check your internet.');
                            break;
                        case 'SAFETY_FILTER':
                            setErrorMessage('Content was blocked by safety filters.');
                            break;
                        default:
                            setErrorMessage('An unexpected error occurred.');
                    }
                    setLoading(false);
                    return;
                }

                setAnalysis(result);

                // 4. Update Supabase with result if we have an ID
                if (id && result) {
                    await supabase
                        .from('simulations')
                        .update({ gemini_analysis: result })
                        .eq('id', id);
                }

            } catch (err: any) {
                console.error('[Network/Parse Error]', {
                    message: err.message,
                    name: err.name,
                    stack: err.stack
                });
                setErrorType('NETWORK_ERROR');
                setErrorMessage('Failed to connect to the server. Check your internet connection.');
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };
    fetchData();
  }, [id]);

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
                           {errorType === 'LOCATION_NOT_SUPPORTED' ? 'Region Not Supported' :
                            errorType === 'RATE_LIMIT_EXCEEDED' ? 'Too Many Requests' :
                            errorType === 'NETWORK_ERROR' ? 'Connection Issue' :
                            errorType === 'INVALID_API_KEY' ? 'Configuration Error' :
                            errorType === 'SAFETY_FILTER' ? 'Content Filtered' :
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
                      {errorType === 'LOCATION_NOT_SUPPORTED' && (
                          <button
                              onClick={() => {
                                  clearAnswers();
                                  router.push('/question/1');
                              }}
                              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium text-center"
                          >
                              Go to Simple Q/A Version
                          </button>
                      )}
                      {(errorType === 'NETWORK_ERROR' || errorType === 'SERVER_ERROR' || errorType === 'RATE_LIMIT_EXCEEDED') && (
                          <button
                              onClick={() => window.location.reload()}
                              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium text-center"
                          >
                              Retry
                          </button>
                      )}
                      <button
                          onClick={() => router.push('/pro/game')}
                          className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-medium"
                      >
                          Play Again
                      </button>
                      <button
                          onClick={() => setErrorType(null)}
                          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
                      >
                          Close
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
