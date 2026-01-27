'use client';

import { useEffect, useState } from 'react';
import { getAnswers, getDisplayName } from '@/lib/storage';
import { calculateFinotype } from '@/lib/logic';
import { personas } from '@/lib/data';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Persona } from '@/types';

export default function ResultsPage() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const params = useParams();
  const locale = params.locale as string;
  const tPersonas = useTranslations('personas');
  const tResults = useTranslations('results');

  useEffect(() => {
    const answers = getAnswers();
    const type = calculateFinotype(answers);
    setPersona(personas[type]);
    
    const name = getDisplayName();
    if (name) {
      setDisplayName(name);
    }
  }, []);

  const handleShare = async () => {
    if (!persona) return;

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
      gradient.addColorStop(0, '#2563eb');
      gradient.addColorStop(1, '#1e40af');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Decorative circles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.arc(150, 150, 300, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(900, 900, 250, 0, Math.PI * 2);
      ctx.fill();

      // Mascot emoji (large)
      ctx.font = 'bold 280px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(persona.mascot, canvas.width / 2, 420);

      // "What's your Finotype?" text
      ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText("What's your Finotype?", canvas.width / 2, 680);

      // Website URL
      ctx.font = '48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('finotype.vercel.app', canvas.width / 2, 820);

      // Small branding at bottom
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('Discover your financial personality', canvas.width / 2, 950);

      // Convert to blob and share
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Could not generate image");
          return;
        }
        
        const filename = `finotype-${persona.id}-${Date.now()}.png`;
        const file = new File([blob], filename, { type: 'image/png' });
        const shareUrl = `https://finotype.vercel.app/${locale}`;
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: "What's your Finotype?",
              text: `Discover your financial personality! ${shareUrl}`,
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

  if (!persona) return <div className="p-8 text-center">{tResults('calculating')}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 font-sans bg-gradient-morandi">
      <div className="max-w-3xl w-full space-y-8">
        {displayName && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-neutral-900">{tResults('hey', { name: displayName })}</h2>
          </div>
        )}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-neutral-900">{tResults('yourResults')}</h1>
        </div>

        <div className="card-morandi rounded-3xl overflow-hidden border-0">
          <div className="p-8 text-white relative overflow-hidden bg-gradient-morandi-blue">
            <div className="relative z-10 text-center">
              <h2 
                className="text-sm opacity-90 uppercase tracking-widest font-bold mb-2"
                style={{ opacity: 0.9 }}
              >
                {tResults('yourFinotype')}
              </h2>
              <div className="text-6xl mb-4">{persona.mascot}</div>
              <div className="text-4xl md:text-5xl font-bold mb-6">{tPersonas(`${persona.id}.name`)}</div>
              
              <div 
                className="inline-block backdrop-blur-sm rounded-xl px-6 py-3 border"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <p 
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#dbeafe' }}
                >
                  Type: {persona.id}
                </p>
              </div>
            </div>
            {/* Decorative circles */}
            <div 
              className="absolute top-0 left-0 w-64 h-64 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }}
            ></div>
            <div 
              className="absolute bottom-0 right-0 w-48 h-48 rounded-full translate-x-1/3 translate-y-1/3 opacity-20"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }}
            ></div>
          </div>
          
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900">{tResults('aboutYourType')}</h3>
              <p className="leading-relaxed text-lg" style={{ color: 'var(--color-text-secondary)' }}>{tPersonas(`${persona.id}.description`)}</p>
            </div>
          </div>
        </div>

        <div data-html2canvas-ignore className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleShare}
            className="btn-morandi-primary flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            {tResults('shareResult')}
          </button>

          <Link 
            href={`/${locale}/standard/resources`}
            className="btn-morandi-accent text-center"
          >
            {tResults('seePitfallsAndTips')}
          </Link>
          
          <Link
            href={`/${locale}`}
            className="px-6 py-3 border-2 rounded-xl font-medium text-center transition-all duration-200 cursor-pointer"
            style={{ 
              borderColor: 'var(--color-neutral-300)',
              color: 'var(--color-text)'
            }}
          >
            {tResults('returnHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
