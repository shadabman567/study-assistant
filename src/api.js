import { parseModelOutput } from './validate.js';

async function once(text, signal) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status}).`);
  return parseModelOutput(body.content);
}

// Retry once automatically if the model's output was unusable.
export async function generate(text, signal) {
  try {
    return await once(text, signal);
  } catch (e) {
    if (e.retryable && !signal.aborted) return once(text, signal);
    throw e;
  }
}
