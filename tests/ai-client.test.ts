import { afterEach, describe, expect, it, vi } from 'vitest';
import { chat, streamChat, type ChatMessage } from '../lib/ai/client';

const config = { provider: 'custom', endpoint: 'https://api.example/v1/', model: '', token: 'test-token' };
const messages: ChatMessage[] = [{ role: 'user', content: 'Help me describe my work.' }];

describe('AI client', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('fails before sending when token is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(chat({ ...config, token: '' }, [])).rejects.toThrow('Falta el token');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requires an endpoint before sending user data', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(chat({ ...config, endpoint: '' }, messages)).rejects.toThrow('Configura el endpoint');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects insecure remote endpoints and credentials in endpoint URLs', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(chat({ ...config, endpoint: 'http://api.example/v1' }, messages)).rejects.toThrow('Usa HTTPS');
    await expect(chat({ ...config, endpoint: 'https://user:pass@api.example/v1' }, messages)).rejects.toThrow(
      'No incluyas credenciales',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends chat requests to the compatible endpoint and returns content', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ choices: [{ message: { content: 'A concise summary.' } }] }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(chat(config, messages)).resolves.toMatchObject({ content: 'A concise summary.' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        body: JSON.stringify({ model: 'auto', messages, stream: false }),
      }),
    );
  });

  it('reports provider errors and empty responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: { message: 'Provider unavailable' } }), { status: 503 }),
        )
        .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [] }), { status: 200 })),
    );
    await expect(chat(config, messages)).rejects.toThrow('Provider unavailable');
    await expect(chat(config, messages)).rejects.toThrow('sin contenido');
  });

  it('parses split server-sent event frames and emits tokens', async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\ndata: [DONE]\n\n',
    ];
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(chunks[0].slice(0, 17)));
        controller.enqueue(encoder.encode(chunks[0].slice(17) + chunks[1]));
        controller.close();
      },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status: 200 })));
    const received: string[] = [];

    await streamChat(config, messages, (token) => received.push(token));

    expect(received.join('')).toBe('Hello world');
  });
});
