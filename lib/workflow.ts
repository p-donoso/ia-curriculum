export const prompts = [
  '¿Qué tipo de trabajo te gustaría conseguir en los próximos meses?',
  '¿Qué problema te gusta resolver y qué personas se benefician de tu trabajo?',
  'Cuéntame un momento en que lograste algo de lo que te sientes orgulloso.',
] as const;
export const maxAnswerLength = 5_000;

/** Return the guided prompt at the current answer count, or null when the flow is complete. */
export function nextPrompt(answerCount: number): string | null {
  const index = Math.max(0, Math.floor(answerCount));
  return prompts[index] ?? null;
}

/** Trim and bound an answer, returning a new list; blank answers leave the list unchanged. */
export function appendAnswer(answers: string[], answer: string): string[] {
  const clean = answer.trim().slice(0, maxAnswerLength);
  return clean ? [...answers, clean] : answers;
}
