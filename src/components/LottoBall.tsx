import React from 'react';
import { getBallGradient } from '../utils/lotto';

interface LottoBallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBonus?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  animate?: boolean;
}

export const LottoBall: React.FC<LottoBallProps> = ({
  number,
  size = 'md',
  isBonus = false,
  selected = false,
  onClick,
  className = '',
  animate = false,
}) => {
  const gradient = getBallGradient(number);

  const ballPx = {
    sm: 28,
    md: 40,
    lg: 52,
    xl: 64,
    '2xl': 80,
  }[size];

  return (
    <div
      onClick={onClick}
      style={{
        width: `${ballPx}px`,
        height: `${ballPx}px`,
        background: gradient.bg,
        boxShadow: selected
          ? `0 0 20px 4px ${gradient.glow}, 0 8px 16px rgba(0,0,0,0.6)`
          : `0 4px 12px rgba(0, 0, 0, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.65), inset 0 -3px 6px rgba(0, 0, 0, 0.5)`,
        border: `1.5px solid ${gradient.border}`,
      }}
      className={`relative inline-flex items-center justify-center rounded-full cursor-pointer select-none transition-transform duration-300 hover:scale-105 active:scale-95 ${
        animate ? 'animate-bounce' : ''
      } ${className}`}
    >
      {/* 3D Specular Highlight Gloss */}
      <div
        className="absolute top-1 left-2 w-1/3 h-1/4 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.05) 100%)',
          filter: 'blur(0.5px)',
          transform: 'rotate(-25deg)',
        }}
      />

      {/* Inner Rim Ambient Depth */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 -4px 8px rgba(0, 0, 0, 0.4)',
        }}
      />

      {/* Number text with shadow */}
      <span
        style={{
          color: gradient.text,
          textShadow: gradient.text === '#FFFFFF' ? '0 1px 2px rgba(0,0,0,0.6)' : 'none',
        }}
        className="relative z-10 font-outfit tracking-tight"
      >
        {number}
      </span>

      {isBonus && (
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[9px] font-bold bg-amber-400 text-black rounded-full shadow-md border border-amber-200">
          보너스
        </span>
      )}
    </div>
  );
};
