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
  const { step, title, target, catId, weekly, pickIndex, input, days } = wizard;
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
    dispatch({ type: 'CREATE_GOAL', catId, title: title.trim() || 'Meta sin título', target: (target || '').trim(), weekly });
    closeWizard();
    fx.celebrate('¡Meta creada!');
  };

  const onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); addAtStep(); } };

  return (
    <FullSheet>
      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="kicker" style={{ margin: 0 }}>Nueva meta anual</div>
          <button type="button" aria-label="Cerrar" onClick={closeWizard} className="icon-btn" style={{ width: 36, height: 36 }}>
            <X size={18} weight="bold" />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {STEPS.map(([n, l]) => (
            <div key={n} style={{ flex: 1 }}>
              <div style={{ height: 5, background: step >= n ? 'var(--color-accent)' : 'var(--color-surface-3)', borderRadius: 'var(--radius-pill)' }} />
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.02em', color: step >= n ? 'var(--color-accent)' : 'var(--color-text-faint)', marginTop: 7 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '22px 20px 10px' }}>
        {step === 1 && (
          <>
            <h2 style={{ fontSize: 24, margin: '0 0 16px' }}>¿Qué quieres conseguir este año?</h2>
            <div className="field">
              <label htmlFor="rumbo-goal">Título de la meta</label>
              <input id="rumbo-goal" className="input" placeholder="Ej. Correr 10 km sin parar" value={title}
                onChange={(e) => updateWizard({ title: e.target.value })} style={{ fontSize: 16, minHeight: 44 }} autoFocus />
            </div>
            <div className="field">
              <label htmlFor="rumbo-target">Meta concreta (opcional)</label>
              <input id="rumbo-target" className="input" placeholder="Ej. 10 km sin parar antes de diciembre" value={target || ''}
                onChange={(e) => updateWizard({ target: e.target.value })} style={{ fontSize: 15, minHeight: 42 }} />
            </div>
            <div className="kicker">Categoría</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CATEGORY_ORDER.map((k) => {
                const c = CATEGORIES[k];
                const on = catId === k;
                return (
                  <button key={k} type="button" onClick={() => updateWizard({ catId: k })} className={`pill-btn${on ? ' on' : ''}`}
                    style={{ justifyContent: 'flex-start', padding: '13px 14px', ...(on ? { borderColor: c.fill, background: c.tint, color: c.ink } : {}) }}>
                    <c.Icon size={19} weight="fill" color={c.fill} />
                    <span style={{ fontSize: 15.5, flex: 1 }}>{c.label}</span>
                    {on && <CheckCircle size={18} weight="fill" color={c.ink} />}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: 24, margin: '0 0 6px' }}>Objetivos semanales</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '0 0 16px' }}>Lo que hace falta cada semana para llegar. Después colgarás de cada uno sus objetivos diarios.</p>
            {weekly.length > 0 && (
              <div className="card list-card" style={{ marginBottom: 14 }}>
                {weekly.map((w, i) => (
                  <div key={i} className="list-row">
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-faint)', width: 16 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{w.text}</span>
                    <button type="button" aria-label="Quitar" onClick={() => removeWeekly(i)} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--color-text-faint)', padding: 0 }}>
                      <MinusCircle size={19} weight="fill" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Nuevo objetivo semanal" value={input} onChange={(e) => updateWizard({ input: e.target.value })} onKeyDown={onKey}
                style={{ flex: 1, minWidth: 0, fontSize: 15, minHeight: 42 }} autoFocus />
              <button type="button" onClick={addAtStep} className="btn btn-secondary" style={{ flex: 'none' }}>Añadir</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ fontSize: 24, margin: '0 0 6px' }}>Objetivos diarios</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '0 0 16px' }}>Elige a qué objetivo semanal pertenece cada uno. Se repetirán en el calendario los días marcados.</p>
            {!weekly.length && <p style={{ fontSize: 14.5, color: 'var(--color-text-muted)' }}>Vuelve al paso anterior y añade al menos un objetivo semanal.</p>}
            {weekly.map((w, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <button type="button" onClick={() => updateWizard({ pickIndex: i })} className={`pill-btn${pickIndex === i ? ' on' : ''}`}
                  style={{ justifyContent: 'flex-start', width: '100%', padding: '11px 13px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-faint)', width: 16 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 15 }}>{w.text}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-muted)' }}>{w.daily.length} diarios</span>
                </button>
                {w.daily.map((d, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 4px 9px 30px' }}>
                    <span style={{ flex: 'none', width: 8, height: 8, borderRadius: 'var(--radius-pill)', background: cat.fill }} />
                    <span style={{ flex: 1, fontSize: 14.5 }}>{d.text}</span>
                    <button type="button" aria-label="Quitar" onClick={() => removeDaily(i, j)} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--color-text-faint)', padding: 0 }}>
                      <MinusCircle size={17} weight="fill" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
            {!!weekly.length && (
              <div style={{ marginTop: 10 }}>
                <div className="kicker">Días de la semana</div>
                <div className="day-row" style={{ marginBottom: 14 }}>
                  {DOW_LETTERS.map((l) => {
                    const on = days[l];
                    return (
                      <button key={l} type="button" className={`day-toggle${on ? ' on' : ''}`} onClick={() => toggleDay(l)}
                        style={on ? { background: cat.fill, borderColor: cat.fill } : undefined}>
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

      <div style={{ flex: 'none', padding: '14px 20px max(env(safe-area-inset-bottom), 24px)', display: 'flex', gap: 10, borderTop: '1px solid var(--color-border)' }}>
        <button type="button" onClick={back} className="btn btn-secondary" style={{ flex: 'none' }}>{step === 1 ? 'Cancelar' : 'Atrás'}</button>
        <button type="button" onClick={next} className="btn btn-primary" style={{ flex: 1 }}>{step === 3 ? 'Crear meta' : 'Siguiente'}</button>
      </div>
    </FullSheet>
  );
}
