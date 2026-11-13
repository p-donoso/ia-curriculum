import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultAiConfig, loadAiConfig, profileAiConfigKey, saveAiConfig } from '../lib/ai/config';
import { resolveSystemPrompts, systemPromptSeeds } from '../lib/ai/prompts';

function createStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('AI provider configuration', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses a provider-neutral default without a token or endpoint', () => {
    expect(defaultAiConfig.provider).toBe('openai-compatible');
    expect(defaultAiConfig.endpoint).toBe('');
    expect(defaultAiConfig.token).toBeUndefined();
  });

  it('stores the token in session storage and non-secret settings in local storage', () => {
    const localStorage = createStorage();
    const sessionStorage = createStorage();
    vi.stubGlobal('window', { localStorage, sessionStorage });
    const config = { provider: 'custom', endpoint: 'https://api.example/v1', model: 'model', token: 'secret-token' };

    saveAiConfig('profile-a', config);

    expect(JSON.parse(localStorage.getItem(profileAiConfigKey('profile-a'))!)).toEqual({
      provider: 'custom',
      endpoint: 'https://api.example/v1',
      model: 'model',
    });
    expect(sessionStorage.getItem('ia-curriculum:ai-token:profile-a:v1')).toBe('secret-token');
    expect(loadAiConfig('profile-a')).toEqual({ ...config, systemPrompts: resolveSystemPrompts() });
  });

  it('moves legacy local-storage tokens into the current browser session', () => {
    const localStorage = createStorage();
    const sessionStorage = createStorage();
    localStorage.setItem(
      profileAiConfigKey('profile-a'),
      JSON.stringify({ endpoint: 'https://api.example/v1', token: 'legacy' }),
    );
    vi.stubGlobal('window', { localStorage, sessionStorage });

    expect(loadAiConfig('profile-a').token).toBe('legacy');
    expect(sessionStorage.getItem('ia-curriculum:ai-token:profile-a:v1')).toBe('legacy');
    expect(localStorage.getItem(profileAiConfigKey('profile-a'))).not.toContain('legacy');
  });

  it('does not keep a legacy token when session storage is unavailable', () => {
    const localStorage = createStorage();
    localStorage.setItem(profileAiConfigKey('profile-a'), JSON.stringify({ token: 'legacy' }));
    vi.stubGlobal('window', {
      localStorage,
      sessionStorage: {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: () => {
          throw new Error('blocked');
        },
      },
    });

    expect(loadAiConfig('profile-a').token).toBe('');
    expect(localStorage.getItem(profileAiConfigKey('profile-a'))).not.toContain('legacy');
  });

  it('loads seeded prompts and persists profile-specific prompt edits', () => {
    const localStorage = createStorage();
    const sessionStorage = createStorage();
    vi.stubGlobal('window', { localStorage, sessionStorage });
    const config = {
      ...defaultAiConfig,
      systemPrompts: {
        ...resolveSystemPrompts(),
        es: { ...systemPromptSeeds.es, guidedReflection: 'Custom reflection prompt' },
      },
    };

    saveAiConfig('profile-a', config);

    const loaded = loadAiConfig('profile-a');
    expect(loaded.systemPrompts?.es?.guidedReflection).toBe('Custom reflection prompt');
    expect(loaded.systemPrompts?.en?.recordExtraction).toBe(systemPromptSeeds.en.recordExtraction);
  });

  it('merges partial prompt overrides with seeds and keeps profiles isolated', () => {
    const localStorage = createStorage();
    const sessionStorage = createStorage();
    localStorage.setItem(
      profileAiConfigKey('profile-a'),
      JSON.stringify({ systemPrompts: { en: { guidedReflection: 'Profile A prompt' } } }),
    );
    vi.stubGlobal('window', { localStorage, sessionStorage });

    const profileA = loadAiConfig('profile-a');
    const other = loadAiConfig('profile-b');
    expect(profileA.systemPrompts?.en?.guidedReflection).toBe('Profile A prompt');
    expect(profileA.systemPrompts?.en?.recordExtraction).toBe(systemPromptSeeds.en.recordExtraction);
    expect(other.systemPrompts?.en?.guidedReflection).toBe(systemPromptSeeds.en.guidedReflection);
  });

  it('removes a previously saved token when the user clears it', () => {
    const localStorage = createStorage();
    const sessionStorage = createStorage();
    vi.stubGlobal('window', { localStorage, sessionStorage });
    saveAiConfig('profile-a', { ...defaultAiConfig, token: 'temporary-token' });

    saveAiConfig('profile-a', { ...defaultAiConfig, token: '' });

    expect(sessionStorage.getItem('ia-curriculum:ai-token:profile-a:v1')).toBeNull();
    expect(localStorage.getItem(profileAiConfigKey('profile-a'))).not.toContain('temporary-token');
  });
});
