'use client';

import { useEffect, useRef } from 'react';

interface RadarChartProps {
  scores: {
    paycheckLiteracy: number;
    housingBills: number;
    spendingControl: number;
    creditDebt: number;
    safetyNet: number;
    fraudSafety: number;
  };
}

export default function RadarChart({ scores }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const categories = [
    { key: 'paycheckLiteracy', label: 'Paycheck Literacy' },
    { key: 'housingBills', label: 'Housing & Bills' },
    { key: 'spendingControl', label: 'Spending Control' },
    { key: 'creditDebt', label: 'Credit & Debt' },
    { key: 'safetyNet', label: 'Safety Net' },
    { key: 'fraudSafety', label: 'Fraud & Safety' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get colors from CSS variables
    const isDarkMode = document.documentElement.classList.contains('dark');
    const primaryColor = isDarkMode ? '#3B82F6' : '#1E40AF';
    const accentColor = isDarkMode ? '#0EA5E9' : '#0EA5E9';
    const gridColor = isDarkMode ? '#334155' : '#E2E8F0';
    const textColor = isDarkMode ? '#F1F5F9' : '#0F172A';
    const fillColor = isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 64, 175, 0.2)';

    // Draw concentric circles (grid)
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw axis lines and labels
    const angleStep = (Math.PI * 2) / categories.length;
    
    categories.forEach((category, i) => {
      const angle = angleStep * i - Math.PI / 2; // Start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Draw axis line
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Draw labels
      ctx.fillStyle = textColor;
      ctx.font = '12px IBM Plex Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Position labels further out
      const labelX = centerX + (radius + 30) * Math.cos(angle);
      const labelY = centerY + (radius + 30) * Math.sin(angle);

      // Split long labels into multiple lines
      const words = category.label.split(' ');
      if (words.length > 2) {
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
        const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
        ctx.fillText(line1, labelX, labelY - 8);
        ctx.fillText(line2, labelX, labelY + 8);
      } else {
        ctx.fillText(category.label, labelX, labelY);
      }
    });

    // Draw data polygon
    const dataPoints: { x: number; y: number }[] = [];
    
    categories.forEach((category, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const score = scores[category.key as keyof typeof scores] || 0;
      const normalizedScore = Math.max(0, Math.min(100, score)) / 100; // Normalize to 0-1
      const distance = radius * normalizedScore;
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      dataPoints.push({ x, y });
    });

    // Fill polygon
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    dataPoints.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.fill();

    // Draw polygon outline
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    dataPoints.forEach((point) => {
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isDarkMode ? '#0F172A' : '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw score labels at each point
    ctx.font = 'bold 11px IBM Plex Sans, sans-serif';
    ctx.fillStyle = accentColor;
    categories.forEach((category, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const score = scores[category.key as keyof typeof scores] || 0;
      const normalizedScore = Math.max(0, Math.min(100, score)) / 100;
      const distance = radius * normalizedScore;
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      
      // Position score text slightly inside the point
      const scoreX = centerX + (distance - 15) * Math.cos(angle);
      const scoreY = centerY + (distance - 15) * Math.sin(angle);
      
      ctx.fillText(Math.round(score).toString(), scoreX, scoreY);
    });

  }, [scores]);

  // Re-render on theme change
  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Trigger re-render by updating canvas
      if (canvasRef.current) {
        const event = new Event('themechange');
        window.dispatchEvent(event);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full aspect-square max-w-2xl mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}