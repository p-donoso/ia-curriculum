# Verification and reporting

- Add or update focused tests for changed behavior, especially storage, migration, and profile/source boundaries.
- Run the relevant checks for the change. Use `npm run typecheck`, `npm test`, and, for UI/navigation changes, `npm run test:e2e` when practical.
- Report only checks that actually ran, and state any skipped verification or known limitation.
- Keep fixtures and screenshots synthetic; never use personal CV data in tests or docs.
