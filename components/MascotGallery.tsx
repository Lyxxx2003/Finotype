'use client';

import { useTranslations } from 'next-intl';

const mascots = [
  'afde.png', 'afdn.png', 'afie.png', 'apin.png',
  'apde.png', 'apdn.png', 'apie.png', 'afin.png',
  'gfde.png', 'gfdn.png', 'gfie.png', 'gfin.png',
  'gpde.png', 'gpdn.png', 'gpie.png', 'gpin.png'
];

export default function MascotGallery() {
  const t = useTranslations('home');

  return (
    <>
      <div
        id="mascot-gallery"
        className="w-full mt-8 mb-8 overflow-hidden"
        style={{ animation: 'fadeInUp 0.8s ease-out 1.2s both' }}
      >
        <h2
          className="text-2xl sm:text-3xl font-bold text-center mb-6"
          style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {t('meetOurCharacters') || 'Meet Our Financial Personalities'}
        </h2>

        {/* Scrolling Container */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div
            className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, var(--gradient-surface), transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, var(--gradient-surface), transparent)' }}
          />

          {/* Scrollable Gallery */}
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-6 px-8 min-w-max">
              {mascots.map((mascot, index) => (
                <div
                  key={index}
                  className="group relative flex-shrink-0"
                  style={{
                    animation: `slideInFromBottom 0.6s ease-out ${1.4 + index * 0.05}s both`
                  }}
                >
                  {/* Mascot Card */}
                  <div
                    className="relative w-48 h-48 sm:w-48 sm:h-48 rounded-2xl backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 cursor-pointer overflow-hidden"
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
          </div>
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
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
