'use client';

import { useEffect, useState } from 'react';
import { getAnswers, getDisplayName } from '@/lib/storage';
import { calculateFinotype } from '@/lib/logic';
import { personas } from '@/lib/data';
import Link from 'next/link';
import { Persona } from '@/types';

export default function AnalysisPage() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    const answers = getAnswers();
    const type = calculateFinotype(answers);
    setPersona(personas[type]);
    
    const name = getDisplayName();
    if (name) {
      setDisplayName(name);
    }
  }, []);

  if (!persona) return <div className="p-8 text-center">Loading analysis...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl w-full">
        {displayName && (
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Hey {displayName}! 👋</h2>
          </div>
        )}
        <header className="mb-12 border-b border-gray-100 pb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{persona.mascot}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{persona.name} Analysis</h1>
              <p className="text-gray-500">Finotype: {persona.id}</p>
            </div>
          </div>
          <Link href="/standard/results" className="text-blue-600 font-medium hover:underline">
             ← Back to Summary
          </Link>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Strengths */}
          <section className="bg-green-50 p-8 rounded-2xl border border-green-100">
            <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
              ✨ Your Strengths
            </h2>
            <ul className="space-y-4">
              {persona.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-green-900">
                  <span className="mt-1 block w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                  {s}
                </li>
              ))}
            </ul>
          </section>

          {/* Pitfalls */}
          <section className="bg-red-50 p-8 rounded-2xl border border-red-100">
            <h2 className="text-xl font-bold text-red-800 mb-6 flex items-center gap-2">
              ⚠️ Common Pitfalls
            </h2>
            <ul className="space-y-4">
              {persona.pitfalls.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-red-900">
                  <span className="mt-1 block w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                  {p}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Actionable Tips */}
        <section className="bg-blue-50 p-8 rounded-2xl border border-blue-100 mb-12">
          <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center gap-2">
            💡 Tips for You
          </h2>
          <div className="grid gap-4">
            {persona.tips.map((tip, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 text-blue-900 flex gap-4 items-center">
                 <span className="font-bold text-blue-200 text-2xl">0{i+1}</span>
                 {tip}
              </div>
            ))}
          </div>
        </section>

        <div className="text-center">
          <Link
             href="/"
             className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition"
          >
            Start Over
          </Link>
        </div>
      </div>
    </div>
  );
}
