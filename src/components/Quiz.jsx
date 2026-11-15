import { useState } from 'react';

export default function Quiz({ questions }) {
  const [round, setRound] = useState(questions);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [wrong, setWrong] = useState([]);
  const [score, setScore] = useState(0);

  if (!questions.length) return <p className="empty">No quiz questions were generated. Try again.</p>;

  const restart = (qs) => { setRound(qs); setIdx(0); setPicked(null); setWrong([]); setScore(0); };

  if (idx >= round.length) {
    return (
      <div className="summary">
        <p className="big">{score} / {round.length} correct</p>
        {wrong.length > 0 && <button onClick={() => restart(wrong)}>Re-test {wrong.length} missed</button>}
        <button className="ghost" onClick={() => restart(questions)}>Start over</button>
      </div>
    );
  }

  const q = round[idx];
  const pick = (n) => {
    if (picked !== null) return;
    setPicked(n);
    if (n === q.answerIndex) setScore((s) => s + 1);
    else setWrong((w) => [...w, q]);
  };

  return (
    <div>
      <p className="meta">Question {idx + 1} of {round.length}</p>
      <h3>{q.question}</h3>
      <ul className="options">
        {q.options.map((o, n) => {
          const cls = picked === null ? '' : n === q.answerIndex ? 'correct' : n === picked ? 'wrong' : '';
          return <li key={n}><button className={cls} disabled={picked !== null} onClick={() => pick(n)}>{o}</button></li>;
        })}
      </ul>
      {picked !== null && (
        <>
          <p className="explain">{picked === q.answerIndex ? 'Correct. ' : 'Not quite. '}{q.explanation}</p>
          <button onClick={() => { setIdx(idx + 1); setPicked(null); }}>{idx + 1 === round.length ? 'See results' : 'Next question'}</button>
        </>
      )}
    </div>
  );
}
