import React, { useEffect } from 'react';
import { ArrowLeft, PencilSimple, Plus } from '@phosphor-icons/react';
import { useStore } from '../../state/store';
import { useUi } from '../../state/ui';
import { CATEGORIES } from '../../lib/categories';
import { DOW_LETTERS, daysArrayToMap } from '../../lib/dates';

export function WeeklyDetailScreen() {
  const { state, dispatch } = useStore();
  const ui = useUi();
  const goal = state.goals.find((g) => g.id === ui.openGoalId);
  const weekly = goal && goal.weekly.find((w) => w.id === ui.openWeeklyId);

  useEffect(() => {
    if (!weekly) ui.closeWeekly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekly]);

  if (!goal || !weekly) return null;
  const c = CATEGORIES[goal.catId];

  const toggleDone = () => dispatch({ type: 'TOGGLE_WEEKLY_DONE', goalId: goal.id, weeklyId: weekly.id });

  return (
    <div className="screen">
      <button type="button" onClick={ui.closeWeekly} className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: 10 }}>
        <ArrowLeft size={15} weight="duotone" /> {goal.title}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <c.Icon size={15} weight="duotone" color={c.ink} />
        <span style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: c.ink }}>Objetivo semanal</span>
        <span style={{ flex: 1 }} />
        <button type="button" aria-label="Editar objetivo semanal" className="icon-btn" style={{ width: 44, height: 44, margin: '-11px -11px -11px 0', color: 'var(--color-accent-700)' }}
          onClick={() => ui.openEditor({ kind: 'weekly', mode: 'edit', goalId: goal.id, weeklyId: weekly.id, text: weekly.text })}>
          <PencilSimple size={18} weight="duotone" />
        </button>
      </div>
      <h2 style={{ fontSize: 28, margin: '8px 0 0', letterSpacing: '-.02em', lineHeight: 1.15 }}>{weekly.text}</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <button type="button" onClick={toggleDone} className="btn btn-secondary">{weekly.done ? 'Marcar como pendiente' : 'Marcar cumplido'}</button>
        <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{weekly.done ? 'Cumplido esta semana' : 'Pendiente esta semana'}</span>
      </div>

      <div style={{ marginTop: 26 }}>
        <h3 style={{ fontSize: 20, margin: 0 }}>Objetivos diarios</h3>
        <div style={{ height: 1, background: 'var(--color-text)', margin: '9px 0 2px' }} />
        {weekly.daily.map((d) => (
          <div key={d.id} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(32,30,29,.1)' }}>
            <span style={{ flex: 'none', width: 9, height: 9, borderRadius: 2, background: c.fill }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, lineHeight: 1.35 }}>{d.text}</div>
              <div style={{ fontSize: 11, letterSpacing: '.12em', color: c.ink, marginTop: 3 }}>{DOW_LETTERS.filter((l) => d.days.includes(l)).join(' ')}</div>
            </div>
            <button type="button" aria-label="Editar" className="icon-btn" style={{ flex: 'none', width: 44, height: 44, marginRight: -11, color: 'var(--color-accent-700)' }}
              onClick={() => ui.openEditor({ kind: 'daily', mode: 'edit', goalId: goal.id, weeklyId: weekly.id, dailyId: d.id, text: d.text, days: daysArrayToMap(d.days) })}>
              <PencilSimple size={16} weight="duotone" />
            </button>
          </div>
        ))}
        {!weekly.daily.length && <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontStyle: 'italic', margin: '14px 0 0' }}>Todavía no hay objetivos diarios en este semanal.</p>}
        <button type="button" onClick={() => ui.openEditor({ kind: 'daily', mode: 'new', goalId: goal.id, weeklyId: weekly.id, text: '', days: { L: true, M: true, X: true, J: true, V: true, S: false, D: false } })} className="btn btn-ghost" style={{ marginTop: 10, paddingLeft: 0 }}>
          <Plus size={15} weight="duotone" /> Añadir objetivo diario
        </button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '16px 0 0', fontStyle: 'italic' }}>Los diarios de este semanal aparecen solos en el calendario y en Hoy, los días marcados.</p>
    </div>
  );
}
