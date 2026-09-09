import React, { useState } from 'react';
import { Check } from '@phosphor-icons/react';
import { useFx } from './Fx';

// A tap target sized to 44x44 (accessibility) around a smaller visible box,
// matching the prototype's "44x44 hit area, 28x28 painted box" fix.
export function CheckBox({ done, fill, onToggle, size = 28, hitSize = 44, shape = 'square', big }) {
  const { burst } = useFx();
  const [pop, setPop] = useState(false);

  const handleClick = (e) => {
    const willBeDone = !done;
    onToggle();
    if (willBeDone) {
      setPop(true);
      burst(e, false);
      setTimeout(() => setPop(false), 420);
    }
  };

  return (
    <button
      type="button"
      aria-label="Marcar completada"
      className="checkbox-btn"
      style={{ width: hitSize, height: hitSize, margin: (size - hitSize) / 2 }}
      onClick={handleClick}
    >
      <span
        className={`checkbox-box${done ? ' checked' : ''}${pop ? ' pop' : ''}`}
        style={{ width: size, height: size, borderRadius: shape === 'circle' ? '50%' : 2, '--fill': fill }}
      >
        {done && <Check size={big ? 17 : 15} weight="bold" color="var(--color-bg)" />}
      </span>
    </button>
  );
}
