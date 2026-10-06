import React from 'react';
import { CaretLeft, CaretRight, Trash } from '@phosphor-icons/react';
import { Sheet } from '../ui/Sheet';
import { useUi } from '../../state/ui';
import { useStore } from '../../state/store';
import { EVENT_TYPES, EVENT_TYPE_ORDER, RECURRENCE_LABELS, RECURRENCE_ORDER } from '../../lib/eventTypes';
import { addDays, formatDayMonth, toISODate } from '../../lib/dates';

export function EventSheet() {
  const { eventDraft, updateEvent, closeEvent } = useUi();
  const { dispatch } = useStore();
  const { mode, id, date, type, title, time, recurrence, customLabel } = eventDraft;

  const save = () => {
    const value = (title || '').trim() || 'Evento sin título';
    const payload = { title: value, type, customLabel, date: toISODate(date), time, recurrence };
    if (mode === 'new') dispatch({ type: 'ADD_EVENT', event: payload });
    else dispatch({ type: 'EDIT_EVENT', id, patch: payload });
    closeEvent();
  };

  const remove = () => {
    dispatch({ type: 'DELETE_EVENT', id });
    closeEvent();
  };

  return (
    <Sheet onClose={closeEvent} style={{ maxHeight: '92%' }}>
      <h3 className="sheet-title">{mode === 'new' ? 'Nuevo evento' : 'Editar evento'}</h3>
      <div className="field">
        <label htmlFor="rumbo-ev">Título</label>
        <input id="rumbo-ev" className="input" placeholder="Ej. Examen de estadística" value={title}
          onChange={(e) => updateEvent({ title: e.target.value })} style={{ fontSize: 16, minHeight: 44 }} autoFocus />
      </div>
      <div className="kicker">Tipo</div>
      <div className="pill-row" style={{ marginBottom: 16 }}>
        {EVENT_TYPE_ORDER.map((k) => {
          const t = EVENT_TYPES[k];
          const on = type === k;
          return (
            <button key={k} type="button" className={`pill-btn${on ? ' on' : ''}`} onClick={() => updateEvent({ type: k })}>
              <t.Icon size={16} weight={on ? 'fill' : 'bold'} />{t.label}
            </button>
          );
        })}
      </div>
      {type === 'otro' && (
        <div className="field">
          <label htmlFor="rumbo-evc">Etiqueta propia</label>
          <input id="rumbo-evc" className="input" placeholder="Ej. Viaje, médico, concierto" value={customLabel}
            onChange={(e) => updateEvent({ customLabel: e.target.value })} style={{ fontSize: 15, minHeight: 42 }} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 14, marginBottom: 4 }}>
        <div className="field" style={{ flex: 1 }}>
          <label>Día</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" aria-label="Día anterior" className="icon-btn" style={{ width: 38, height: 38, border: '1.5px solid var(--color-border-strong)' }}
              onClick={() => updateEvent({ date: addDays(date, -1) })}>
              <CaretLeft size={15} weight="bold" />
            </button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: 14.5, fontWeight: 600 }}>{formatDayMonth(date)}</span>
            <button type="button" aria-label="Día siguiente" className="icon-btn" style={{ width: 38, height: 38, border: '1.5px solid var(--color-border-strong)' }}
              onClick={() => updateEvent({ date: addDays(date, 1) })}>
              <CaretRight size={15} weight="bold" />
            </button>
          </div>
        </div>
        <div className="field" style={{ flex: 'none', width: 120 }}>
          <label htmlFor="rumbo-evt">Hora</label>
          <input id="rumbo-evt" className="input" type="time" value={time} onChange={(e) => updateEvent({ time: e.target.value })} style={{ fontSize: 15, minHeight: 38 }} />
        </div>
      </div>
      <div className="kicker">Se repite</div>
      <div className="pill-row" style={{ marginBottom: 6 }}>
        {RECURRENCE_ORDER.map((k) => {
          const on = recurrence === k;
          return (
            <button key={k} type="button" className={`pill-btn${on ? ' on' : ''}`} onClick={() => updateEvent({ recurrence: k })}>
              {RECURRENCE_LABELS[k]}
            </button>
          );
        })}
      </div>
      <div className="sheet-actions">
        {mode === 'edit' && (
          <button type="button" onClick={remove} className="btn btn-danger" style={{ flex: 'none' }}>
            <Trash size={15} weight="bold" /> Eliminar
          </button>
        )}
        <button type="button" onClick={save} className="btn btn-primary" style={{ flex: 1 }}>Guardar evento</button>
      </div>
    </Sheet>
  );
}
