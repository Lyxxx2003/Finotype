'use client';

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { clearAnswers } from "@/lib/storage";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('home');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startTest = () => {
    clearAnswers();
    router.push(`/${locale}/standard/start`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--gradient-surface)' }}>
      {/* Professional background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {/* Large soft circles */}
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', animation: 'float 12s ease-in-out infinite' }} />
        <div className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', animation: 'float 15s ease-in-out infinite', animationDelay: '2s' }} />
        <div className="absolute -bottom-1/4 left-1/3 w-[450px] h-[450px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(30,64,175,0.12) 0%, transparent 70%)', animation: 'float 18s ease-in-out infinite', animationDelay: '4s' }} />
      </div>

      {/* Floating geometric shapes - minimal and professional */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 rounded-lg opacity-10" style={{ background: 'var(--color-primary)', animation: 'float 8s ease-in-out infinite', transform: 'rotate(15deg)' }} />
        <div className="absolute top-1/3 right-16 w-16 h-16 rounded-full opacity-10" style={{ background: 'var(--color-accent)', animation: 'float 10s ease-in-out infinite', animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-12 h-12 opacity-8" style={{ background: 'var(--color-primary-light)', animation: 'float 9s ease-in-out infinite', animationDelay: '2s', transform: 'rotate(-20deg)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-14 h-14 rounded-lg opacity-10" style={{ background: 'var(--color-accent-dark)', animation: 'float 11s ease-in-out infinite', animationDelay: '3s' }} />
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
        {/* Main content */}
        <main 
          className={`flex flex-col gap-6 sm:gap-8 items-center text-center max-w-5xl transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Main card with Professional aesthetics */}
          <div 
            className="relative backdrop-blur-md rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden"
            style={{ 
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid var(--color-neutral-200)',
              boxShadow: '0 8px 32px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.04)'
            }}
          >
            {/* Decorative corner elements */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5" style={{ background: 'var(--color-accent)', borderRadius: '0 0 0 100%' }} />
            <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5" style={{ background: 'var(--color-primary)', borderRadius: '0 100% 0 0' }} />
            
            {/* Badge - professional */}
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 sm:mb-8 relative z-10" 
              style={{ 
                animation: 'scaleIn 0.6s ease-out 0.2s both',
                background: 'var(--gradient-primary)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(30,64,175,0.25)'
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Financial Education Platform
            </div>

            {/* Title with professional gradient */}
            <h1 
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 relative z-10"
              style={{ 
                animation: 'fadeInUp 0.8s ease-out 0.4s both',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em'
              }}
            >
              {t('title')}
            </h1>
            
            <p 
              className="text-lg sm:text-xl mb-8 sm:mb-10 max-w-2xl leading-relaxed relative z-10 font-medium"
              style={{ 
                animation: 'fadeInUp 0.8s ease-out 0.6s both',
                color: 'var(--color-neutral-600)'
              }}
            >
              {t('subtitle')}
            </p>
            
            {/* Feature badges - Morandi color palette */}
            <div 
              className="flex flex-wrap gap-3 justify-center mb-8 sm:mb-10 relative z-10"
              style={{ animation: 'fadeInUp 0.8s ease-out 0.8s both' }}
            >
              <span 
                className="px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer hover:scale-105"
                style={{ 
                  background: 'rgba(30,64,175,0.1)',
                  color: 'var(--color-primary)',
                  border: '1px solid rgba(30,64,175,0.2)'
                }}
              >
                <svg className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Behavioral Analysis
              </span>
              <span 
                className="px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer hover:scale-105"
                style={{ 
                  background: 'rgba(14,165,233,0.1)',
                  color: 'var(--color-accent)',
                  border: '1px solid rgba(14,165,233,0.2)'
                }}
              >
                <svg className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Personalized Insights
              </span>
              <span 
                className="px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer hover:scale-105"
                style={{ 
                  background: 'rgba(16,185,129,0.1)',
                  color: 'var(--color-success)',
                  border: '1px solid rgba(16,185,129,0.2)'
                }}
              >
                <svg className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Real Scenarios
              </span>
            </div>
            
            {/* CTA buttons - Morandi styled */}
            <div 
              className="flex gap-4 items-center flex-col sm:flex-row justify-center relative z-10"
              style={{ animation: 'scaleIn 0.8s ease-out 1s both' }}
            >
              <button
                onClick={startTest}
                className="group relative cursor-pointer rounded-2xl text-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 overflow-hidden w-full sm:w-auto"
                style={{ 
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 8px 24px rgba(30,64,175,0.35), 0 2px 8px rgba(30,64,175,0.2)'
                }}
              >
                <span className="relative z-10 flex items-center gap-2 justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('standardTest')}
                </span>
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)' }}
                />
              </button>
              
              <Link
                href={`/${locale}/pro/game`}
                className="group cursor-pointer rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto flex items-center gap-2 justify-center"
                style={{
                  background: 'var(--gradient-accent)',
                  color: 'white',
                  border: '2px solid rgba(14,165,233,0.5)',
                  boxShadow: '0 8px 24px rgba(14,165,233,0.3), 0 2px 8px rgba(14,165,233,0.15)'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('proSimulation')}
              </Link>
            </div>
          </div>

          {/* Stats section - Morandi aesthetic */}
          <div 
            className="grid grid-cols-3 gap-4 sm:gap-6 w-full mt-8"
            style={{ animation: 'fadeInUp 0.8s ease-out 1.2s both' }}
          >
            <div 
              className="backdrop-blur-md rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                background: 'rgba(30,64,175,0.05)',
                border: '1px solid rgba(30,64,175,0.2)',
                boxShadow: '0 4px 16px rgba(30,64,175,0.08)'
              }}
            >
              <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-primary)' }}>15K+</div>
              <div className="text-xs sm:text-sm" style={{ color: 'var(--color-neutral-500)' }}>Tests Taken</div>
            </div>
            <div 
              className="backdrop-blur-md rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                background: 'rgba(14,165,233,0.05)',
                border: '1px solid rgba(14,165,233,0.2)',
                boxShadow: '0 4px 16px rgba(14,165,233,0.08)'
              }}
            >
              <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-accent-dark)' }}>98%</div>
              <div className="text-xs sm:text-sm" style={{ color: 'var(--color-neutral-500)' }}>Accuracy</div>
            </div>
            <div 
              className="backdrop-blur-md rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                background: 'rgba(16,185,129,0.05)',
                border: '1px solid rgba(16,185,129,0.2)',
                boxShadow: '0 4px 16px rgba(16,185,129,0.08)'
              }}
            >
              <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-success)' }}>4.9/5</div>
              <div className="text-xs sm:text-sm" style={{ color: 'var(--color-neutral-500)' }}>Rating</div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer 
          className="mt-12 text-sm font-medium transition-all duration-1000"
          style={{ 
            animation: 'fadeInUp 0.8s ease-out 1.4s both',
            color: 'var(--color-neutral-500)'
          }}
        >
          {t('footer', { year: new Date().getFullYear() })}
        </footer>
      </div>
    </div>
  );
}
