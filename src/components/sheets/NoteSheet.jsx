import React, { useEffect, useState } from 'react';
import { PencilSimple } from '@phosphor-icons/react';
import { Sheet } from '../ui/Sheet';
import { useUi } from '../../state/ui';
import { useStore, getTaskViewByRef, categoryOf } from '../../state/store';
import { daysArrayToMap } from '../../lib/dates';

export function NoteSheet() {
  const { noteRef, closeNote, openEditor } = useUi();
  const { state, dispatch } = useStore();
  const task = getTaskViewByRef(state, noteRef);
  const [draft, setDraft] = useState(task ? task.note : '');

  useEffect(() => {
    if (!task) closeNote();
  }, [task, closeNote]);

  if (!task) return null;
  const cat = categoryOf(task.catId);

  const toggle = () => {
    if (task.kind === 'daily') dispatch({ type: 'TOGGLE_DAILY', dailyId: task.dailyId, date: task.date });
    else dispatch({ type: 'TOGGLE_LOOSE_TASK', id: task.id });
  };

  const save = () => {
    if (task.kind === 'daily') dispatch({ type: 'SET_DAILY_NOTE', dailyId: task.dailyId, date: task.date, note: draft });
    else dispatch({ type: 'SET_LOOSE_NOTE', id: task.id, note: draft });
    closeNote();
  };

  const editText = () => {
    closeNote();
    if (task.kind === 'daily') {
      openEditor({ kind: 'daily', mode: 'edit', goalId: task.goalId, weeklyId: task.weeklyId, dailyId: task.dailyId, text: task.title, days: daysArrayToMap(task.days) });
    } else {
      openEditor({ kind: 'loose', mode: 'edit', id: task.id, text: task.title });
    }
  };

  return (
    <Sheet onClose={closeNote}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span className="chip" style={{ background: cat.tint, color: cat.ink }}>
          <cat.Icon size={13} weight="fill" /> {cat.label}
        </span>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={editText} className="btn btn-ghost btn-sm">
          <PencilSimple size={14} weight="bold" /> Editar
        </button>
      </div>
      <h3 className="sheet-title" style={{ marginBottom: 2 }}>{task.title}</h3>
      {task.goalTitle && <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', margin: '0 0 16px' }}>{task.goalTitle}</p>}
      <div className="field">
        <label htmlFor="rumbo-note">Nota del día</label>
        <textarea id="rumbo-note" className="input" placeholder="¿Cómo ha ido? Dificultades, contexto, lo que quieras recordar."
          value={draft} onChange={(e) => setDraft(e.target.value)} style={{ minHeight: 104, fontSize: 15 }} />
      </div>
      <div className="sheet-actions">
        <button type="button" onClick={() => { toggle(); closeNote(); }} className="btn btn-secondary" style={{ flex: 1 }}>
          {task.done ? 'Desmarcar' : 'Marcar hecha'}
        </button>
        <button type="button" onClick={save} className="btn btn-primary" style={{ flex: 1 }}>Guardar nota</button>
      </div>
    </Sheet>
  );
}
