# Study assistant

Paste notes or a topic. An LLM returns structured JSON, and the app renders it as flippable flashcards and a quiz with a "re-test missed questions" round. It is not a chatbot.

Built with React (Vite), a small Express proxy, and the Groq API (OpenAI-compatible).

## Setup

Requires Node 20.6 or newer.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your env file and add your API key (free key from https://console.groq.com):
   ```bash
   cp .env.example .env
   ```
   On Windows Command Prompt use `copy .env.example .env`. Then open `.env` and set `API_KEY`.
3. Start the API and the app together:
   ```bash
   npm start
   ```
4. Open http://localhost:5173

The model name lives in `.env` (`MODEL=openai/gpt-oss-120b`), not in code. Groq retired `llama-3.3-70b-versatile` in August 2026, which caused a 404 for me, so it is easy to swap if a model gets retired. Any OpenAI-compatible provider works by changing `API_KEY`, `BASE_URL` and `MODEL`.

The server reads `.env` only at startup, so restart it after any change. On Windows, if port 8787 is still in use, run `taskkill /F /IM node.exe` and then `npm start`.

## How it works
- `server.js`: tiny Express proxy. Keeps the API key on the server, validates input length, 30s timeout, requests JSON mode.
- `src/validate.js`: strips code fences, parses JSON, checks the shape, drops invalid items, fails only if nothing is usable.
- `src/api.js`: calls the proxy and retries once automatically if the output was unusable.
- `src/App.jsx`: idle, loading, error and ready states. Each request gets an id and an AbortController, so a stale response can never overwrite a newer one. Cancel button included.
- `src/components/`: `Flashcards` (flip, arrow keys) and `Quiz` (score, explanations, re-test missed questions).

## Handling bad AI output
Malformed JSON, fenced JSON, wrong shape, empty reply, out-of-range `answerIndex`, provider errors (like 404 or 401), timeouts, and network failures all show an error message with a Try again button. The app does not crash.

## AI usage note
I used Claude (an AI assistant) to scaffold the project and write the first version of the code. I then ran it, debugged setup problems myself (wrong folder, port already in use, and a retired Groq model causing a 404), read through the files to understand them, and tested the app by hand.

## Known limitations
- No streaming, no saved sessions, no refinement loop.
- The model can produce wrong facts or a wrong `answerIndex`, and the app cannot verify correctness.
- Input is capped at 8,000 characters.
- No rate limiting on the proxy.
- Only lightly tested across browsers and devices.

## Time spent
About X hours.

## What I'd do next
Streaming, saving sessions in localStorage, schema validation with Zod, rate limiting, and deploying with a serverless function.
