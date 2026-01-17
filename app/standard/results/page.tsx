'use client';

import { useEffect, useState, useRef } from 'react';
import { getAnswers } from '@/lib/storage';
import { calculateFinotype } from '@/lib/logic';
import { personas } from '@/lib/data';
import Link from 'next/link';
import { Persona } from '@/types';
import html2canvas from 'html2canvas';

export default function ResultsPage() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const answers = getAnswers();
    const type = calculateFinotype(answers);
    setPersona(personas[type]);
  }, []);

  const handleShare = async () => {
    if (!resultRef.current || !persona) return;
    
    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      } as any);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const file = new File([blob], `finotype-${persona.id}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `I'm a ${persona.name}!`,
              text: `I discovered my financial personality type: ${persona.name}. Check out yours using Finotype!`,
              files: [file]
            });
          } catch (err) {
            console.log('Share canceled or failed', err);
          }
        } else {
            // Fallback download
            const link = document.createElement('a');
            link.download = `finotype-${persona.id}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
      });
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to generate image. Please try again.');
    }
  };

  if (!persona) return <div className="p-8 text-center">Calculating your financial DNA...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 font-sans">
      <main 
        ref={resultRef} 
        className="flex flex-col items-center text-center max-w-2xl bg-white p-10 rounded-3xl shadow-xl border border-gray-100"
        style={{ backgroundColor: '#ffffff', borderColor: '#f3f4f6' }}
      >
        <div className="text-8xl mb-6 animate-bounce">
          {persona.mascot}
        </div>
        
        <h1 
            className="text-2xl font-medium text-gray-500 mb-2"
            style={{ color: '#6b7280' }}
        >
            Your Finotype is
        </h1>
        <h2 className="text-5xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600" style={{WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(to right, #2563eb, #9333ea)', color: '#111827'}}>
          {persona.name}
        </h2>
        <div 
            className="inline-block bg-gray-100 rounded-full px-4 py-1 text-sm font-bold text-gray-600 mb-8 border border-gray-200"
            style={{ backgroundColor: '#f3f4f6', color: '#4b5563', borderColor: '#e5e7eb' }}
        >
          Type: {persona.id}
        </div>

        <p 
            className="text-xl text-gray-700 leading-relaxed mb-10"
            style={{ color: '#374151' }}
        >
          {persona.description}
        </p>

        <div data-html2canvas-ignore className="flex gap-4 flex-col w-full sm:w-auto">
          <button
            onClick={handleShare}
            className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Share My Result
          </button>

          <Link 
            href="/standard/analysis"
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
