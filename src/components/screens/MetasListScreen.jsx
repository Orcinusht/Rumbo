import React from 'react';
import { Plus, Target } from '@phosphor-icons/react';
import { useStore, goalWeeklyProgress } from '../../state/store';
import { useUi } from '../../state/ui';
import { CATEGORIES, CATEGORY_ORDER } from '../../lib/categories';
import { ProgressBar } from '../ui/ProgressBar';

export function MetasListScreen() {
  const { state } = useStore();
  const ui = useUi();

  const groups = CATEGORY_ORDER.map((k) => {
    const list = state.goals.filter((g) => g.catId === k);
    if (!list.length) return null;
    return { key: k, c: CATEGORIES[k], list };
  }).filter(Boolean);

  return (
    <div className="screen">
      <div className="page-head">
        <div>
          <div className="kicker">Metas del año · {state.goals.length} activas</div>
          <h1>Metas</h1>
        </div>
        <button type="button" onClick={ui.openWizard} className="fab"><Plus size={16} weight="bold" /> Nueva</button>
      </div>

      {groups.map(({ key, c, list }) => (
        <div key={key} style={{ marginBottom: 24 }}>
          <div className="kicker" style={{ color: c.ink }}>
            <c.Icon size={15} weight="fill" color={c.ink} /> {c.label}
          </div>
          <div className="card list-card">
            {list.map((g) => {
              const { pct } = goalWeeklyProgress(state, g);
              return (
                <button key={g.id} type="button" onClick={() => ui.openGoal(g.id)} className="list-row"
                  style={{ display: 'flex', width: '100%', textAlign: 'left', background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.25 }}>{g.title}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: c.ink, flex: 'none' }}>{pct}%</span>
                    </div>
                    <div style={{ margin: '8px 0 5px' }}><ProgressBar pct={pct} fill={c.fill} thin /></div>
                    {g.target && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{g.target}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!groups.length && (
        <div className="empty-state">
          <div className="empty-icon"><Target size={32} weight="fill" /></div>
          <h3>Todavía no hay metas</h3>
          <p>Define una meta anual, desglósala en objetivos semanales y diarios, y Rumbo se encarga de recordártelos.</p>
          <button type="button" className="btn btn-primary" onClick={ui.openWizard}>
            <Plus size={16} weight="bold" /> Crear tu primera meta
          </button>
        </div>
      )}
    </div>
  );
}
