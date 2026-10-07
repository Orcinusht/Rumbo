import React, { createContext, useContext, useState } from 'react';
import { todayISO, fromISODate, startOfWeek, addDays } from '../lib/dates';

const UiContext = createContext(null);

const emptyWizard = () => ({
  step: 1,
  title: '',
  target: '',
  catId: 'salud',
  weekly: [], // [{ text, daily: [{ text, days }] }]
  pickIndex: 0,
  input: '',
  days: { L: true, M: true, X: true, J: true, V: true, S: false, D: false },
});

export function UiProvider({ children }) {
  const [tab, setTabRaw] = useState('hoy');
  const [openGoalId, setOpenGoalId] = useState(null);
  const [openWeeklyId, setOpenWeeklyId] = useState(null);
  const [hoyMode, setHoyMode] = useState('dia');

  const [calMode, setCalMode] = useState('mes');
  const today = fromISODate(todayISO());
  const [calRefDate, setCalRefDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);

  const [noteRef, setNoteRef] = useState(null);
  const [addDraft, setAddDraft] = useState(null);
  const [editor, setEditor] = useState(null);
  const [eventDraft, setEventDraft] = useState(null);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [wizard, setWizard] = useState(null);

  const setTab = (t) => {
    setTabRaw(t);
    setOpenGoalId(null);
    setOpenWeeklyId(null);
  };

  const value = {
    tab, setTab,
    openGoalId, openGoal: (id) => { setOpenGoalId(id); setOpenWeeklyId(null); }, closeGoal: () => setOpenGoalId(null),
    openWeeklyId, openWeekly: (id) => setOpenWeeklyId(id), closeWeekly: () => setOpenWeeklyId(null),
    goToWeekly: (goalId, weeklyId) => { setTabRaw('metas'); setOpenGoalId(goalId); setOpenWeeklyId(weeklyId); },

    hoyMode, setHoyMode,

    calMode, setCalMode,
    calRefDate, setCalRefDate,
    selectedDate, setSelectedDate,
    goToMonth: (delta) => setCalRefDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1)),
    goToWeek: (delta) => setCalRefDate((d) => addDays(startOfWeek(d), delta * 7)),

    noteRef, openNote: (ref) => setNoteRef(ref), closeNote: () => setNoteRef(null),

    addDraft,
    openAdd: () => setAddDraft({ title: '', catId: 'salud', goalId: null }),
    closeAdd: () => setAddDraft(null),
    updateAdd: (patch) => setAddDraft((d) => ({ ...d, ...patch })),

    editor,
    openEditor: (cfg) => setEditor({ days: {}, every: 1, ...cfg }),
    closeEditor: () => setEditor(null),
    updateEditorText: (text) => setEditor((e) => ({ ...e, text })),
    toggleEditorDay: (letter) => setEditor((e) => ({ ...e, days: { ...e.days, [letter]: !e.days[letter] } })),
    setAllEditorDays: (on) => setEditor((e) => ({ ...e, days: { L: on, M: on, X: on, J: on, V: on, S: on, D: on } })),
    setEditorEvery: (every) => setEditor((e) => ({ ...e, every })),

    eventDraft,
    openNewEvent: (date) => setEventDraft({ mode: 'new', id: null, date, type: 'marcada', title: '', time: '', recurrence: 'once', customLabel: '' }),
    openEditEvent: (ev) => setEventDraft({ ...ev, mode: 'edit', date: fromISODate(ev.date) }),
    closeEvent: () => setEventDraft(null),
    updateEvent: (patch) => setEventDraft((e) => ({ ...e, ...patch })),

    remindersOpen, openReminders: () => setRemindersOpen(true), closeReminders: () => setRemindersOpen(false),

    wizard,
    openWizard: () => setWizard(emptyWizard()),
    closeWizard: () => setWizard(null),
    setWizardStep: (step) => setWizard((w) => ({ ...w, step, input: '' })),
    updateWizard: (patch) => setWizard((w) => ({ ...w, ...patch })),
  };

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within UiProvider');
  return ctx;
}
