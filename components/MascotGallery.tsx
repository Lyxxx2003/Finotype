'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { clearAnswers } from '@/lib/psych/storage';
import Link from 'next/link';

const mascots = [
  'afde.png', 'afdn.png', 'afie.png', 'afin.png',
  'apde.png', 'apdn.png', 'apie.png', 'apin.png',
  'gfde.png', 'gfdn.png', 'gfie.png', 'gfin.png',
  'gpde.png', 'gpdn.png', 'gpie.png', 'gpin.png'
];

export default function MascotGallery() {
  const t = useTranslations('home');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const startTest = () => {
    clearAnswers();
    router.push(`/${locale}/psych/start`);
  };

  return (
    <>
      <div
        id="mascot-gallery"
        className="w-full mt-8 mb-8 max-w-6xl mx-auto px-4"
        style={{ animation: 'fadeInUp 0.8s ease-out 1.2s both' }}
      >
        <h2
          className="text-2xl sm:text-3xl font-bold text-center mb-8"
          style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {t('meetOurCharacters') || 'Meet Our Financial Personalities'}
        </h2>

        {/* 4x4 Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {mascots.map((mascot, index) => (
            <div
              key={index}
              className="group relative"
              style={{
                animation: `slideInFromBottom 0.6s ease-out ${1.4 + index * 0.05}s both`
              }}
            >
              {/* Mascot Card */}
              <div
                className="relative w-full aspect-square rounded-2xl backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 cursor-pointer overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                  style={{
                    background: `radial-gradient(circle, ${
                      index % 4 === 0 ? 'rgba(30,64,175,0.4)' :
                      index % 4 === 1 ? 'rgba(14,165,233,0.4)' :
                      index % 4 === 2 ? 'rgba(16,185,129,0.4)' :
                      'rgba(168,85,247,0.4)'
                    }, transparent 70%)`
                  }}
                />

                {/* Mascot Image */}
                <div className="relative w-full h-full flex items-center justify-center p-3">
                  <img
                    src={`/mascot/${mascot}`}
                    alt={`Financial personality ${mascot.split('.')[0]}`}
                    className="w-full h-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Type Label on hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 py-2 px-3 text-center text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                  style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    color: 'white'
                  }}
                >
                  {mascot.split('.')[0].toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Buttons */}
        <div
          className="flex gap-4 items-center flex-col sm:flex-row justify-center mt-8"
          style={{ animation: 'fadeInUp 0.8s ease-out 2.2s both' }}
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
            href={`/${locale}/technical/question`}
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

      {/* Component-specific styles */}
      <style jsx>{`
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
