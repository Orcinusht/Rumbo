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
    <Sheet onClose={closeEvent} style={{ maxHeight: '90%' }}>
      <h3 style={{ fontSize: 24, margin: '0 0 14px', letterSpacing: '-.02em' }}>{mode === 'new' ? 'Nuevo evento' : 'Editar evento'}</h3>
      <div className="field" style={{ marginBottom: 18 }}>
        <label htmlFor="rumbo-ev">Título</label>
        <input id="rumbo-ev" className="input" placeholder="Ej. Examen de estadística" value={title}
          onChange={(e) => updateEvent({ title: e.target.value })} style={{ fontSize: 16, minHeight: 44 }} />
      </div>
      <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 9 }}>Tipo</div>
      <div className="pill-row" style={{ marginBottom: 14 }}>
        {EVENT_TYPE_ORDER.map((k) => {
          const t = EVENT_TYPES[k];
          const on = type === k;
          return (
            <button key={k} type="button" className="pill-btn" onClick={() => updateEvent({ type: k })}
              style={{ borderColor: on ? 'var(--color-text)' : undefined, background: on ? '#e3e0df' : undefined }}>
              <t.Icon size={16} weight="duotone" />{t.label}
            </button>
          );
        })}
      </div>
      {type === 'otro' && (
        <div className="field" style={{ marginBottom: 18 }}>
          <label htmlFor="rumbo-evc">Etiqueta propia</label>
          <input id="rumbo-evc" className="input" placeholder="Ej. Viaje, médico, concierto" value={customLabel}
            onChange={(e) => updateEvent({ customLabel: e.target.value })} style={{ fontSize: 15, minHeight: 42 }} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
        <div className="field" style={{ flex: 1 }}>
          <label>Día</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" aria-label="Día anterior" onClick={() => updateEvent({ date: addDays(date, -1) })}
              style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: 2, border: '1px solid rgba(32,30,29,.16)', background: 'none', cursor: 'pointer' }}>
              <CaretLeft size={15} weight="duotone" />
            </button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: 15 }}>{formatDayMonth(date)}</span>
            <button type="button" aria-label="Día siguiente" onClick={() => updateEvent({ date: addDays(date, 1) })}
              style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: 2, border: '1px solid rgba(32,30,29,.16)', background: 'none', cursor: 'pointer' }}>
              <CaretRight size={15} weight="duotone" />
            </button>
          </div>
        </div>
        <div className="field" style={{ flex: 'none', width: 118 }}>
          <label htmlFor="rumbo-evt">Hora</label>
          <input id="rumbo-evt" className="input" type="time" value={time} onChange={(e) => updateEvent({ time: e.target.value })} style={{ fontSize: 15, minHeight: 38 }} />
        </div>
      </div>
      <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 9 }}>Se repite</div>
      <div className="pill-row" style={{ marginBottom: 20 }}>
        {RECURRENCE_ORDER.map((k) => {
          const on = recurrence === k;
          return (
            <button key={k} type="button" onClick={() => updateEvent({ recurrence: k })}
              style={{ padding: '9px 13px', borderRadius: 3, cursor: 'pointer', font: 'inherit', fontSize: 14, border: `1.5px solid ${on ? 'var(--color-text)' : 'rgba(32,30,29,.18)'}`, background: on ? '#e3e0df' : 'transparent' }}>
              {RECURRENCE_LABELS[k]}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {mode === 'edit' && (
          <button type="button" onClick={remove} className="btn btn-secondary" style={{ flex: 'none', color: '#aa0b56' }}>
            <Trash size={15} weight="duotone" /> Eliminar
          </button>
        )}
        <button type="button" onClick={save} className="btn btn-primary" style={{ flex: 1 }}>Guardar evento</button>
      </div>
    </Sheet>
  );
}
