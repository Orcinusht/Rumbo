import { Cake, Exam, BookmarkSimple, Tag } from '@phosphor-icons/react';

// Colors: cumpleaños=amarillo, examen=rojo, el resto (marcada/otro)=azul.
export const EVENT_TYPES = {
  cumple: { key: 'cumple', label: 'Cumpleaños', Icon: Cake, fill: 'var(--evt-cumple-fill)', ink: 'var(--evt-cumple-ink)', tint: 'var(--evt-cumple-tint)' },
  examen: { key: 'examen', label: 'Examen', Icon: Exam, fill: 'var(--evt-examen-fill)', ink: 'var(--evt-examen-ink)', tint: 'var(--evt-examen-tint)' },
  marcada: { key: 'marcada', label: 'Fecha marcada', Icon: BookmarkSimple, fill: 'var(--evt-otro-fill)', ink: 'var(--evt-otro-ink)', tint: 'var(--evt-otro-tint)' },
  otro: { key: 'otro', label: 'Otro', Icon: Tag, fill: 'var(--evt-otro-fill)', ink: 'var(--evt-otro-ink)', tint: 'var(--evt-otro-tint)' },
};

export const EVENT_TYPE_ORDER = ['cumple', 'examen', 'marcada', 'otro'];

export const RECURRENCE_LABELS = {
  once: 'Una vez',
  weekly: 'Cada semana',
  monthly: 'Cada mes',
  yearly: 'Cada año',
};

export const RECURRENCE_ORDER = ['once', 'weekly', 'monthly', 'yearly'];

export function eventDisplayName(event) {
  const t = EVENT_TYPES[event.type];
  return event.type === 'otro' && event.customLabel ? event.customLabel : t.label;
}

export function eventKindLabel(event) {
  const name = eventDisplayName(event);
  const rec = event.recurrence !== 'once' ? ` · ${RECURRENCE_LABELS[event.recurrence].toLowerCase()}` : '';
  return name + rec;
}
