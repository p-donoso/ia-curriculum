import type { AiConfig } from './prompts';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export type ChatResult = { content: string; raw: unknown };
const requestTimeoutMs = 30_000;

function completionUrl(endpoint: string): string {
  const value = endpoint.trim();
  if (!value) throw new Error('Configura el endpoint de tu proveedor de IA.');
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('El endpoint debe ser una URL HTTP(S) válida.');
  }
  const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && localHosts.has(url.hostname))) {
    throw new Error('Usa HTTPS para proveedores remotos; HTTP solo se permite para servicios locales.');
  }
  if (url.username || url.password) throw new Error('No incluyas credenciales en la URL del endpoint.');
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/chat/completions`;
  url.search = '';
  url.hash = '';
  return url.toString();
}

function createRequestSignal(signal?: AbortSignal) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new DOMException('Request timed out', 'TimeoutError')),
    requestTimeoutMs,
  );
  const onAbort = () => controller.abort(signal?.reason);
  if (signal?.aborted) onAbort();
  else signal?.addEventListener('abort', onAbort, { once: true });
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
    },
  };
}

export async function chat(config: AiConfig, messages: ChatMessage[], signal?: AbortSignal): Promise<ChatResult> {
  if (!config.token) throw new Error('Falta el token del proveedor.');
  const endpoint = completionUrl(config.endpoint ?? '');
  const request = createRequestSignal(signal);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.token}` },
      body: JSON.stringify({ model: config.model?.trim() || 'auto', messages, stream: false }),
      signal: request.signal,
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(
        (raw as { error?: { message?: string } }).error?.message ?? `El proveedor respondió ${response.status}.`,
      );
    const content = (raw as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content;
    if (!content) throw new Error('El proveedor devolvió una respuesta sin contenido.');
    return { content, raw };
  } finally {
    request.cleanup();
  }
}

export async function streamChat(
  config: AiConfig,
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!config.token) throw new Error('Falta el token del proveedor.');
  const endpoint = completionUrl(config.endpoint ?? '');
  const request = createRequestSignal(signal);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.token}` },
      body: JSON.stringify({ model: config.model?.trim() || 'auto', messages, stream: true }),
      signal: request.signal,
    });
    if (!response.ok || !response.body) {
      const raw = await response.text().catch(() => '');
      throw new Error(raw || `El proveedor respondió ${response.status}.`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const consumeLine = (line: string) => {
      if (!line.startsWith('data:')) return false;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') return true;
      try {
        const token = (JSON.parse(payload) as { choices?: Array<{ delta?: { content?: string } }> }).choices?.[0]?.delta
          ?.content;
        if (token) onToken(token);
      } catch {
        // Ignore malformed provider events; the stream can continue.
      }
      return false;
    };
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) if (consumeLine(line.trimEnd())) return;
      if (done) {
        if (buffer) consumeLine(buffer.trimEnd());
        return;
      }
    }
  } finally {
    request.cleanup();
  }
}
