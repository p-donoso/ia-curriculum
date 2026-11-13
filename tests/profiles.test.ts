import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createProfile,
  deleteProfile,
  deleteProfileData,
  exportProfile,
  loadProfiles,
  starterProfiles,
} from '../lib/profiles/storage';
describe('profile storage model', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('keeps starter profiles isolated', () => {
    expect(starterProfiles).toHaveLength(2);
    expect(starterProfiles[0].answers).not.toBe(starterProfiles[1].answers);
    expect(starterProfiles.map((profile) => profile.name)).toEqual(['CTO', 'Consultor']);
    expect(starterProfiles[1].role).toContain('Una Salud');
  });
  it('creates a usable profile with a stable id', () => {
    const profile = createProfile('  Mi transición  ');
    expect(profile.name).toBe('Mi transición');
    expect(profile.id).toMatch(/^profile-/);
    expect(profile.answers).toEqual([]);
  });

  it('falls back to starter profiles when stored data is malformed', () => {
    const localStorage = { getItem: vi.fn(() => '{invalid'), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('window', { localStorage });
    expect(loadProfiles()).toEqual(starterProfiles);
  });

  it('keeps an intentionally empty profile list empty after deletion', () => {
    const localStorage = { getItem: vi.fn(() => '[]'), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('window', { localStorage });
    expect(loadProfiles()).toEqual([]);
  });

  it('filters malformed profiles while preserving valid entries', () => {
    const localStorage = {
      getItem: vi.fn(() => JSON.stringify([starterProfiles[0], { id: 'broken', name: 42 }])),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('window', { localStorage });

    expect(loadProfiles()).toEqual([starterProfiles[0]]);
  });

  it('falls back to starter profiles when browser storage throws', () => {
    const localStorage = {
      getItem: () => {
        throw new Error('storage blocked');
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('window', { localStorage });

    expect(loadProfiles()).toEqual(starterProfiles);
  });

  it('deletes profiles without mutating the input list', () => {
    const result = deleteProfile(starterProfiles, 'cto');
    expect(result.map((profile) => profile.id)).toEqual(['consultor']);
    expect(starterProfiles).toHaveLength(2);
  });

  it('exports profile data and records as portable JSON', () => {
    const payload = JSON.parse(
      exportProfile(starterProfiles[0], [{ section: 'skills', values: { Skill: 'TypeScript' } }]),
    );
    expect(payload.schemaVersion).toBe(1);
    expect(payload.profile.id).toBe('cto');
    expect(payload.records).toHaveLength(1);
    expect(payload.exportedAt).toBeTruthy();
  });

  it('migrates only the untouched example profiles to CTO and Consultor', async () => {
    const { migrateStarterProfiles } = await import('../lib/profiles/storage');
    expect(
      migrateStarterProfiles([
        { ...starterProfiles[0], id: 'alex', name: 'Alex Morgan', role: 'Perfil de ejemplo' },
        { ...starterProfiles[1], id: 'career-change', name: 'Cambio de carrera', role: 'Borrador' },
      ]).map((profile) => profile.name),
    ).toEqual(['CTO', 'Consultor']);
    const customized = [{ ...starterProfiles[0], id: 'alex', name: 'Mi perfil' }];
    expect(migrateStarterProfiles(customized)).toBe(customized);
  });

  it('removes profile data and settings from browser storage', () => {
    const localStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
    const sessionStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('window', { localStorage, sessionStorage });
    deleteProfileData('alex');
    expect(localStorage.removeItem).toHaveBeenCalledWith('ia-curriculum:records:alex:v1');
    expect(localStorage.removeItem).toHaveBeenCalledWith('ia-curriculum:ai-config:v1:alex');
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('ia-curriculum:ai-token:alex:v1');
  });
});
