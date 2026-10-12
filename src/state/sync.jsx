import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Warning } from '@phosphor-icons/react';
import { useAuth } from './auth';
import { useStore } from './store';
import { supabase } from '../lib/supabaseClient';
import { Sheet } from '../components/ui/Sheet';

const SyncContext = createContext(null);
const PUSH_DEBOUNCE_MS = 1500;

function isEmptyState(s) {
  return (
    s.goals.length === 0 && s.events.length === 0 && s.looseTasks.length === 0
    && s.notes.permanent.length === 0 && s.notes.temporal.length === 0 && s.shopping.items.length === 0
  );
}

function statesEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function pushState(userId, state) {
  return supabase.from('rumbo_state').upsert({ user_id: userId, data: state, updated_at: new Date().toISOString() });
}

export function SyncProvider({ children }) {
  const { user, configured } = useAuth();
  const { state, dispatch } = useStore();
  const [status, setStatus] = useState('idle'); // idle | syncing | synced | error
  const [conflict, setConflict] = useState(null); // { local, cloud } | null
  const resolvedForUser = useRef(null);
  const skipNextPush = useRef(false);
  const debounceRef = useRef(null);

  // Reset tracking on sign-out so a later sign-in (same or different
  // account) re-runs the reconcile step instead of trusting stale state.
  useEffect(() => {
    if (!user) resolvedForUser.current = null;
  }, [user]);

  // Reconcile local vs. cloud once, right after sign-in.
  useEffect(() => {
    if (!configured || !user || resolvedForUser.current === user.id) return;
    let cancelled = false;
    setStatus('syncing');
    supabase.from('rumbo_state').select('data').eq('user_id', user.id).maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) { setStatus('error'); return; }
        if (!data) {
          resolvedForUser.current = user.id;
          pushState(user.id, state).then(() => setStatus('synced'), () => setStatus('error'));
          return;
        }
        const cloud = data.data;
        if (isEmptyState(state) || statesEqual(state, cloud)) {
          resolvedForUser.current = user.id;
          skipNextPush.current = true;
          dispatch({ type: 'IMPORT_STATE', state: cloud });
          setStatus('synced');
        } else {
          // Both sides have real, different data — never pick for the
          // user silently (that's exactly how data gets lost).
          setConflict({ local: state, cloud });
          setStatus('idle');
        }
      });
    return () => { cancelled = true; };
    // Deliberately only re-runs on sign-in/out, not on every local change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, configured]);

  // Debounced push to the cloud on every local change, once reconciled.
  useEffect(() => {
    if (!configured || !user || resolvedForUser.current !== user.id || conflict) return;
    if (skipNextPush.current) { skipNextPush.current = false; return; }
    clearTimeout(debounceRef.current);
    setStatus('syncing');
    debounceRef.current = setTimeout(() => {
      pushState(user.id, state).then(() => setStatus('synced'), () => setStatus('error'));
    }, PUSH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, user, configured, conflict]);

  const resolveConflict = (choice) => {
    if (!conflict || !user) return;
    resolvedForUser.current = user.id;
    if (choice === 'local') {
      pushState(user.id, conflict.local).then(() => setStatus('synced'), () => setStatus('error'));
    } else {
      skipNextPush.current = true;
      dispatch({ type: 'IMPORT_STATE', state: conflict.cloud });
      setStatus('synced');
    }
    setConflict(null);
  };

  const dismissConflict = () => {
    if (!user) return;
    resolvedForUser.current = user.id; // defers to the next debounced push (keeps local)
    setConflict(null);
  };

  return (
    <SyncContext.Provider value={{ status, conflict }}>
      {children}
      {conflict && (
        <Sheet onClose={dismissConflict}>
          <h3 className="sheet-title">Datos distintos en la nube</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <Warning size={20} weight="fill" color="var(--color-danger)" style={{ flex: 'none', marginTop: 1 }} />
            <p style={{ fontSize: 14, margin: 0, lineHeight: 1.5 }}>
              Este dispositivo tiene datos distintos a los que ya hay guardados en tu cuenta. Elige cuáles conservar — los otros se sobrescribirán.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="button" className="btn btn-primary" onClick={() => resolveConflict('local')}>Usar los de este dispositivo</button>
            <button type="button" className="btn btn-secondary" onClick={() => resolveConflict('cloud')}>Usar los de la nube</button>
          </div>
        </Sheet>
      )}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
}
