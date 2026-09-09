import { Cake, Exam, BookmarkSimple, Tag } from '@phosphor-icons/react';

export const EVENT_TYPES = {
  cumple: { key: 'cumple', label: 'Cumpleaños', Icon: Cake },
  examen: { key: 'examen', label: 'Examen', Icon: Exam },
  marcada: { key: 'marcada', label: 'Fecha marcada', Icon: BookmarkSimple },
  otro: { key: 'otro', label: 'Otro', Icon: Tag },
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
