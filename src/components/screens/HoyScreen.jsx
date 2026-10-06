import React, { useEffect, useRef } from 'react';
import { Bell, Plus, NotePencil, SunHorizon } from '@phosphor-icons/react';
import { useStore, tasksOnDate, computeReminders } from '../../state/store';
import { useUi } from '../../state/ui';
import { useFx } from '../ui/Fx';
import { CheckBox } from '../ui/CheckBox';
import { ProgressRing } from '../ui/ProgressRing';
import { CATEGORIES, CATEGORY_ORDER } from '../../lib/categories';
import { EVENT_TYPES } from '../../lib/eventTypes';
import { formatLongDate, isoWeekNumber, todayISO } from '../../lib/dates';

function useReminders(state, today) {
  const all = computeReminders(state, today);
  const withLabel = all.map((r) => ({ ...r, when: r.diff === 1 ? 'Mañana' : `En ${r.diff} días` }));
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
  const remMore = soon.length > 1 ? `+${soon.length - 1} más` : '';

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
      <div className="page-head">
        <div>
          <div className="kicker">{formatLongDate(today)} · Semana {isoWeekNumber(today)}</div>
          <h1>Hoy</h1>
        </div>
        <button type="button" aria-label="Avisos" className="icon-btn bell-btn" style={{ width: 44, height: 44 }} onClick={ui.openReminders}>
          <Bell size={22} weight={hasReminder ? 'fill' : 'bold'} color={hasReminder ? 'var(--color-accent)' : 'var(--color-text)'} />
          {hasReminder && <span className="pct-badge" style={{ position: 'absolute', top: 2, right: 2 }}>{soon.length}</span>}
        </button>
      </div>

      {hasReminder && nextRem && (
        <button type="button" onClick={ui.openReminders} className="card"
          style={{ display: 'flex', width: '100%', gap: 12, alignItems: 'center', textAlign: 'left', marginBottom: 18, cursor: 'pointer', font: 'inherit' }}>
          <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-pill)', background: 'var(--color-accent-tint)', display: 'grid', placeItems: 'center', flex: 'none' }}>
            {React.createElement(EVENT_TYPES[nextRem.event.type].Icon, { size: 19, weight: 'fill', color: 'var(--color-accent)' })}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{nextRem.when}</span>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600, lineHeight: 1.3, marginTop: 1 }}>{nextRem.event.title}</span>
          </span>
          {remMore && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', flex: 'none' }}>{remMore}</span>}
        </button>
      )}

      {total === 0 ? (
        <EmptyHoy ui={ui} />
      ) : (
        <>
          {variant === 'a' && <VariantIndice tasks={visible} doneCount={doneCount} total={total} dayPct={dayPct} toggle={toggle} openTask={openTask} />}
          {variant === 'b' && <VariantPortada tasks={visible} doneCount={doneCount} total={total} dayPct={dayPct} toggle={toggle} openTask={openTask} />}
          {variant === 'c' && <VariantFichas tasks={visible} doneCount={doneCount} total={total} toggle={toggle} openTask={openTask} />}

          {allDone && (
            <div className="card" style={{ marginTop: 6, marginBottom: 16, textAlign: 'center', background: 'var(--color-accent-tint)', border: 'none' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 19, color: 'var(--color-accent-700)' }}>Día completo 🎉</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>Todo lo de hoy, cerrado. Mañana sigue.</div>
            </div>
          )}

          <button type="button" onClick={ui.openAdd} className="add-row">
            <Plus size={17} weight="bold" /> Añadir objetivo al día
          </button>
        </>
      )}
    </div>
  );
}

function EmptyHoy({ ui }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><SunHorizon size={32} weight="fill" /></div>
      <h3>Nada por hoy, todavía</h3>
      <p>Crea una meta con sus objetivos, o añade algo suelto solo para hoy.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="btn btn-secondary" onClick={ui.openAdd}>Añadir objetivo</button>
        <button type="button" className="btn btn-primary" onClick={() => { ui.setTab('metas'); ui.openWizard(); }}>Nueva meta</button>
      </div>
    </div>
  );
}

function TaskRow({ t, toggle, openTask }) {
  const cat = CATEGORIES[t.catId];
  return (
    <div className={`task-card${t.done ? ' done' : ''}`}>
      <span className="accent-bar" style={{ background: cat.fill }} />
      <div className="list-row" style={{ flex: 1, padding: '11px 13px' }}>
        <CheckBox done={t.done} fill={cat.fill} onToggle={() => toggle(t)} size={26} hitSize={44} />
        <button type="button" onClick={() => openTask(t)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', minWidth: 0 }}>
          <div className={`task-title${t.done ? ' done' : ''}`}>{t.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <span className="task-meta">{t.weeklyText || (t.goalTitle ? t.goalTitle : 'Suelta · hoy')}</span>
            {t.note && <NotePencil size={13} weight="bold" color={cat.ink} />}
          </div>
        </button>
      </div>
    </div>
  );
}

function VariantIndice({ tasks, doneCount, total, dayPct, toggle, openTask }) {
  const groups = CATEGORY_ORDER.map((k) => {
    const list = tasks.filter((t) => t.catId === k);
    if (!list.length) return null;
    const c = CATEGORIES[k];
    const done = tasks.filter((t) => t.catId === k && t.done).length;
    return { key: k, c, list, count: `${done}/${list.length}` };
  }).filter(Boolean);

  return (
    <>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <ProgressRing pct={dayPct} size={62} stroke={7} fill="var(--color-accent)">
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16 }}>{dayPct}%</span>
        </ProgressRing>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>{doneCount} de {total} completadas</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{total - doneCount > 0 ? `${total - doneCount} por cerrar hoy` : '¡Todo hecho!'}</div>
        </div>
      </div>
      {groups.map(({ key, c, list, count }) => (
        <div key={key} style={{ marginBottom: 20 }}>
          <div className="section-head">
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <c.Icon size={16} weight="fill" color={c.ink} />
              <span style={{ fontSize: 13, fontWeight: 700, color: c.ink }}>{c.label}</span>
            </span>
            <span className="count">{count}</span>
          </div>
          {list.map((t) => <TaskRow key={t.id} t={t} toggle={toggle} openTask={openTask} />)}
        </div>
      ))}
    </>
  );
}

function VariantPortada({ tasks, doneCount, total, dayPct, toggle, openTask }) {
  const pending = total - doneCount;
  return (
    <>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 10, background: 'var(--color-accent)', border: 'none' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 56, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{doneCount}<span style={{ fontSize: 26, opacity: .7 }}>/{total}</span></div>
        <div style={{ color: 'rgba(255,255,255,.92)' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{pending > 0 ? `${pending} por cerrar hoy` : 'Todo cerrado hoy'}</div>
          <div style={{ fontSize: 12.5, opacity: .85, marginTop: 2 }}>{pending > 0 ? 'El resto del día está libre.' : 'Buen ritmo — nos vemos mañana.'}</div>
        </div>
      </div>
      <div style={{ margin: '14px 0 18px', height: 8, background: 'var(--color-surface-3)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${dayPct}%`, background: 'var(--color-accent)', borderRadius: 'var(--radius-pill)', transition: 'width .6s cubic-bezier(.2,.8,.25,1)' }} />
      </div>
      {tasks.map((t) => <TaskRow key={t.id} t={t} toggle={toggle} openTask={openTask} />)}
    </>
  );
}

function VariantFichas({ tasks, doneCount, total, toggle, openTask }) {
  const meters = CATEGORY_ORDER.map((k) => {
    const list = tasks.filter((t) => t.catId === k);
    const n = list.length;
    const d = list.filter((t) => t.done).length;
    return { key: k, c: CATEGORIES[k], h: n ? Math.round((d / n) * 100) : 0, n };
  }).filter((m) => m.n > 0);
  return (
    <>
      <h1 style={{ marginBottom: 14 }}>{doneCount}<span style={{ color: 'var(--color-text-faint)' }}>/{total}</span></h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {meters.map(({ key, c, h }) => (
          <div key={key} style={{ flex: 1 }}>
            <div style={{ height: 40, background: 'var(--color-surface-3)', borderRadius: 'var(--radius-sm)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: c.fill, height: `${h}%`, transition: 'height .5s cubic-bezier(.2,.8,.25,1)' }} />
            </div>
            <div style={{ display: 'grid', placeItems: 'center', marginTop: 6 }}><c.Icon size={15} weight="fill" color={c.ink} /></div>
          </div>
        ))}
      </div>
      {tasks.map((t) => {
        const c = CATEGORIES[t.catId];
        return (
          <div key={t.id} className={`task-card${t.done ? ' done' : ''}`} style={{ borderLeft: 'none' }}>
            <div className="list-row" style={{ flex: 1, padding: '12px 14px' }}>
              <CheckBox done={t.done} fill={c.fill} onToggle={() => toggle(t)} size={36} hitSize={44} />
              <button type="button" onClick={() => openTask(t)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', minWidth: 0 }}>
                <div className={`task-title${t.done ? ' done' : ''}`} style={{ fontSize: 16 }}>{t.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <c.Icon size={13} weight="fill" color={c.ink} />
                  <span className="task-meta">{t.weeklyText || t.goalTitle || 'Suelta · hoy'}</span>
                </div>
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
