# Privacy and bring-your-own-token

IA Curriculum has no server-side user database or provider proxy. The app stores CVs and their tailored text, answers, and a shared career source in the current browser's `localStorage`. Education, experience, projects, and skills are shared by all CVs; basic information, headline, summary, and AI settings belong to each CV. Clearing browser site data removes that information. There is no sync or backup. Existing per-CV career records are copied into the shared source on first use; legacy copies remain in local storage until browser data is cleared.

## AI requests

AI is optional. Without a configured token and endpoint, the guided flow makes no network request. With AI configured, the browser sends submitted answers to the selected OpenAI-compatible provider. The provider can process and retain the data according to its own policies. A provider must allow browser access through CORS.

The token is sent only in the HTTPS request's `Authorization` header (or to a local HTTP endpoint). It is held in the current tab's `sessionStorage`, which clears when the browser session ends. Same-origin scripts can access it while that session is open, so use a trusted device and keep the app and dependencies current. This storage choice reduces persistence; it does not defend against cross-site scripting or malicious browser extensions.

## User controls

- Export profile metadata, answers, and career records as JSON from Settings.
- Delete a CV, its CV-specific information, provider configuration, and session token from Settings. The shared career source remains available to other CVs.
- Delete individual career records in their section.

Exports may contain personal information. Store and share them carefully. Provider settings and tokens are excluded from JSON exports.

## Development rules

- Never commit real profile data, tokens, private prompts, or provider output.
- Do not put secrets in `.env.example` or `NEXT_PUBLIC_*` variables.
- Use synthetic examples and fixtures.
- Review endpoint URLs before sending profile text; remote endpoints must use HTTPS.
