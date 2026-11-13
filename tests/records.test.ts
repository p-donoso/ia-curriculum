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

  it('shares source records across CVs and replaces updates without duplication', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
    vi.stubGlobal('window', { localStorage: storage });
    vi.stubGlobal('localStorage', storage);
    const original = createRecord('experience', { Role: 'Analyst' });
    saveRecord('alex', original);
    const sharedRecord = createRecord('experience', { Role: 'Designer' });
    const separateConfig = createRecord('basic', { Name: 'Consultant-specific' });
    saveRecord('career-change', separateConfig);

    const updated = { ...original, values: { Role: 'Lead analyst' }, updatedAt: '2026-10-30T00:00:00.000Z' };
    saveRecord('alex', updated);

    expect(loadRecords('alex', 'experience')).toEqual([updated]);
    expect(loadRecords('career-change', 'experience')).toEqual([updated]);
    expect(loadRecords('career-change', 'basic')).toEqual([separateConfig]);
  });

  it('migrates existing profile records into one shared source without loss', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
    vi.stubGlobal('window', { localStorage: storage });
    vi.stubGlobal('localStorage', storage);
    const first = createRecord('experience', { Cargo: 'CTO' });
    const second = createRecord('experience', { Cargo: 'Consultor' });
    values.set('ia-curriculum:profiles:v1', JSON.stringify([{ id: 'cto' }, { id: 'consultor' }]));
    values.set('ia-curriculum:records:cto:v1', JSON.stringify([first]));
    values.set('ia-curriculum:records:consultor:v1', JSON.stringify([second]));

    expect(loadRecords('cto', 'experience')).toEqual([first, second]);
    expect(loadRecords('consultor', 'experience')).toEqual([first, second]);
  });

  it('discards malformed entries from an otherwise valid records list', () => {
    const good = createRecord('experience', { Role: 'Engineer' });
    const storage = {
      getItem: () => JSON.stringify([good, { id: 'broken', section: 'experience', values: ['invalid'] }]),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('window', { localStorage: storage });
    vi.stubGlobal('localStorage', storage);

    expect(loadRecords('alex', 'experience')).toEqual([good]);
  });
});
