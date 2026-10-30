import { beforeEach, describe, expect, it, vi } from 'vitest';

const { chatMock } = vi.hoisted(() => ({ chatMock: vi.fn() }));
vi.mock('../lib/ai/client', () => ({ chat: chatMock }));

import { extractRecord, parseProposal } from '../lib/ai/extraction';
import { systemPromptSeeds } from '../lib/ai/prompts';

describe('structured extraction', () => {
  beforeEach(() => chatMock.mockReset());

  it('normalizes valid JSON to known fields', () => {
    const result = parseProposal('{"values":{"Cargo":"Líder"},"confidence":"high"}', ['Cargo', 'Organización']);
    expect(result.values.Cargo).toBe('Líder');
    expect(result.values.Organización).toBe('');
    expect(result.missing).toEqual(['Organización']);
    expect(result.confidence).toBe('high');
  });

  it('preserves valid confidence and parses fenced JSON', () => {
    const result = parseProposal('```json\n{"values":{"Cargo":"Lead"},"confidence":"high"}\n```', ['Cargo']);
    expect(result.values).toEqual({ Cargo: 'Lead' });
    expect(result.missing).toEqual([]);
    expect(result.confidence).toBe('high');
  });
  it('rejects malformed model output without inventing values', () => {
    const result = parseProposal('not json', ['Cargo']);
    expect(result.values.Cargo).toBe('');
    expect(result.missing).toEqual(['Cargo']);
  });

  it('ignores fields outside the requested schema and rejects non-string values', () => {
    const result = parseProposal('{"values":{"Cargo":42,"Unknown":"discard"},"confidence":"certain"}', ['Cargo']);
    expect(result.values).toEqual({ Cargo: '' });
    expect(result.missing).toEqual(['Cargo']);
    expect(result.confidence).toBe('low');
  });

  it('uses the selected locale seed and keeps extraction context in the user message', async () => {
    chatMock.mockResolvedValue({ content: '{"values":{"Role":"Designer"},"confidence":"medium"}' });

    const result = await extractRecord(
      { provider: 'compatible', endpoint: 'https://api.example/v1', model: 'model', token: 'test' },
      'Experience',
      ['Role'],
      'Led a design team.',
      'en',
    );

    expect(chatMock).toHaveBeenCalledWith(expect.objectContaining({ token: 'test' }), [
      { role: 'system', content: systemPromptSeeds.en.recordExtraction },
      { role: 'user', content: 'Section: Experience\nFields: Role\nText: Led a design team.' },
    ]);
    expect(result.values).toEqual({ Role: 'Designer' });
    expect(result.confidence).toBe('medium');
  });

  it('uses a profile override for the selected locale', async () => {
    chatMock.mockResolvedValue({ content: '{"values":{"Cargo":"Líder"}}' });
    const config = {
      provider: 'compatible',
      endpoint: 'https://api.example/v1',
      model: 'model',
      systemPrompts: { es: { recordExtraction: 'Prompt personalizado' } },
    };

    await extractRecord(config, 'Experiencia', ['Cargo'], 'Lideré un equipo.');

    expect(chatMock.mock.calls[0][1][0]).toEqual({ role: 'system', content: 'Prompt personalizado' });
  });
});
