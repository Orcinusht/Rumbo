import React, { useEffect, useState } from 'react';
import { Sparkle, ArrowClockwise, Check, Gear } from '@phosphor-icons/react';
import { Sheet } from '../ui/Sheet';
import { useUi } from '../../state/ui';
import { suggestList, AiError } from '../../lib/ai';

const KICKER = { weekly: 'Sugerencias · objetivos semanales', daily: 'Sugerencias · objetivos diarios' };

function buildRequest(d) {
  if (d.kind === 'weekly') {
    return {
      system: 'Eres un asistente dentro de Rumbo, una app de organización personal, que ayuda a desglosar metas anuales en objetivos semanales concretos, accionables y medibles. Responde siempre en español.',
      prompt: `Meta: "${d.goalTitle}"${d.goalTarget ? ` (objetivo concreto: ${d.goalTarget})` : ''}\nCategoría: ${d.catLabel || ''}\nObjetivos semanales que ya existen para esta meta: ${d.existing.length ? d.existing.join('; ') : 'ninguno todavía'}\n\nPropón ${d.existing.length ? 'nuevos' : ''} objetivos semanales distintos a los que ya existen, concretos y variados, que ayuden a avanzar de verdad hacia la meta.`,
    };
  }
  return {
    system: 'Eres un asistente dentro de Rumbo, una app de organización personal, que ayuda a desglosar un objetivo semanal en objetivos diarios breves y accionables (algo que se pueda hacer en pocos minutos). Responde siempre en español.',
    prompt: `Meta anual: "${d.goalTitle}"\nObjetivo semanal: "${d.weeklyText}"\nObjetivos diarios que ya existen en este semanal: ${d.existing.length ? d.existing.join('; ') : 'ninguno todavía'}\n\nPropón objetivos diarios distintos a los que ya existen, breves y concretos, que ayuden a cumplir el objetivo semanal.`,
  };
}

export function SuggestSheet() {
  const { suggestDraft: d, closeSuggest, setTab } = useUi();
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [items, setItems] = useState([]);
  const [checked, setChecked] = useState({});
  const [error, setError] = useState(null);
  const [noKey, setNoKey] = useState(false);

  const run = async () => {
    setStatus('loading');
    setError(null);
    setNoKey(false);
    try {
      const list = await suggestList({ ...buildRequest(d), count: 5 });
      setItems(list);
      setChecked(Object.fromEntries(list.map((_, i) => [i, true])));
      setStatus('ready');
    } catch (e) {
      setError(e instanceof AiError ? e.message : 'Algo ha ido mal pidiendo sugerencias.');
      setNoKey(e instanceof AiError && e.kind === 'no-key');
      setStatus('error');
    }
  };

  useEffect(() => { run(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  if (!d) return null;
  const selectedCount = Object.values(checked).filter(Boolean).length;

  const addSelected = () => {
    const texts = items.filter((_, i) => checked[i]);
    if (texts.length) d.onAdd(texts);
    closeSuggest();
  };

  return (
    <Sheet onClose={closeSuggest}>
      <div className="kicker"><Sparkle size={13} weight="fill" /> {KICKER[d.kind]}</div>
      <h3 className="sheet-title">Ideas para avanzar</h3>

      {status === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 0', color: 'var(--color-text-muted)', gap: 10 }}>
          <Sparkle size={26} weight="fill" color="var(--color-accent)" style={{ animation: 'rumbo-pop 1.1s ease infinite' }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Pensando…</span>
        </div>
      )}

      {status === 'error' && (
        <div className="empty-state" style={{ padding: '20px 4px' }}>
          <p style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{error}</p>
          {noKey ? (
            <button type="button" className="btn btn-primary" onClick={() => { closeSuggest(); setTab('perfil'); }}>
              <Gear size={15} weight="bold" /> Ir a Ajustes de IA
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={run}><ArrowClockwise size={15} weight="bold" /> Reintentar</button>
          )}
        </div>
      )}

      {status === 'ready' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {items.map((text, i) => {
              const on = !!checked[i];
              return (
                <button key={i} type="button" className={`pill-btn${on ? ' on' : ''}`}
                  style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '12px 14px' }}
                  onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 'var(--radius-sm)', flex: 'none', display: 'grid', placeItems: 'center',
                    border: `1.5px solid ${on ? 'var(--color-accent)' : 'var(--color-border-strong)'}`, background: on ? 'var(--color-accent)' : 'transparent',
                  }}
                  >{on && <Check size={13} weight="bold" color="#fff" />}</span>
                  <span style={{ flex: 1, fontSize: 14.5 }}>{text}</span>
                </button>
              );
            })}
          </div>
          <div className="sheet-actions" style={{ marginTop: 0 }}>
            <button type="button" aria-label="Regenerar" className="btn btn-secondary btn-icon" onClick={run}><ArrowClockwise size={16} weight="bold" /></button>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} disabled={!selectedCount} onClick={addSelected}>
              Añadir {selectedCount > 0 ? `(${selectedCount})` : ''}
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
