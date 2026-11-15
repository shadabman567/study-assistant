# Study assistant

Paste notes or a topic. An LLM returns structured JSON, and the app renders it as flippable flashcards and a quiz with a "re-test missed questions" round. It is not a chatbot.

## Setup
Requires Node 20.6+.
```bash
cp .env.example .env     # then put your API key in .env
npm install && npm start # API on :8787, app on http://localhost:5173
```
Any OpenAI-compatible provider works (Groq, Gemini, OpenRouter, OpenAI, Ollama). Set `API_KEY`, `BASE_URL`, `MODEL` in `.env`.

## How it works
- `server.js`: tiny Express proxy. Holds the API key, validates input length, 30s timeout, requests JSON mode.
- `src/validate.js`: strips code fences, parses JSON, checks shape, drops invalid items, fails only if nothing is usable.
- `src/api.js`: calls the proxy, auto-retries once if output was unusable.
- `src/App.jsx`: idle/loading/error/ready states. Each request gets an id and an AbortController, so a stale response can never overwrite a newer one. Cancel button included.
- `src/components/`: `Flashcards` (flip, arrow keys) and `Quiz` (score, explanations, re-test wrong answers).

## Handling bad AI output
Malformed JSON, fenced JSON, wrong shape, empty reply, out-of-range `answerIndex`, provider errors, timeouts, and network failures are all handled with a message and a Try again button. No crashes.

## AI usage note
<!-- Be honest here. Example: -->
I used Claude to scaffold the project and draft the code. I read, tested, and can explain every file, and I tested failure cases by hand (broken JSON, wrong key, timeouts).

## Known limitations
- No streaming, no saved sessions, no refinement loop.
- The model can produce wrong facts or a wrong `answerIndex`; the app can't verify correctness.
- Input is capped at 8,000 characters. No rate limiting on the proxy.

## Time spent
<!-- Fill in your actual hours (max 8). -->

## What I'd do next
Streaming, localStorage sessions, schema validation with Zod, rate limiting, deploy (Vercel serverless function).
