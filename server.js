// Small proxy: keeps the API key on the server and never in the browser bundle.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const { API_KEY, BASE_URL = 'https://api.groq.com/openai/v1', MODEL = 'llama-3.3-70b-versatile', PORT = 8787 } = process.env;

const SYSTEM = `You turn study notes into a study set. Reply with ONLY a JSON object, no markdown, in this exact shape:
{"title": string,
 "flashcards": [{"front": string, "back": string}],
 "quiz": [{"question": string, "options": [string, string, string, string], "answerIndex": number, "explanation": string}]}
Rules: 6-10 flashcards and 5-8 quiz questions. answerIndex is the 0-based index of the correct option. Use only facts from the notes or well-established knowledge of the topic.`;

const app = express();
app.use(express.json({ limit: '50kb' }));

app.post('/api/generate', async (req, res) => {
  const text = String(req.body?.text ?? '').trim();
  if (text.length < 10 || text.length > 8000) return res.status(400).json({ error: 'Enter between 10 and 8,000 characters.' });
  if (!API_KEY) return res.status(500).json({ error: 'Server has no API_KEY set. See README.' });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const r = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: text }],
      }),
    });
    if (!r.ok) return res.status(502).json({ error: `The model provider returned an error (${r.status}).` });
    const j = await r.json();
    res.json({ content: j.choices?.[0]?.message?.content ?? '' });
  } catch (e) {
    const timeout = e.name === 'AbortError';
    res.status(timeout ? 504 : 502).json({ error: timeout ? 'The model took too long to respond.' : 'Could not reach the model provider.' });
  } finally {
    clearTimeout(timer);
  }
});
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
