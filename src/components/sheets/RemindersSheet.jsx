import React from 'react';
import { Sheet } from '../ui/Sheet';
import { useUi } from '../../state/ui';
import { useStore, computeReminders } from '../../state/store';
import { EVENT_TYPES, eventKindLabel } from '../../lib/eventTypes';
import { formatDayMonth } from '../../lib/dates';

export function RemindersSheet() {
  const { closeReminders, openEditEvent } = useUi();
  const { state } = useStore();
  const today = new Date();
  const reminders = computeReminders(state, today);

  const openOccurrence = (event) => {
    closeReminders();
    openEditEvent(event);
  };

  return (
    <Sheet onClose={closeReminders}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 24, margin: 0, letterSpacing: '-.02em' }}>Próximos avisos</h3>
        <span style={{ fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{reminders.length} en dos semanas</span>
      </div>
      <div style={{ height: 1, background: 'var(--color-text)', margin: '10px 0 2px' }} />
      {reminders.map(({ event, date, diff }) => {
        const t = EVENT_TYPES[event.type];
        const when = diff === 1 ? 'Mañana' : `En ${diff} días`;
        return (
          <div key={`${event.id}-${diff}`} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '13px 0', borderBottom: '1px solid rgba(32,30,29,.1)' }}>
            <t.Icon size={21} weight="duotone" style={{ flex: 'none' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: diff <= 2 ? 'var(--color-accent-2-700)' : 'var(--color-text-muted)' }}>{when}</div>
              <div style={{ fontSize: 16, lineHeight: 1.3, marginTop: 2 }}>{event.title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {eventKindLabel(event)}{event.time ? ` · ${event.time}` : ''} · {formatDayMonth(date)}
              </div>
            </div>
            <button type="button" onClick={() => openOccurrence(event)} className="btn btn-ghost" style={{ fontSize: 12.5, flex: 'none' }}>Ver</button>
          </div>
        );
      })}
      {!reminders.length && <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '10px 0' }}>Nada previsto en las próximas dos semanas.</p>}
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '14px 0 0', fontStyle: 'italic' }}>
        Los avisos del sistema (notificaciones push) llegarán en una fase posterior. Aquí se ve cómo aparecen dentro de la app.
      </p>
    </Sheet>
  );
}
