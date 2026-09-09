import React from 'react';
import { Plus, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useStore, objectivesOnDate, eventsOnDate } from '../../state/store';
import { useUi } from '../../state/ui';
import { CATEGORIES } from '../../lib/categories';
import { EVENT_TYPES, eventKindLabel } from '../../lib/eventTypes';
import {
  DOW_LETTERS, monthGrid, monthLabel, isSameDay, startOfWeek, addDays, formatDayMonth, formatWeekRange,
} from '../../lib/dates';

const DOW_FULL = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function CalendarScreen() {
  const { state } = useStore();
  const ui = useUi();
  const { calMode, calRefDate, selectedDate, setSelectedDate, openNewEvent } = ui;
  const today = new Date();

  const switchMode = (mode) => {
    ui.setCalRefDate(selectedDate);
    ui.setCalMode(mode);
  };

  const selObjectives = objectivesOnDate(state, selectedDate);
  const selEvents = eventsOnDate(state, selectedDate);
  const entryCount = selObjectives.length + selEvents.length;

  return (
    <div className="screen">
      <div className="screen-kicker">
        <span>Calendario</span>
        <button type="button" onClick={() => openNewEvent(selectedDate)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 0, cursor: 'pointer', font: 'inherit', fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-accent-700)', padding: '8px 0' }}>
          <Plus size={15} weight="duotone" /> Evento
        </button>
      </div>
      <div className="screen-rule" />
      <div className="screen-rule-thin" />

      <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: 10, alignItems: 'center', justifyContent: 'space-between', margin: '18px 0 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <button type="button" aria-label="Anterior" className="icon-btn" style={{ flex: 'none' }} onClick={() => (calMode === 'mes' ? ui.goToMonth(-1) : ui.goToWeek(-1))}>
            <CaretLeft size={17} weight="duotone" />
          </button>
          <h2 style={{ fontSize: 26, margin: 0, letterSpacing: '-.02em', whiteSpace: 'nowrap' }}>
            {calMode === 'mes' ? monthLabel(calRefDate) : formatWeekRange(startOfWeek(calRefDate))}
          </h2>
          <button type="button" aria-label="Siguiente" className="icon-btn" style={{ flex: 'none' }} onClick={() => (calMode === 'mes' ? ui.goToMonth(1) : ui.goToWeek(1))}>
            <CaretRight size={17} weight="duotone" />
          </button>
        </div>
        <div style={{ display: 'flex', border: '1px solid rgba(32,30,29,.16)', borderRadius: 2, overflow: 'hidden', flex: 'none' }}>
          <button type="button" onClick={() => switchMode('mes')} style={{ padding: '7px 14px', fontSize: 12.5, cursor: 'pointer', border: 0, fontFamily: 'inherit', background: calMode === 'mes' ? 'var(--color-text)' : 'transparent', color: calMode === 'mes' ? 'var(--color-bg)' : 'var(--color-text)' }}>Mes</button>
          <button type="button" onClick={() => switchMode('semana')} style={{ padding: '7px 14px', fontSize: 12.5, cursor: 'pointer', border: 0, borderLeft: '1px solid rgba(32,30,29,.16)', fontFamily: 'inherit', background: calMode === 'semana' ? 'var(--color-text)' : 'transparent', color: calMode === 'semana' ? 'var(--color-bg)' : 'var(--color-text)' }}>Semana</button>
        </div>
      </div>

      {calMode === 'mes' && (
        <>
          <div className="cal-grid" style={{ marginBottom: 8 }}>
            {DOW_FULL.map((l, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{l}</div>
            ))}
          </div>
          <div className="cal-grid">
            {monthGrid(calRefDate.getFullYear(), calRefDate.getMonth()).map((d, i) => {
              if (!d) return <div key={i} />;
              const ob = objectivesOnDate(state, d);
              const ev = eventsOnDate(state, d);
              const isToday = isSameDay(d, today);
              const isSel = isSameDay(d, selectedDate);
              return (
                <button key={i} type="button" className="cal-cell" onClick={() => setSelectedDate(d)}
                  style={{ background: isSel ? '#e3e0df' : 'transparent', cursor: 'pointer' }}>
                  <span className="cal-num" style={{ background: isToday ? 'var(--color-text)' : 'transparent', color: isToday ? 'var(--color-bg)' : 'var(--color-text)' }}>{d.getDate()}</span>
                  <span className="cal-dots">
                    {ob.slice(0, 3).map((o, j) => <span key={j} className="cal-dot" style={{ background: CATEGORIES[o.catId].fill }} />)}
                    {ev.length > 0 && <span className="cal-diamond" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 24, animation: 'rumbo-in .28s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 21, margin: 0 }}>{formatDayMonth(selectedDate)}</h3>
              <span style={{ fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{entryCount} {entryCount === 1 ? 'entrada' : 'entradas'}</span>
            </div>
            <div style={{ height: 1, background: 'var(--color-text)', margin: '9px 0 4px' }} />
            {selEvents.map((e) => {
              const t = EVENT_TYPES[e.type];
              return (
                <div key={e.id} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(32,30,29,.1)' }}>
                  <t.Icon size={19} weight="duotone" style={{ flex: 'none' }} />
                  <button type="button" onClick={() => ui.openEditEvent(e)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, lineHeight: 1.3 }}>{e.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 2 }}>{eventKindLabel(e)}</div>
                  </button>
                  <span style={{ fontSize: 13, flex: 'none' }}>{e.time || 'Todo el día'}</span>
                </div>
              );
            })}
            {selObjectives.map((o) => {
              const c = CATEGORIES[o.catId];
              return (
                <div key={o.id} style={{ display: 'flex', gap: 11, alignItems: 'baseline', padding: '10px 0', borderBottom: '1px solid rgba(32,30,29,.1)' }}>
                  <span style={{ flex: 'none', width: 9, height: 9, borderRadius: 2, background: c.fill }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15.5, lineHeight: 1.3 }}>{o.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 2 }}>{o.weeklyText}</div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Diario</span>
                </div>
              );
            })}
            <button type="button" onClick={() => openNewEvent(selectedDate)} className="btn btn-ghost" style={{ marginTop: 10, paddingLeft: 0 }}>
              <Plus size={15} weight="duotone" /> Añadir evento a este día
            </button>
          </div>
        </>
      )}

      {calMode === 'semana' && (
        <WeekView state={state} calRefDate={calRefDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate} today={today} openEditEvent={ui.openEditEvent} />
      )}
    </div>
  );
}

function WeekView({ state, calRefDate, selectedDate, setSelectedDate, today, openEditEvent }) {
  const start = startOfWeek(calRefDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <>
      {days.map((d, i) => {
        const ob = objectivesOnDate(state, d);
        const ev = eventsOnDate(state, d);
        const isSel = isSameDay(d, selectedDate);
        const isToday = isSameDay(d, today);
        return (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '13px 0', borderTop: '1px solid rgba(32,30,29,.12)', background: isSel ? '#e9e7e6' : 'transparent' }}>
            <button type="button" onClick={() => setSelectedDate(d)} style={{ flex: 'none', width: 42, textAlign: 'center', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit' }}>
              <div style={{ fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{DOW_LETTERS[i]}</div>
              <div style={{ fontSize: 22, lineHeight: 1.2, color: isToday ? 'var(--color-text)' : '#4a4746' }}>{d.getDate()}</div>
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              {ev.map((e) => {
                const t = EVENT_TYPES[e.type];
                return (
                  <button key={e.id} type="button" onClick={() => openEditEvent(e)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '3px 0', width: '100%', background: 'none', border: 0, cursor: 'pointer', font: 'inherit', textAlign: 'left' }}>
                    <t.Icon size={15} weight="duotone" style={{ flex: 'none' }} />
                    <span style={{ fontSize: 14.5, lineHeight: 1.3, flex: 1, minWidth: 0 }}>{e.title}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{e.time || 'Todo el día'}</span>
                  </button>
                );
              })}
              {ob.map((o) => (
                <div key={o.id} style={{ display: 'flex', gap: 9, alignItems: 'baseline', padding: '3px 0' }}>
                  <span style={{ flex: 'none', width: 8, height: 8, borderRadius: 2, background: CATEGORIES[o.catId].fill }} />
                  <span style={{ fontSize: 14.5, lineHeight: 1.3 }}>{o.title}</span>
                </div>
              ))}
              {!ob.length && !ev.length && <div style={{ fontSize: 13, color: '#75726f', fontStyle: 'italic', padding: '3px 0' }}>Sin objetivos</div>}
            </div>
          </div>
        );
      })}
    </>
  );
}
