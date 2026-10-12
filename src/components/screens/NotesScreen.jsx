import React, { useEffect, useRef, useState } from 'react';
import { Notebook, CalendarBlank, Basket, Plus, PencilSimple, Trash, Check } from '@phosphor-icons/react';
import { useStore, topFrequentShoppingItems } from '../../state/store';
import { useUi } from '../../state/ui';
import { useFx } from '../ui/Fx';
import { CheckBox } from '../ui/CheckBox';

const MODES = [
  { key: 'permanent', label: 'Notas' },
  { key: 'temporal', label: 'Temporales' },
  { key: 'shopping', label: 'Compra' },
];

export function NotesScreen() {
  const ui = useUi();
  const mode = ui.notesMode;

  return (
    <div className="screen">
      <div className="page-head">
        <div>
          <div className="kicker">Tu espacio</div>
          <h1>Notas</h1>
        </div>
      </div>

      <div className="pill-row" style={{ flexWrap: 'nowrap', marginBottom: 20 }}>
        {MODES.map((m) => (
          <button key={m.key} type="button" className={`pill-btn${mode === m.key ? ' on' : ''}`}
            onClick={() => ui.setNotesMode(m.key)} style={{ flex: 1, justifyContent: 'center' }}>
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'permanent' && <PermanentNotes />}
      {mode === 'temporal' && <TemporalNotes />}
      {mode === 'shopping' && <ShoppingList />}
    </div>
  );
}

function NoteCard({ note, badge, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);

  const save = () => {
    const text = draft.trim();
    if (text) onSave(text);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="card">
        <textarea className="input" value={draft} onChange={(e) => setDraft(e.target.value)}
          style={{ minHeight: 70, fontSize: 15, marginBottom: 10 }} autoFocus />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => { setDraft(note.text); setEditing(false); }} className="btn btn-secondary btn-sm">Cancelar</button>
          <button type="button" onClick={save} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Guardar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <p style={{ fontSize: 15, lineHeight: 1.45, margin: 0, whiteSpace: 'pre-wrap' }}>{note.text}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
        {badge}
        <span style={{ flex: 1 }} />
        <button type="button" aria-label="Editar" onClick={() => setEditing(true)} className="icon-btn" style={{ width: 32, height: 32 }}>
          <PencilSimple size={14} weight="bold" />
        </button>
        <button type="button" aria-label="Eliminar" onClick={onDelete} className="icon-btn" style={{ width: 32, height: 32 }}>
          <Trash size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
}

function PermanentNotes() {
  const { state, dispatch } = useStore();
  const [draft, setDraft] = useState('');
  const notes = state.notes.permanent;

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    dispatch({ type: 'ADD_NOTE_PERMANENT', text });
    setDraft('');
  };

  return (
    <>
      <div className="field" style={{ marginBottom: 10 }}>
        <textarea className="input" placeholder="Escribe una nota…" value={draft}
          onChange={(e) => setDraft(e.target.value)} style={{ minHeight: 70, fontSize: 15 }} />
      </div>
      <button type="button" onClick={add} className="add-row" style={{ marginBottom: 22 }}>
        <Plus size={17} weight="bold" /> Añadir nota
      </button>

      {!notes.length ? (
        <div className="empty-state">
          <div className="empty-icon"><Notebook size={32} weight="fill" /></div>
          <h3>Sin notas todavía</h3>
          <p>Este bloc es permanente: apunta lo que quieras y se queda aquí hasta que lo borres.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.map((n) => (
            <NoteCard key={n.id} note={n}
              onSave={(text) => dispatch({ type: 'EDIT_NOTE_PERMANENT', id: n.id, text })}
              onDelete={() => dispatch({ type: 'DELETE_NOTE_PERMANENT', id: n.id })} />
          ))}
        </div>
      )}
    </>
  );
}

function TemporalNotes() {
  const { state, dispatch } = useStore();
  const [draft, setDraft] = useState('');
  const [scope, setScope] = useState('day');
  const notes = state.notes.temporal;

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    dispatch({ type: 'ADD_NOTE_TEMPORAL', text, scope });
    setDraft('');
  };

  return (
    <>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 14px' }}>
        Notas de usar y tirar — elige si son de hoy o de esta semana, y desaparecen solas cuando el plazo termina.
      </p>
      <div className="field" style={{ marginBottom: 10 }}>
        <textarea className="input" placeholder="Escribe una nota rápida…" value={draft}
          onChange={(e) => setDraft(e.target.value)} style={{ minHeight: 60, fontSize: 15 }} />
      </div>
      <div className="pill-row" style={{ flexWrap: 'nowrap', marginBottom: 10 }}>
        <button type="button" className={`pill-btn${scope === 'day' ? ' on' : ''}`} onClick={() => setScope('day')} style={{ flex: 1, justifyContent: 'center' }}>Para hoy</button>
        <button type="button" className={`pill-btn${scope === 'week' ? ' on' : ''}`} onClick={() => setScope('week')} style={{ flex: 1, justifyContent: 'center' }}>Para esta semana</button>
      </div>
      <button type="button" onClick={add} className="add-row" style={{ marginBottom: 22 }}>
        <Plus size={17} weight="bold" /> Añadir nota temporal
      </button>

      {!notes.length ? (
        <div className="empty-state">
          <div className="empty-icon"><CalendarBlank size={32} weight="fill" /></div>
          <h3>Nada temporal ahora mismo</h3>
          <p>Apunta algo para hoy o para esta semana — se borra sola cuando el plazo termina.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.map((n) => (
            <NoteCard key={n.id} note={n}
              badge={<span className="chip" style={{ background: 'var(--color-accent-tint)', color: 'var(--color-accent-700)' }}>{n.scope === 'week' ? 'Esta semana' : 'Hoy'}</span>}
              onSave={(text) => dispatch({ type: 'EDIT_NOTE_TEMPORAL', id: n.id, text })}
              onDelete={() => dispatch({ type: 'DELETE_NOTE_TEMPORAL', id: n.id })} />
          ))}
        </div>
      )}
    </>
  );
}

function ShoppingRow({ item, dispatch }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(item.qty);

  const save = () => {
    const nm = name.trim();
    if (nm) dispatch({ type: 'EDIT_SHOPPING_ITEM', id: item.id, name: nm, qty: qty.trim() });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="list-row" style={{ padding: '10px 2px', gap: 8 }}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 2, minWidth: 0, fontSize: 14, minHeight: 38 }} autoFocus />
        <input className="input" value={qty} onChange={(e) => setQty(e.target.value)} style={{ flex: 1, minWidth: 0, fontSize: 14, minHeight: 38 }} />
        <button type="button" aria-label="Guardar" onClick={save} className="icon-btn" style={{ width: 34, height: 34, flex: 'none' }}>
          <Check size={15} weight="bold" />
        </button>
      </div>
    );
  }

  return (
    <div className="list-row">
      <CheckBox done={item.done} fill="var(--color-accent)" onToggle={() => dispatch({ type: 'TOGGLE_SHOPPING_ITEM', id: item.id })} size={24} hitSize={40} />
      <button type="button" onClick={() => setEditing(true)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', minWidth: 0 }}>
        <div className={`task-title${item.done ? ' done' : ''}`}>{item.name}</div>
        {item.qty && <div className="task-meta">{item.qty}</div>}
      </button>
      <button type="button" aria-label="Eliminar" onClick={() => dispatch({ type: 'DELETE_SHOPPING_ITEM', id: item.id })} className="icon-btn" style={{ width: 32, height: 32, flex: 'none' }}>
        <Trash size={14} weight="bold" />
      </button>
    </div>
  );
}

function ShoppingList() {
  const { state, dispatch } = useStore();
  const fx = useFx();
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const items = state.shopping.items;
  const pending = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);
  const frequent = topFrequentShoppingItems(state, 6);

  const allBought = items.length > 0 && pending.length === 0;
  const prevAllBought = useRef(allBought);
  useEffect(() => {
    if (allBought && !prevAllBought.current) {
      const t = setTimeout(() => fx.burst(null, true), 200);
      return () => clearTimeout(t);
    }
    prevAllBought.current = allBought;
    return undefined;
  }, [allBought, fx]);

  const add = (n, q) => {
    const nm = (n ?? name).trim();
    if (!nm) return;
    dispatch({ type: 'ADD_SHOPPING_ITEM', name: nm, qty: (q ?? qty).trim() });
    setName('');
    setQty('');
  };

  const onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } };

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input className="input" placeholder="Alimento" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={onKey}
          style={{ flex: 2, minWidth: 0, fontSize: 15, minHeight: 44 }} />
        <input className="input" placeholder="Cantidad" value={qty} onChange={(e) => setQty(e.target.value)} onKeyDown={onKey}
          style={{ flex: 1, minWidth: 0, fontSize: 15, minHeight: 44 }} />
      </div>
      <button type="button" onClick={() => add()} className="add-row" style={{ marginBottom: frequent.length ? 16 : 22 }}>
        <Plus size={17} weight="bold" /> Añadir a la compra
      </button>

      {frequent.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div className="kicker">Habituales — un toque para añadir</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {frequent.map((f) => (
              <button key={f.key} type="button" onClick={() => add(f.label, '')} className="pill-btn">
                <Plus size={12} weight="bold" /> {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!items.length ? (
        <div className="empty-state">
          <div className="empty-icon"><Basket size={32} weight="fill" /></div>
          <h3>La lista está vacía</h3>
          <p>Añade alimentos con su cantidad. Rumbo recuerda lo que compras más a menudo y te lo sugiere aquí arriba.</p>
        </div>
      ) : (
        <>
          <div className="section-head">
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)' }}>Por comprar</span>
            <span className="count">{pending.length}</span>
          </div>
          {pending.length === 0 ? (
            <div className="card" style={{ marginBottom: 20, textAlign: 'center', background: 'var(--color-accent-tint)', border: 'none' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--color-accent-700)' }}>Compra completa 🛒</div>
            </div>
          ) : (
            <div className="card list-card" style={{ marginBottom: 20 }}>
              {pending.map((it) => <ShoppingRow key={it.id} item={it} dispatch={dispatch} />)}
            </div>
          )}

          {done.length > 0 && (
            <>
              <div className="section-head">
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)' }}>Comprado</span>
                <button type="button" onClick={() => dispatch({ type: 'CLEAR_SHOPPING_DONE' })} className="link-btn">Vaciar</button>
              </div>
              <div className="card list-card">
                {done.map((it) => <ShoppingRow key={it.id} item={it} dispatch={dispatch} />)}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
