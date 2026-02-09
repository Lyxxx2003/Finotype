'use client';

import Image from 'next/image';
import { useState } from 'react';

interface TypesCardProps {
  type: string;
  description: string;
  group: string;
}

export default function TypesCard({ type, description, group }: TypesCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const groupColors: Record<string, { bg: string; border: string; text: string }> = {
    Pioneers: {
      bg: 'rgba(245, 158, 11, 0.15)',
      border: '#F59E0B',
      text: '#F59E0B',
    },
    Guardians: {
      bg: 'rgba(16, 185, 129, 0.15)',
      border: '#10B981',
      text: '#10B981',
    },
    Players: {
      bg: 'rgba(236, 72, 153, 0.15)',
      border: '#EC4899',
      text: '#EC4899',
    },
    Pragmatists: {
      bg: 'rgba(59, 130, 246, 0.15)',
      border: '#3B82F6',
      text: '#3B82F6',
    },
  };

  const colors = groupColors[group] || groupColors.Pioneers;

  return (
    <div
      className="relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer"
      style={{
        background: isHovered ? colors.bg : 'var(--color-surface)',
        transform: isHovered ? 'translateY(-12px) scale(1.05)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? `0 24px 48px rgba(0, 0, 0, 0.2), 0 0 0 3px ${colors.border}30`
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Content */}
      <div className="p-6">
        {/* Mascot Image */}
        <div className="flex justify-center mb-4">
          <div
            className="relative transition-transform duration-300"
            style={{
              transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
            }}
          >
            <Image
              src={`/mascot/${type.toLowerCase()}.png`}
              alt={type}
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Type Name */}
        <div className="text-center mb-3">
          <h3
            className="text-2xl font-bold tracking-wider transition-colors duration-300"
            style={{
              color: isHovered ? colors.text : 'var(--color-text)',
            }}
          >
            {type}
          </h3>
          <p
            className="text-xs font-semibold mt-1 uppercase tracking-wide"
            style={{
              color: colors.text,
            }}
          >
            {group}
          </p>
        </div>

        {/* Description */}
        <p
          className="text-sm text-center leading-relaxed transition-colors duration-300"
          style={{
            color: isHovered ? 'var(--color-text)' : 'var(--color-text-secondary)',
          }}
        >
          {description}
        </p>
      </div>

      {/* Hover Effect Border Animation */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${colors.bg} 0%, transparent 100%)`,
            opacity: 0.3,
          }}
        />
      )}
    </div>
  );
}
