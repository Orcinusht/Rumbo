import React, { useEffect } from 'react';
import { ArrowLeft, PencilSimple, CaretRight, Plus, Check, Sparkle } from '@phosphor-icons/react';
import {
  useStore, goalWeeklyProgress, weeklyOccurrence, isWeeklyActiveOnDate, goalYearGrid,
} from '../../state/store';
import { useUi } from '../../state/ui';
import { CATEGORIES } from '../../lib/categories';
import { ProgressRing } from '../ui/ProgressRing';
import { isoWeekNumber, isoWeeksInYear, isoWeekKey, startOfWeek, weekRepeatLabel } from '../../lib/dates';

export function GoalDetailScreen() {
  const { state, dispatch } = useStore();
  const ui = useUi();
  const goal = state.goals.find((g) => g.id === ui.openGoalId);

  useEffect(() => {
    if (!goal) ui.closeGoal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal]);

  if (!goal) return null;
  const c = CATEGORIES[goal.catId];
  const { pct } = goalWeeklyProgress(state, goal);
  const today = new Date();
  const weekNo = isoWeekNumber(today);
  const totalWeeks = isoWeeksInYear(today.getFullYear());
  const totalDaily = goal.weekly.reduce((a, w) => a + w.daily.length, 0);
  const grid = goalYearGrid(state, goal, today.getFullYear(), today);

  const toggleWeekly = (w) => {
    if (!isWeeklyActiveOnDate(w, today)) return;
    dispatch({ type: 'TOGGLE_WEEKLY_OCCURRENCE', weeklyId: w.id, weekKey: isoWeekKey(startOfWeek(today)) });
  };

  const suggestWeekly = () => ui.openSuggest({
    kind: 'weekly', goalTitle: goal.title, goalTarget: goal.target, catLabel: c.label,
    existing: goal.weekly.map((w) => w.text),
    onAdd: (texts) => texts.forEach((text) => dispatch({ type: 'SAVE_WEEKLY', goalId: goal.id, mode: 'new', text, every: 1 })),
  });

  return (
    <div className="screen">
      <button type="button" onClick={ui.closeGoal} className="btn btn-ghost btn-sm" style={{ marginLeft: -10, marginBottom: 14 }}>
        <ArrowLeft size={15} weight="bold" /> Metas
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="chip" style={{ background: c.tint, color: c.ink }}>
          <c.Icon size={13} weight="fill" /> {c.label}
        </span>
        <span style={{ flex: 1 }} />
        <button type="button" aria-label="Editar meta" className="icon-btn" style={{ width: 40, height: 40, marginRight: -8 }}
          onClick={() => ui.openEditor({ kind: 'goal', mode: 'edit', goalId: goal.id, text: goal.title })}>
          <PencilSimple size={17} weight="bold" />
        </button>
      </div>
      <h1 style={{ margin: '10px 0 0', fontSize: 28, lineHeight: 1.15 }}>{goal.title}</h1>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '18px 0' }}>
        <ProgressRing pct={pct} size={76} stroke={8} fill={c.fill}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 19 }}>{pct}%</span>
        </ProgressRing>
        <div>
          {goal.target && <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 3 }}>{goal.target}</div>}
          <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>Semana {weekNo} de {totalWeeks}</div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="kicker">El año, semana a semana</div>
        <div className="year-grid">
          {grid.map((w) => {
            const bg = w.status === 'done' ? c.fill
              : w.status === 'missed' ? 'var(--color-danger-tint)'
                : 'var(--color-surface-3)';
            return (
              <span key={w.week} className={`year-cell${w.isCurrent ? ' current' : ''}`}
                style={{ background: bg, '--fill': c.fill }}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11.5, color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
          <LegendDot color={c.fill} label="Cumplida" />
          <LegendDot color="var(--color-danger-tint)" label="Fallada" />
          <LegendDot color="var(--color-surface-3)" label="Sin nada" />
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <div className="section-head">
          <h3>Objetivos semanales</h3>
          <span className="count">{goal.weekly.length} · {totalDaily} diarios</span>
        </div>
        <div className="card list-card">
          {goal.weekly.map((w) => {
            const occ = weeklyOccurrence(state, w, today);
            const active = isWeeklyActiveOnDate(w, today);
            return (
              <div key={w.id} className="list-row">
                <button type="button" aria-label="Marcar objetivo semanal" onClick={() => toggleWeekly(w)}
                  disabled={!active}
                  style={{ flex: 'none', width: 36, height: 36, display: 'grid', placeItems: 'center', background: 'none', border: 0, cursor: active ? 'pointer' : 'default', padding: 0, opacity: active ? 1 : 0.35 }}>
                  <span className={`checkbox-box${occ.done ? ' checked' : ''}`} style={{ width: 24, height: 24, '--fill': c.fill }}>
                    {occ.done && <Check size={14} weight="bold" color="#fff" />}
                  </span>
                </button>
                <button type="button" onClick={() => ui.openWeekly(w.id)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35, color: occ.done ? 'var(--color-text-done)' : 'var(--color-text)' }}>{w.text}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3, flexWrap: 'wrap' }}>
                    <span className="task-meta">{weekRepeatLabel(w.repeat?.every || 1)}</span>
                    <span style={{ color: 'var(--color-text-faint)' }}>·</span>
                    <span className="task-meta">{w.daily.length ? `${w.daily.length} diario${w.daily.length === 1 ? '' : 's'}` : 'sin diarios'}</span>
                  </div>
                </button>
                <button type="button" aria-label="Editar" className="icon-btn" style={{ flex: 'none', width: 36, height: 36 }}
                  onClick={() => ui.openEditor({ kind: 'weekly', mode: 'edit', goalId: goal.id, weeklyId: w.id, text: w.text, every: w.repeat?.every || 1 })}>
                  <PencilSimple size={15} weight="bold" />
                </button>
                <CaretRight size={15} weight="bold" color="var(--color-text-faint)" style={{ flex: 'none' }} onClick={() => ui.openWeekly(w.id)} />
              </div>
            );
          })}
          {!goal.weekly.length && <p style={{ fontSize: 14, color: 'var(--color-text-faint)', padding: '6px 2px' }}>Todavía no hay objetivos semanales.</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => ui.openEditor({ kind: 'weekly', mode: 'new', goalId: goal.id, text: '', every: 1 })} className="add-row" style={{ flex: 1 }}>
            <Plus size={17} weight="bold" /> Añadir
          </button>
          <button type="button" onClick={suggestWeekly} className="add-row" style={{ flex: 1, borderStyle: 'solid', color: 'var(--color-accent)' }}>
            <Sparkle size={16} weight="fill" /> Sugerir con IA
          </button>
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--color-text-faint)', margin: '16px 2px 0' }}>Cada objetivo semanal puede tener sus propios objetivos diarios — entra en uno para verlos o añadir más.</p>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 9, height: 9, borderRadius: 3, background: color, flex: 'none' }} />
      {label}
    </span>
  );
}
