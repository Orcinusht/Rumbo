import React, { useState } from 'react';
import { Trash, CalendarCheck } from '@phosphor-icons/react';
import { Sheet } from '../ui/Sheet';
import { useUi } from '../../state/ui';
import { useStore } from '../../state/store';
import { DOW_LETTERS } from '../../lib/dates';

const KICKER = { goal: 'Meta anual', weekly: 'Objetivo semanal', daily: 'Objetivo diario', loose: 'Objetivo de hoy' };
const REPEAT_OPTIONS = [
  { every: 1, label: 'Cada semana' },
  { every: 2, label: 'Cada 2 semanas' },
  { every: 3, label: 'Cada 3 semanas' },
  { every: 4, label: 'Cada 4 semanas' },
];

export function EditorSheet() {
  const { editor, updateEditorText, toggleEditorDay, setAllEditorDays, setEditorEvery, closeEditor, closeWeekly } = useUi();
  const { dispatch } = useStore();
  const { kind, mode, text, days, every, goalId, weeklyId, dailyId, id } = editor;
  const [confirming, setConfirming] = useState(false);

  const isDaily = kind === 'daily';
  const isWeekly = kind === 'weekly';
  const allDaysOn = DOW_LETTERS.every((l) => days && days[l]);
  const heading = mode === 'new' ? `Nuevo ${kind === 'weekly' ? 'objetivo semanal' : 'objetivo diario'}` : 'Editar texto';
  const label = kind === 'goal' ? 'Título de la meta' : 'Texto del objetivo';
  const placeholder = kind === 'daily' ? 'Ej. Leer 20 min antes de dormir' : 'Ej. Tres salidas de carrera';
  const canDelete = kind === 'goal' || (mode !== 'new' && kind !== 'goal');
  const saveLabel = mode === 'new' ? 'Añadir' : 'Guardar cambios';

  const save = () => {
    const value = (text || '').trim();
    if (!value) { closeEditor(); return; }
    const selectedDays = DOW_LETTERS.filter((l) => days && days[l]);
    const finalDays = selectedDays.length ? selectedDays : ['L', 'M', 'X', 'J', 'V'];
    if (kind === 'goal') {
      dispatch({ type: 'EDIT_GOAL_TITLE', goalId, text: value });
    } else if (kind === 'weekly') {
      dispatch({ type: 'SAVE_WEEKLY', goalId, weeklyId, mode, text: value, every });
    } else if (kind === 'daily') {
      if (mode === 'new') dispatch({ type: 'ADD_DAILY', goalId, weeklyId, text: value, days: finalDays });
      else dispatch({ type: 'EDIT_DAILY', goalId, weeklyId, dailyId, text: value, days: finalDays });
    } else if (kind === 'loose') {
      dispatch({ type: 'EDIT_LOOSE_TITLE', id, text: value });
    }
    closeEditor();
  };

  const remove = () => {
    if (kind === 'goal') {
      dispatch({ type: 'DELETE_GOAL', goalId });
      closeWeekly();
    } else if (kind === 'weekly') dispatch({ type: 'DELETE_WEEKLY', goalId, weeklyId });
    else if (kind === 'daily') dispatch({ type: 'DELETE_DAILY', goalId, weeklyId, dailyId });
    else if (kind === 'loose') dispatch({ type: 'DELETE_LOOSE_TASK', id });
    closeEditor();
  };

  return (
    <Sheet onClose={closeEditor}>
      <div className="kicker">{KICKER[kind]}</div>
      <h3 className="sheet-title">{heading}</h3>
      {kind !== 'goal' || mode === 'edit' ? (
        <div className="field">
          <label htmlFor="rumbo-ed">{label}</label>
          <textarea id="rumbo-ed" className="input" placeholder={placeholder} value={text}
            onChange={(e) => updateEditorText(e.target.value)} style={{ minHeight: 70, fontSize: 16 }} />
        </div>
      ) : null}
      {isDaily && (
        <div style={{ marginTop: 16 }}>
          <div className="field-row-head">
            <span className="kicker" style={{ margin: 0 }}>Días de la semana</span>
            <button type="button" className="link-btn" onClick={() => setAllEditorDays(!allDaysOn)}>
              {allDaysOn ? 'Ninguno' : 'Todos los días'}
            </button>
          </div>
          <div className="day-row">
            {DOW_LETTERS.map((l) => {
              const on = !!(days && days[l]);
              return (
                <button key={l} type="button" className={`day-toggle${on ? ' on' : ''}`} onClick={() => toggleEditorDay(l)}>
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {isWeekly && (
        <div style={{ marginTop: 16 }}>
          <div className="kicker">
            <CalendarCheck size={13} weight="bold" /> Se repite
          </div>
          <div className="pill-row">
            {REPEAT_OPTIONS.map((opt) => (
              <button key={opt.every} type="button" className={`pill-btn${every === opt.every ? ' on' : ''}`} onClick={() => setEditorEvery(opt.every)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="sheet-actions">
        {canDelete && !confirming && (
          <button type="button" onClick={() => (kind === 'goal' ? setConfirming(true) : remove())} className="btn btn-secondary btn-danger" style={{ flex: 'none' }}>
            <Trash size={15} weight="bold" /> Eliminar
          </button>
        )}
        {canDelete && confirming && (
          <button type="button" onClick={remove} className="btn btn-danger-solid" style={{ flex: 'none' }}>
            <Trash size={15} weight="bold" /> Confirmar, borrar meta
          </button>
        )}
        {!confirming && <button type="button" onClick={save} className="btn btn-primary" style={{ flex: 1 }}>{saveLabel}</button>}
        {confirming && <button type="button" onClick={() => setConfirming(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>}
      </div>
    </Sheet>
  );
}
