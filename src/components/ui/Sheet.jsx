import React from 'react';

export function Sheet({ onClose, children, style }) {
  return (
    <div className="sheet-backdrop">
      <button type="button" aria-label="Cerrar" className="sheet-scrim" onClick={onClose} />
      <div className="sheet" style={style}>
        <div className="sheet-grabber" />
        {children}
      </div>
    </div>
  );
}

export function FullSheet({ children }) {
  return <div className="full-sheet">{children}</div>;
}
