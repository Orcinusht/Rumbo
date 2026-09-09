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
  { k: 'a', name: 'Índice', desc: 'Agrupado por categoría, con barra del día' },
  { k: 'b', name: 'Portada', desc: 'Cifra a plancha y lista corrida de titulares' },
  { k: 'c', name: 'Fichas', desc: 'Medidores por categoría y tarjetas con check grande' },
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
    const pct = list.length ? Math.round(list.reduce((a, g) => a + goalWeeklyProgress(g).pct, 0) / list.length) : 0;
    return { key: k, c: CATEGORIES[k], pct };
  });

  const spark = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map((d) => {
    const tasks = tasksOnDate(state, d);
    const pct = tasks.length ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0;
    return { key: d.toISOString(), h: 8 + pct * 0.7, d: capitalize(DOW_LETTERS[(d.getDay() + 6) % 7]), isToday: d.toDateString() === today.toDateString() };
  });

  const setVariant = (v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { hoyVariant: v } });

  return (
    <div className="screen">
      <div className="screen-kicker" style={{ alignItems: 'baseline' }}>
        <span>Progreso</span><span>Año {today.getFullYear()}</span>
      </div>
      <div className="screen-rule" />
      <div className="screen-rule-thin" />
      <h2 style={{ fontSize: 34, margin: '18px 0 4px' }}>Tu año</h2>
      <p style={{ fontSize: 14.5, color: 'var(--color-text-muted)', margin: '0 0 22px' }}>
        Vas por la semana {weekNo} de {totalWeeks}. Queda el {pctYear} % del año.
      </p>

      <div style={{ display: 'flex', gap: 18, marginBottom: 26 }}>
        {[[weekDone, 'tareas esta semana'], [monthDone, 'tareas este mes'], [state.goals.length, 'metas activas']].map(([n, l]) => (
          <div key={l} style={{ flex: 1 }}>
            <div style={{ fontSize: 34, lineHeight: 1, letterSpacing: '-.03em' }}>{n}</div>
            <div style={{ fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 6, lineHeight: 1.4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }}>Por categoría</div>
      {catBars.map(({ key, c, pct }) => (
        <div key={key} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}><c.Icon size={15} weight="duotone" color={c.ink} />{c.label}</span>
            <span style={{ fontSize: 14, color: c.ink }}>{pct} %</span>
          </div>
          <ProgressBar pct={pct} fill={c.fill} thin />
        </div>
      ))}

      <div style={{ marginTop: 26 }}>
        <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 10 }}>Últimos siete días</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 78 }}>
          {spark.map((s) => (
            <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', gap: 6 }}>
              <div style={{ background: s.isToday ? 'var(--color-text)' : '#b8b4b3', height: `${s.h}%`, borderRadius: 1 }} />
              <div style={{ textAlign: 'center', fontSize: 9.5, color: 'var(--color-text-muted)' }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 34 }}>
        <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }}>Ajustes de Hoy</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {VARIANTS.map((v) => {
            const on = state.settings.hoyVariant === v.k;
            return (
              <button key={v.k} type="button" onClick={() => setVariant(v.k)}
                style={{ display: 'flex', gap: 11, alignItems: 'baseline', textAlign: 'left', padding: '11px 13px', borderRadius: 3, cursor: 'pointer', font: 'inherit', border: `1.5px solid ${on ? 'var(--color-text)' : 'rgba(32,30,29,.18)'}`, background: on ? '#e9e7e6' : 'transparent' }}>
                <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', width: 14 }}>{v.k.toUpperCase()}</span>
                <span style={{ flex: 1 }}><span style={{ fontSize: 16 }}>{v.name}</span><br /><span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>{v.desc}</span></span>
              </button>
            );
          })}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={state.settings.showCompleted !== false}
            onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', patch: { showCompleted: e.target.checked } })} />
          Mostrar tareas completadas en Hoy
        </label>
      </div>
    </div>
  );
}
