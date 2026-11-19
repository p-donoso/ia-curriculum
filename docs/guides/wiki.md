# Publishing the GitHub Wiki

`docs/` is the source of truth. The `Publish documentation wiki` workflow publishes Markdown, assets, and navigation when documentation changes reach `main`, or when manually dispatched. It replaces wiki contents; edit documentation through repository pull requests.

## Initial setup

1. Create the first page in GitHub Wiki to initialize `ia-curriculum.wiki.git`.
2. Create a fine-grained token limited to this repository with Contents: Read and write and automatic Metadata: Read. Use an account with write access and authorize SSO if required. Never store the token in files.
3. Save it as the Actions secret `WIKI_TOKEN`. The workflow does not assume `GITHUB_TOKEN` can write to the separate wiki repository.
4. Merge the workflow into `main` and run it from Actions. Check Home, navigation, images, and the publication log. Token access must be verified by a successful push; a configured secret alone does not prove access.

## Local generation

From the repository root:

```bash
python3 scripts/build-wiki.py --output /tmp/ia-curriculum-wiki-preview --repository p-donoso/ia-curriculum
```

The destination must be empty and outside the repository. `docs/README.md` becomes Home; other page paths use `--` separators. Direct Markdown links are rewritten to wiki pages, assets, or source files on `main`. External links and local anchors are preserved. HTML links and reference-style Markdown links are not rewritten; use direct Markdown links in published content.

Local generation does not publish. The workflow uses a temporary clone, preserves `.git`, removes obsolete files, and skips unchanged commits. It never prints the token or embeds it in the remote URL.
