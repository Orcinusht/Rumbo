import { getApiKey } from './aiKey';

// Calls the Anthropic Messages API directly from the browser — there is no
// backend here (Rumbo is a static GitHub Pages site), so this relies on
// Anthropic's opt-in direct-browser-access header. The key never goes
// anywhere except straight to api.anthropic.com from the user's own device.
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

export class AiError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind; // 'no-key' | 'network' | 'auth' | 'rate-limit' | 'api' | 'parse'
  }
}

export function hasApiKey() {
  return !!getApiKey();
}

async function callClaude({ system, prompt, maxTokens = 1024, temperature = 0.8 }) {
  const key = getApiKey();
  if (!key) throw new AiError('no-key', 'Añade tu clave de API de Anthropic en Progreso → Ajustes de IA.');

  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch {
    throw new AiError('network', 'No se pudo conectar con la API de Anthropic. Revisa tu conexión.');
  }

  if (!res.ok) {
    if (res.status === 401) throw new AiError('auth', 'Clave de API inválida o revocada.');
    if (res.status === 429) throw new AiError('rate-limit', 'Límite de peticiones alcanzado. Prueba de nuevo en un momento.');
    let detail = '';
    try { detail = (await res.json())?.error?.message || ''; } catch { /* ignore */ }
    throw new AiError('api', detail || `La API respondió con un error (${res.status}).`);
  }

  const data = await res.json();
  const text = (data.content || []).map((b) => b.text || '').join('').trim();
  if (!text) throw new AiError('parse', 'La IA no devolvió ningún texto.');
  return text;
}

// Asks for a short JSON array of strings (used for objective suggestions).
// Tolerant of a model that wraps the array in stray prose or a code fence.
export async function suggestList({ system, prompt, count = 5 }) {
  const text = await callClaude({
    system: `${system}\n\nResponde ÚNICAMENTE con un array JSON de ${count} strings cortos, en español, sin numeración, sin markdown, sin texto antes o después. Ejemplo de formato exacto: ["Primera idea","Segunda idea"]`,
    prompt,
    maxTokens: 600,
  });
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new AiError('parse', 'No se pudo interpretar la respuesta de la IA.');
  try {
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) throw new Error('not an array');
    return arr.map((s) => String(s).trim()).filter(Boolean);
  } catch {
    throw new AiError('parse', 'No se pudo interpretar la respuesta de la IA.');
  }
}

// Asks for a free-form plan (markdown-ish: "## " headers, "- " bullets).
export async function generatePlan({ system, prompt }) {
  return callClaude({ system, prompt, maxTokens: 1400, temperature: 0.7 });
}
