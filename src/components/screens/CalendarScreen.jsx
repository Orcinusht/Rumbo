import React from 'react';
import { Plus, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useStore, objectivesOnDate, eventsOnDate } from '../../state/store';
import { useUi } from '../../state/ui';
import { CATEGORIES } from '../../lib/categories';
import { EVENT_TYPES, eventKindLabel } from '../../lib/eventTypes';
import {
  DOW_LETTERS, monthGrid, monthLabel, isSameDay, startOfWeek, addDays, formatDayMonth, formatWeekRange,
} from '../../lib/dates';

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
      <div className="page-head">
        <div>
          <div className="kicker">Calendario</div>
          <h1 style={{ fontSize: 30 }}>{calMode === 'mes' ? monthLabel(calRefDate) : formatWeekRange(startOfWeek(calRefDate))}</h1>
        </div>
        <button type="button" onClick={() => openNewEvent(selectedDate)} className="fab" style={{ padding: '10px 16px' }}>
          <Plus size={16} weight="bold" /> Evento
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button type="button" aria-label="Anterior" className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => (calMode === 'mes' ? ui.goToMonth(-1) : ui.goToWeek(-1))}>
            <CaretLeft size={16} weight="bold" />
          </button>
          <button type="button" aria-label="Siguiente" className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => (calMode === 'mes' ? ui.goToMonth(1) : ui.goToWeek(1))}>
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
        <div className="pill-row" style={{ flexWrap: 'nowrap' }}>
          <button type="button" className={`pill-btn${calMode === 'mes' ? ' on' : ''}`} onClick={() => switchMode('mes')}>Mes</button>
          <button type="button" className={`pill-btn${calMode === 'semana' ? ' on' : ''}`} onClick={() => switchMode('semana')}>Semana</button>
        </div>
      </div>

      {calMode === 'mes' && (
        <>
          <div className="cal-grid" style={{ marginBottom: 6 }}>
            {DOW_LETTERS.map((l, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--color-text-faint)' }}>{l}</div>
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
                  style={{ background: isSel ? 'var(--color-accent-tint)' : 'transparent', cursor: 'pointer' }}>
                  <span className="cal-num" style={{ background: isToday ? 'var(--color-accent)' : 'transparent', color: isToday ? '#fff' : 'var(--color-text)' }}>{d.getDate()}</span>
                  <span className="cal-dots">
                    {ob.slice(0, 3).map((o, j) => <span key={j} className="cal-dot" style={{ background: CATEGORIES[o.catId].fill }} />)}
                    {ev.length > 0 && <span className="cal-diamond" style={{ background: EVENT_TYPES[ev[0].type].fill }} />}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 26, animation: 'rumbo-in .28s ease both' }}>
            <div className="section-head">
              <h3>{formatDayMonth(selectedDate)}</h3>
              <span className="count">{entryCount} {entryCount === 1 ? 'entrada' : 'entradas'}</span>
            </div>
            {entryCount > 0 ? (
              <div className="card list-card">
                {selEvents.map((e) => {
                  const t = EVENT_TYPES[e.type];
                  return (
                    <div key={e.id} className="list-row">
                      <span style={{ width: 36, height: 36, borderRadius: 'var(--radius-pill)', background: t.tint, display: 'grid', placeItems: 'center', flex: 'none' }}>
                        <t.Icon size={17} weight="fill" color={t.ink} />
                      </span>
                      <button type="button" onClick={() => ui.openEditEvent(e)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{e.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{eventKindLabel(e)}</div>
                      </button>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-muted)', flex: 'none' }}>{e.time || 'Todo el día'}</span>
                    </div>
                  );
                })}
                {selObjectives.map((o) => {
                  const c = CATEGORIES[o.catId];
                  return (
                    <div key={o.id} className="list-row">
                      <span style={{ flex: 'none', width: 10, height: 10, borderRadius: 'var(--radius-pill)', background: c.fill }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{o.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{o.weeklyText}</div>
                      </div>
                      <span className="chip" style={{ background: c.tint, color: c.ink }}>Diario</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--color-text-faint)', margin: '4px 0 16px' }}>Nada planeado este día.</p>
            )}
            <button type="button" onClick={() => openNewEvent(selectedDate)} className="add-row">
              <Plus size={17} weight="bold" /> Añadir evento a este día
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {days.map((d, i) => {
        const ob = objectivesOnDate(state, d);
        const ev = eventsOnDate(state, d);
        const isSel = isSameDay(d, selectedDate);
        const isToday = isSameDay(d, today);
        return (
          <div key={i} className="card" style={{ display: 'flex', gap: 14, borderColor: isSel ? 'var(--color-accent)' : 'var(--color-border)' }}>
            <button type="button" onClick={() => setSelectedDate(d)} style={{ flex: 'none', width: 40, textAlign: 'center', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-faint)' }}>{DOW_LETTERS[i]}</div>
              <div style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, lineHeight: 1.6, marginTop: 2, width: 28, height: 28,
                borderRadius: 'var(--radius-pill)', display: 'grid', placeItems: 'center', margin: '2px auto 0',
                background: isToday ? 'var(--color-accent)' : 'transparent', color: isToday ? '#fff' : 'var(--color-text)',
              }}
              >{d.getDate()}</div>
            </button>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5, justifyContent: 'center' }}>
              {ev.map((e) => {
                const t = EVENT_TYPES[e.type];
                return (
                  <button key={e.id} type="button" onClick={() => openEditEvent(e)} style={{ display: 'flex', gap: 7, alignItems: 'center', padding: 0, width: '100%', background: 'none', border: 0, cursor: 'pointer', font: 'inherit', textAlign: 'left' }}>
                    <t.Icon size={14} weight="fill" color={t.ink} style={{ flex: 'none' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, flex: 1, minWidth: 0 }}>{e.title}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{e.time || 'Todo el día'}</span>
                  </button>
                );
              })}
              {ob.map((o) => (
                <div key={o.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ flex: 'none', width: 7, height: 7, borderRadius: 'var(--radius-pill)', background: CATEGORIES[o.catId].fill }} />
                  <span style={{ fontSize: 14, lineHeight: 1.3 }}>{o.title}</span>
                </div>
              ))}
              {!ob.length && !ev.length && <div style={{ fontSize: 13, color: 'var(--color-text-faint)' }}>Nada este día</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
