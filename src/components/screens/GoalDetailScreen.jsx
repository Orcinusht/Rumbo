import React, { useEffect } from 'react';
import { ArrowLeft, PencilSimple, CaretRight, Plus } from '@phosphor-icons/react';
import { useStore, goalWeeklyProgress } from '../../state/store';
import { useUi } from '../../state/ui';
import { CATEGORIES } from '../../lib/categories';
import { ProgressBar } from '../ui/ProgressBar';
import { isoWeekNumber, isoWeeksInYear } from '../../lib/dates';

export function GoalDetailScreen() {
  const { state } = useStore();
  const ui = useUi();
  const goal = state.goals.find((g) => g.id === ui.openGoalId);

  useEffect(() => {
    if (!goal) ui.closeGoal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal]);

  if (!goal) return null;
  const c = CATEGORIES[goal.catId];
  const { pct } = goalWeeklyProgress(goal);
  const today = new Date();
  const weekNo = isoWeekNumber(today);
  const totalWeeks = isoWeeksInYear(today.getFullYear());
  const filled = Math.round((totalWeeks * pct) / 100);
  const totalDaily = goal.weekly.reduce((a, w) => a + w.daily.length, 0);

  return (
    <div className="screen">
      <button type="button" onClick={ui.closeGoal} className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: 10 }}>
        <ArrowLeft size={15} weight="duotone" /> Metas
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <c.Icon size={15} weight="duotone" color={c.ink} />
        <span style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: c.ink }}>{c.label}</span>
        <span style={{ flex: 1 }} />
        <button type="button" aria-label="Editar meta" className="icon-btn" style={{ width: 44, height: 44, margin: '-11px -11px -11px 0', color: 'var(--color-accent-700)' }}
          onClick={() => ui.openEditor({ kind: 'goal', mode: 'edit', goalId: goal.id, text: goal.title })}>
          <PencilSimple size={18} weight="duotone" />
        </button>
      </div>
      <h2 style={{ fontSize: 32, margin: '8px 0 0', letterSpacing: '-.02em', lineHeight: 1.1 }}>{goal.title}</h2>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '18px 0 8px' }}>
        <div className="cmyk-num" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 64, letterSpacing: '-.04em' }}>
          <span className="paper">{pct} %</span>
          <span className="plate plate-c" aria-hidden="true">{pct} %</span>
          <span className="plate plate-m" aria-hidden="true">{pct} %</span>
          <span className="plate plate-y" aria-hidden="true">{pct} %</span>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11.5, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{goal.target}<br />Semana {weekNo} de {totalWeeks}</div>
      </div>
      <ProgressBar pct={pct} fill={c.fill} />

      <div style={{ marginTop: 26 }}>
        <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 9 }}>El año, semana a semana</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13,1fr)', gap: 3 }}>
          {Array.from({ length: totalWeeks }, (_, i) => (
            <span key={i} style={{
              aspectRatio: '1', borderRadius: 1,
              background: i < filled ? c.fill : (i === weekNo - 1 ? 'transparent' : '#dedbda'),
              boxShadow: i === weekNo - 1 ? `inset 0 0 0 1.5px ${c.ink}` : 'none',
            }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 20, margin: 0 }}>Objetivos semanales</h3>
          <span style={{ fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{goal.weekly.length} semanales · {totalDaily} diarios</span>
        </div>
        <div style={{ height: 1, background: 'var(--color-text)', margin: '9px 0 2px' }} />
        {goal.weekly.map((w) => (
          <div key={w.id} style={{ display: 'flex', gap: 0, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(32,30,29,.1)' }}>
            <WeeklyCheck goal={goal} w={w} c={c} />
            <button type="button" onClick={() => ui.openWeekly(w.id)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', minWidth: 0 }}>
              <div style={{ fontSize: 15.5, lineHeight: 1.35, color: w.done ? 'var(--color-text-done)' : 'var(--color-text)' }}>{w.text}</div>
              <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {w.daily.length ? `${w.daily.length} ${w.daily.length === 1 ? 'objetivo diario' : 'objetivos diarios'}` : 'Sin diarios todavía'}
              </div>
            </button>
            <button type="button" aria-label="Editar" className="icon-btn" style={{ flex: 'none', width: 40, height: 44, color: 'var(--color-accent-700)' }}
              onClick={() => ui.openEditor({ kind: 'weekly', mode: 'edit', goalId: goal.id, weeklyId: w.id, text: w.text })}>
              <PencilSimple size={16} weight="duotone" />
            </button>
            <CaretRight size={15} weight="duotone" color="#8a8887" style={{ flex: 'none' }} />
          </div>
        ))}
        <button type="button" onClick={() => ui.openEditor({ kind: 'weekly', mode: 'new', goalId: goal.id, text: '' })} className="btn btn-ghost" style={{ marginTop: 10, paddingLeft: 0 }}>
          <Plus size={15} weight="duotone" /> Añadir objetivo semanal
        </button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '16px 0 0', fontStyle: 'italic' }}>Cada objetivo semanal contiene sus objetivos diarios. Entra en uno para verlos o añadir más.</p>
    </div>
  );
}

function WeeklyCheck({ goal, w, c }) {
  const { dispatch } = useStore();
  const toggle = () => dispatch({ type: 'TOGGLE_WEEKLY_DONE', goalId: goal.id, weeklyId: w.id });
  return (
    <button type="button" aria-label="Marcar objetivo semanal" onClick={toggle}
      style={{ flex: 'none', width: 44, height: 44, marginLeft: -8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}>
      <span style={{ width: 22, height: 22, display: 'grid', placeItems: 'center', borderRadius: 2, border: `1.5px solid ${w.done ? c.fill : 'rgba(32,30,29,.32)'}`, background: w.done ? c.fill : 'transparent' }}>
        {w.done && (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8.4l3.2 3.2L13 4.8" stroke="var(--color-bg)" strokeWidth="2.2" strokeLinecap="square" /></svg>
        )}
      </span>
    </button>
  );
}
