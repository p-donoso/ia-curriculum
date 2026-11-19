"""Build a disposable GitHub Wiki tree from docs/ (Python standard library only)."""
import argparse
import re
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--repository', required=True, help='GitHub owner/repository')
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
source = root / 'docs'
out = args.output.resolve()
if out == root or root in out.parents:
    parser.error('Output must be outside the source repository')
if out.exists() and any(out.iterdir()):
    parser.error('Output directory must be empty')
out.mkdir(parents=True, exist_ok=True)
pages = sorted(source.rglob('*.md'))


def name(path):
    relative = path.relative_to(source)
    return 'Home' if str(relative) == 'README.md' else '--'.join(relative.with_suffix('').parts)


names = {page.resolve(): name(page) for page in pages}
if len(set(names.values())) != len(names):
    parser.error('Wiki page name collision')
base = f'https://github.com/{args.repository}'


def link(match, page):
    target = match.group(1)
    parts = urlsplit(target)
    if parts.scheme or parts.netloc or not parts.path:
        return match.group(0)
    local = (page.parent / unquote(parts.path)).resolve()
    suffix = ('?' + parts.query if parts.query else '') + ('#' + parts.fragment if parts.fragment else '')
    if local in names:
        url = base + '/wiki/' + quote(names[local])
    elif local.is_relative_to(source) and local.is_file():
        url = base + '/wiki/assets/' + quote(local.relative_to(source).as_posix())
    elif local.is_relative_to(root):
        url = base + '/blob/main/' + quote(local.relative_to(root).as_posix())
    else:
        raise ValueError(f'Link escapes repository: {page}: {target}')
    return '](' + url + suffix + ')'


for page in pages:
    content = re.sub(r'\]\(([^\s)]+)\)', lambda m: link(m, page), page.read_text())
    def html_url(match):
        prefix, target = match.group(1), match.group(2)
        converted = re.sub(r'\]\(([^\s)]+)\)', lambda m: link(m, page), '](' + target + ')')
        return prefix + converted[2:-1] + '"'
    content = re.sub(r'((?:src|href)=")([^"]+)"', html_url, content)
    (out / (names[page.resolve()] + '.md')).write_text(content)
for asset in source.rglob('*'):
    if asset.is_file() and asset.suffix != '.md':
        target = out / 'assets' / asset.relative_to(source)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(asset.read_bytes())
(out / '_Sidebar.md').write_text('\n'.join(
    f'- [{names[p.resolve()]}]({base}/wiki/{quote(names[p.resolve()])})' for p in pages
) + '\n')
(out / '_Footer.md').write_text('Generated from docs/. Edit the source repository; wiki edits are overwritten.\n')
print(f'Generated {len(pages)} wiki pages in {out}')
