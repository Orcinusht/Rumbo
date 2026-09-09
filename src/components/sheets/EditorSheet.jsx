import React from 'react';
import { Trash } from '@phosphor-icons/react';
import { Sheet } from '../ui/Sheet';
import { useUi } from '../../state/ui';
import { useStore } from '../../state/store';
import { DOW_LETTERS } from '../../lib/dates';

const KICKER = { goal: 'Meta anual', weekly: 'Objetivo semanal', daily: 'Objetivo diario', loose: 'Objetivo de hoy' };

export function EditorSheet() {
  const { editor, updateEditorText, toggleEditorDay, closeEditor } = useUi();
  const { dispatch } = useStore();
  const { kind, mode, text, days, goalId, weeklyId, dailyId, id } = editor;

  const isDaily = kind === 'daily';
  const heading = mode === 'new' ? `Nuevo ${kind === 'weekly' ? 'objetivo semanal' : 'objetivo diario'}` : 'Editar texto';
  const label = kind === 'goal' ? 'Título de la meta' : 'Texto del objetivo';
  const placeholder = kind === 'daily' ? 'Ej. Leer 20 min antes de dormir' : 'Ej. Tres salidas de carrera';
  const canDelete = mode !== 'new' && kind !== 'goal';
  const saveLabel = mode === 'new' ? 'Añadir' : 'Guardar cambios';

  const save = () => {
    const value = (text || '').trim();
    if (!value) { closeEditor(); return; }
    const selectedDays = DOW_LETTERS.filter((l) => days && days[l]);
    const finalDays = selectedDays.length ? selectedDays : ['L', 'M', 'X', 'J', 'V'];
    if (kind === 'goal') {
      dispatch({ type: 'EDIT_GOAL_TITLE', goalId, text: value });
    } else if (kind === 'weekly') {
      if (mode === 'new') dispatch({ type: 'ADD_WEEKLY', goalId, text: value });
      else dispatch({ type: 'EDIT_WEEKLY_TEXT', goalId, weeklyId, text: value });
    } else if (kind === 'daily') {
      if (mode === 'new') dispatch({ type: 'ADD_DAILY', goalId, weeklyId, text: value, days: finalDays });
      else dispatch({ type: 'EDIT_DAILY', goalId, weeklyId, dailyId, text: value, days: finalDays });
    } else if (kind === 'loose') {
      dispatch({ type: 'EDIT_LOOSE_TITLE', id, text: value });
    }
    closeEditor();
  };

  const remove = () => {
    if (kind === 'weekly') dispatch({ type: 'DELETE_WEEKLY', goalId, weeklyId });
    else if (kind === 'daily') dispatch({ type: 'DELETE_DAILY', goalId, weeklyId, dailyId });
    else if (kind === 'loose') dispatch({ type: 'DELETE_LOOSE_TASK', id });
    closeEditor();
  };

  return (
    <Sheet onClose={closeEditor}>
      <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>{KICKER[kind]}</div>
      <h3 style={{ fontSize: 24, margin: '0 0 14px', letterSpacing: '-.02em' }}>{heading}</h3>
      <div className="field">
        <label htmlFor="rumbo-ed">{label}</label>
        <textarea id="rumbo-ed" className="input" placeholder={placeholder} value={text}
          onChange={(e) => updateEditorText(e.target.value)} style={{ minHeight: 70, fontSize: 16 }} />
      </div>
      {isDaily && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 9 }}>Días de la semana</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {DOW_LETTERS.map((l) => {
              const on = !!(days && days[l]);
              return (
                <button key={l} type="button" className="day-toggle" onClick={() => toggleEditorDay(l)}
                  style={{ background: on ? 'var(--color-text)' : 'transparent', color: on ? 'var(--color-bg)' : 'var(--color-text)', borderColor: on ? 'var(--color-text)' : undefined }}>
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {canDelete && (
          <button type="button" onClick={remove} className="btn btn-secondary" style={{ flex: 'none', color: '#aa0b56' }}>
            <Trash size={15} weight="duotone" /> Eliminar
          </button>
        )}
        <button type="button" onClick={save} className="btn btn-primary" style={{ flex: 1 }}>{saveLabel}</button>
      </div>
    </Sheet>
  );
}
