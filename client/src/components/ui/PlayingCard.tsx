import React from 'react';
import { Card, Suit, Rank } from '../../types/index.js';

const SUIT_SYMBOL: Record<Suit, string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
};

const isRedSuit = (suit: Suit) => suit === 'H' || suit === 'D';

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

// Proportional sizing
const SIZE_MAP = {
  xs: { width: 44, height: 62, cornerFs: 11, suitFs: 9, centerFs: 20, radius: 10, pad: 3 },
  sm: { width: 56, height: 78, cornerFs: 13, suitFs: 11, centerFs: 26, radius: 12, pad: 4 },
  md: { width: 72, height: 100, cornerFs: 16, suitFs: 13, centerFs: 34, radius: 16, pad: 6 },
  lg: { width: 88, height: 122, cornerFs: 19, suitFs: 15, centerFs: 42, radius: 18, pad: 7 },
  xl: { width: 106, height: 148, cornerFs: 23, suitFs: 18, centerFs: 52, radius: 22, pad: 9 },
};

// Card Back
const CardBack: React.FC<{ size: keyof typeof SIZE_MAP }> = ({ size }) => {
  const { width, height, radius } = SIZE_MAP[size];
  return (
    <div
      style={{
        width,
        height,
        flexShrink: 0,
        background: 'linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%) 0 0 / 8px 8px, linear-gradient(135deg, #1e293b, #0f172a)',
        borderRadius: radius,
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    />
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
  if (isBack || !card) return <CardBack size={size} />;

  const { width, height, cornerFs, suitFs, centerFs, radius, pad } = SIZE_MAP[size];
  const red = isRedSuit(card.suit);
  const color = red ? '#c82323' : '#1e293b';
  const suitSym = SUIT_SYMBOL[card.suit];
  const canPlay = isPlayable && isLegal;

  return (
    <button
      type="button"
      onClick={canPlay ? onClick : undefined}
      disabled={!canPlay}
      className={className}
      style={{
        width,
        height,
        flexShrink: 0,
        // Card Body: clean white with soft border and modern rounded corners
        background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
        borderRadius: radius,
        border: '1px solid #cbd5e1',
        boxShadow: canPlay
          ? '0 0 0 2px #16a34a, 0 0 0 5px rgba(22, 163, 74, 0.18), 0 8px 20px rgba(0, 0, 0, 0.12)'
          : '0 2px 5px rgba(0,0,0,0.08)',
        padding: `${pad}px ${pad + 1}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'left',
        cursor: canPlay ? 'pointer' : isPlayable && !isLegal ? 'not-allowed' : 'default',
        opacity: isPlayable && !isLegal ? 0.38 : 1,
        filter: isPlayable && !isLegal ? 'grayscale(0.35)' : undefined,
        transform: isSelected ? 'translateY(-12px)' : undefined,
        transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out, filter 0.15s ease-out',
        position: 'relative',
        zIndex: canPlay ? 5 : undefined,
        outline: 'none',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        if (canPlay) {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-6px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 0 0 2px #16a34a, 0 0 0 6px rgba(22, 163, 74, 0.25), 0 14px 28px rgba(0, 0, 0, 0.16)';
        }
      }}
      onMouseLeave={e => {
        if (canPlay) {
          (e.currentTarget as HTMLButtonElement).style.transform = '';
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 0 0 2px #16a34a, 0 0 0 5px rgba(22, 163, 74, 0.18), 0 8px 20px rgba(0, 0, 0, 0.12)';
        }
      }}
    >
      {/* Top-left corner: bold sans-serif rank + suit symbol underneath */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 800,
          color,
          marginLeft: 1,
          marginTop: 1,
        }}
      >
        <span style={{ fontSize: cornerFs, letterSpacing: '-0.02em', lineHeight: 1 }}>{card.rank}</span>
        <span style={{ fontSize: suitFs, marginTop: 1, lineHeight: 1 }}>{suitSym}</span>
      </div>

      {/* Exact Center: Single prominent, clean suit symbol */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: centerFs,
          color,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {suitSym}
      </div>

      {/* Bottom-right corner: rotated 180° bold rank + suit symbol */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 800,
          color,
          transform: 'rotate(180deg)',
          alignSelf: 'flex-end',
          marginRight: 1,
          marginBottom: 1,
        }}
      >
        <span style={{ fontSize: cornerFs, letterSpacing: '-0.02em', lineHeight: 1 }}>{card.rank}</span>
        <span style={{ fontSize: suitFs, marginTop: 1, lineHeight: 1 }}>{suitSym}</span>
      </div>
    </button>
  );
};
