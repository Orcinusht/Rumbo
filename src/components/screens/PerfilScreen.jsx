import React from 'react';
import { useStore, goalWeeklyProgress, tasksOnDate } from '../../state/store';
import { CATEGORIES, CATEGORY_ORDER } from '../../lib/categories';
import { ProgressBar } from '../ui/ProgressBar';
import {
  DOW_LETTERS, addDays, startOfWeek, isoWeekNumber, isoWeeksInYear, capitalize,
} from '../../lib/dates';

function sumDoneInRange(state, from, to) {
  let done = 0;
  for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
    done += tasksOnDate(state, d).filter((t) => t.done).length;
  }
  return done;
}

const VARIANTS = [
  { k: 'a', name: 'Índice', desc: 'Agrupado por categoría, con anillo del día' },
  { k: 'b', name: 'Portada', desc: 'Cifra grande sobre fondo de color' },
  { k: 'c', name: 'Fichas', desc: 'Medidores por categoría y tarjetas grandes' },
];

export function PerfilScreen() {
  const { state, dispatch } = useStore();
  const today = new Date();
  const weekNo = isoWeekNumber(today);
  const totalWeeks = isoWeeksInYear(today.getFullYear());
  const pctYear = Math.round(((totalWeeks - weekNo) / totalWeeks) * 100);

  const weekDone = sumDoneInRange(state, startOfWeek(today), addDays(startOfWeek(today), 6));
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const monthDone = sumDoneInRange(state, monthStart, monthEnd);

  const catBars = CATEGORY_ORDER.map((k) => {
    const list = state.goals.filter((g) => g.catId === k);
    const pct = list.length ? Math.round(list.reduce((a, g) => a + goalWeeklyProgress(state, g).pct, 0) / list.length) : 0;
    return { key: k, c: CATEGORIES[k], pct, hasGoals: list.length > 0 };
  });

  const spark = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map((d) => {
    const tasks = tasksOnDate(state, d);
    const pct = tasks.length ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0;
    return { key: d.toISOString(), h: 10 + pct * 0.68, d: capitalize(DOW_LETTERS[(d.getDay() + 6) % 7]), isToday: d.toDateString() === today.toDateString() };
  });

  const setVariant = (v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { hoyVariant: v } });

  return (
    <div className="screen">
      <div className="page-head">
        <div>
          <div className="kicker">Año {today.getFullYear()}</div>
          <h1>Tu progreso</h1>
        </div>
      </div>
      <p style={{ fontSize: 14.5, color: 'var(--color-text-muted)', margin: '0 0 20px' }}>
        Vas por la semana {weekNo} de {totalWeeks} · queda el {pctYear}% del año.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 26 }}>
        {[[weekDone, 'esta semana'], [monthDone, 'este mes'], [state.goals.length, 'metas activas']].map(([n, l]) => (
          <div key={l} className="stat-tile">
            <div className="stat-n">{n}</div>
            <div className="stat-l">{l}</div>
          </div>
        ))}
      </div>

      {state.goals.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="kicker">Por categoría</div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {catBars.filter((b) => b.hasGoals).map(({ key, c, pct }) => (
              <div key={key}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, fontWeight: 600 }}><c.Icon size={15} weight="fill" color={c.ink} />{c.label}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: c.ink }}>{pct}%</span>
                </div>
                <ProgressBar pct={pct} fill={c.fill} thin />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 30 }}>
        <div className="kicker">Últimos siete días</div>
        <div className="card" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 92 }}>
          {spark.map((s) => (
            <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', gap: 7 }}>
              <div style={{ background: s.isToday ? 'var(--color-accent)' : 'var(--color-surface-3)', height: `${s.h}%`, borderRadius: 'var(--radius-sm)' }} />
              <div style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: s.isToday ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="kicker">Ajustes de Hoy</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {VARIANTS.map((v) => {
            const on = state.settings.hoyVariant === v.k;
            return (
              <button key={v.k} type="button" onClick={() => setVariant(v.k)}
                className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left', cursor: 'pointer', borderColor: on ? 'var(--color-accent)' : 'var(--color-border)', background: on ? 'var(--color-accent-tint)' : 'var(--color-surface)' }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 'var(--radius-pill)', display: 'grid', placeItems: 'center', flex: 'none',
                  background: on ? 'var(--color-accent)' : 'var(--color-surface-2)', color: on ? '#fff' : 'var(--color-text-muted)',
                  fontWeight: 800, fontSize: 12,
                }}
                >{v.k.toUpperCase()}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, display: 'block' }}>{v.name}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>{v.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
        <label className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <input type="checkbox" checked={state.settings.showCompleted !== false}
            onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', patch: { showCompleted: e.target.checked } })}
            style={{ width: 18, height: 18, accentColor: 'var(--color-accent)' }} />
          Mostrar tareas completadas en Hoy
        </label>
      </div>
    </div>
  );
}
