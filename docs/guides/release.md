# Release checklist

```bash
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
npm audit
```

Before publishing a release:

- Review public files and commit history for secrets, personal profiles, generated exports, and local data.
- Confirm README, privacy, setup, and limitations match the implementation.
- Review dependency audit output and GitHub Actions status.
- Exercise profile creation, navigation, editing, export, deletion, and browser storage behavior.
- State remaining limitations in release notes.
