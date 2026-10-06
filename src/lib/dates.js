// Date helpers. Weeks run Monday→Sunday (the prototype's L M X J V S D order).

export const DOW_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']; // Mon..Sun

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO() {
  return toISODate(new Date());
}

// Monday=0 .. Sunday=6
export function mondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

export function dowLetter(date) {
  return DOW_LETTERS[mondayIndex(date)];
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function startOfWeek(date) {
  return addDays(date, -mondayIndex(date));
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ISO-8601 week number (1..53)
export function isoWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((d - firstThursday) / (7 * 86400000));
}

export function isoWeeksInYear(year) {
  const p = (y) => (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)) % 7;
  return p(year) === 4 || p(year - 1) === 3 ? 53 : 52;
}

// The ISO week-numbering year (the year of that week's Thursday) — differs
// from getFullYear() for the first/last few days of some calendar years.
export function isoWeekYear(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  return d.getUTCFullYear();
}

// Human-readable, sortable ISO week key, e.g. "2026-W41".
export function isoWeekKey(date) {
  return `${isoWeekYear(date)}-W${String(isoWeekNumber(date)).padStart(2, '0')}`;
}

const WEEK_EPOCH = new Date(2000, 0, 3); // a Monday

// Absolute, monotonic Monday-aligned week index — stable across year
// boundaries, used for "every N weeks" interval math (ISO week *numbers*
// wrap 53→1 and can't be used for modulo directly).
export function weekIndex(date) {
  return Math.round((startOfWeek(date) - startOfWeek(WEEK_EPOCH)) / (7 * 86400000));
}

// Inverse of weekIndex: the Monday of the week at that absolute index.
export function dateForWeekIndex(idx) {
  return addDays(startOfWeek(WEEK_EPOCH), idx * 7);
}

// The Monday of ISO week `week` in ISO week-numbering year `year`.
export function mondayOfIsoWeek(year, week) {
  const jan4 = new Date(year, 0, 4);
  return addDays(startOfWeek(jan4), (week - 1) * 7);
}

export function daysArrayToMap(arr) {
  return DOW_LETTERS.reduce((acc, l) => { acc[l] = (arr || []).includes(l); return acc; }, {});
}

export function weekRepeatLabel(every) {
  return every <= 1 ? 'Cada semana' : `Cada ${every} semanas`;
}

export function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

const WEEKDAY_FULL = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export function formatLongDate(date) {
  return `${capitalize(WEEKDAY_FULL[mondayIndex(date)])} ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;
}

export function formatDayMonth(date) {
  return `${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;
}

export function formatWeekRange(start) {
  const end = addDays(start, 6);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTH_NAMES[start.getMonth()].slice(0, 3)}.`;
  }
  return `${start.getDate()} ${MONTH_NAMES[start.getMonth()].slice(0, 3)}. – ${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0, 3)}.`;
}

export function monthLabel(date) {
  return capitalize(MONTH_NAMES[date.getMonth()]);
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Builds a 7-wide grid of Date objects (or null for leading/trailing pad
// cells) covering the given month, Monday-first.
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const lead = mondayIndex(first);
  const dim = daysInMonth(year, month);
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

// Does a recurring event (defined by its first occurrence `startDate` and a
// recurrence rule) occur on `date`?
export function eventOccursOn(event, date) {
  const start = fromISODate(event.date);
  if (date < new Date(start.getFullYear(), start.getMonth(), start.getDate())) return false;
  switch (event.recurrence) {
    case 'weekly':
      return mondayIndex(date) === mondayIndex(start);
    case 'monthly':
      return date.getDate() === start.getDate();
    case 'yearly':
      return date.getDate() === start.getDate() && date.getMonth() === start.getMonth();
    case 'once':
    default:
      return isSameDay(date, start);
  }
}

export function diffInDays(from, to) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86400000);
}
