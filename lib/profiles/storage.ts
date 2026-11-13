export type Profile = {
  id: string;
  name: string;
  role: string;
  color: string;
  answers: string[];
  sourceProfileId?: string;
  targetDescription?: string;
  cvTemplateId?: string;
  cvPaletteId?: string;
  cvCustomPalette?: { primary: string; secondary: string; text: string; muted: string; paper: string };
  cvShowSectionIcons?: boolean;
  createdAt: string;
  updatedAt: string;
};
export const PROFILES_STORAGE_KEY = 'ia-curriculum:profiles:v1';
/** Load saved profiles from browser storage; a new or unavailable store starts empty. */
export function loadProfiles(): Profile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw === null) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(isProfile);
  } catch {
    return [];
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
    (profile.sourceProfileId === undefined || typeof profile.sourceProfileId === 'string') &&
    (profile.targetDescription === undefined || typeof profile.targetDescription === 'string') &&
    (profile.cvTemplateId === undefined || typeof profile.cvTemplateId === 'string') &&
    (profile.cvPaletteId === undefined || typeof profile.cvPaletteId === 'string') &&
    (profile.cvCustomPalette === undefined || isPalette(profile.cvCustomPalette)) &&
    (profile.cvShowSectionIcons === undefined || typeof profile.cvShowSectionIcons === 'boolean') &&
    typeof profile.createdAt === 'string' &&
    typeof profile.updatedAt === 'string'
  );
}
function isPalette(value: unknown): value is NonNullable<Profile['cvCustomPalette']> {
  if (!value || typeof value !== 'object') return false;
  const palette = value as Record<string, unknown>;
  return ['primary', 'secondary', 'text', 'muted', 'paper'].every(
    (key) => typeof palette[key] === 'string' && /^#[0-9a-f]{6}$/i.test(palette[key] as string),
  );
}
/** Persist profile metadata and reflection answers in browser local storage. */
export function saveProfiles(profiles: Profile[]): void {
  window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
}
/** Create a profile with a trimmed name and empty reflection answers. */
export function createProfile(
  name: string,
  options: { role?: string; sourceProfileId?: string; targetDescription?: string } = {},
): Profile {
  const now = new Date().toISOString();
  return {
    id: `profile-${Date.now()}`,
    name: name.trim() || 'Nuevo perfil',
    role: options.role?.trim() || 'Nuevo recorrido',
    color: '#315efb',
    answers: [],
    sourceProfileId: options.sourceProfileId || undefined,
    targetDescription: options.targetDescription?.trim() || undefined,
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
  // Shared source records are intentionally retained when one resume profile is deleted.
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
