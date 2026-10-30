# AI integration

AI is optional. Without a token and endpoint, answers are saved locally and the reflection flow continues without network requests.

When configured, the browser sends a streaming chat-completions request to the user-selected OpenAI-compatible endpoint. It includes the conversation answers entered in that session so the provider can respond with context. The token is sent in the `Authorization` header, never in the URL. The provider must allow browser requests from the app's origin (CORS).

## Configure

Open a profile's Settings and provide:

- An OpenAI-compatible API base URL, for example `https://provider.example/v1`.
- The model identifier expected by that service.
- A token accepted by that service.

Remote endpoints must use HTTPS. HTTP is accepted only for local services such as `http://localhost:port/v1`. Do not embed credentials in endpoint URLs. Native provider APIs that do not implement OpenAI-compatible chat completions are not supported.

The token is kept in tab-scoped `sessionStorage`; provider and model settings are stored in `localStorage`. Existing tokens found in the legacy profile configuration are moved to session storage and removed from persistent settings when possible. If browser storage is restricted, the app does not fall back to persistent token storage.

`NEXT_PUBLIC_AI_PROVIDER`, `NEXT_PUBLIC_AI_ENDPOINT`, and `NEXT_PUBLIC_AI_MODEL` are optional public defaults. Never use them for secrets.

## Data and trust

The configured provider receives the submitted answers and may process or retain them under its own terms. The app displays this before the person continues. Suggestions are shown as untrusted text, are not stored as verified facts, and must not be treated as career advice or a factual source.

Implementation: `lib/ai/config.ts`, `lib/ai/client.ts`, and `lib/ai/extraction.ts`.
