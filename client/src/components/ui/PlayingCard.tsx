import React from 'react';
import { Card } from '../../types/index.js';
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
    xs: 'w-8 h-12 text-[10px] rounded-md',
    sm: 'w-11 h-16 sm:w-12 sm:h-18 text-xs rounded-lg',
    md: 'w-16 h-24 sm:w-20 sm:h-28 text-sm sm:text-base rounded-xl',
    lg: 'w-20 h-30 sm:w-24 sm:h-36 text-base sm:text-lg rounded-2xl',
    xl: 'w-28 h-40 sm:w-32 sm:h-48 text-lg sm:text-xl rounded-2xl',
  };

  // Card Back (Crisp emerald diamond lattice pattern with gold trim)
  if (isBack || !card) {
    return (
      <div
        className={`
          relative ${sizeClasses[size]} bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 
          border-2 border-emerald-600 rounded-xl shadow-md flex items-center justify-center select-none overflow-hidden ${className}
        `}
      >
        <div className="absolute inset-1 border border-emerald-400/40 rounded-lg flex items-center justify-center bg-emerald-950/60">
          <div className="w-full h-full opacity-40 bg-[radial-gradient(#34d399_1.5px,transparent_1.5px)] [background-size:8px_8px] flex items-center justify-center">
            <span className="text-emerald-300 font-bold text-base">♠</span>
          </div>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'H' || card.suit === 'D';
  const textColorClass = isRed ? 'text-red-600' : 'text-slate-900';

  return (
    <button
      type="button"
      onClick={isPlayable && isLegal ? onClick : undefined}
      disabled={!isPlayable || !isLegal}
      className={`
        group relative ${sizeClasses[size]} bg-white border text-left select-none transition-all duration-150 ease-out 
        flex flex-col justify-between p-1 sm:p-1.5 shadow-md playing-card-shadow
        ${
          isPlayable && isLegal
            ? 'cursor-pointer hover:-translate-y-3.5 hover:shadow-emerald-500/30 hover:shadow-2xl border-emerald-500 ring-2 ring-emerald-500/50 z-10'
            : isPlayable && !isLegal
            ? 'opacity-40 grayscale-[0.6] cursor-not-allowed border-slate-200'
            : 'border-slate-300'
        }
        ${isSelected ? '-translate-y-4 ring-4 ring-amber-400 border-amber-500 shadow-2xl' : ''}
        ${className}
      `}
    >
      {/* Corner Top-Left */}
      <div className="flex flex-col items-center leading-none">
        <span className={`font-black tracking-tight text-xs sm:text-sm ${textColorClass}`}>
          {card.rank}
        </span>
        <SuitIcon suit={card.suit} size="xs" className="mt-0.5" />
      </div>

      {/* Center Art */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {['J', 'Q', 'K', 'A'].includes(card.rank) ? (
          <div className={`flex flex-col items-center justify-center font-serif font-black ${textColorClass}`}>
            <span className="text-xl sm:text-3xl opacity-15 leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} size={size === 'sm' || size === 'xs' ? 'sm' : 'md'} className="opacity-95 drop-shadow-sm -mt-2" />
          </div>
        ) : (
          <SuitIcon suit={card.suit} size={size === 'sm' || size === 'xs' ? 'sm' : 'lg'} className="opacity-90 drop-shadow-sm" />
        )}
      </div>

      {/* Corner Bottom-Right (Rotated) */}
      <div className="flex flex-col items-center leading-none rotate-180 self-end">
        <span className={`font-black tracking-tight text-xs sm:text-sm ${textColorClass}`}>
          {card.rank}
        </span>
        <SuitIcon suit={card.suit} size="xs" className="mt-0.5" />
      </div>
    </button>
  );
};
