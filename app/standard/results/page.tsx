'use client';

import { useEffect, useState, useRef } from 'react';
import { getAnswers, getDisplayName } from '@/lib/storage';
import { calculateFinotype } from '@/lib/logic';
import { personas } from '@/lib/data';
import Link from 'next/link';
import { Persona } from '@/types';
import html2canvas from 'html2canvas';

export default function ResultsPage() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const resultRef = useRef<HTMLDivElement>(null);

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
    if (!resultRef.current || !persona) return;
    
    // Slight delay to ensure everything is rendered stable
    await new Promise(r => setTimeout(r, 100));

    try {
      // Clone the element and convert lab() colors to rgb() for html2canvas compatibility
      const clonedElement = resultRef.current.cloneNode(true) as HTMLElement;
      
      // Function to convert computed styles with lab() to rgb()
      const convertLabToRgb = (element: HTMLElement) => {
        const computedStyle = window.getComputedStyle(element);
        const styles = ['color', 'backgroundColor', 'borderColor'];
        
        styles.forEach(prop => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value.includes('lab')) {
            // Get the computed color value and convert it
            const tempDiv = document.createElement('div');
            tempDiv.style.color = value;
            document.body.appendChild(tempDiv);
            const rgb = window.getComputedStyle(tempDiv).color;
            document.body.removeChild(tempDiv);
            element.style.setProperty(prop, rgb);
          }
        });
        
        // Recursively process children
        Array.from(element.children).forEach(child => {
          convertLabToRgb(child as HTMLElement);
        });
      };
      
      // Temporarily add to DOM for processing
      clonedElement.style.position = 'fixed';
      clonedElement.style.left = '-9999px';
      document.body.appendChild(clonedElement);
      convertLabToRgb(clonedElement);
      
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true, 
        allowTaint: true,
        windowWidth: clonedElement.scrollWidth,
        windowHeight: clonedElement.scrollHeight
      } as any);
      
      // Remove cloned element
      document.body.removeChild(clonedElement);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Could not generate image blob");
          return;
        }
        
        // Generate a filename
        const filename = `finotype-${persona.id}-${Date.now()}.png`;
        const file = new File([blob], filename, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `I'm a ${persona.name}!`,
              text: `I discovered my financial personality type: ${persona.name}. Check out yours using Finotype: https://finotype.vercel.app/!`,
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
      console.error('Failed to generate image', err);
      alert('Failed to generate image. Please try again.');
    }
  };

  if (!persona) return <div className="p-8 text-center">Calculating your financial DNA...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-3xl w-full space-y-8">
        {displayName && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Hey {displayName}! 👋</h2>
          </div>
        )}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Your Results</h1>
        </div>

        <div 
          ref={resultRef} 
          className="rounded-2xl overflow-hidden border"
          style={{ 
            backgroundColor: '#ffffff', 
            borderColor: '#f3f4f6', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div 
            className="p-8 text-white relative overflow-hidden"
            style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
          >
            <div className="relative z-10 text-center">
              <h2 
                className="text-sm opacity-90 uppercase tracking-widest font-bold mb-2"
                style={{ opacity: 0.9 }}
              >
                Your Finotype
              </h2>
              <div className="text-6xl mb-4">{persona.mascot}</div>
              <div className="text-4xl md:text-5xl font-bold mb-6">{persona.name}</div>
              
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
              className="absolute top-0 left-0 w-64 h-64 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            ></div>
            <div 
              className="absolute bottom-0 right-0 w-48 h-48 rounded-full translate-x-1/3 translate-y-1/3"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            ></div>
          </div>
          
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>About Your Type</h3>
              <p className="leading-relaxed text-lg" style={{ color: '#374151' }}>{persona.description}</p>
            </div>
          </div>
        </div>

        <div data-html2canvas-ignore className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleShare}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Share My Result
          </button>

          <Link 
            href="/standard/analysis"
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium text-center"
          >
            See Common Pitfalls & Tips
          </Link>
          
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-center"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
