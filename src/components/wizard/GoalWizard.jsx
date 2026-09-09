import React from 'react';
import { X, CheckCircle, MinusCircle } from '@phosphor-icons/react';
import { FullSheet } from '../ui/Sheet';
import { useUi } from '../../state/ui';
import { useStore } from '../../state/store';
import { useFx } from '../ui/Fx';
import { CATEGORIES, CATEGORY_ORDER } from '../../lib/categories';
import { DOW_LETTERS } from '../../lib/dates';

const STEPS = [[1, 'Título'], [2, 'Semanales'], [3, 'Diarios']];

export function GoalWizard() {
  const { wizard, updateWizard, setWizardStep, closeWizard } = useUi();
  const { dispatch } = useStore();
  const fx = useFx();
  const { step, title, catId, weekly, pickIndex, input, days } = wizard;
  const cat = CATEGORIES[catId];

  const addAtStep = () => {
    const value = input.trim();
    if (!value) return;
    if (step === 2) {
      updateWizard({ weekly: [...weekly, { text: value, daily: [] }], input: '' });
    } else {
      const selected = DOW_LETTERS.filter((l) => days[l]);
      const finalDays = selected.length ? selected : ['L', 'M', 'X', 'J', 'V'];
      updateWizard({
        weekly: weekly.map((w, i) => (i === pickIndex ? { ...w, daily: [...w.daily, { text: value, days: finalDays }] } : w)),
        input: '',
      });
    }
  };

  const removeWeekly = (i) => updateWizard({ weekly: weekly.filter((_, j) => j !== i) });
  const removeDaily = (wi, di) => updateWizard({ weekly: weekly.map((w, i) => (i === wi ? { ...w, daily: w.daily.filter((_, j) => j !== di) } : w)) });
  const toggleDay = (l) => updateWizard({ days: { ...days, [l]: !days[l] } });

  const back = () => (step === 1 ? closeWizard() : setWizardStep(step - 1));
  const next = () => {
    if (step < 3) { setWizardStep(step + 1); return; }
    dispatch({ type: 'CREATE_GOAL', catId, title: title.trim() || 'Meta sin título', weekly });
    closeWizard();
    fx.celebrate('Meta creada');
  };

  const onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); addAtStep(); } };

  return (
    <FullSheet>
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Nueva meta anual</span>
          <button type="button" aria-label="Cerrar" onClick={closeWizard} style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)' }}>
            <X size={19} weight="duotone" />
          </button>
        </div>
        <div style={{ height: 3, background: 'var(--color-text)', marginTop: 7 }} />
        <div style={{ height: 1, background: 'var(--color-text)', marginTop: 2 }} />
        <div style={{ display: 'flex', gap: 5, marginTop: 14 }}>
          {STEPS.map(([n, l]) => (
            <div key={n} style={{ flex: 1 }}>
              <div style={{ height: 4, background: step >= n ? 'var(--color-text)' : '#dedbda', borderRadius: 1 }} />
              <div style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: step >= n ? 'var(--color-text)' : '#75726f', marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '22px 22px 10px' }}>
        {step === 1 && (
          <>
            <h3 style={{ fontSize: 26, margin: '0 0 16px', letterSpacing: '-.02em' }}>¿Qué quieres conseguir este año?</h3>
            <div className="field" style={{ marginBottom: 22 }}>
              <label htmlFor="rumbo-goal">Título de la meta</label>
              <input id="rumbo-goal" className="input" placeholder="Ej. Correr 10 km sin parar" value={title}
                onChange={(e) => updateWizard({ title: e.target.value })} style={{ fontSize: 16, minHeight: 44 }} />
            </div>
            <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 10 }}>Categoría</div>
            {CATEGORY_ORDER.map((k) => {
              const c = CATEGORIES[k];
              const on = catId === k;
              return (
                <button key={k} type="button" onClick={() => updateWizard({ catId: k })}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 11, padding: '12px 13px', marginBottom: 7, borderRadius: 3, cursor: 'pointer', font: 'inherit', textAlign: 'left', border: `1.5px solid ${on ? c.fill : 'rgba(32,30,29,.18)'}`, background: on ? c.tint : 'transparent' }}>
                  <c.Icon size={19} weight="duotone" color={c.ink} />
                  <span style={{ fontSize: 16, flex: 1 }}>{c.label}</span>
                  {on && <CheckCircle size={18} weight="duotone" color={c.ink} />}
                </button>
              );
            })}
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ fontSize: 26, margin: '0 0 6px', letterSpacing: '-.02em' }}>Objetivos semanales</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '0 0 18px' }}>Lo que hace falta cada semana para llegar. Después colgarás de cada uno sus objetivos diarios.</p>
            {weekly.map((w, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '11px 0', borderBottom: '1px solid rgba(32,30,29,.12)' }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', width: 16 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 15.5 }}>{w.text}</span>
                <button type="button" aria-label="Quitar" onClick={() => removeWeekly(i)} style={{ background: 'none', border: 0, cursor: 'pointer', color: '#75726f', padding: 0 }}>
                  <MinusCircle size={17} weight="duotone" />
                </button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <input className="input" placeholder="Nuevo objetivo semanal" value={input} onChange={(e) => updateWizard({ input: e.target.value })} onKeyDown={onKey}
                style={{ flex: 1, minWidth: 0, fontSize: 15, minHeight: 42 }} />
              <button type="button" onClick={addAtStep} className="btn btn-secondary" style={{ flex: 'none' }}>Añadir</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 style={{ fontSize: 26, margin: '0 0 6px', letterSpacing: '-.02em' }}>Objetivos diarios</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '0 0 16px' }}>Elige a qué objetivo semanal pertenece cada uno. Se repetirán en el calendario los días marcados.</p>
            {!weekly.length && <p style={{ fontSize: 14.5, fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Vuelve al paso anterior y añade al menos un objetivo semanal.</p>}
            {weekly.map((w, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <button type="button" onClick={() => updateWizard({ pickIndex: i })}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 9, textAlign: 'left', padding: '10px 12px', borderRadius: 3, cursor: 'pointer', font: 'inherit', border: `1.5px solid ${pickIndex === i ? 'var(--color-text)' : 'rgba(32,30,29,.18)'}`, background: pickIndex === i ? '#e3e0df' : 'transparent' }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', width: 16 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 15.5 }}>{w.text}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{w.daily.length} diarios</span>
                </button>
                {w.daily.map((d, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 0 9px 26px', borderBottom: '1px solid rgba(32,30,29,.1)' }}>
                    <span style={{ flex: 'none', width: 8, height: 8, borderRadius: 2, background: cat.fill }} />
                    <span style={{ flex: 1, fontSize: 15 }}>{d.text}</span>
                    <button type="button" aria-label="Quitar" onClick={() => removeDaily(i, j)} style={{ background: 'none', border: 0, cursor: 'pointer', color: '#75726f', padding: 0 }}>
                      <MinusCircle size={17} weight="duotone" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
            {!!weekly.length && (
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 9 }}>Días de la semana</div>
                <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
                  {DOW_LETTERS.map((l) => {
                    const on = days[l];
                    return (
                      <button key={l} type="button" className="day-toggle" onClick={() => toggleDay(l)}
                        style={{ background: on ? cat.fill : 'transparent', color: on ? 'var(--color-bg)' : 'var(--color-text)', borderColor: on ? cat.fill : undefined }}>
                        {l}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" placeholder={`Diario para «${weekly[Math.min(pickIndex, weekly.length - 1)].text}»`} value={input}
                    onChange={(e) => updateWizard({ input: e.target.value })} onKeyDown={onKey} style={{ flex: 1, minWidth: 0, fontSize: 15, minHeight: 42 }} />
                  <button type="button" onClick={addAtStep} className="btn btn-secondary" style={{ flex: 'none' }}>Añadir</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ flex: 'none', padding: '14px 22px 30px', display: 'flex', gap: 10, borderTop: '1px solid rgba(32,30,29,.14)' }}>
        <button type="button" onClick={back} className="btn btn-secondary" style={{ flex: 'none' }}>{step === 1 ? 'Cancelar' : 'Atrás'}</button>
        <button type="button" onClick={next} className="btn btn-primary" style={{ flex: 1 }}>{step === 3 ? 'Crear meta' : 'Siguiente'}</button>
      </div>
    </FullSheet>
  );
}
