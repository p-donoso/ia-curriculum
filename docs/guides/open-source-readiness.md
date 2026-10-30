# Open-source readiness

IA Curriculum is an actively developed personal project, not a production service. The repository documents its limits and includes automated checks, a license, contribution guidance, and a security reporting path.

## Current product limits

- No hosted backend, user accounts, synchronization, or recovery service.
- Profiles and career records are stored in the current browser.
- AI requests go directly from the browser to the configured OpenAI-compatible provider.
- Browser storage and client-side token storage are not a security boundary against same-origin script execution.
- AI proposals remain temporary until reviewed and saved by the user.
- CV labels follow the selected interface language; user-provided profile text is not translated automatically.
- Server-side PDF export and design templates are future work.

## Release checks

Run `npm run check` and `npm run test:e2e`. GitHub Actions runs these checks on pushes and pull requests. Review `npm audit` before a release. Verify no `.env` files, profile exports, tokens, or personal examples are in the change.
