import React from 'react';
import { Suit } from '../../types/index.js';

interface SuitIconProps {
  suit: Suit;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const SuitIcon: React.FC<SuitIconProps> = ({ suit, className = '', size = 'md' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3 text-[10px]',
    sm: 'w-3.5 h-3.5 text-xs',
    md: 'w-5 h-5 text-base',
    lg: 'w-7 h-7 text-xl',
    xl: 'w-10 h-10 text-3xl',
  };

  const suitColorClasses = {
    S: 'text-slate-900 fill-slate-900',      // Spades: Deep Slate
    D: 'text-red-600 fill-red-600',          // Diamonds: Ruby Red
    C: 'text-emerald-800 fill-emerald-800',  // Clubs: Deep Forest Emerald
    H: 'text-red-600 fill-red-600',          // Hearts: Crimson Red
  };

  if (suit === 'S') {
    return (
      <svg viewBox="0 0 24 24" className={`${sizeClasses[size]} ${suitColorClasses.S} ${className}`} fill="currentColor">
        <path d="M12 2C10.5 4.5 5 11 5 15a7 7 0 0 0 6 6.92V23h2v-1.08A7 7 0 0 0 19 15c0-4-5.5-10.5-7-13z" />
      </svg>
    );
  }

  if (suit === 'D') {
    return (
      <svg viewBox="0 0 24 24" className={`${sizeClasses[size]} ${suitColorClasses.D} ${className}`} fill="currentColor">
        <path d="M12 2L3 12l9 10 9-10L12 2z" />
      </svg>
    );
  }

  if (suit === 'C') {
    return (
      <svg viewBox="0 0 24 24" className={`${sizeClasses[size]} ${suitColorClasses.C} ${className}`} fill="currentColor">
        <path d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0 .58 2.06A4.5 4.5 0 0 0 5 12.5a4.5 4.5 0 0 0 6 4.24V19l-2 3h6l-2-3v-2.26a4.5 4.5 0 0 0 6-4.24 4.5 4.5 0 0 0-3.58-4.44A4 4 0 0 0 16 6a4 4 0 0 0-4-4z" />
      </svg>
    );
  }

  if (suit === 'H') {
    return (
      <svg viewBox="0 0 24 24" className={`${sizeClasses[size]} ${suitColorClasses.H} ${className}`} fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }

  return null;
};
