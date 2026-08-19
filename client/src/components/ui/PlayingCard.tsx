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
  xs: { width: 44, height: 62, cornerFs: 11, suitFs: 9, centerFs: 20, radius: 8, pad: 3 },
  sm: { width: 56, height: 78, cornerFs: 13, suitFs: 11, centerFs: 26, radius: 10, pad: 4 },
  md: { width: 72, height: 100, cornerFs: 16, suitFs: 13, centerFs: 34, radius: 12, pad: 5 },
  lg: { width: 88, height: 122, cornerFs: 19, suitFs: 15, centerFs: 42, radius: 14, pad: 6 },
  xl: { width: 106, height: 148, cornerFs: 23, suitFs: 18, centerFs: 52, radius: 18, pad: 8 },
};

// Red Ornate Rider Back SVG matching user's reference image
export const CardBack: React.FC<{ size?: keyof typeof SIZE_MAP; className?: string; onClick?: () => void }> = ({
  size = 'md',
  className = '',
  onClick,
}) => {
  const { width, height, radius } = SIZE_MAP[size];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative select-none overflow-hidden transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${className}`}
      style={{
        width,
        height,
        flexShrink: 0,
        borderRadius: radius,
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)',
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 140 200"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ borderRadius: radius - 2, display: 'block' }}
      >
        <defs>
          {/* Dense filigree diamond background pattern */}
          <pattern id="cardBackPattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#ffffff" />
            <path
              d="M 5 0 L 10 5 L 5 10 L 0 5 Z"
              fill="none"
              stroke="#c82323"
              strokeWidth="0.8"
            />
            <circle cx="5" cy="5" r="1.5" fill="#c82323" />
            <circle cx="0" cy="0" r="0.8" fill="#c82323" />
            <circle cx="10" cy="0" r="0.8" fill="#c82323" />
            <circle cx="0" cy="10" r="0.8" fill="#c82323" />
            <circle cx="10" cy="10" r="0.8" fill="#c82323" />
          </pattern>
        </defs>

        {/* White base */}
        <rect width="140" height="200" fill="#ffffff" />

        {/* Outer border margin */}
        <rect
          x="3"
          y="3"
          width="134"
          height="194"
          rx="6"
          fill="none"
          stroke="#c82323"
          strokeWidth="1.2"
        />
        <rect
          x="5.5"
          y="5.5"
          width="129"
          height="189"
          rx="4.5"
          fill="none"
          stroke="#c82323"
          strokeWidth="0.6"
        />

        {/* Filigree Pattern Fill Area */}
        <rect
          x="7"
          y="7"
          width="126"
          height="186"
          rx="4"
          fill="url(#cardBackPattern)"
        />

        {/* Inner Frame */}
        <rect
          x="18"
          y="18"
          width="104"
          height="164"
          rx="3"
          fill="none"
          stroke="#c82323"
          strokeWidth="1.5"
        />
        <rect
          x="20.5"
          y="20.5"
          width="99"
          height="159"
          rx="2"
          fill="none"
          stroke="#c82323"
          strokeWidth="0.6"
        />

        {/* Central Connector Decorative Arches */}
        <g stroke="#c82323" strokeWidth="0.8" fill="none">
          <ellipse cx="70" cy="100" rx="36" ry="16" />
          <ellipse cx="70" cy="100" rx="28" ry="11" />
          <ellipse cx="70" cy="100" rx="20" ry="7" />
          <path d="M 50 100 L 90 100" strokeWidth="1.2" />
          <polygon points="70,94 76,100 70,106 64,100" fill="#c82323" />
        </g>

        {/* TOP MEDALLION */}
        <g transform="translate(70, 62)">
          {/* Outer circle rings */}
          <circle r="30" fill="#ffffff" stroke="#c82323" strokeWidth="1.5" />
          <circle r="27.5" fill="none" stroke="#c82323" strokeWidth="0.6" />
          <circle r="25" fill="#c82323" />

          {/* Radiating sunburst rays */}
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={23 * Math.cos((i * Math.PI) / 8)}
              y2={23 * Math.sin((i * Math.PI) / 8)}
              stroke="#ffffff"
              strokeWidth="0.7"
              strokeDasharray="2 2"
            />
          ))}

          {/* Inner concentric ring */}
          <circle r="18" fill="#c82323" stroke="#ffffff" strokeWidth="1.2" />
          <circle r="15" fill="none" stroke="#ffffff" strokeWidth="0.6" />

          {/* White diamond petal / star accent */}
          <polygon points="0,-16 16,0 0,16 -16,0" fill="#ffffff" />
          <polygon points="0,-13 13,0 0,13 -13,0" fill="#c82323" />

          {/* Central diamond core with rays */}
          <rect
            x="-7"
            y="-7"
            width="14"
            height="14"
            fill="#c82323"
            stroke="#ffffff"
            strokeWidth="1"
            transform="rotate(45)"
          />
          <circle r="2.5" fill="#ffffff" />
        </g>

        {/* BOTTOM MEDALLION (Symmetrical reflection) */}
        <g transform="translate(70, 138)">
          {/* Outer circle rings */}
          <circle r="30" fill="#ffffff" stroke="#c82323" strokeWidth="1.5" />
          <circle r="27.5" fill="none" stroke="#c82323" strokeWidth="0.6" />
          <circle r="25" fill="#c82323" />

          {/* Radiating sunburst rays */}
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={23 * Math.cos((i * Math.PI) / 8)}
              y2={23 * Math.sin((i * Math.PI) / 8)}
              stroke="#ffffff"
              strokeWidth="0.7"
              strokeDasharray="2 2"
            />
          ))}

          {/* Inner concentric ring */}
          <circle r="18" fill="#c82323" stroke="#ffffff" strokeWidth="1.2" />
          <circle r="15" fill="none" stroke="#ffffff" strokeWidth="0.6" />

          {/* White diamond petal / star accent */}
          <polygon points="0,-16 16,0 0,16 -16,0" fill="#ffffff" />
          <polygon points="0,-13 13,0 0,13 -13,0" fill="#c82323" />

          {/* Central diamond core with rays */}
          <rect
            x="-7"
            y="-7"
            width="14"
            height="14"
            fill="#c82323"
            stroke="#ffffff"
            strokeWidth="1"
            transform="rotate(45)"
          />
          <circle r="2.5" fill="#ffffff" />
        </g>
      </svg>
    </button>
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
  if (isBack || !card) {
    return <CardBack size={size} className={className} onClick={onClick} />;
  }

  const { width, height, cornerFs, suitFs, centerFs, radius, pad } = SIZE_MAP[size];
  const red = isRedSuit(card.suit);
  const color = red ? '#c82323' : '#1e293b';
  const suitSym = SUIT_SYMBOL[card.suit];
  const canPlay = isPlayable && isLegal;

  return (
    <button
      type="button"
      onClick={canPlay || onClick ? (canPlay ? onClick : onClick) : undefined}
      disabled={!canPlay && !onClick}
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
        cursor: canPlay ? 'pointer' : isPlayable && !isLegal ? 'not-allowed' : onClick ? 'pointer' : 'default',
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
