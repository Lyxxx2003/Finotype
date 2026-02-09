'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import RadarChart from '@/components/RadarChart';

export default function TechnicalQuestionPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to login if user is not authenticated
        router.push(`/${locale}/login`);
        return;
      }

      setUser(user);
    };
    checkUser();
  }, [locale, router]);

  const [scores, setScores] = useState({
    paycheckLiteracy: 75,
    housingBills: 80,
    spendingControl: 65,
    creditDebt: 70,
    safetyNet: 60,
    fraudSafety: 85,
  });

  const handleScoreChange = (key: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setScores((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, numValue)),
    }));
  };

  const inputFields = [
    { key: 'paycheckLiteracy', label: 'Paycheck Literacy', description: 'Understanding paychecks, deductions, and net income' },
    { key: 'housingBills', label: 'Housing & Bills', description: 'Managing rent, utilities, and household expenses' },
    { key: 'spendingControl', label: 'Spending Control (Necessities)', description: 'Budgeting for essential expenses' },
    { key: 'creditDebt', label: 'Credit & Debt', description: 'Credit management and debt repayment strategies' },
    { key: 'safetyNet', label: 'Safety Net (Emergency Readiness)', description: 'Emergency fund and financial preparedness' },
    { key: 'fraudSafety', label: 'Fraud & Safety', description: 'Protecting against scams and financial fraud' },
  ];

  return (
    <div className="min-h-screen p-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            Financial Literacy Assessment
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Enter scores (0-100) for each financial literacy area to visualize your strengths
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Input Section */}
          <div className="space-y-6 lg:sticky lg:top-6">
            <div
              className="p-6 rounded-xl shadow-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderWidth: '1px',
                borderColor: 'var(--color-neutral-200)'
              }}
            >
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text)' }}>
                Score Inputs
              </h2>

              <div className="space-y-4">
                {inputFields.map((field) => (
                  <div key={field.key}>
                    <label className="block mb-2">
                      <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                        {field.label}
                      </span>
                      <span
                        className="block text-sm mt-1"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {field.description}
                      </span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={scores[field.key as keyof typeof scores]}
                        onChange={(e) => handleScoreChange(field.key, e.target.value)}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${scores[field.key as keyof typeof scores]}%, var(--color-neutral-200) ${scores[field.key as keyof typeof scores]}%, var(--color-neutral-200) 100%)`,
                        }}
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores[field.key as keyof typeof scores]}
                        onChange={(e) => handleScoreChange(field.key, e.target.value)}
                        className="w-20 px-3 py-2 rounded-lg text-center font-semibold"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          color: 'var(--color-text)',
                          borderWidth: '1px',
                          borderColor: 'var(--color-neutral-300)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div
              className="p-6 rounded-xl shadow-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderWidth: '1px',
                borderColor: 'var(--color-neutral-200)'
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                Overall Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                    {Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6)}
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Average Score
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                    {Math.max(...Object.values(scores))}
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Highest Score
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div
            className="p-8 rounded-xl shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderWidth: '1px',
              borderColor: 'var(--color-neutral-200)'
            }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--color-text)' }}>
              Financial Literacy Radar
            </h2>
            <RadarChart scores={scores} />

            <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
              <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
                The radar chart visualizes your financial literacy across six key areas.
                Larger shapes indicate stronger financial capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
