export type ProviderConfig = { provider: string; endpoint: string; model: string; token?: string };
export const defaultAiConfig: ProviderConfig = {
  provider: process.env.NEXT_PUBLIC_AI_PROVIDER ?? 'openai-compatible',
  endpoint: process.env.NEXT_PUBLIC_AI_ENDPOINT ?? '',
  model: process.env.NEXT_PUBLIC_AI_MODEL ?? '',
};
export const AI_CONFIG_STORAGE_KEY = 'ia-curriculum:ai-config:v1';
export const profileAiConfigKey = (profileId: string) => `${AI_CONFIG_STORAGE_KEY}:${profileId}`;
const profileAiTokenKey = (profileId: string) => `ia-curriculum:ai-token:${profileId}:v1`;

export function loadAiConfig(profileId?: string): ProviderConfig {
  if (typeof window === 'undefined') return defaultAiConfig;
  try {
    const key = profileId ? profileAiConfigKey(profileId) : AI_CONFIG_STORAGE_KEY;
    const saved = JSON.parse(window.localStorage.getItem(key) ?? '{}') as Partial<ProviderConfig>;
    const { token: legacyToken, ...safeConfig } = saved;
    let token = '';
    if (profileId) {
      try {
        token = window.sessionStorage.getItem(profileAiTokenKey(profileId)) ?? '';
      } catch {
        token = '';
      }
      if (!token && legacyToken) {
        try {
          window.sessionStorage.setItem(profileAiTokenKey(profileId), legacyToken);
          token = legacyToken;
        } catch {
          // Do not fall back to persistent storage when session storage is unavailable.
        }
        window.localStorage.setItem(key, JSON.stringify(safeConfig));
      }
    }
    return { ...defaultAiConfig, ...safeConfig, token };
  } catch {
    return defaultAiConfig;
  }
}

export function saveAiConfig(profileId: string, config: ProviderConfig): void {
  const { token, ...safeConfig } = config;
  window.localStorage.setItem(profileAiConfigKey(profileId), JSON.stringify(safeConfig));
  if (token) window.sessionStorage.setItem(profileAiTokenKey(profileId), token);
  else window.sessionStorage.removeItem(profileAiTokenKey(profileId));
}
