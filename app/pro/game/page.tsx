'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateScenario, GameState, GameEvent } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/client';

const MAX_DAYS = 5;

export default function GamePage() {
  const router = useRouter();
  const supabase = createClient();
  
  // Game State
  const [day, setDay] = useState(1);
  const [cash, setCash] = useState(10000);
  const [shares, setShares] = useState(0);
  const [stockPrice, setStockPrice] = useState(100);
  const [loan, setLoan] = useState(0);
  const [news, setNews] = useState("Welcome to the market. NebulaAI is the hottest stock right now.");
  const [history, setHistory] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateNetWorth = () => cash + (shares * stockPrice) - loan;

  const handleAction = async (action: 'buy' | 'sell' | 'hold' | 'loan' | 'repay', amount?: number) => {
    setLoading(true);
    let newCash = cash;
    let newShares = shares;
    let newLoan = loan;
    
    // 1. Process Action
    if (action === 'buy') {
      const cost = amount! * stockPrice;
      if (cost > newCash) {
        alert("sNot enough cash!");
        setLoading(false);
        return;
      }
      newCash -= cost;
      newShares += amount!;
    } else if (action === 'sell') {
      if (amount! > newShares) {
        alert("Not enough shares!");
        setLoading(false);
        return;
      }
      newCash += amount! * stockPrice;
      newShares -= amount!;
    } else if (action === 'loan') {
        newLoan += 5000;
        newCash += 5000;
        alert("Took a $5,000 loan (10% interest per day applied at end of game)");
    } else if (action === 'repay') {
        if (newCash < 5000) {
            alert("Not enough cash to repay loan chunk");
            setLoading(false);
            return;
        }
        newLoan -= 5000;
        newCash -= 5000;
    }

    // 2. Log Event
    const event: GameEvent = {
        day,
        action,
        amount,
        priceAtAction: stockPrice
    };
    const newHistory = [...history, event];

    // 3. Advance to next day logic
    if (day >= MAX_DAYS) {
        // Game Over
        await finishGame(newHistory, newCash, newShares, newLoan);
        return;
    }

    // 4. Generate Next Day Scenario
    try {
        const scenario = await generateScenario(day + 1, stockPrice);
        setStockPrice(prev => Number((prev * (1 + scenario.priceChangePercent)).toFixed(2)));
        setNews(scenario.news);
        setDay(d => d + 1);
        setCash(newCash);
        setShares(newShares);
        setLoan(newLoan);
        setHistory(newHistory);
    } catch (e) {
        console.error("Failed to generate scenario", e);
    } finally {
        setLoading(false);
    }
  };

  const finishGame = async (finalHistory: GameEvent[], finalCash: number, finalShares: number, finalLoan: number) => {
      // Calculate final net worth (simple interest for loan just for demo)
      const finalPrice = stockPrice; // Use last known price
      const totalLoanRepayment = finalLoan * 1.5; // Heavy interest penalty
      const netWorth = finalCash + (finalShares * finalPrice) - totalLoanRepayment;

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
          const { data, error } = await supabase.from('simulations').insert({
              user_id: user.id,
              final_balance: netWorth,
              game_history: finalHistory as any 
          }).select().single();

          if (data) {
             router.push(`/pro/analysis?id=${data.id}`);
             return;
          } else if (error) {
              console.error("Error saving game:", error);
          }
      }

      // Fallback if save fails or user not logged in (though they should be)
      localStorage.setItem('gameHistory', JSON.stringify(finalHistory));
      localStorage.setItem('finalNetWorth', netWorth.toString());
      
      router.push('/pro/analysis');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-500">Day</div>
            <div className="text-2xl font-bold text-blue-700">{day} / {MAX_DAYS}</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-500">Cash</div>
            <div className="text-2xl font-bold text-green-700">${cash.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-500">Net Worth</div>
            <div className="text-2xl font-bold text-purple-700">${calculateNetWorth().toFixed(2)}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">NebulaAI Stock</div>
            <div className="text-2xl font-bold text-gray-900">${stockPrice.toFixed(2)}</div>
        </div>
        {(loan > 0) && (
            <div className="p-4 bg-red-50 rounded-lg col-span-full md:col-span-1 border border-red-200">
                <div className="text-sm text-red-500">Outstanding Loan</div>
                <div className="text-xl font-bold text-red-700">-${loan}</div>
            </div>
        )}
      </div>

      {/* Main Game Area */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <h2 className="text-xl font-semibold opacity-80 mb-2">Market News Feed</h2>
              <p className="text-2xl font-medium leading-relaxed">"{news}"</p>
          </div>

          <div className="p-8">
              <h3 className="text-lg font-semibold mb-6">Make your move</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                       <label className="block text-sm font-medium text-gray-700">Shares Owned: {shares}</label>
                       <div className="flex gap-2">
                           <button 
                                onClick={() => handleAction('buy', 10)}
                                disabled={loading || cash < stockPrice * 10}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                           >
                               Buy 10
                           </button>
                           <button 
                                onClick={() => handleAction('buy', 50)}
                                disabled={loading || cash < stockPrice * 50}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                           >
                               Buy 50
                           </button>
                       </div>
                  </div>

                  <div className="space-y-2">
                       <label className="block text-sm font-medium text-gray-700">Positions Value: ${(shares * stockPrice).toFixed(2)}</label>
                       <div className="flex gap-2">
                           <button 
                                onClick={() => handleAction('sell', 10)}
                                disabled={loading || shares < 10}
                                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                           >
                               Sell 10
                           </button>
                           <button 
                                onClick={() => handleAction('sell', shares)} // Sell All
                                disabled={loading || shares === 0}
                                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                           >
                               Sell All
                           </button>
                       </div>
                  </div>

                  <div className="space-y-2">
                       <label className="block text-sm font-medium text-gray-700">Liquidity & Wait</label>
                       <div className="flex gap-2">
                           <button 
                                onClick={() => handleAction('hold')}
                                disabled={loading}
                                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium"
                           >
                               Hold (Skip Day)
                           </button>
                       </div>
                  </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Financial Tools</h4>
                  <div className="flex gap-4">
                      <button 
                          onClick={() => handleAction('loan')} 
                          disabled={loading}
                          className="px-4 py-2 border border-yellow-600 text-yellow-700 rounded hover:bg-yellow-50 text-sm font-medium"
                      >
                          Request Loan ($5,000)
                      </button>
                      {loan > 0 && (
                          <button 
                              onClick={() => handleAction('repay')} 
                              disabled={loading || cash < 5000}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium"
                          >
                              Repay Loan ($5,000)
                          </button>
                      )}
                  </div>
              </div>
          </div>
      </div>
      
      {loading && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="text-xl font-bold text-blue-600 animate-pulse">Simulating Market...</div>
          </div>
      )}
    </div>
  );
}
