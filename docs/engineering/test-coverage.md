# Test coverage

`npm run test:coverage` uses Vitest and V8 for library unit and integration coverage. Reports are generated under `coverage/` as text, HTML, and LCOV. `npm run test:e2e` uses Chromium and a production build for user flows; it does not measure React line coverage.

The latest library run passed 41 tests across eight files: 85% lines, 80.24% statements, 73.01% functions, and 73.78% branches. Thresholds are configured in `vitest.config.mts`. These figures do not imply complete AI, storage, or template coverage.

The 19 browser tests cover CV creation and selection, desktop/mobile navigation, reflection persistence/reset, provider settings, accessibility, JSON export/deletion, experience records, and profile/resume views. The fixture initializes missing storage without overwriting answers on reload. Tests follow the current creation redirect and English selector heading.

## Known intermittent failure

The JSON-download test has occasionally timed out in the full parallel suite and passed individually. The MUI migration run passed 18/19, including accessibility; its failed download test passed on a focused rerun. Keep this visible rather than treating retries as proof of reliability.

## Dependency checks

The dependency update resolved the earlier Next.js/minimatch advisories; audit reported zero vulnerabilities at that run. Re-run audit before release. TypeScript is constrained to `~6.0.3`, within typescript-eslint 8.73.0's supported range (`>=4.8.4 <6.1.0`). TypeScript 7 remains tracked in issue #12. The Node type major is unchanged. No forced peer-dependency overrides are used.

## Extending coverage

Review `coverage/index.html`, prioritize deterministic behavior and real failure cases, then add browser checks for user-visible flows. Run `npm run check` and `npm run test:e2e` before release. Do not lower thresholds to hide regressions. PDF appearance still requires visual review across browsers and paper sizes.
