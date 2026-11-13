# Order and scope

- Keep changes focused, consistent with the existing structure, and easy to review.
- Search for existing components, helpers, translations, and docs before adding alternatives.
- Keep business logic in `lib/` and UI composition in `app/`; avoid duplicating state or storage behavior.
- Do not add dependencies, generated artifacts, or unrelated refactors without a clear need.
- Preserve local data and backwards compatibility. Make migrations safe to repeat and avoid destructive defaults.
- Follow the installed Next.js guidance in `node_modules/next/dist/docs/` before changing Next.js APIs or conventions.
