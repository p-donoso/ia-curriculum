# Branch workflow

- Keep `main` deployable; make focused changes on short-lived `feat/`, `fix/`, or `docs/` branches and merge through a pull request.
- Do not force-push or delete the default branch. Delete merged topic branches.
- Before changing repository rules, inspect the live ruleset with `gh api repos/{owner}/{repo}/rulesets` and `gh api repos/{owner}/{repo}/rulesets/{id}`.
- Update rulesets with `gh api --method PUT repos/{owner}/{repo}/rulesets/{id} --input ruleset.json`; preserve existing conditions and rules unless intentionally changing them. Re-read the ruleset afterward.
- Add required status checks only after confirming the named check is consistently passing on pull requests.
- Use `gh pr create`, `gh pr checks`, and `gh pr merge` for the review flow; verify the merged commit and a clean worktree.
