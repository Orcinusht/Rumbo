// The Anthropic API key lives in its own localStorage slot, deliberately
// separate from the main app state blob (lib/storage.js) — it's a secret,
// not app data, and should never ride along if state is ever exported or
// synced elsewhere. It never leaves this browser except in requests made
// directly to api.anthropic.com (see lib/ai.js).
const KEY = 'rumbo:anthropic-key';

export function getApiKey() {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}

export function setApiKey(key) {
  try {
    if (key) localStorage.setItem(KEY, key);
    else localStorage.removeItem(KEY);
  } catch {
    // storage unavailable — key just won't persist this session
  }
}
