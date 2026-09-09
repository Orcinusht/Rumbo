import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { loadState, saveState } from '../lib/storage';
import { seedState } from './seed';
import { makeId } from '../lib/id';
import { CATEGORIES } from '../lib/categories';
import { dowLetter, toISODate, addDays, eventOccursOn } from '../lib/dates';

const StoreContext = createContext(null);

function mapGoal(goals, goalId, fn) {
  return goals.map((g) => (g.id === goalId ? fn(g) : g));
}

function mapWeekly(goal, weeklyId, fn) {
  return { ...goal, weekly: goal.weekly.map((w) => (w.id === weeklyId ? fn(w) : w)) };
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

    case 'ADD_WEEKLY':
      return {
        ...state,
        goals: mapGoal(state.goals, action.goalId, (g) => ({
          ...g,
          weekly: [...g.weekly, { id: makeId('w'), text: action.text, done: false, daily: [] }],
        })),
      };
    case 'EDIT_WEEKLY_TEXT':
      return {
        ...state,
        goals: mapGoal(state.goals, action.goalId, (g) =>
          mapWeekly(g, action.weeklyId, (w) => ({ ...w, text: action.text }))),
      };
    case 'DELETE_WEEKLY':
      return {
        ...state,
        goals: mapGoal(state.goals, action.goalId, (g) => ({ ...g, weekly: g.weekly.filter((w) => w.id !== action.weeklyId) })),
      };
    case 'TOGGLE_WEEKLY_DONE':
      return {
        ...state,
        goals: mapGoal(state.goals, action.goalId, (g) =>
          mapWeekly(g, action.weeklyId, (w) => ({ ...w, done: !w.done }))),
      };

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
      };

    case 'CREATE_GOAL': {
      const goalId = makeId('g');
      const weekly = action.weekly.map((w) => ({
        id: makeId('w'), text: w.text, done: false,
        daily: w.daily.map((d) => ({ id: makeId('d'), text: d.text, days: d.days })),
      }));
      const goal = { id: goalId, catId: action.catId, title: action.title, target: '', weekly };
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

export function goalWeeklyProgress(goal) {
  const total = goal.weekly.length;
  const done = goal.weekly.filter((w) => w.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
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

