'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface ResourceCardProps {
  title: string;
  description: string;
  imageUrl: string;
  blogUrl: string;
  index: number;
}

export default function ResourceCard({
  title,
  description,
  imageUrl,
  blogUrl,
  index,
}: ResourceCardProps) {
  // Pattern logic: Apply different overlay effects based on card index
  // Using CSS variables from globals.css for consistent theming
  const getOverlayClass = (idx: number) => {
    const patterns = [
      'overlay-primary', // 1st card: primary gradient overlay
      'overlay-accent', // 2nd card: accent gradient overlay  
      'overlay-success', // 3rd card: success gradient overlay
      'overlay-warning', // 4th card: warning gradient overlay
    ];
    return patterns[idx % patterns.length];
  };

  // Pattern logic: Apply different border colors using CSS variables from globals.css
  const getBorderColor = (idx: number) => {
    const colors = [
      'var(--color-primary)', // Blue
      'var(--color-accent)', // Sky blue
      'var(--color-success)', // Green
      'var(--color-warning)', // Amber
    ];
    return colors[idx % colors.length];
  };

  const t = useTranslations('resources');

  return (
    <Link
      href={blogUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <article 
        className="h-full flex flex-col overflow-hidden rounded-xl border-2 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-neutral-200)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        {/* Image Section - Takes up half the card */}
        <div 
          className="relative h-64 overflow-hidden"
          style={{ backgroundColor: 'var(--color-neutral-100)' }}
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Dynamic overlay pattern based on index - using globals.css color system */}
          <div 
            className="absolute inset-0 opacity-20 mix-blend-multiply dark:mix-blend-screen"
            style={{ 
              background: index % 4 === 0 ? 'var(--gradient-primary)' : 
                         index % 4 === 1 ? 'var(--gradient-accent)' : 
                         index % 4 === 2 ? 'linear-gradient(135deg, var(--color-success) 0%, #10B981 100%)' :
                         'linear-gradient(135deg, var(--color-warning) 0%, #F59E0B 100%)'
            }}
          />
          {/* Hover effect */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
            style={{ backgroundColor: 'var(--color-text)' }}
          />
        </div>

        {/* Content Section */}
        <div 
          className="flex-1 flex flex-col p-6 border-t-4"
          style={{ borderColor: getBorderColor(index) }}
        >
          <h3 
            className="text-2xl font-bold mb-3 transition-colors line-clamp-2"
            style={{ color: 'var(--color-text)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text)'}
          >
            {title}
          </h3>
          <p 
            className="mb-4 flex-1 line-clamp-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {description}
          </p>
          <div 
            className="flex items-center font-semibold group-hover:translate-x-2 transition-transform"
            style={{ color: 'var(--color-primary)' }}
          >
            <span>{t('readMore')}</span>
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
