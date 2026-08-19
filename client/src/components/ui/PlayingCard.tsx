import React from 'react';
import { Card, Suit, Rank } from '../../types/index.js';

// Suit unicode symbols matching Rishabh Doshi's design
const SUIT_SYMBOL: Record<Suit, string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
};

const isRedSuit = (suit: Suit) => suit === 'H' || suit === 'D';

// ─── Number card centre pips ─────────────────────────────────────────────────
const PipLayout: React.FC<{ rank: Rank; suit: Suit; pipStyle: React.CSSProperties }> = ({
  rank,
  suit,
  pipStyle,
}) => {
  const s = SUIT_SYMBOL[suit];
  const num = parseInt(rank as string, 10);

  const pip = (flipped = false) => (
    <span style={{ ...pipStyle, display: 'inline-block', lineHeight: 1, transform: flipped ? 'rotate(180deg)' : undefined }}>
      {s}
    </span>
  );

  const col = (items: boolean[]) => (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
      {items.map((flipped, i) => <React.Fragment key={i}>{pip(flipped)}</React.Fragment>)}
    </div>
  );

  const full: React.CSSProperties = { display: 'flex', width: '100%', height: '100%' };

  if (num === 2) return <div style={{ ...full, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>{pip(false)}{pip(true)}</div>;
  if (num === 3) return <div style={{ ...full, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>{pip(false)}{pip(false)}{pip(true)}</div>;
  if (num === 4) return <div style={{ ...full, justifyContent: 'space-between' }}>{col([false, true])}{col([false, true])}</div>;
  if (num === 5) return <div style={{ ...full, justifyContent: 'space-between', position: 'relative' }}>{col([false, true])}<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>{pip()}</div>{col([false, true])}</div>;
  if (num === 6) return <div style={{ ...full, justifyContent: 'space-between' }}>{col([false, false, true])}{col([false, false, true])}</div>;
  if (num === 7) return <div style={{ ...full, justifyContent: 'space-between', position: 'relative' }}>{col([false, false, true])}<div style={{ position: 'absolute', top: '28%', left: '50%', transform: 'translate(-50%, -50%)' }}>{pip()}</div>{col([false, false, true])}</div>;
  if (num === 8) return <div style={{ ...full, justifyContent: 'space-between', position: 'relative' }}>{col([false, false, true])}<div style={{ position: 'absolute', top: '28%', left: '50%', transform: 'translate(-50%, -50%)' }}>{pip()}</div><div style={{ position: 'absolute', bottom: '28%', left: '50%', transform: 'translate(-50%, 50%)' }}>{pip(true)}</div>{col([false, false, true])}</div>;
  if (num === 9) return <div style={{ ...full, justifyContent: 'space-between', position: 'relative' }}>{col([false, false, true, true])}<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>{pip()}</div>{col([false, false, true, true])}</div>;
  if (num === 10) return <div style={{ ...full, justifyContent: 'space-between', position: 'relative' }}>{col([false, false, true, true])}<div style={{ position: 'absolute', top: '22%', left: '50%', transform: 'translate(-50%, -50%)' }}>{pip()}</div><div style={{ position: 'absolute', bottom: '22%', left: '50%', transform: 'translate(-50%, 50%)' }}>{pip(true)}</div>{col([false, false, true, true])}</div>;
  return <span style={pipStyle}>{s}</span>;
};

// ─── Props ────────────────────────────────────────────────────────────────────

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

// Size map follows Rishabh Doshi's 66x92 base ratio
const SIZE_MAP = {
  xs: { width: 42, height: 58, cornerFs: 9,  centerFs: 16, pipFs: 10 },
  sm: { width: 52, height: 72, cornerFs: 10, centerFs: 19, pipFs: 12 },
  md: { width: 66, height: 92, cornerFs: 12, centerFs: 26, pipFs: 15 },
  lg: { width: 82, height: 114, cornerFs: 14, centerFs: 32, pipFs: 18 },
  xl: { width: 100, height: 140, cornerFs: 16, centerFs: 38, pipFs: 21 },
};

// Card Back
const CardBack: React.FC<{ size: keyof typeof SIZE_MAP }> = ({ size }) => {
  const { width, height } = SIZE_MAP[size];
  return (
    <div style={{
      width, height, flexShrink: 0,
      background: 'linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%) 0 0 / 9px 9px, linear-gradient(135deg, #163c5a, #234f70)',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 14px 28px rgba(7,61,52,0.18)',
    }} />
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

  const { width, height, cornerFs, centerFs, pipFs } = SIZE_MAP[size];
  const red = isRedSuit(card.suit);
  const color = red ? '#c62828' : '#1f2937';
  const suitSym = SUIT_SYMBOL[card.suit];
  const isCourtOrAce = ['J', 'Q', 'K', 'A'].includes(card.rank);
  const pad = Math.max(4, Math.round(width * 0.07));
  const canPlay = isPlayable && isLegal;

  const centerContent = isCourtOrAce ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, fontFamily: 'Georgia, serif', color }}>
      <span style={{ fontSize: centerFs, fontWeight: 700 }}>{card.rank}</span>
      <span style={{ fontSize: centerFs * 0.72, lineHeight: 1.1 }}>{suitSym}</span>
    </div>
  ) : (
    <PipLayout rank={card.rank} suit={card.suit} pipStyle={{ fontSize: pipFs, color, fontFamily: 'Georgia, serif' }} />
  );

  return (
    <button
      type="button"
      onClick={canPlay ? onClick : undefined}
      disabled={!canPlay}
      className={className}
      style={{
        width, height, flexShrink: 0,
        // Rishabh Doshi's exact playing-card-face style
        background: 'linear-gradient(#fff 0%, #fbfdff 100%)',
        border: `1px solid ${canPlay ? '#16a34a' : '#c9d4ce'}`,
        borderRadius: 12,
        boxShadow: canPlay
          ? 'inset 0 0 0 1px #fff, 0 0 0 2px rgba(22,163,74,0.28), 0 4px 10px rgba(0,0,0,0.12)'
          : 'inset 0 0 0 1px #fff, 0 2px 4px rgba(0,0,0,0.08)',
        padding: `${pad}px ${pad}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'left',
        cursor: canPlay ? 'pointer' : isPlayable && !isLegal ? 'not-allowed' : 'default',
        opacity: isPlayable && !isLegal ? 0.38 : 1,
        filter: isPlayable && !isLegal ? 'grayscale(0.35)' : undefined,
        transform: isSelected ? 'translateY(-10px)' : undefined,
        transition: 'transform 0.14s, box-shadow 0.14s, border-color 0.14s',
        position: 'relative',
        zIndex: canPlay ? 5 : undefined,
        outline: 'none',
      }}
      onMouseEnter={e => {
        if (canPlay) {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'inset 0 0 0 1px #fff, 0 0 0 2px rgba(22,163,74,0.45), 0 8px 18px rgba(0,0,0,0.14)';
        }
      }}
      onMouseLeave={e => {
        if (canPlay) {
          (e.currentTarget as HTMLButtonElement).style.transform = '';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'inset 0 0 0 1px #fff, 0 0 0 2px rgba(22,163,74,0.28), 0 4px 10px rgba(0,0,0,0.12)';
        }
      }}
    >
      {/* Top-left corner */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1, fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: cornerFs, color }}>
        <span>{card.rank}</span>
        <span style={{ fontSize: cornerFs * 0.88, lineHeight: 0.9 }}>{suitSym}</span>
      </div>

      {/* Centre */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 0' }}>
        {centerContent}
      </div>

      {/* Bottom-right corner rotated */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1, fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: cornerFs, color, transform: 'rotate(180deg)', alignSelf: 'flex-end' }}>
        <span>{card.rank}</span>
        <span style={{ fontSize: cornerFs * 0.88, lineHeight: 0.9 }}>{suitSym}</span>
      </div>
    </button>
  );
};
