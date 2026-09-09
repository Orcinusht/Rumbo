import React, { useEffect, useRef } from 'react';
import { Bell, Plus, NotePencil } from '@phosphor-icons/react';
import { useStore, tasksOnDate, computeReminders } from '../../state/store';
import { useUi } from '../../state/ui';
import { useFx } from '../ui/Fx';
import { CheckBox } from '../ui/CheckBox';
import { ProgressBar } from '../ui/ProgressBar';
import { CATEGORIES, CATEGORY_ORDER } from '../../lib/categories';
import { EVENT_TYPES } from '../../lib/eventTypes';
import { formatLongDate, isoWeekNumber, todayISO } from '../../lib/dates';

function useReminders(state, today) {
  const all = computeReminders(state, today);
  const withLabel = all.map((r) => ({
    ...r,
    when: r.diff === 1 ? 'Mañana' : `En ${r.diff} días`,
  }));
  const soon = withLabel.filter((r) => r.diff <= 7);
  return { all: withLabel, soon };
}

export function HoyScreen() {
  const { state, dispatch } = useStore();
  const ui = useUi();
  const fx = useFx();
  const today = new Date();
  const iso = todayISO();

  const tasks = tasksOnDate(state, today);
  const visible = state.settings.showCompleted === false ? tasks.filter((t) => !t.done) : tasks;
  const doneCount = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const allDone = total > 0 && doneCount === total;
  const dayPct = total ? Math.round((doneCount / total) * 100) : 0;

  const prevAllDone = useRef(allDone);
  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      const t = setTimeout(() => fx.burst(null, true), 260);
      return () => clearTimeout(t);
    }
    prevAllDone.current = allDone;
    return undefined;
  }, [allDone, fx]);

  const { soon, all } = useReminders(state, today);
  const hasReminder = soon.length > 0;
  const nextRem = all[0];
  const remMore = soon.length > 1 ? `+${soon.length - 1}` : '';

  const toggle = (t) => {
    if (t.kind === 'daily') dispatch({ type: 'TOGGLE_DAILY', dailyId: t.dailyId, date: iso });
    else dispatch({ type: 'TOGGLE_LOOSE_TASK', id: t.id });
  };
  const openTask = (t) => {
    ui.openNote(t.kind === 'daily'
      ? { kind: 'daily', dailyId: t.dailyId, goalId: t.goalId, weeklyId: t.weeklyId, date: iso }
      : { kind: 'loose', id: t.id });
  };

  const variant = state.settings.hoyVariant || 'a';

  return (
    <div className="screen">
      <div className="screen-kicker">
        <span>{formatLongDate(today)}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>Semana {isoWeekNumber(today)}</span>
          <button type="button" aria-label="Avisos" className="icon-btn" style={{ position: 'relative', width: 34, height: 34, margin: '-8px -6px -8px 0' }} onClick={ui.openReminders}>
            <Bell size={20} weight="duotone" />
            {hasReminder && <span className="pct-badge" style={{ position: 'absolute', top: 1, right: 1 }}>{soon.length}</span>}
          </button>
        </span>
      </div>
      <div className="screen-rule" />
      <div className="screen-rule-thin" />

      {hasReminder && nextRem && (
        <button type="button" onClick={ui.openReminders} style={{ display: 'flex', width: '100%', gap: 11, alignItems: 'center', textAlign: 'left', marginTop: 16, padding: '12px 13px', background: 'var(--color-surface)', border: 0, borderRadius: 3, cursor: 'pointer', font: 'inherit' }}>
          {React.createElement(EVENT_TYPES[nextRem.event.type].Icon, { size: 20, weight: 'duotone', style: { flex: 'none' } })}
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{nextRem.when}</span>
            <span style={{ display: 'block', fontSize: 15.5, lineHeight: 1.3 }}>{nextRem.event.title}</span>
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)', flex: 'none' }}>{remMore}</span>
        </button>
      )}

      {variant === 'a' && (
        <VariantIndice tasks={visible} doneOf={`${doneCount}/${total}`} dayPct={dayPct} toggle={toggle} openTask={openTask} />
      )}
      {variant === 'b' && (
        <VariantPortada tasks={visible} doneCount={doneCount} total={total} toggle={toggle} openTask={openTask} />
      )}
      {variant === 'c' && (
        <VariantFichas tasks={visible} doneOf={`${doneCount}/${total}`} toggle={toggle} openTask={openTask} />
      )}

      {allDone && (
        <div style={{ marginTop: 8, padding: '16px 0', borderTop: '3px solid var(--color-text)', animation: 'rumbo-in .35s ease both' }}>
          <div style={{ fontSize: 22 }}>Día completo.</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>Todo lo de hoy, cerrado. Mañana sigue.</div>
        </div>
      )}

      <button type="button" onClick={ui.openAdd} className="btn btn-ghost" style={{ marginTop: 6, paddingLeft: 0 }}>
        <Plus size={15} weight="duotone" /> Añadir objetivo al día
      </button>
    </div>
  );
}

function TaskRow({ t, toggle, openTask, size = 28, hitSize = 44 }) {
  const cat = CATEGORIES[t.catId];
  return (
    <div className="task-row">
      <CheckBox done={t.done} fill={cat.fill} onToggle={() => toggle(t)} size={size} hitSize={hitSize} />
      <button type="button" onClick={() => openTask(t)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', minWidth: 0 }}>
        <div className={`task-title${t.done ? ' done' : ''}`}>{t.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4 }}>
          <span className="task-meta">{t.weeklyText || (t.goalTitle ? t.goalTitle : 'Suelta · hoy')}</span>
          {t.note && <NotePencil size={13} weight="duotone" color={cat.ink} />}
        </div>
      </button>
    </div>
  );
}

function VariantIndice({ tasks, doneOf, dayPct, toggle, openTask }) {
  const groups = CATEGORY_ORDER.map((k) => {
    const list = tasks.filter((t) => t.catId === k);
    if (!list.length) return null;
    const c = CATEGORIES[k];
    const done = tasks.filter((t) => t.catId === k && t.done).length;
    return { key: k, c, list, count: `${done}/${list.length}` };
  }).filter(Boolean);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '20px 0 12px' }}>
        <h2 style={{ fontSize: 38 }}>Hoy</h2>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, lineHeight: 1 }}>{doneOf}</div>
          <div style={{ fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 4 }}>completadas</div>
        </div>
      </div>
      <ProgressBar pct={dayPct} fill="var(--color-text)" />
      <div style={{ height: 26 }} />
      {groups.map(({ key, c, list, count }) => (
        <div key={key} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <c.Icon size={15} weight="duotone" color={c.ink} />
            <span style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: c.ink }}>{c.label}</span>
            <span style={{ flex: 1, height: 1, background: 'rgba(32,30,29,.14)' }} />
            <span style={{ fontSize: 9.5, letterSpacing: '.1em', color: 'var(--color-text-muted)' }}>{count}</span>
          </div>
          {list.map((t) => <TaskRow key={t.id} t={t} toggle={toggle} openTask={openTask} />)}
        </div>
      ))}
      {!groups.length && <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Nada por hoy. Añade un objetivo abajo.</p>}
    </>
  );
}

function VariantPortada({ tasks, doneCount, total, toggle, openTask }) {
  const pending = total - doneCount;
  return (
    <>
      <div style={{ margin: '22px 0 6px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div className="cmyk-num" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 104, letterSpacing: '-.04em' }}>
          <span className="paper">{doneCount}</span>
          <span className="plate plate-c" aria-hidden="true">{doneCount}</span>
          <span className="plate plate-m" aria-hidden="true">{doneCount}</span>
          <span className="plate plate-y" aria-hidden="true">{doneCount}</span>
        </div>
        <div style={{ paddingTop: 10 }}>
          <div style={{ fontSize: 30, lineHeight: 1, color: 'var(--color-text-muted)' }}>de {total}</div>
          <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 8 }}>objetivos<br />de hoy</div>
        </div>
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.5, margin: '10px 0 18px', maxWidth: '31ch' }}>
        {pending > 0 ? `Quedan ${pending} por cerrar. El resto del día está libre de compromisos.` : 'Todo cerrado por hoy.'}
      </p>
      <div style={{ height: 1, background: 'var(--color-text)', marginBottom: 2 }} />
      <div style={{ height: 3, background: 'var(--color-text)' }} />
      {tasks.map((t) => {
        const c = CATEGORIES[t.catId];
        return (
          <div key={t.id} style={{ display: 'flex', gap: 0, alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid rgba(32,30,29,.12)' }}>
            <CheckBox done={t.done} fill={c.fill} onToggle={() => toggle(t)} size={26} hitSize={44} />
            <button type="button" onClick={() => openTask(t)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', minWidth: 0 }}>
              <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: c.ink, marginBottom: 3 }}>{c.label}</div>
              <div className={`task-title${t.done ? ' done' : ''}`} style={{ fontSize: 17 }}>{t.title}</div>
              {t.goalTitle && <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 3, fontStyle: 'italic' }}>{t.goalTitle}</div>}
            </button>
          </div>
        );
      })}
    </>
  );
}

function VariantFichas({ tasks, doneOf, toggle, openTask }) {
  const meters = CATEGORY_ORDER.map((k) => {
    const list = tasks.filter((t) => t.catId === k);
    const n = list.length;
    const d = list.filter((t) => t.done).length;
    return { key: k, c: CATEGORIES[k], h: n ? Math.round((d / n) * 100) : 0 };
  });
  return (
    <>
      <div style={{ margin: '20px 0 14px' }}>
        <h2 style={{ fontSize: 34, margin: '0 0 14px' }}>Hoy · {doneOf}</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {meters.map(({ key, c, h }) => (
            <div key={key} style={{ flex: 1 }}>
              <div style={{ height: 34, background: '#e3e0df', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: c.fill, height: `${h}%`, transition: 'height .5s cubic-bezier(.2,.7,.3,1)' }} />
              </div>
              <div style={{ display: 'grid', placeItems: 'center', marginTop: 5 }}><c.Icon size={14} weight="duotone" color={c.ink} /></div>
            </div>
          ))}
        </div>
      </div>
      {tasks.map((t) => {
        const c = CATEGORIES[t.catId];
        return (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', background: t.done ? 'transparent' : 'var(--color-surface)', borderRadius: 3, padding: '13px 14px', marginBottom: 9, gap: 10, boxShadow: t.done ? 'none' : 'var(--shadow-sm)' }}>
            <CheckBox done={t.done} fill={c.fill} onToggle={() => toggle(t)} size={38} hitSize={44} shape="circle" big />
            <button type="button" onClick={() => openTask(t)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', minWidth: 0 }}>
              <div className={`task-title${t.done ? ' done' : ''}`} style={{ fontSize: 16 }}>{t.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4 }}>
                <c.Icon size={13} weight="duotone" color={c.ink} />
                <span className="task-meta">{t.weeklyText || t.goalTitle || 'Suelta · hoy'}</span>
              </div>
            </button>
          </div>
        );
      })}
    </>
  );
}
