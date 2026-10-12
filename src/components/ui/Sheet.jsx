import React, { useRef, useState } from 'react';
import { useScrollLock } from '../../lib/useScrollLock';

const DISMISS_DISTANCE = 110; // px dragged down
const DISMISS_VELOCITY = 0.55; // px/ms

export function Sheet({ onClose, children, style }) {
  useScrollLock();
  const drag = useRef(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);

  const onPointerDown = (e) => {
    drag.current = { startY: e.clientY, startTime: Date.now() };
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const delta = e.clientY - drag.current.startY;
    if (delta > 0) setDragY(delta);
  };
  const endDrag = () => {
    if (!drag.current) return;
    const elapsed = Date.now() - drag.current.startTime;
    const velocity = dragY / Math.max(elapsed, 1);
    drag.current = null;
    setDragging(false);
    if (dragY > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
      setClosing(true);
      setDragY(window.innerHeight);
      setTimeout(onClose, 220);
    } else {
      setDragY(0);
    }
  };

  return (
    <div className="sheet-backdrop" style={closing ? { opacity: 0, transition: 'opacity .2s ease' } : undefined}>
      <button type="button" aria-label="Cerrar" className="sheet-scrim" onClick={onClose} />
      <div
        className="sheet"
        style={{
          ...style,
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? 'none' : undefined,
        }}
      >
        <div
          className="sheet-handle"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="sheet-grabber" />
        </div>
        {children}
      </div>
    </div>
  );
}

export function FullSheet({ children }) {
  useScrollLock();
  return <div className="full-sheet">{children}</div>;
}
