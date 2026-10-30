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

    saveAiConfig('alex', config);

    expect(JSON.parse(localStorage.getItem(profileAiConfigKey('alex'))!)).toEqual({
      provider: 'custom',
      endpoint: 'https://api.example/v1',
      model: 'model',
    });
    expect(sessionStorage.getItem('ia-curriculum:ai-token:alex:v1')).toBe('secret-token');
    expect(loadAiConfig('alex')).toEqual({ ...config, systemPrompts: resolveSystemPrompts() });
  });

  it('moves legacy local-storage tokens into the current browser session', () => {
    const localStorage = createStorage();
    const sessionStorage = createStorage();
    localStorage.setItem(
      profileAiConfigKey('alex'),
      JSON.stringify({ endpoint: 'https://api.example/v1', token: 'legacy' }),
    );
    vi.stubGlobal('window', { localStorage, sessionStorage });

    expect(loadAiConfig('alex').token).toBe('legacy');
    expect(sessionStorage.getItem('ia-curriculum:ai-token:alex:v1')).toBe('legacy');
    expect(localStorage.getItem(profileAiConfigKey('alex'))).not.toContain('legacy');
  });

  it('does not keep a legacy token when session storage is unavailable', () => {
    const localStorage = createStorage();
    localStorage.setItem(profileAiConfigKey('alex'), JSON.stringify({ token: 'legacy' }));
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

    expect(loadAiConfig('alex').token).toBe('');
    expect(localStorage.getItem(profileAiConfigKey('alex'))).not.toContain('legacy');
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

    saveAiConfig('alex', config);

    const loaded = loadAiConfig('alex');
    expect(loaded.systemPrompts?.es?.guidedReflection).toBe('Custom reflection prompt');
    expect(loaded.systemPrompts?.en?.recordExtraction).toBe(systemPromptSeeds.en.recordExtraction);
  });
});
