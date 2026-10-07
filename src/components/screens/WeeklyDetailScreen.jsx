import React, { useEffect } from 'react';
import { ArrowLeft, PencilSimple, Plus, Check, Sparkle } from '@phosphor-icons/react';
import { useStore, weeklyOccurrence, isWeeklyActiveOnDate } from '../../state/store';
import { useUi } from '../../state/ui';
import { CATEGORIES } from '../../lib/categories';
import { DOW_LETTERS, daysArrayToMap, isoWeekKey, startOfWeek, weekRepeatLabel } from '../../lib/dates';

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
  const today = new Date();
  const occ = weeklyOccurrence(state, weekly, today);
  const active = isWeeklyActiveOnDate(weekly, today);

  const toggleDone = () => {
    if (!active) return;
    dispatch({ type: 'TOGGLE_WEEKLY_OCCURRENCE', weeklyId: weekly.id, weekKey: isoWeekKey(startOfWeek(today)) });
  };

  const suggestDaily = () => ui.openSuggest({
    kind: 'daily', goalTitle: goal.title, weeklyText: weekly.text,
    existing: weekly.daily.map((d) => d.text),
    onAdd: (texts) => texts.forEach((text) => dispatch({
      type: 'ADD_DAILY', goalId: goal.id, weeklyId: weekly.id, text, days: ['L', 'M', 'X', 'J', 'V'],
    })),
  });

  return (
    <div className="screen">
      <button type="button" onClick={ui.closeWeekly} className="btn btn-ghost btn-sm" style={{ marginLeft: -10, marginBottom: 14 }}>
        <ArrowLeft size={15} weight="bold" /> {goal.title}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="chip" style={{ background: c.tint, color: c.ink }}>
          <c.Icon size={13} weight="fill" /> Objetivo semanal
        </span>
        <span style={{ flex: 1 }} />
        <button type="button" aria-label="Editar objetivo semanal" className="icon-btn" style={{ width: 40, height: 40, marginRight: -8 }}
          onClick={() => ui.openEditor({ kind: 'weekly', mode: 'edit', goalId: goal.id, weeklyId: weekly.id, text: weekly.text, every: weekly.repeat?.every || 1 })}>
          <PencilSimple size={17} weight="bold" />
        </button>
      </div>
      <h1 style={{ margin: '10px 0 0', fontSize: 25, lineHeight: 1.2 }}>{weekly.text}</h1>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 6 }}>{weekRepeatLabel(weekly.repeat?.every || 1)}</div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '16px 0' }}>
        <button type="button" onClick={toggleDone} disabled={!active}
          style={{ flex: 'none', background: 'none', border: 0, padding: 0, cursor: active ? 'pointer' : 'default', opacity: active ? 1 : 0.4 }}>
          <span className={`checkbox-box${occ.done ? ' checked' : ''}`} style={{ width: 40, height: 40, '--fill': c.fill }}>
            {occ.done && <Check size={20} weight="bold" color="#fff" />}
          </span>
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{active ? (occ.done ? 'Cumplido esta semana' : 'Pendiente esta semana') : 'No toca esta semana'}</div>
          <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 2 }}>{active ? 'Toca en esta semana' : weekRepeatLabel(weekly.repeat?.every || 1)}</div>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div className="section-head"><h3>Objetivos diarios</h3></div>
        <div className="card list-card">
          {weekly.daily.map((d) => (
            <div key={d.id} className="list-row">
              <span style={{ flex: 'none', width: 10, height: 10, borderRadius: 'var(--radius-pill)', background: c.fill }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{d.text}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.03em', color: c.ink, marginTop: 3 }}>{DOW_LETTERS.filter((l) => d.days.includes(l)).join(' · ')}</div>
              </div>
              <button type="button" aria-label="Editar" className="icon-btn" style={{ flex: 'none', width: 36, height: 36 }}
                onClick={() => ui.openEditor({ kind: 'daily', mode: 'edit', goalId: goal.id, weeklyId: weekly.id, dailyId: d.id, text: d.text, days: daysArrayToMap(d.days) })}>
                <PencilSimple size={15} weight="bold" />
              </button>
            </div>
          ))}
          {!weekly.daily.length && <p style={{ fontSize: 14, color: 'var(--color-text-faint)', padding: '6px 2px' }}>Todavía no hay objetivos diarios en este semanal.</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => ui.openEditor({ kind: 'daily', mode: 'new', goalId: goal.id, weeklyId: weekly.id, text: '', days: { L: true, M: true, X: true, J: true, V: true, S: false, D: false } })} className="add-row" style={{ flex: 1 }}>
            <Plus size={17} weight="bold" /> Añadir
          </button>
          <button type="button" onClick={suggestDaily} className="add-row" style={{ flex: 1, borderStyle: 'solid', color: 'var(--color-accent)' }}>
            <Sparkle size={16} weight="fill" /> Sugerir con IA
          </button>
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--color-text-faint)', margin: '16px 2px 0' }}>Los diarios de este semanal aparecen solos en el calendario y en Hoy, los días marcados.</p>
    </div>
  );
}
