// v2: bumped from v1's recurrence/data-model rework and the move to a blank
// first-run app — old v1 demo saves should not leak into the fresh start.
const KEY = 'rumbo:v2';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable — the session still works, just won't persist
  }
}
