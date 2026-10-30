export type Profile = {
  id: string;
  name: string;
  role: string;
  color: string;
  answers: string[];
  createdAt: string;
  updatedAt: string;
};
export const PROFILES_STORAGE_KEY = 'ia-curriculum:profiles:v1';
export const starterProfiles: Profile[] = [
  {
    id: 'alex',
    name: 'Alex Morgan',
    role: 'Perfil de ejemplo',
    color: '#315efb',
    answers: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'career-change',
    name: 'Cambio de carrera',
    role: 'Borrador',
    color: '#7c5cff',
    answers: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];
/** Load valid profiles from browser storage, falling back to examples on first use or storage errors. */
export function loadProfiles(): Profile[] {
  if (typeof window === 'undefined') return starterProfiles;
  try {
    const raw = window.localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw === null) return starterProfiles;
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return starterProfiles;
    return value.filter(isProfile);
  } catch {
    return starterProfiles;
  }
}
function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<Profile>;
  return (
    typeof profile.id === 'string' &&
    typeof profile.name === 'string' &&
    typeof profile.role === 'string' &&
    typeof profile.color === 'string' &&
    Array.isArray(profile.answers) &&
    profile.answers.every((answer) => typeof answer === 'string') &&
    typeof profile.createdAt === 'string' &&
    typeof profile.updatedAt === 'string'
  );
}
/** Persist profile metadata and reflection answers in browser local storage. */
export function saveProfiles(profiles: Profile[]): void {
  window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
}
/** Create a profile with a trimmed name and empty reflection answers. */
export function createProfile(name: string): Profile {
  const now = new Date().toISOString();
  return {
    id: `profile-${Date.now()}`,
    name: name.trim() || 'Nuevo perfil',
    role: 'Nuevo recorrido',
    color: '#315efb',
    answers: [],
    createdAt: now,
    updatedAt: now,
  };
}
/** Return a new profile list without the selected profile. */
export function deleteProfile(profiles: Profile[], id: string): Profile[] {
  return profiles.filter((profile) => profile.id !== id);
}
/** Remove local records, AI preferences, and the current-session token for one profile. */
export function deleteProfileData(profileId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(`ia-curriculum:records:${profileId}:v1`);
  window.localStorage.removeItem(`ia-curriculum:ai-config:v1:${profileId}`);
  try {
    window.sessionStorage.removeItem(`ia-curriculum:ai-token:${profileId}:v1`);
  } catch {
    // Session storage can be unavailable even when local storage is enabled.
  }
}
/** Serialize profile data in the versioned JSON export format. */
export function exportProfile(profile: Profile, records: unknown[] = []): string {
  return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), profile, records }, null, 2);
}
