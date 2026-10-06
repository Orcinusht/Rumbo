import React from 'react';
import { BellSlash } from '@phosphor-icons/react';
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
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 className="sheet-title" style={{ margin: 0 }}>Próximos avisos</h3>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)' }}>{reminders.length} en 2 semanas</span>
      </div>
      {reminders.length > 0 ? (
        <div className="card list-card">
          {reminders.map(({ event, date, diff }) => {
            const t = EVENT_TYPES[event.type];
            const when = diff === 1 ? 'Mañana' : `En ${diff} días`;
            const soon = diff <= 2;
            return (
              <div key={`${event.id}-${diff}`} className="list-row">
                <span style={{ width: 38, height: 38, borderRadius: 'var(--radius-pill)', background: soon ? 'var(--color-danger-tint)' : 'var(--color-accent-tint)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                  <t.Icon size={17} weight="fill" color={soon ? 'var(--color-danger)' : 'var(--color-accent)'} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.03em', textTransform: 'uppercase', color: soon ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{when}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, marginTop: 2 }}>{event.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {eventKindLabel(event)}{event.time ? ` · ${event.time}` : ''} · {formatDayMonth(date)}
                  </div>
                </div>
                <button type="button" onClick={() => openOccurrence(event)} className="btn btn-ghost btn-sm" style={{ flex: 'none' }}>Ver</button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: '32px 16px 12px' }}>
          <div className="empty-icon"><BellSlash size={28} weight="fill" /></div>
          <h3 style={{ fontSize: 17 }}>Nada previsto</h3>
          <p style={{ marginBottom: 0 }}>No hay eventos en las próximas dos semanas.</p>
        </div>
      )}
      <p style={{ fontSize: 12.5, color: 'var(--color-text-faint)', margin: '16px 2px 0' }}>
        Los avisos del sistema (notificaciones push) llegarán en una fase posterior. Aquí se ve cómo aparecen dentro de la app.
      </p>
    </Sheet>
  );
}
