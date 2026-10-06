import React from 'react';

// A circular progress indicator built from a plain SVG circle — used for
// the Hoy day ring and the goal-detail percentage.
export function ProgressRing({ pct, size = 64, stroke = 7, fill = 'var(--color-accent)', track = 'var(--color-surface-3)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={fill} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.25,1)' }}
        />
      </svg>
      {children && <div className="ring-value">{children}</div>}
    </div>
  );
}
