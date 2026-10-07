import React, { useState } from 'react';
import { Sparkle, ArrowClockwise, X } from '@phosphor-icons/react';
import { FullSheet } from '../ui/Sheet';
import { useUi } from '../../state/ui';
import { useStore, goalWeeklyProgress, eventsOnDate } from '../../state/store';
import { generatePlan, AiError } from '../../lib/ai';
import { CATEGORIES } from '../../lib/categories';
import { addDays, monthLabel } from '../../lib/dates';
import { eventDisplayName, eventKindLabel } from '../../lib/eventTypes';

function buildContext(state, days) {
  const today = new Date();
  const goals = state.goals.map((g) => {
    const { pct } = goalWeeklyProgress(state, g);
    const weekly = g.weekly.map((w) => `  · ${w.text}`).join('\n');
    return `- ${CATEGORIES[g.catId].label} — "${g.title}"${g.target ? ` (objetivo: ${g.target})` : ''}, ${pct}% completada\n${weekly}`;
  }).join('\n');

  const events = [];
  for (let i = 0; i <= days; i++) {
    const d = addDays(today, i);
    eventsOnDate(state, d).forEach((e) => events.push(`- ${eventDisplayName(e)} el ${d.toLocaleDateString('es-ES')}${e.time ? ` a las ${e.time}` : ''} (${eventKindLabel(e)})`));
  }

  return {
    goals: goals || 'El usuario todavía no tiene metas creadas.',
    events: events.length ? events.join('\n') : 'Sin eventos marcados en ese periodo.',
  };
}

async function requestPlan(mode, state) {
  const days = mode === 'semana' ? 7 : 30;
  const ctx = buildContext(state, days);
  const label = mode === 'semana' ? 'esta semana (7 días)' : `este mes (${monthLabel(new Date())})`;
  const system = 'Eres el planificador integrado en Rumbo, una app de organización personal con metas anuales desglosadas en objetivos semanales y diarios. Propones planes prácticos, realistas y motivadores, nunca abrumadores. Respondes siempre en español, en formato con encabezados que empiecen por "## " y viñetas que empiecen por "- ", sin introducciones ni cierres largos.';
  const prompt = `Metas activas del usuario:\n${ctx.goals}\n\nEventos marcados en el calendario para ${label}:\n${ctx.events}\n\nPropón un plan para ${label} que ayude a avanzar en las metas de forma realista, teniendo en cuenta los eventos. Organiza el plan en 2-4 secciones breves con encabezados "## ".`;
  return generatePlan({ system, prompt });
}

function renderPlan(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length);
  const blocks = [];
  let bullets = null;
  lines.forEach((line) => {
    if (line.startsWith('## ') || line.startsWith('# ')) {
      bullets = null;
      blocks.push({ type: 'h', text: line.replace(/^#+\s*/, '') });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!bullets) { bullets = { type: 'ul', items: [] }; blocks.push(bullets); }
      bullets.items.push(line.replace(/^[-*]\s*/, ''));
    } else {
      bullets = null;
      blocks.push({ type: 'p', text: line });
    }
  });
  return blocks.map((b, i) => {
    if (b.type === 'h') return <h4 key={i} style={{ marginTop: i ? 20 : 0, marginBottom: 8, color: 'var(--color-accent)' }}>{b.text}</h4>;
    if (b.type === 'ul') {
      return (
        <ul key={i} style={{ margin: '0 0 10px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {b.items.map((it, j) => <li key={j} style={{ fontSize: 14.5, lineHeight: 1.45 }}>{it}</li>)}
        </ul>
      );
    }
    return <p key={i} style={{ fontSize: 14.5, lineHeight: 1.5, margin: '0 0 10px' }}>{b.text}</p>;
  });
}

export function PlannerSheet() {
  const { closePlanner } = useUi();
  const { state } = useStore();
  const [mode, setMode] = useState('semana');
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [plan, setPlan] = useState('');
  const [error, setError] = useState(null);

  const generate = async (m) => {
    setStatus('loading');
    setError(null);
    try {
      const text = await requestPlan(m, state);
      setPlan(text);
      setStatus('ready');
    } catch (e) {
      setError(e instanceof AiError ? e.message : 'Algo ha ido mal generando el plan.');
      setStatus('error');
    }
  };

  const switchMode = (m) => { setMode(m); setStatus('idle'); setPlan(''); };

  return (
    <FullSheet>
      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="kicker" style={{ margin: 0 }}><Sparkle size={13} weight="fill" /> Planificador IA</div>
          <button type="button" aria-label="Cerrar" onClick={closePlanner} className="icon-btn" style={{ width: 36, height: 36 }}>
            <X size={18} weight="bold" />
          </button>
        </div>
        <h2 style={{ fontSize: 24, margin: '10px 0 16px' }}>Tu plan</h2>
        <div className="pill-row" style={{ flexWrap: 'nowrap', marginBottom: 18 }}>
          <button type="button" className={`pill-btn${mode === 'semana' ? ' on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => switchMode('semana')}>Semana</button>
          <button type="button" className={`pill-btn${mode === 'mes' ? ' on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => switchMode('mes')}>Mes</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 20px' }}>
        {status === 'idle' && (
          <div className="empty-state" style={{ padding: '30px 4px' }}>
            <div className="empty-icon"><Sparkle size={28} weight="fill" /></div>
            <h3>{mode === 'semana' ? 'Plan de la semana' : 'Plan del mes'}</h3>
            <p>La IA mira tus metas activas (y tu calendario) y propone cómo repartir el {mode === 'semana' ? 'tiempo esta semana' : 'esfuerzo este mes'}.</p>
            <button type="button" className="btn btn-primary" onClick={() => generate(mode)}><Sparkle size={15} weight="fill" /> Generar plan</button>
          </div>
        )}
        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', color: 'var(--color-text-muted)', gap: 10 }}>
            <Sparkle size={28} weight="fill" color="var(--color-accent)" style={{ animation: 'rumbo-pop 1.1s ease infinite' }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Pensando tu plan…</span>
          </div>
        )}
        {status === 'error' && (
          <div className="empty-state" style={{ padding: '20px 4px' }}>
            <p style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{error}</p>
            <button type="button" className="btn btn-secondary" onClick={() => generate(mode)}><ArrowClockwise size={15} weight="bold" /> Reintentar</button>
          </div>
        )}
        {status === 'ready' && (
          <>
            <div className="card">{renderPlan(plan)}</div>
            <button type="button" className="add-row" onClick={() => generate(mode)}>
              <ArrowClockwise size={16} weight="bold" /> Generar otra versión
            </button>
          </>
        )}
      </div>
    </FullSheet>
  );
}
