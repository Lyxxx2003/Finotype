'use client';

import { useEffect, useState } from 'react';
import { getAnswers } from '@/lib/storage';
import { calculateFinotype } from '@/lib/logic';
import { personas } from '@/lib/data';
import Link from 'next/link';
import { Persona } from '@/types';

export default function ResultsPage() {
  const [persona, setPersona] = useState<Persona | null>(null);

  useEffect(() => {
    const answers = getAnswers();
    const type = calculateFinotype(answers);
    setPersona(personas[type]);
  }, []);

  if (!persona) return <div className="p-8 text-center">Calculating your financial DNA...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 font-sans">
      <main className="flex flex-col items-center text-center max-w-2xl bg-white p-10 rounded-3xl shadow-xl">
        <div className="text-8xl mb-6 animate-bounce">
          {persona.mascot}
        </div>
        
        <h1 className="text-2xl font-medium text-gray-500 mb-2">Your Finotype is</h1>
        <h2 className="text-5xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600" style={{WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(to right, #2563eb, #9333ea)'}}>
          {persona.name}
        </h2>
        <div className="inline-block bg-gray-100 rounded-full px-4 py-1 text-sm font-bold text-gray-600 mb-8 border border-gray-200">
          Type: {persona.id}
        </div>

        <p className="text-xl text-gray-700 leading-relaxed mb-10">
          {persona.description}
        </p>

        <div className="flex gap-4 flex-col w-full sm:w-auto">
          <Link 
            href="/analysis"
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl text-center"
          >
            See Common Pitfalls & Tips
          </Link>
          
          <Link
            href="/"
            className="w-full sm:w-auto bg-white text-gray-600 px-8 py-4 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition text-center"
          >
            Retake Test
          </Link>
        </div>
      </main>
    </div>
  );
}
