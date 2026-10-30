import { describe, expect, it } from 'vitest';
import { getSystemPrompt, resolveSystemPrompts, systemPromptSeeds } from '../lib/ai/prompts';

describe('seeded system prompts', () => {
  it('provides complete prompt sets in both supported locales', () => {
    const resolved = resolveSystemPrompts();

    expect(resolved.es.guidedReflection).toBe(systemPromptSeeds.es.guidedReflection);
    expect(resolved.es.recordExtraction).toBe(systemPromptSeeds.es.recordExtraction);
    expect(resolved.en.guidedReflection).toBe(systemPromptSeeds.en.guidedReflection);
    expect(resolved.en.recordExtraction).toBe(systemPromptSeeds.en.recordExtraction);
  });

  it('fills missing overrides from seeds and uses a seed for empty overrides', () => {
    const overrides = { es: { guidedReflection: 'Perfilizado' } };
    const resolved = resolveSystemPrompts(overrides);

    expect(resolved.es.guidedReflection).toBe('Perfilizado');
    expect(resolved.es.recordExtraction).toBe(systemPromptSeeds.es.recordExtraction);
    expect(getSystemPrompt({ en: { guidedReflection: '' } }, 'en', 'guidedReflection')).toBe(
      systemPromptSeeds.en.guidedReflection,
    );
  });
});
