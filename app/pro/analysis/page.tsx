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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [netWorth, setNetWorth] = useState<string>('0');
  const [showLocationError, setShowLocationError] = useState(false);
  
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
                const result = await res.json();

                if (result.error === 'LOCATION_NOT_SUPPORTED') {
                    setShowLocationError(true);
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

            } catch (err) {
                console.error(err);
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

      {showLocationError && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-2xl space-y-6">
                  <div className="text-center space-y-2">
                       <h3 className="text-2xl font-bold text-gray-900">Wait a second!</h3>
                       <p className="text-gray-600">
                           It seems Gemini AI isn't available in your region yet.
                           But you can still test your financial personality!
                       </p>
                  </div>
                  <div className="flex flex-col gap-3">
                      <button
                          onClick={() => {
                              clearAnswers();
                              router.push('/question/1');
                          }}
                          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium text-center"
                      >
                          Go to Simple Q/A Version
                      </button>
                      <button
                          onClick={() => setShowLocationError(false)}
                          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
                      >
                          Cancel
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
