import { useRef, useState } from 'react';
import { generate } from './api.js';
import Flashcards from './components/Flashcards.jsx';
import Quiz from './components/Quiz.jsx';

export default function App() {
  const [text, setText] = useState('');
  const [state, setState] = useState({ status: 'idle' });
  const [tab, setTab] = useState('cards');
  const latest = useRef(0); // id of the newest request
  const ctrl = useRef(null);

  async function submit(e) {
    e.preventDefault();
    if (text.trim().length < 10) return setState({ status: 'error', message: 'Add a few sentences of notes or a topic first.' });
    ctrl.current?.abort(); // cancel the older request...
    const c = (ctrl.current = new AbortController());
    const id = ++latest.current; // ...and ignore it if it still resolves
    setState({ status: 'loading' });
    try {
      const data = await generate(text, c.signal);
      if (id !== latest.current) return;
      setState({ status: 'ready', data, id });
      setTab(data.cards.length ? 'cards' : 'quiz');
    } catch (err) {
      if (id !== latest.current || err.name === 'AbortError') return;
      setState({ status: 'error', message: err.message });
    }
  }

  function cancel() {
    latest.current++;
    ctrl.current?.abort();
    setState({ status: 'idle' });
  }

  const { status, data } = state;
  return (
    <main>
      <h1><mark>Study</mark> assistant</h1>
      <form onSubmit={submit}>
        <label htmlFor="notes">Your notes or topic</label>
        <textarea id="notes" rows={7} value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Paste lecture notes, or type a topic like “causes of World War I”." />
        <div className="row">
          <button type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Generating…' : 'Make study set'}</button>
          {status === 'loading' && <button type="button" className="ghost" onClick={cancel}>Cancel</button>}
        </div>
      </form>

      <section aria-live="polite">
        {status === 'idle' && <p className="empty">Paste some notes above to get flashcards and a quiz.</p>}
        {status === 'loading' && <p className="loading"><span className="spinner" />Reading your notes and writing questions…</p>}
        {status === 'error' && (
          <div className="error" role="alert">
            <p>{state.message}</p>
            <button onClick={submit}>Try again</button>
          </div>
        )}
        {status === 'ready' && (
          <>
            <h2>{data.title}</h2>
            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={tab === 'cards'} onClick={() => setTab('cards')}>Flashcards ({data.cards.length})</button>
              <button role="tab" aria-selected={tab === 'quiz'} onClick={() => setTab('quiz')}>Quiz ({data.quiz.length})</button>
            </div>
            {tab === 'cards' ? <Flashcards key={state.id} cards={data.cards} /> : <Quiz key={state.id} questions={data.quiz} />}
          </>
        )}
      </section>
    </main>
  );
}
