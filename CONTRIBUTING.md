# Contributing

Thanks for helping improve IA Curriculum.

## Before opening a pull request

1. Open an issue for a substantial change so the intended behavior is clear.
2. Create a focused branch and keep the patch scoped to one concern.
3. Install the locked dependencies with `npm ci`.
4. Run `npm run check` and `npm run test:e2e` for UI or navigation changes.
5. Update documentation when behavior, setup, privacy, or limitations change.

## Pull request description

Include the user problem, the behavior changed, relevant screenshots for UI changes, and commands run. Call out known limitations. Do not claim checks that were not run.

## Privacy and security

Do not commit `.env` files, API keys, real career profiles, personal records, provider responses, or generated exports. Use synthetic fixtures. Follow [SECURITY.md](SECURITY.md) for vulnerability reports and the [Code of Conduct](CODE_OF_CONDUCT.md) for project participation.
