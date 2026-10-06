import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { loadState, saveState } from '../lib/storage';
import { seedState } from './seed';
import { makeId } from '../lib/id';
import { CATEGORIES } from '../lib/categories';
import {
  dowLetter, toISODate, addDays, eventOccursOn, weekIndex, isoWeekKey, startOfWeek,
  mondayOfIsoWeek, isoWeekNumber, isoWeekYear, isoWeeksInYear,
} from '../lib/dates';

const StoreContext = createContext(null);

function mapGoal(goals, goalId, fn) {
  return goals.map((g) => (g.id === goalId ? fn(g) : g));
}

function mapWeekly(goal, weeklyId, fn) {
  return { ...goal, weekly: goal.weekly.map((w) => (w.id === weeklyId ? fn(w) : w)) };
}

function newWeekly(text, now = new Date()) {
  return { id: makeId('w'), text, repeat: { every: 1 }, anchorWeek: weekIndex(now), daily: [] };
}

function omitKey(obj, key) {
  if (!(key in obj)) return obj;
  const { [key]: _omit, ...rest } = obj;
  return rest;
}

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_DAILY': {
      const { dailyId, date } = action;
      const forDaily = state.completions[dailyId] || {};
      const prev = forDaily[date] || { done: false, note: '' };
      return {
        ...state,
        completions: {
          ...state.completions,
          [dailyId]: { ...forDaily, [date]: { ...prev, done: !prev.done } },
        },
      };
    }
    case 'SET_DAILY_NOTE': {
      const { dailyId, date, note } = action;
      const forDaily = state.completions[dailyId] || {};
      const prev = forDaily[date] || { done: false, note: '' };
      return {
        ...state,
        completions: { ...state.completions, [dailyId]: { ...forDaily, [date]: { ...prev, note } } },
      };
    }
    case 'ADD_LOOSE_TASK': {
      const { catId, title, goalId } = action;
      const task = { id: makeId('lt'), catId, title, goalId: goalId || null, date: toISODate(new Date()), done: false, note: '' };
      return { ...state, looseTasks: [...state.looseTasks, task] };
    }
    case 'TOGGLE_LOOSE_TASK':
      return { ...state, looseTasks: state.looseTasks.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)) };
    case 'SET_LOOSE_NOTE':
      return { ...state, looseTasks: state.looseTasks.map((t) => (t.id === action.id ? { ...t, note: action.note } : t)) };
    case 'EDIT_LOOSE_TITLE':
      return { ...state, looseTasks: state.looseTasks.map((t) => (t.id === action.id ? { ...t, title: action.text } : t)) };
    case 'DELETE_LOOSE_TASK':
      return { ...state, looseTasks: state.looseTasks.filter((t) => t.id !== action.id) };

    case 'EDIT_GOAL_TITLE':
      return { ...state, goals: mapGoal(state.goals, action.goalId, (g) => ({ ...g, title: action.text })) };

    case 'DELETE_GOAL': {
      const goal = state.goals.find((g) => g.id === action.goalId);
      if (!goal) return state;
      const dailyIds = new Set(goal.weekly.flatMap((w) => w.daily.map((d) => d.id)));
      const weeklyIds = new Set(goal.weekly.map((w) => w.id));
      const completions = Object.fromEntries(Object.entries(state.completions).filter(([id]) => !dailyIds.has(id)));
      const weeklyCompletions = Object.fromEntries(Object.entries(state.weeklyCompletions).filter(([id]) => !weeklyIds.has(id)));
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.goalId),
        completions,
        weeklyCompletions,
        looseTasks: state.looseTasks.map((t) => (t.goalId === action.goalId ? { ...t, goalId: null } : t)),
      };
    }

    case 'SAVE_WEEKLY': {
      const { goalId, weeklyId, mode, text, every } = action;
      if (mode === 'new') {
        const w = newWeekly(text);
        w.repeat = { every: Math.max(1, every || 1) };
        return { ...state, goals: mapGoal(state.goals, goalId, (g) => ({ ...g, weekly: [...g.weekly, w] })) };
      }
      return {
        ...state,
        goals: mapGoal(state.goals, goalId, (g) =>
          mapWeekly(g, weeklyId, (w) => ({ ...w, text, repeat: { every: Math.max(1, every || 1) } }))),
      };
    }
    case 'DELETE_WEEKLY':
      return {
        ...state,
        goals: mapGoal(state.goals, action.goalId, (g) => ({ ...g, weekly: g.weekly.filter((w) => w.id !== action.weeklyId) })),
        weeklyCompletions: omitKey(state.weeklyCompletions, action.weeklyId),
      };
    case 'TOGGLE_WEEKLY_OCCURRENCE': {
      const { weeklyId, weekKey } = action;
      const forWeekly = state.weeklyCompletions[weeklyId] || {};
      const prev = forWeekly[weekKey] || { done: false, note: '' };
      return {
        ...state,
        weeklyCompletions: { ...state.weeklyCompletions, [weeklyId]: { ...forWeekly, [weekKey]: { ...prev, done: !prev.done } } },
      };
    }

    case 'ADD_DAILY':
      return {
        ...state,
        goals: mapGoal(state.goals, action.goalId, (g) =>
          mapWeekly(g, action.weeklyId, (w) => ({
            ...w,
            daily: [...w.daily, { id: makeId('d'), text: action.text, days: action.days }],
          }))),
      };
    case 'EDIT_DAILY':
      return {
        ...state,
        goals: mapGoal(state.goals, action.goalId, (g) =>
          mapWeekly(g, action.weeklyId, (w) => ({
            ...w,
            daily: w.daily.map((d) => (d.id === action.dailyId ? { ...d, text: action.text, days: action.days } : d)),
          }))),
      };
    case 'DELETE_DAILY':
      return {
        ...state,
        goals: mapGoal(state.goals, action.goalId, (g) =>
          mapWeekly(g, action.weeklyId, (w) => ({ ...w, daily: w.daily.filter((d) => d.id !== action.dailyId) }))),
        completions: omitKey(state.completions, action.dailyId),
      };

    case 'CREATE_GOAL': {
      const goalId = makeId('g');
      const now = new Date();
      const weekly = action.weekly.map((w) => ({
        ...newWeekly(w.text, now),
        daily: w.daily.map((d) => ({ id: makeId('d'), text: d.text, days: d.days })),
      }));
      const goal = { id: goalId, catId: action.catId, title: action.title, target: action.target || '', weekly };
      return { ...state, goals: [...state.goals, goal] };
    }

    case 'ADD_EVENT':
      return { ...state, events: [...state.events, { id: makeId('e'), ...action.event }] };
    case 'EDIT_EVENT':
      return { ...state, events: state.events.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)) };
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter((e) => e.id !== action.id) };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    default:
      return state;
  }
}

function init() {
  const loaded = loadState();
  if (loaded) return loaded;
  return seedState();
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

// ── selectors / derived data ────────────────────────────────────────────

export function allDailyObjectives(state) {
  const out = [];
  state.goals.forEach((g) => {
    g.weekly.forEach((w) => {
      w.daily.forEach((d) => {
        out.push({ goal: g, weekly: w, daily: d });
      });
    });
  });
  return out;
}

// Every "objective" (goal-derived, recurring) touching a given date.
export function objectivesOnDate(state, date) {
  const letter = dowLetter(date);
  const iso = toISODate(date);
  return allDailyObjectives(state)
    .filter(({ daily }) => daily.days.includes(letter))
    .map(({ goal, weekly, daily }) => {
      const rec = (state.completions[daily.id] || {})[iso] || { done: false, note: '' };
      return {
        kind: 'daily', id: `${daily.id}@${iso}`, dailyId: daily.id, goalId: goal.id, weeklyId: weekly.id,
        catId: goal.catId, title: daily.text, weeklyText: weekly.text, goalTitle: goal.title,
        done: rec.done, note: rec.note,
      };
    });
}

// Loose (one-off) tasks added directly to a given date.
export function looseTasksOnDate(state, date) {
  const iso = toISODate(date);
  return state.looseTasks
    .filter((t) => t.date === iso)
    .map((t) => {
      const goal = t.goalId ? state.goals.find((g) => g.id === t.goalId) : null;
      return {
        kind: 'loose', id: t.id, catId: t.catId, title: t.title, done: t.done, note: t.note,
        goalId: t.goalId, goalTitle: goal ? goal.title : '', weeklyText: '',
      };
    });
}

export function tasksOnDate(state, date) {
  return [...objectivesOnDate(state, date), ...looseTasksOnDate(state, date)];
}

// Is a weekly objective's recurrence rule "due" on the week containing `date`?
export function isWeeklyActiveOnDate(weekly, date) {
  const idx = weekIndex(date);
  const every = Math.max(1, weekly.repeat?.every || 1);
  if (idx < weekly.anchorWeek) return false;
  return (idx - weekly.anchorWeek) % every === 0;
}

export function weeklyOccurrence(state, weekly, date) {
  const key = isoWeekKey(startOfWeek(date));
  return (state.weeklyCompletions[weekly.id] || {})[key] || { done: false, note: '' };
}

// How many times a weekly objective has been due so far, and how many of
// those were completed — the real, recurrence-aware basis for goal %.
export function weeklyHistory(state, weekly, uptoDate = new Date()) {
  const every = Math.max(1, weekly.repeat?.every || 1);
  const uptoIdx = weekIndex(uptoDate);
  if (uptoIdx < weekly.anchorWeek) return { due: 0, done: 0 };
  const due = Math.floor((uptoIdx - weekly.anchorWeek) / every) + 1;
  const completions = state.weeklyCompletions[weekly.id] || {};
  const done = Object.values(completions).filter((c) => c.done).length;
  return { due, done: Math.min(done, due) };
}

export function goalWeeklyProgress(state, goal, uptoDate = new Date()) {
  let due = 0;
  let done = 0;
  goal.weekly.forEach((w) => {
    const h = weeklyHistory(state, w, uptoDate);
    due += h.due;
    done += h.done;
  });
  const pct = due ? Math.round((done / due) * 100) : 0;
  return { done, due, pct };
}

// Per-ISO-week status across a year, for the "year at a glance" grid:
// 'future' | 'none' (nothing due that week) | 'done' (all due objectives
// completed) | 'missed' (something was due and wasn't done).
export function goalYearGrid(state, goal, year, today = new Date()) {
  const weeks = isoWeeksInYear(year);
  const todayIdx = weekIndex(today);
  const out = [];
  for (let w = 1; w <= weeks; w++) {
    const monday = mondayOfIsoWeek(year, w);
    const idx = weekIndex(monday);
    const isCurrent = isoWeekYear(today) === year && isoWeekNumber(today) === w;
    if (idx > todayIdx) { out.push({ week: w, status: 'future', isCurrent }); continue; }
    const active = goal.weekly.filter((wk) => isWeeklyActiveOnDate(wk, monday));
    if (!active.length) { out.push({ week: w, status: 'none', isCurrent }); continue; }
    const allDone = active.every((wk) => weeklyOccurrence(state, wk, monday).done);
    out.push({ week: w, status: allDone ? 'done' : 'missed', isCurrent });
  }
  return out;
}

export function categoryOf(catId) {
  return CATEGORIES[catId];
}

// Re-derives a fresh task view from a lightweight reference (used by sheets
// that stay open across store updates, e.g. the note sheet).
export function getTaskViewByRef(state, ref) {
  if (!ref) return null;
  if (ref.kind === 'loose') {
    const t = state.looseTasks.find((x) => x.id === ref.id);
    if (!t) return null;
    const goal = t.goalId ? state.goals.find((g) => g.id === t.goalId) : null;
    return {
      kind: 'loose', id: t.id, catId: t.catId, title: t.title, done: t.done, note: t.note,
      goalId: t.goalId, goalTitle: goal ? goal.title : '', weeklyText: '',
    };
  }
  const goal = state.goals.find((g) => g.id === ref.goalId);
  if (!goal) return null;
  const weekly = goal.weekly.find((w) => w.id === ref.weeklyId);
  if (!weekly) return null;
  const daily = weekly.daily.find((d) => d.id === ref.dailyId);
  if (!daily) return null;
  const rec = (state.completions[daily.id] || {})[ref.date] || { done: false, note: '' };
  return {
    kind: 'daily', id: `${daily.id}@${ref.date}`, dailyId: daily.id, goalId: goal.id, weeklyId: weekly.id, date: ref.date,
    catId: goal.catId, title: daily.text, days: daily.days, weeklyText: weekly.text, goalTitle: goal.title,
    done: rec.done, note: rec.note,
  };
}

export function eventsOnDate(state, date) {
  return state.events.filter((e) => eventOccursOn(e, date));
}

// Upcoming reminders: one entry per (event, occurrence) within the next
// `horizonDays` days after `today` (today itself excluded — those already
// show inline on the Hoy screen).
export function computeReminders(state, today, horizonDays = 14) {
  const out = [];
  for (let i = 1; i <= horizonDays; i++) {
    const d = addDays(today, i);
    eventsOnDate(state, d).forEach((e) => {
      out.push({ event: e, date: d, diff: i });
    });
  }
  out.sort((a, b) => a.diff - b.diff);
  return out;
}
