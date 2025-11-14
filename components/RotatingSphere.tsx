'use client';

import { useId } from 'react';

interface RotatingSphereProps {
  isRotating?: boolean;
  size?: number;
}

export function RotatingSphere({ isRotating = false, size = 48 }: RotatingSphereProps) {
  const id = useId();
  const gradientId1 = `sphereGradient-${id}`;
  const gradientId2 = `sphereOverlay-${id}`;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        className={isRotating ? 'animate-spin-slow' : ''}
      >
        {/* Gradient definitions */}
        <defs>
          <radialGradient id={gradientId1} cx="30%" cy="30%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="25%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="75%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </radialGradient>
          <linearGradient id={gradientId2} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="33%" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="66%" stopColor="#ec4899" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        
        {/* Main sphere with radial gradient */}
        <circle cx="24" cy="24" r="22" fill={`url(#${gradientId1})`} />
        
        {/* Overlay pattern for depth */}
        <circle cx="24" cy="24" r="22" fill={`url(#${gradientId2})`} opacity="0.6" />
        
        {/* Color segments for multicolored effect */}
        <path d="M 24 2 A 22 22 0 0 1 24 46" fill="#6366f1" opacity="0.8" />
        <path d="M 24 2 A 22 22 0 0 1 46 24" fill="#8b5cf6" opacity="0.8" />
        <path d="M 46 24 A 22 22 0 0 1 24 46" fill="#ec4899" opacity="0.8" />
        <path d="M 24 46 A 22 22 0 0 1 2 24" fill="#10b981" opacity="0.8" />
        <path d="M 2 24 A 22 22 0 0 1 24 2" fill="#3b82f6" opacity="0.8" />
        
        {/* Highlight overlay for 3D effect */}
        <ellipse cx="18" cy="18" rx="10" ry="10" fill="white" opacity="0.25" />
        
        {/* Decorative highlights */}
        <circle cx="20" cy="20" r="3" fill="white" opacity="0.4" />
        <circle cx="28" cy="16" r="2" fill="white" opacity="0.3" />
        <circle cx="16" cy="28" r="2" fill="white" opacity="0.3" />
      </svg>
    </div>
  );
}

