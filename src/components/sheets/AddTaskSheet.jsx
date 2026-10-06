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
  const activeCat = CATEGORIES[catId];

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
      <h3 className="sheet-title">Objetivo de hoy</h3>
      <div className="field">
        <label htmlFor="rumbo-add">Qué vas a hacer</label>
        <input id="rumbo-add" className="input" placeholder="Ej. Estirar 10 minutos" value={title}
          onChange={(e) => updateAdd({ title: e.target.value })} style={{ fontSize: 16, minHeight: 44 }} autoFocus />
      </div>
      <div className="kicker">Categoría</div>
      <div className="pill-row" style={{ marginBottom: 18 }}>
        {CATEGORY_ORDER.map((k) => {
          const c = CATEGORIES[k];
          const on = catId === k;
          return (
            <button key={k} type="button" className={`pill-btn${on ? ' on' : ''}`} onClick={() => updateAdd({ catId: k, goalId: null })}
              style={on ? { borderColor: c.fill, background: c.tint, color: c.ink } : undefined}>
              <c.Icon size={16} weight="fill" color={on ? c.ink : c.fill} />{c.label}
            </button>
          );
        })}
      </div>
      <div className="kicker">Meta asociada</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 22 }}>
        {goalsForCat.map((g) => {
          const on = goalId === g.id;
          return (
            <button key={g.id} type="button" onClick={() => updateAdd({ goalId: g.id })} className={`pill-btn${on ? ' on' : ''}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '11px 14px', ...(on ? { borderColor: activeCat.fill, background: activeCat.tint, color: activeCat.ink } : {}) }}>
              <span style={{ flex: 1 }}>{g.title}</span>
              {on && <CheckCircle size={17} weight="fill" color={activeCat.ink} />}
            </button>
          );
        })}
        <button type="button" onClick={() => updateAdd({ goalId: null })} className={`pill-btn${!goalId ? ' on' : ''}`} style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '11px 14px' }}>
          Sin meta asociada
        </button>
      </div>
      <div className="sheet-actions" style={{ marginTop: 0 }}>
        <button type="button" onClick={closeAdd} className="btn btn-secondary" style={{ flex: 'none' }}>Cancelar</button>
        <button type="button" onClick={save} className="btn btn-primary" style={{ flex: 1 }}>Añadir a hoy</button>
      </div>
    </Sheet>
  );
}
