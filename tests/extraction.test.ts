import { describe, expect, it } from 'vitest';
import { parseProposal } from '../lib/ai/extraction';
describe('structured extraction', () => {
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
});
