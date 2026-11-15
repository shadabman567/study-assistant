// Never trust model output: strip fences, parse, check shape, drop bad items.
const str = (v) => typeof v === 'string' && v.trim() !== '';
const fail = (msg) => Object.assign(new Error(msg), { retryable: true });

export function parseModelOutput(raw) {
  if (!str(raw)) throw fail('The model returned an empty response.');
  const s = raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a < 0 || b < a) throw fail('The model did not return JSON.');
  let d;
  try { d = JSON.parse(s.slice(a, b + 1)); } catch { throw fail('The model returned malformed JSON.'); }

  const cards = (Array.isArray(d?.flashcards) ? d.flashcards : []).filter((c) => c && str(c.front) && str(c.back));
  const quiz = (Array.isArray(d?.quiz) ? d.quiz : [])
    .filter((q) => q && str(q.question) && Array.isArray(q.options) && q.options.length >= 2 && q.options.every(str)
      && Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < q.options.length)
    .map((q) => ({ ...q, explanation: str(q.explanation) ? q.explanation : '' }));

  if (!cards.length && !quiz.length) throw fail('The model returned data in an unexpected shape.');
  return { title: str(d.title) ? d.title : 'Study set', cards, quiz };
}
