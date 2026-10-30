import { describe, expect, it } from 'vitest';
import { appendAnswer, maxAnswerLength, nextPrompt, prompts } from '../lib/workflow';

describe('workflow', () => {
  it('rotates through the guided questions', () => {
    expect(nextPrompt(0)).toBe(prompts[0]);
    expect(nextPrompt(2)).toBe(prompts[2]);
    expect(nextPrompt(-1)).toBe(prompts[0]);
    expect(nextPrompt(prompts.length)).toBeNull();
    expect(nextPrompt(1.8)).toBe(prompts[1]);
  });
  it('stores only non-empty answers, preserving the original list', () => {
    const answers = ['Una respuesta'];
    expect(appendAnswer(answers, '  ')).toEqual(answers);
    expect(appendAnswer(answers, '  Un logro concreto  ')).toEqual(['Una respuesta', 'Un logro concreto']);
    expect(appendAnswer(answers, 'x'.repeat(maxAnswerLength + 1))[1]).toHaveLength(maxAnswerLength);
    expect(answers).toEqual(['Una respuesta']);
  });
});
