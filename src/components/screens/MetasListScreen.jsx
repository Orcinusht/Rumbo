import React from 'react';
import { Plus } from '@phosphor-icons/react';
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
      <div className="screen-kicker" style={{ alignItems: 'baseline' }}>
        <span>Metas del año</span><span>{state.goals.length} activas</span>
      </div>
      <div className="screen-rule" />
      <div className="screen-rule-thin" />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '18px 0 22px' }}>
        <h2 style={{ fontSize: 34 }}>Metas</h2>
        <button type="button" onClick={ui.openWizard} className="btn btn-primary"><Plus size={14} weight="duotone" /> Nueva</button>
      </div>
      {groups.map(({ key, c, list }) => (
        <div key={key} style={{ marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <c.Icon size={15} weight="duotone" color={c.ink} />
            <span style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: c.ink }}>{c.label}</span>
            <span style={{ flex: 1, height: 1, background: 'rgba(32,30,29,.14)' }} />
          </div>
          {list.map((g) => {
            const { pct } = goalWeeklyProgress(g);
            return (
              <button key={g.id} type="button" onClick={() => ui.openGoal(g.id)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 0, padding: '0 0 16px', cursor: 'pointer', font: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 19, lineHeight: 1.25 }}>{g.title}</span>
                  <span style={{ fontSize: 15, color: c.ink, flex: 'none' }}>{pct} %</span>
                </div>
                <div style={{ margin: '8px 0 5px' }}><ProgressBar pct={pct} fill={c.fill} thin /></div>
                <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{g.target}</span>
              </button>
            );
          })}
        </div>
      ))}
      {!groups.length && <p style={{ fontSize: 14.5, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Todavía no hay metas. Crea la primera con «Nueva».</p>}
    </div>
  );
}
