import { useEffect, useState } from 'react';

export default function Flashcards({ cards }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const n = cards.length;
  const go = (d) => { setI((v) => (v + d + n) % n); setFlipped(false); };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [n]);

  if (!n) return <p className="empty">No flashcards were generated. Try again.</p>;
    const c = cards[i];
  return (
    <div>
      <button className={`card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((f) => !f)} aria-label="Flip card">
        <span className="face front"><small>Question</small>{c.front}</span>
        <span className="face back"><small>Answer</small>{c.back}</span>
      </button>
      <div className="row between">
        <button className="ghost" onClick={() => go(-1)}>Previous</button>
        <span>{i + 1} / {n}</span>
        <button className="ghost" onClick={() => go(1)}>Next</button>
      </div>
    </div>
  );
}
