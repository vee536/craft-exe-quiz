import React from 'react';

interface BlazeRodIconProps {
  used?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  statusLabel?: boolean;
  className?: string;
}

export const BlazeRodIcon: React.FC<BlazeRodIconProps> = ({
  used = false,
  size = 'md',
  animated = true,
  statusLabel = false,
  className = ''
}) => {
  const sizeMap = {
    sm: { w: 20, h: 28, text: 'text-[9px]' },
    md: { w: 28, h: 40, text: 'text-xs' },
    lg: { w: 42, h: 60, text: 'text-sm' },
  };

  const { w, h } = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 select-none transition-all duration-300 ${
        used ? 'grayscale opacity-40 contrast-75' : ''
      } ${className}`}
      title={used ? 'Blaze Rod: USED' : 'Blaze Rod: AVAILABLE (2x Wager)'}
    >
      <div className="relative" style={{ width: w, height: h }}>
        {/* Glowing aura if available */}
        {!used && animated && (
          <div
            className="absolute inset-0 bg-amber-500/30 blur-md rounded-full animate-pulse pointer-events-none"
            style={{ transform: 'scale(1.4)' }}
          />
        )}

        {/* Pixel Art Blaze Rod SVG */}
        <svg
          viewBox="0 0 16 24"
          width={w}
          height={h}
          className={`relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
            !used && animated ? 'hover:scale-110 transition-transform' : ''
          }`}
          shapeRendering="crispEdges"
        >
          {/* Outer Rod Core - Pixel Grid */}
          {/* Main rod body */}
          <rect x="6" y="2" width="4" height="20" fill={used ? '#52525b' : '#f59e0b'} />
          <rect x="7" y="3" width="2" height="18" fill={used ? '#71717a' : '#fef08a'} />
          
          {/* Yellow/Orange highlight segments */}
          <rect x="6" y="4" width="4" height="2" fill={used ? '#3f3f46' : '#d97706'} />
          <rect x="6" y="9" width="4" height="2" fill={used ? '#3f3f46' : '#d97706'} />
          <rect x="6" y="14" width="4" height="2" fill={used ? '#3f3f46' : '#d97706'} />
          <rect x="6" y="19" width="4" height="2" fill={used ? '#3f3f46' : '#b45309'} />

          {/* Fiery particles orbiting (if not used) */}
          {!used && (
            <>
              <rect x="3" y="6" width="2" height="2" fill="#ef4444" opacity="0.9">
                <animate attributeName="y" values="6;4;6" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="x" values="3;2;3" dur="1.2s" repeatCount="indefinite" />
              </rect>
              <rect x="11" y="12" width="2" height="2" fill="#fbbf24" opacity="0.9">
                <animate attributeName="y" values="12;10;12" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="x" values="11;12;11" dur="1.5s" repeatCount="indefinite" />
              </rect>
              <rect x="2" y="16" width="2" height="2" fill="#f97316" opacity="0.8">
                <animate attributeName="y" values="16;14;16" dur="1.8s" repeatCount="indefinite" />
              </rect>
              <rect x="11" y="5" width="2" height="2" fill="#f59e0b" opacity="0.9">
                <animate attributeName="y" values="5;7;5" dur="1.4s" repeatCount="indefinite" />
              </rect>
            </>
          )}

          {/* Used ash particles */}
          {used && (
            <rect x="6" y="2" width="4" height="20" fill="#27272a" opacity="0.5" />
          )}
        </svg>
      </div>

      <span
        className={`font-pixel ${sizeMap[size].text} tracking-wider uppercase font-bold ${
          used
            ? 'text-zinc-500 line-through'
            : 'text-amber-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
        }`}
      >
        {used ? 'USED' : statusLabel ? 'AVAILABLE' : 'BLAZE'}
      </span>
    </div>
  );
};
