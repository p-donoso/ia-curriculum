# Deliverable audit — IA Curriculum

**Verdict:** ship-ready (**8/10**)
**Baseline comparison:** better than the ~2/10 reference — working product flows, real unit and browser tests, and an OSS-ready repository structure.
**Repo:** `/home/pdonoso/curriculum/ia-curriculum`
**Commands run:** `npm run check`; `npm run test:e2e`; `npm audit --audit-level=moderate`; source scans for personal details and common credential patterns.

## Dimension scores

| Dimension          | Score | Notes                                                                                                                                                                                             |
| ------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structure & wiring | 8/10  | Next.js App Router, profile store, reflection flow, and optional direct provider requests are connected; one-command local start.                                                                 |
| Docs ↔ code        | 8/10  | README, architecture, privacy, setup, and limitations describe the implemented browser-local design.                                                                                              |
| API contract       | 8/10  | No app-owned HTTP API; documents the OpenAI-compatible chat-completions request boundary and provider limitations.                                                                                |
| Tests (honesty)    | 8/10  | 26 Vitest tests and 15 Playwright E2E tests exercise behavior; `npm run check` and E2E pass. Library line coverage is 86.07%.                                                                     |
| OSS hygiene        | 9/10  | MIT license, contribution guide, code of conduct, security policy, CI, Dependabot, issue forms, PR template, and ignored build artifacts.                                                         |
| Security basics    | 7/10  | No secrets or personal CV data detected; token is tab-scoped, requests are bounded/cancellable, user controls provider. Browser-local data and third-party provider handling remain user-managed. |

## Findings

- **[medium]** Browser storage is not encrypted or synchronized — evidence: `lib/profiles/storage.ts`; users need to manage device access and backups.
- **[low]** AI requests go directly from the browser to a user-selected provider — evidence: `lib/ai/client.ts`, `docs/guides/privacy-byot.md`.
- **[low]** CV is an English print view and PDF save uses browser print — evidence: `app/components/cv-preview.tsx`, `README.md`.

## Recommendations (ordered)

1. Add optional encrypted backup/sync only with an explicit threat model and consent.
2. Add localized CV templates and stronger export formatting after validating user demand.
3. Keep expanding E2E coverage for edge cases in provider streaming and storage failures.
