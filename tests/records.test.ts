import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRecord, deleteRecord, loadRecords, saveRecord } from '../lib/profiles/records';
describe('records', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('creates records with section and values', () => {
    const record = createRecord('experience', { Cargo: 'Coordinador' });
    expect(record.section).toBe('experience');
    expect(record.values.Cargo).toBe('Coordinador');
    expect(record.id).toMatch(/^record-/);
  });

  it('saves, filters, and deletes records for a profile', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
    vi.stubGlobal('window', { localStorage: storage });
    vi.stubGlobal('localStorage', storage);

    const experience = createRecord('experience', { Cargo: 'Engineer' });
    const education = createRecord('education', { Institution: 'Example University' });
    saveRecord('alex', experience);
    saveRecord('alex', education);
    expect(loadRecords('alex', 'experience')).toEqual([experience]);
    deleteRecord('alex', experience.id);
    expect(loadRecords('alex', 'experience')).toEqual([]);
    expect(loadRecords('alex', 'education')).toEqual([education]);
  });

  it('returns an empty list for malformed storage data', () => {
    const storage = { getItem: () => '{invalid', setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('window', { localStorage: storage });
    vi.stubGlobal('localStorage', storage);
    expect(loadRecords('alex', 'experience')).toEqual([]);
  });
});
