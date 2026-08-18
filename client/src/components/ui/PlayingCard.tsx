import React from 'react';
import { Card, Suit, Rank } from '../../types/index.js';
import { SuitIcon } from './SuitIcon.js';

interface PlayingCardProps {
  card?: Card;
  isBack?: boolean;
  isLegal?: boolean;
  isPlayable?: boolean;
  isSelected?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

// Royal Court Artwork Illustrations (Jack, Queen, King, Ace)
const CourtCardArt: React.FC<{ rank: Rank; suit: Suit; isRed: boolean }> = ({ rank, suit, isRed }) => {
  const primaryColor = isRed ? '#dc2626' : '#1e1b4b';
  const secondaryColor = isRed ? '#f59e0b' : '#3b82f6';
  const goldColor = '#f59e0b';

  if (rank === 'A') {
    return (
      <div className="flex flex-col items-center justify-center relative w-full h-full">
        {/* Large Ornate Ace Centerpiece */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 rounded-full border border-amber-400/30 bg-amber-500/5 animate-pulse" />
          <SuitIcon suit={suit} size="xl" className="drop-shadow-md scale-125" />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1 font-serif">
          {suit === 'S' ? 'Ace of Spades' : suit === 'H' ? 'Ace of Hearts' : suit === 'D' ? 'Ace of Diamonds' : 'Ace of Clubs'}
        </span>
      </div>
    );
  }

  // King, Queen, Jack Royal Portraits
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-1 overflow-hidden">
      <svg viewBox="0 0 100 130" className="w-full h-full max-w-[85%] max-h-[85%] drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ornate Frame */}
        <rect x="5" y="5" width="90" height="120" rx="6" fill="#fefce8" stroke={goldColor} strokeWidth="1.5" />
        <rect x="8" y="8" width="84" height="114" rx="4" fill="#fafaf9" stroke={primaryColor} strokeWidth="1" strokeDasharray="3 2" />

        {/* Crown & Headpiece */}
        {rank === 'K' && (
          <>
            {/* King Crown */}
            <path d="M30 38 L50 24 L70 38 L65 48 L35 48 Z" fill={goldColor} stroke="#b45309" strokeWidth="1" />
            <circle cx="30" cy="38" r="2.5" fill="#ef4444" />
            <circle cx="50" cy="24" r="3" fill="#3b82f6" />
            <circle cx="70" cy="38" r="2.5" fill="#ef4444" />
            {/* King Beard & Robe */}
            <path d="M38 58 Q50 72 62 58 Q50 64 38 58 Z" fill={primaryColor} />
            <path d="M22 68 Q50 60 78 68 L82 110 Q50 118 18 110 Z" fill={primaryColor} opacity="0.85" />
            {/* Scepter */}
            <line x1="72" y1="52" x2="78" y2="105" stroke={goldColor} strokeWidth="3" strokeLinecap="round" />
            <circle cx="72" cy="50" r="4" fill={goldColor} />
          </>
        )}

        {rank === 'Q' && (
          <>
            {/* Queen Tiara */}
            <path d="M32 36 L40 26 L50 34 L60 26 L68 36 L64 46 L36 46 Z" fill={goldColor} stroke="#b45309" strokeWidth="1" />
            <circle cx="40" cy="26" r="2" fill="#ec4899" />
            <circle cx="50" cy="34" r="2.5" fill="#8b5cf6" />
            <circle cx="60" cy="26" r="2" fill="#ec4899" />
            {/* Queen Hair & Robe */}
            <path d="M34 46 Q28 65 36 78 Q50 72 64 78 Q72 65 66 46 Z" fill={secondaryColor} opacity="0.8" />
            <path d="M25 76 Q50 68 75 76 L80 112 Q50 118 20 112 Z" fill={primaryColor} opacity="0.85" />
            {/* Royal Flower */}
            <circle cx="68" cy="62" r="5" fill="#f43f5e" />
            <circle cx="68" cy="62" r="2" fill={goldColor} />
          </>
        )}

        {rank === 'J' && (
          <>
            {/* Jack Feather Cap */}
            <path d="M32 44 Q50 30 68 44 L64 52 L36 52 Z" fill={secondaryColor} />
            <path d="M30 46 Q20 20 45 18 Q35 28 36 44 Z" fill="#ef4444" />
            {/* Jack Robe & Collar */}
            <path d="M36 52 L50 62 L64 52 L68 64 L50 74 L32 64 Z" fill={goldColor} />
            <path d="M25 68 Q50 62 75 68 L78 110 Q50 116 22 110 Z" fill={primaryColor} opacity="0.85" />
          </>
        )}

        {/* Face */}
        <circle cx="50" cy="54" r="11" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
        <circle cx="46" cy="53" r="1.2" fill="#1e293b" />
        <circle cx="54" cy="53" r="1.2" fill="#1e293b" />
        <path d="M47 58 Q50 61 53 58" stroke="#ca8a04" strokeWidth="1" strokeLinecap="round" />

        {/* Center Suit Crest */}
        <g transform="translate(40, 80) scale(0.85)">
          <rect x="-4" y="-4" width="28" height="28" rx="14" fill="#ffffff" stroke={goldColor} strokeWidth="1" />
        </g>
      </svg>
      {/* Floating Center Suit Pip */}
      <div className="absolute bottom-5 z-10 flex items-center justify-center">
        <SuitIcon suit={suit} size="sm" className="drop-shadow" />
      </div>
    </div>
  );
};

// Realistic Pip Layouts for standard number cards (2..10)
const NumberCardPips: React.FC<{ rank: Rank; suit: Suit; size: string }> = ({ rank, suit, size }) => {
  const pipSize = size === 'xs' || size === 'sm' ? 'xs' : size === 'lg' || size === 'xl' ? 'md' : 'sm';
  const num = parseInt(rank, 10);

  if (isNaN(num)) return null;

  return (
    <div className="w-full h-full p-2 sm:p-2.5 flex flex-col justify-between items-center select-none pointer-events-none">
      {/* 2 */}
      {num === 2 && (
        <div className="w-full h-full flex flex-col justify-between items-center py-2">
          <SuitIcon suit={suit} size={pipSize} />
          <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
        </div>
      )}

      {/* 3 */}
      {num === 3 && (
        <div className="w-full h-full flex flex-col justify-between items-center py-1">
          <SuitIcon suit={suit} size={pipSize} />
          <SuitIcon suit={suit} size={pipSize} />
          <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
        </div>
      )}

      {/* 4 */}
      {num === 4 && (
        <div className="w-full h-full flex justify-between px-1 py-1">
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
        </div>
      )}

      {/* 5 */}
      {num === 5 && (
        <div className="w-full h-full relative flex justify-between px-1 py-1">
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <SuitIcon suit={suit} size={pipSize} />
          </div>
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
        </div>
      )}

      {/* 6 */}
      {num === 6 && (
        <div className="w-full h-full flex justify-between px-1 py-0.5">
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
        </div>
      )}

      {/* 7 */}
      {num === 7 && (
        <div className="w-full h-full relative flex justify-between px-1 py-0.5">
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2">
            <SuitIcon suit={suit} size={pipSize} />
          </div>
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
        </div>
      )}

      {/* 8 */}
      {num === 8 && (
        <div className="w-full h-full relative flex justify-between px-1 py-0.5">
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2">
            <SuitIcon suit={suit} size={pipSize} />
          </div>
          <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2">
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
        </div>
      )}

      {/* 9 */}
      {num === 9 && (
        <div className="w-full h-full relative flex justify-between px-0.5 py-0.5">
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <SuitIcon suit={suit} size={pipSize} />
          </div>
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
        </div>
      )}

      {/* 10 */}
      {num === 10 && (
        <div className="w-full h-full relative flex justify-between px-0.5 py-0.5">
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
          <div className="absolute top-[22%] left-1/2 -translate-x-1/2">
            <SuitIcon suit={suit} size={pipSize} />
          </div>
          <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2">
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
          <div className="flex flex-col justify-between">
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
            <SuitIcon suit={suit} size={pipSize} className="rotate-180" />
          </div>
        </div>
      )}
    </div>
  );
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isBack = false,
  isLegal = true,
  isPlayable = false,
  isSelected = false,
  size = 'md',
  onClick,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-9 h-13 text-[10px] rounded-md',
    sm: 'w-12 h-17 sm:w-14 sm:h-20 text-xs rounded-lg',
    md: 'w-16 h-24 sm:w-20 sm:h-29 text-sm sm:text-base rounded-xl',
    lg: 'w-22 h-32 sm:w-26 sm:h-38 text-base sm:text-lg rounded-2xl',
    xl: 'w-28 h-40 sm:w-34 sm:h-50 text-lg sm:text-xl rounded-2xl',
  };

  // Card Back: Royal Indigo Mandala Lattice with Gold Filigree
  if (isBack || !card) {
    return (
      <div
        className={`
          relative ${sizeClasses[size]} bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#2e1065] 
          border-2 border-amber-500/70 rounded-xl shadow-lg flex items-center justify-center select-none overflow-hidden ${className}
        `}
      >
        {/* Ornate Gold Border Inset */}
        <div className="absolute inset-1 border border-amber-400/40 rounded-lg flex items-center justify-center bg-indigo-950/80">
          {/* Subtle Geometric Mandala Background */}
          <div className="w-full h-full opacity-30 bg-[radial-gradient(#f59e0b_1.5px,transparent_1.5px)] [background-size:6px_6px] flex items-center justify-center" />
          {/* Center Royal Seal */}
          <div className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-amber-400/60 bg-amber-500/10 flex items-center justify-center shadow-inner">
            <span className="text-amber-400 font-serif font-black text-sm sm:text-base">♠</span>
          </div>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'H' || card.suit === 'D';
  const textColorClass = isRed ? 'text-red-600' : 'text-slate-950';
  const isCourtCard = ['J', 'Q', 'K', 'A'].includes(card.rank);

  return (
    <button
      type="button"
      onClick={isPlayable && isLegal ? onClick : undefined}
      disabled={!isPlayable || !isLegal}
      className={`
        group relative ${sizeClasses[size]} bg-gradient-to-b from-[#ffffff] to-[#fafaf9] border text-left select-none transition-all duration-150 ease-out 
        flex flex-col justify-between shadow-md overflow-hidden rounded-xl
        ${
          isPlayable && isLegal
            ? 'cursor-pointer hover:-translate-y-4 hover:shadow-indigo-500/40 hover:shadow-2xl border-indigo-600 ring-2 ring-indigo-500/60 z-20 scale-[1.02]'
            : isPlayable && !isLegal
            ? 'opacity-35 grayscale-[0.7] cursor-not-allowed border-slate-200'
            : 'border-slate-300'
        }
        ${isSelected ? '-translate-y-4 ring-4 ring-amber-400 border-amber-500 shadow-2xl z-20' : ''}
        ${className}
      `}
      style={{
        boxShadow: isPlayable && isLegal ? '0 10px 25px -5px rgba(30, 27, 75, 0.25), 0 8px 10px -6px rgba(30, 27, 75, 0.25)' : '0 2px 5px rgba(0,0,0,0.1)'
      }}
    >
      {/* Corner Top-Left (Rank + Small Pip) */}
      <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 flex flex-col items-center leading-none z-10">
        <span className={`font-black font-sans tracking-tight text-xs sm:text-sm ${textColorClass}`}>
          {card.rank}
        </span>
        <SuitIcon suit={card.suit} size="xs" className="mt-0.5" />
      </div>

      {/* Main Center Artwork / Multi-Pip Layout */}
      <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
        {isCourtCard ? (
          <CourtCardArt rank={card.rank} suit={card.suit} isRed={isRed} />
        ) : (
          <NumberCardPips rank={card.rank} suit={card.suit} size={size} />
        )}
      </div>

      {/* Corner Bottom-Right (Rotated) */}
      <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 flex flex-col items-center leading-none rotate-180 z-10">
        <span className={`font-black font-sans tracking-tight text-xs sm:text-sm ${textColorClass}`}>
          {card.rank}
        </span>
        <SuitIcon suit={card.suit} size="xs" className="mt-0.5" />
      </div>
    </button>
  );
};
