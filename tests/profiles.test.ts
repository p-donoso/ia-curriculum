import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Profile } from '../lib/profiles/storage';
import { createProfile, deleteProfile, deleteProfileData, exportProfile, loadProfiles } from '../lib/profiles/storage';

const profileA: Profile = {
  id: 'profile-a',
  name: 'Profile A',
  role: 'Test role A',
  color: '#315efb',
  answers: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
const profileB: Profile = { ...profileA, id: 'profile-b', name: 'Profile B', role: 'Test role B' };

describe('profile storage model', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('starts with no profiles when browser storage is empty', () => {
    const localStorage = { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('window', { localStorage });
    expect(loadProfiles()).toEqual([]);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('creates a usable profile with a stable id', () => {
    const profile = createProfile('  Mi perfil  ');
    expect(profile.name).toBe('Mi perfil');
    expect(profile.id).toMatch(/^profile-/);
    expect(profile.answers).toEqual([]);
  });

  it('returns an empty list when stored data is malformed', () => {
    const localStorage = { getItem: vi.fn(() => '{invalid'), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('window', { localStorage });
    expect(loadProfiles()).toEqual([]);
  });

  it('keeps an intentionally empty profile list empty after deletion', () => {
    const localStorage = { getItem: vi.fn(() => '[]'), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('window', { localStorage });
    expect(loadProfiles()).toEqual([]);
  });

  it('filters malformed profiles while preserving valid saved profiles', () => {
    const localStorage = {
      getItem: vi.fn(() => JSON.stringify([profileA, { id: 'broken', name: 42 }])),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('window', { localStorage });
    expect(loadProfiles()).toEqual([profileA]);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('returns an empty list when browser storage is unavailable', () => {
    const localStorage = {
      getItem: () => {
        throw new Error('storage blocked');
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('window', { localStorage });
    expect(loadProfiles()).toEqual([]);
  });

  it('deletes profiles without mutating the input list', () => {
    const profiles = [profileA, profileB];
    expect(deleteProfile(profiles, profileA.id)).toEqual([profileB]);
    expect(profiles).toHaveLength(2);
  });

  it('exports profile data and records as portable JSON', () => {
    const payload = JSON.parse(exportProfile(profileA, [{ section: 'skills', values: { Skill: 'TypeScript' } }]));
    expect(payload.schemaVersion).toBe(1);
    expect(payload.profile.id).toBe(profileA.id);
    expect(payload.records).toHaveLength(1);
    expect(payload.exportedAt).toBeTruthy();
  });

  it('preserves existing profile identities and data without migration', () => {
    const profiles = [profileA, profileB];
    const localStorage = { getItem: vi.fn(() => JSON.stringify(profiles)), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('window', { localStorage });
    expect(loadProfiles()).toEqual(profiles);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('removes profile data and settings from browser storage', () => {
    const localStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
    const sessionStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal('window', { localStorage, sessionStorage });
    deleteProfileData('profile-a');
    expect(localStorage.removeItem).toHaveBeenCalledWith('ia-curriculum:records:profile-a:v1');
    expect(localStorage.removeItem).toHaveBeenCalledWith('ia-curriculum:ai-config:v1:profile-a');
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('ia-curriculum:ai-token:profile-a:v1');
  });
});
