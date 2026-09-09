import React from 'react';

export function ProgressBar({ pct, fill = 'var(--color-text)', thin }) {
  return (
    <div className={`progress-track${thin ? ' thin' : ''}`}>
      <div className="progress-fill" style={{ width: `${pct}%`, background: fill }} />
    </div>
  );
}
