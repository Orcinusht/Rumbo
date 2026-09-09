import React from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import { Sheet } from '../ui/Sheet';
import { useUi } from '../../state/ui';
import { useStore } from '../../state/store';
import { CATEGORIES, CATEGORY_ORDER } from '../../lib/categories';

export function AddTaskSheet() {
  const { addDraft, updateAdd, closeAdd, setTab } = useUi();
  const { state, dispatch } = useStore();
  const { title, catId, goalId } = addDraft;

  const goalsForCat = state.goals.filter((g) => g.catId === catId);

  const save = () => {
    const value = (title || '').trim();
    if (!value) { closeAdd(); return; }
    dispatch({ type: 'ADD_LOOSE_TASK', catId, title: value, goalId });
    closeAdd();
    setTab('hoy');
  };

  return (
    <Sheet onClose={closeAdd}>
      <h3 style={{ fontSize: 24, margin: '0 0 14px', letterSpacing: '-.02em' }}>Objetivo de hoy</h3>
      <div className="field" style={{ marginBottom: 18 }}>
        <label htmlFor="rumbo-add">Qué vas a hacer</label>
        <input id="rumbo-add" className="input" placeholder="Ej. Estirar 10 minutos" value={title}
          onChange={(e) => updateAdd({ title: e.target.value })} style={{ fontSize: 16, minHeight: 44 }} />
      </div>
      <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 9 }}>Categoría</div>
      <div className="pill-row" style={{ marginBottom: 18 }}>
        {CATEGORY_ORDER.map((k) => {
          const c = CATEGORIES[k];
          const on = catId === k;
          return (
            <button key={k} type="button" className="pill-btn" onClick={() => updateAdd({ catId: k, goalId: null })}
              style={{ borderColor: on ? c.fill : undefined, background: on ? c.tint : undefined }}>
              <c.Icon size={16} weight="duotone" color={c.ink} />{c.label}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 9 }}>Meta asociada</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        {goalsForCat.map((g) => {
          const on = goalId === g.id;
          const c = CATEGORIES[catId];
          return (
            <button key={g.id} type="button" onClick={() => updateAdd({ goalId: g.id })}
              style={{ display: 'flex', alignItems: 'center', gap: 9, textAlign: 'left', padding: '10px 12px', borderRadius: 3, cursor: 'pointer', font: 'inherit', fontSize: 14.5, border: `1.5px solid ${on ? c.fill : 'rgba(32,30,29,.18)'}`, background: on ? c.tint : 'transparent' }}>
              <span style={{ flex: 1 }}>{g.title}</span>
              {on && <CheckCircle size={17} weight="duotone" color={c.ink} />}
            </button>
          );
        })}
        <button type="button" onClick={() => updateAdd({ goalId: null })}
          style={{ display: 'flex', alignItems: 'center', gap: 9, textAlign: 'left', padding: '10px 12px', borderRadius: 3, cursor: 'pointer', font: 'inherit', fontSize: 14.5, border: `1.5px solid ${!goalId ? 'var(--color-text)' : 'rgba(32,30,29,.18)'}`, background: !goalId ? 'var(--color-surface)' : 'transparent' }}>
          <span style={{ flex: 1 }}>Sin meta asociada</span>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={closeAdd} className="btn btn-secondary" style={{ flex: 'none' }}>Cancelar</button>
        <button type="button" onClick={save} className="btn btn-primary" style={{ flex: 1 }}>Añadir a hoy</button>
      </div>
    </Sheet>
  );
}
