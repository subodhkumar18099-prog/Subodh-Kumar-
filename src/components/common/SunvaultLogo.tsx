/**
 * Sunvault Powertech Pvt. Ltd. - Official Brand Logo Component
 * Faithfully matches the official logo:
 * - Green leaf & solar rays around green mountains & earth base
 * - Vibrant Orange "Sun" + Green "vault" typography
 * - Dark uppercase "POWERTECH PVT LTD" subtitle
 */

import React from 'react';

interface SunvaultLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'dark' | 'light';
}

export const SunvaultLogo: React.FC<SunvaultLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'light',
}) => {
  // Size mapping
  const heightClass = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  }[size];

  // SVG Emblem Icon
  const Emblem = ({ className: emblemClass = 'w-10 h-10' }: { className?: string }) => (
    <svg
      viewBox="0 0 160 160"
      className={emblemClass}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sunRayGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
        <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15803D" />
          <stop offset="60%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#4ADE80" />
        </linearGradient>
        <linearGradient id="earthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
      </defs>

      {/* Sun Rays Background / Arcs */}
      <g>
        {/* Outer Radiant Sun Rays */}
        <path
          d="M 85 24 L 92 14 Q 102 18 112 24 L 102 32 Z"
          fill="url(#sunRayGrad)"
        />
        <path
          d="M 108 36 L 122 28 Q 130 36 138 46 L 122 52 Z"
          fill="url(#sunRayGrad)"
        />
        <path
          d="M 125 58 L 143 54 Q 148 64 150 76 L 131 77 Z"
          fill="url(#sunRayGrad)"
        />
        <path
          d="M 132 83 L 151 86 Q 150 97 146 108 L 128 99 Z"
          fill="url(#sunRayGrad)"
        />

        {/* Concentric Sun Halo Rings */}
        <path
          d="M 68 35 C 95 24 125 35 138 58 C 142 66 144 76 142 86 L 132 81 C 134 74 132 66 128 60 C 118 43 95 35 74 44 Z"
          fill="url(#sunRayGrad)"
        />
        <path
          d="M 62 47 C 82 38 108 45 120 64 C 124 70 126 78 125 86 L 117 83 C 117 77 115 71 112 66 C 103 52 82 46 66 54 Z"
          fill="#F59E0B"
        />
      </g>

      {/* Clouds */}
      <path
        d="M 88 56 C 88 53 91 50 94 50 C 95 48 98 47 101 48 C 103 48 105 50 106 52 C 108 52 110 54 110 56 C 110 58 108 60 106 60 L 90 60 C 88 60 88 58 88 56 Z"
        fill="#BAE6FD"
        opacity="0.9"
      />
      <path
        d="M 115 70 C 115 68 117 66 119 66 C 120 65 122 64 124 65 C 126 65 127 66 128 67 C 129 67 131 68 131 70 C 131 71 130 72 128 72 L 117 72 C 115 72 115 71 115 70 Z"
        fill="#BAE6FD"
        opacity="0.8"
      />

      {/* Green Mountain Peaks */}
      <g>
        {/* Left Peak */}
        <polygon points="76,105 92,66 108,105" fill="#15803D" />
        <polygon points="92,66 98,80 92,86 86,80" fill="#E2E8F0" opacity="0.6" />
        {/* Right Smaller Peak */}
        <polygon points="98,105 110,75 122,105" fill="#166534" />
      </g>

      {/* Evergreen Trees at Foothills */}
      <g fill="#22C55E">
        <polygon points="72,105 76,96 80,105" />
        <polygon points="80,105 84,94 88,105" />
        <polygon points="88,105 92,93 96,105" />
        <polygon points="96,105 100,94 104,105" />
        <polygon points="104,105 108,95 112,105" />
        <polygon points="112,105 116,97 120,105" />
      </g>

      {/* Earth Base / Semicircular Green Bowl */}
      <path
        d="M 64 105 C 64 128 82 142 105 142 C 122 142 134 133 138 120 C 120 134 92 134 76 120 C 70 115 66 109 64 105 Z"
        fill="url(#earthGrad)"
      />
      <ellipse cx="100" cy="118" rx="28" ry="12" fill="#16A34A" opacity="0.85" />

      {/* Large Curved Green Leaf embracing the left side */}
      <path
        d="M 52 142 C 34 135 18 116 14 92 C 10 70 18 45 36 28 C 38 26 42 27 41 30 C 36 48 38 72 50 90 C 58 102 70 112 84 118 C 76 126 64 136 52 142 Z"
        fill="url(#leafGrad)"
      />
      {/* Leaf Central Rib Line */}
      <path
        d="M 28 42 C 32 65 42 88 64 106"
        stroke="#86EFAC"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${heightClass} ${className}`}>
        <Emblem className="h-full w-auto aspect-square" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 ${heightClass} ${className}`}>
      {/* Emblem Icon */}
      <Emblem className="h-full w-auto aspect-square shrink-0" />

      {/* Brand Typographic Lockup */}
      <div className="flex flex-col justify-center leading-none select-none">
        <div className="flex items-baseline font-black tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <span className="text-[#F97316] text-[1.45em] font-extrabold tracking-tight">Sun</span>
          <span className="text-[#16A34A] text-[1.45em] font-extrabold tracking-tight">vault</span>
        </div>
        <span
          className={`text-[0.55em] font-bold tracking-[0.22em] uppercase mt-0.5 whitespace-nowrap ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          POWERTECH PVT LTD
        </span>
      </div>
    </div>
  );
};
