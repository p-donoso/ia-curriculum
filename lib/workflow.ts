export const prompts = [
  '¿Qué tipo de trabajo te gustaría conseguir en los próximos meses?',
  '¿Qué problema te gusta resolver y qué personas se benefician de tu trabajo?',
  'Cuéntame un momento en que lograste algo de lo que te sientes orgulloso.',
] as const;
export const maxAnswerLength = 5_000;

export function nextPrompt(answerCount: number): string | null {
  const index = Math.max(0, Math.floor(answerCount));
  return prompts[index] ?? null;
}

export function appendAnswer(answers: string[], answer: string): string[] {
  const clean = answer.trim().slice(0, maxAnswerLength);
  return clean ? [...answers, clean] : answers;
}
