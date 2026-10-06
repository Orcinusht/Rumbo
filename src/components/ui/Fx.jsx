import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { useStore } from '../../state/store';

const FxContext = createContext(null);

const INKS = ['#6c5ce7', '#ff5d7a', '#3e8bff', '#f5a623', '#22c55e', '#14b8a6'];

export function FxProvider({ children }) {
  const { state } = useStore();
  const hostRef = useRef(null);
  const [celebration, setCelebration] = useState(null);

  const burst = useCallback((e, big) => {
    if (state.settings.confetti === false) return;
    const host = hostRef.current;
    if (!host) return;
    const hr = host.getBoundingClientRect();
    let x = hr.width / 2;
    let y = hr.height * 0.42;
    if (e && e.currentTarget) {
      const r = e.currentTarget.getBoundingClientRect();
      x = r.left - hr.left + r.width / 2;
      y = r.top - hr.top + r.height / 2;
    }
    const n = big ? 46 : 16;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      const a = Math.random() * Math.PI * 2;
      const dist = (big ? 60 : 26) + Math.random() * (big ? 190 : 56);
      const w = (3 + Math.random() * 4).toFixed(1);
      const h = (6 + Math.random() * 7).toFixed(1);
      const dx = (Math.cos(a) * dist).toFixed(1);
      const dy = (Math.sin(a) * dist - 24).toFixed(1);
      const r2 = (Math.random() * 720 - 360).toFixed(0);
      s.className = 'confetti-bit';
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.width = `${w}px`;
      s.style.height = `${h}px`;
      s.style.background = INKS[i % INKS.length];
      s.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      s.style.setProperty('--dx', `${dx}px`);
      s.style.setProperty('--dy', `${dy}px`);
      s.style.setProperty('--r', `${r2}deg`);
      s.style.animation = `rumbo-conf ${big ? 1.05 : 0.78}s cubic-bezier(.2,.7,.3,1) forwards`;
      host.appendChild(s);
      setTimeout(() => s.remove(), 1120);
    }
  }, [state.settings.confetti]);

  const celebrate = useCallback((text) => {
    setCelebration(text);
    setTimeout(() => burst(null, true), 120);
    setTimeout(() => setCelebration(null), 1700);
  }, [burst]);

  return (
    <FxContext.Provider value={{ burst, celebrate }}>
      {children}
      {celebration && (
        <div className="celebration-overlay">
          <div style={{ textAlign: 'center', animation: 'rumbo-in .35s cubic-bezier(.2,.8,.25,1) both' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 32, letterSpacing: '-.02em', color: 'var(--color-accent)' }}>{celebration}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)', marginTop: 6 }}>Ya está en el calendario</div>
          </div>
        </div>
      )}
      <div ref={hostRef} className="confetti-layer" />
    </FxContext.Provider>
  );
}

export function useFx() {
  const ctx = useContext(FxContext);
  if (!ctx) throw new Error('useFx must be used within FxProvider');
  return ctx;
}
