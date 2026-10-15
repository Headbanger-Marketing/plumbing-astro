#!/usr/bin/env python3
"""Build locally; preview or atomically publish compiled files to GitHub Pages.

Examples: local-deploy.py londonheatingcooling.ca [--publish]
          local-deploy.py --all-live --build-only
          local-deploy.py --publish-plan .local-deploy/<run>/<domain>/plan.json
No city repository is cloned. Authentication uses the existing gh CLI session.
"""
from __future__ import annotations

import argparse
import ast
import base64
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import fcntl
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path, PurePosixPath
import posixpath
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from urllib.parse import unquote, urlsplit
import uuid

ROOT = Path(__file__).resolve().parents[1]
OWNER = 'Headbanger-Marketing'
ENGINES = {'hvac-astro', 'plumbing-astro', 'duct-cleaning-astro', 'electrical-astro'}


def run(command, *, env=None, capture=False):
    result = subprocess.run(command, cwd=ROOT, env=env, check=True,
                            capture_output=capture, text=True)
    return result.stdout.strip() if capture else None


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def blob_sha(raw):
    return hashlib.sha1(f'blob {len(raw)}\0'.encode() + raw).hexdigest()


def save(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(data, indent=2) + '\n')
    temporary.replace(path)


def approved_sites():
    """Reuse the reviewed live allowlist, rather than staged config globs."""
    tree = ast.parse((ROOT / 'scripts/rollout-chat.py').read_text())
    for node in tree.body:
        if (isinstance(node, ast.Assign)
                and any(isinstance(t, ast.Name) and t.id == 'APPROVED_SITES' for t in node.targets)):
            value = node.value
            if not (isinstance(value, ast.Call) and isinstance(value.func, ast.Name)
                    and value.func.id == 'frozenset' and len(value.args) == 1):
                break
            return frozenset(ast.literal_eval(value.args[0]))
    raise ValueError('Cannot read the reviewed live-site allowlist')


def safe_path(path):
    parts = PurePosixPath(path).parts
    return bool(parts) and not path.startswith('/') and not any(p in ('..', '.', '.git') for p in parts)


def fingerprint():
    paths = run(['git', 'ls-files', '-z', '--cached', '--others', '--exclude-standard', '--',
                 'src', 'public', 'astro.config.mjs', 'package.json', 'package-lock.json',
                 'scripts', 'tsconfig.json', '*.config.mjs'], capture=True).split('\0')
    result = hashlib.sha256()
    for name in sorted(set(filter(None, paths))):
        path = ROOT / name
        if path.is_symlink() and path.is_dir():
            result.update(name.encode() + b'\0' + os.fsencode(os.readlink(path)))
            continue
        if not path.is_file():
            raise ValueError('Missing source input: ' + name)
        result.update(name.encode() + b'\0' + hashlib.sha256(path.read_bytes()).digest())
    # HVAC's tracked image link points at an external verified local pool.
    manifest = ROOT.parent / 'hvac-assets/preview-assets.json'
    if engine() == 'hvac-astro':
        result.update(json.dumps(json.loads(manifest.read_text())['files'], sort_keys=True).encode())
    return result.hexdigest()


def engine():
    name = json.loads((ROOT / 'package.json').read_text())['name']
    if name not in ENGINES:
        raise ValueError('Unrecognized builder: ' + name)
    return name


class API:
    def __init__(self):
        self.token = run(['gh', 'auth', 'token'], capture=True)
        self.last_write = 0.0

    def request(self, path, data=None, method=None):
        method = method or ('POST' if data is not None else 'GET')
        if method != 'GET':
            time.sleep(max(0, 1.1 - (time.monotonic() - self.last_write)))
            self.last_write = time.monotonic()
        headers = {'Authorization': 'Bearer ' + self.token, 'Accept': 'application/vnd.github+json',
                   'User-Agent': 'Headbanger-Local-Deploy', 'Content-Type': 'application/json'}
        request = urllib.request.Request('https://api.github.com' + path,
                                         data=json.dumps(data).encode() if data is not None else None,
                                         headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                result = json.load(response)
        except urllib.error.HTTPError as error:
            raise RuntimeError(f'GitHub {method} {path}: HTTP {error.code}; no automatic write retry') from None
        if result.get('errors'):
            message = '; '.join(e.get('message', 'GraphQL error') for e in result['errors'])
            raise RuntimeError(message.replace(self.token, '[redacted]'))
        return result

    def snapshot(self, domain):
        prefix = f'/repos/{OWNER}/{domain}/git'
        try:
            head = self.request(prefix + '/ref/heads/main')['object']['sha']
        except RuntimeError:
            # GitHub occasionally misreports a populated branch through this REST endpoint.
            # Independent commit and GraphQL reads must agree; writes keep their head guard.
            commit = self.request(f'/repos/{OWNER}/{domain}/commits/main')
            query = 'query($owner:String!,$name:String!){repository(owner:$owner,name:$name){ref(qualifiedName:"refs/heads/main"){target{oid}}}}'
            alternate = self.request('/graphql', {'query': query, 'variables': {'owner': OWNER, 'name': domain}})
            target = alternate['data']['repository']['ref']
            if not target or target['target']['oid'] != commit['sha']:
                raise ValueError('Independent branch reads disagree; publication refused')
            head = commit['sha']
        tree = self.request(prefix + '/trees/' + head + '?recursive=1')
        if tree.get('truncated'):
            raise ValueError('GitHub returned an incomplete tree')
        return head, tree['sha'], {r['path']: {'sha': r['sha'], 'mode': r['mode'], 'type': r['type']}
                                   for r in tree['tree'] if r['type'] != 'tree'}


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.header = self.main = self.redirect = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.header |= tag == 'header'
        self.main |= tag == 'main'
        self.redirect |= tag == 'meta' and attrs.get('http-equiv', '').lower() == 'refresh'
        if set(attrs.get('class', '').split()) & {'topbar', 'ownership'}:
            raise ValueError('The removed topbar must not be rebuilt')
        for key in ('src', 'href', 'poster'):
            if attrs.get(key):
                self.urls.append(attrs[key])
        if attrs.get('srcset'):
            self.urls.extend(item.strip().split()[0] for item in attrs['srcset'].split(',') if item.strip())
        if attrs.get('property') in ('og:image', 'twitter:image') or attrs.get('name') == 'twitter:image':
            self.urls.append(attrs.get('content', ''))


def validate_output(dist, domain):
    count = 0
    for path in dist.rglob('*.html'):
        parser = References()
        parser.feed(path.read_text())
        if not parser.redirect and (not parser.header or not parser.main):
            raise ValueError('Missing retained header/main: ' + str(path.relative_to(dist)))
        for url in parser.urls:
            parsed = urlsplit(url)
            if parsed.netloc and parsed.hostname != domain:
                continue
            name = unquote(parsed.path).lstrip('/')
            if name.startswith(('assets/', '_astro/')) or name in ('favicon.ico', 'favicon.svg'):
                if not safe_path(name) or not (dist / name).is_file():
                    raise ValueError(f'{path.relative_to(dist)} references missing local asset {name}')
        count += 1
    for css in dist.rglob('*.css'):
        for url in re.findall(r'url\(\s*[\'\"]?([^\s\)\'\"]+)', css.read_text()):
            parsed = urlsplit(url)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            name = unquote(parsed.path)
            name = name.lstrip('/') if name.startswith('/') else posixpath.normpath((css.relative_to(dist).parent / name).as_posix())
            if not safe_path(name) or not (dist / name).is_file():
                raise ValueError(f'{css.relative_to(dist)} references missing local asset {name}')
    if not (dist / 'index.html').is_file() or count == 0:
        raise ValueError('The local build did not produce index.html')
    if (dist / 'CNAME').read_text().strip() != domain:
        raise ValueError('Built CNAME does not match the selected domain')
    return count


def build(domain):
    env = dict(os.environ)
    env['ELECTRICAL_SITE' if engine() == 'electrical-astro' else 'HVAC_SITE'] = domain
    before = fingerprint()
    run(['npm', 'run', 'build'], env=env)
    if engine() == 'electrical-astro':
        run(['node', 'scripts/verify-sites.mjs', domain], env=env)
    else:
        run([sys.executable, 'scripts/normalize.py'], env=env)
        run([sys.executable, 'scripts/gen-service-redirects.py'], env=env)
        run(['node', 'scripts/gen-og-images.mjs', domain], env=env)
        og = ROOT / 'dist' / domain / 'assets/img/og-default.png'
        if not og.is_file() or og.with_suffix('.png.base.png').exists() or og.with_suffix('.png.logo.png').exists():
            raise ValueError('Per-site OG image generation did not complete')
    if fingerprint() != before:
        raise ValueError('Source changed during the build; rebuild before publishing')
    dist = ROOT / 'dist' / domain
    (dist / '.nojekyll').touch()
    return dist, before, validate_output(dist, domain)


def output_files(dist, domain):
    text = '\n'.join(p.read_text() for p in dist.rglob('*.html'))
    for path in dist.rglob('*'):
        if not path.is_file():
            continue
        name = path.relative_to(dist).as_posix()
        if not safe_path(name):
            raise ValueError('Unsafe built path: ' + name)
        if engine() != 'electrical-astro' and name.startswith('assets/wordmarks/') and not Path(name).name.startswith(domain + '.') and not Path(name).name.startswith(domain + '-'):
            continue
        if name.startswith('assets/brand-media/') and not Path(name).name.startswith(domain + '-'):
            continue
        if engine() == 'hvac-astro' and domain != 'londonheatingcooling.ca':
            if name == 'assets/img/logo.png':
                continue
            if name.startswith(('assets/img/logos/', 'assets/img/logos-trans/')) and name not in text:
                continue
        if any(part.startswith('.') for part in PurePosixPath(name).parts) and name != '.nojekyll':
            continue
        yield name, path


def plan_build(api, dist, domain, source, html_count, destination):
    head, tree_sha, remote = api.snapshot(domain)
    files = []
    for name, path in output_files(dist, domain):
        raw = path.read_bytes()
        sha = blob_sha(raw)
        previous = remote.get(name)
        if previous and (previous['mode'] != '100644' or previous['type'] != 'blob'):
            raise ValueError('Refusing to overwrite a non-regular remote file: ' + name)
        files.append({'path': name, 'sha': sha, 'size': len(raw),
                      'changed': not previous or previous['sha'] != sha})
    managed = {row['path'] for row in files}
    deletions = sorted(path for path in remote if path not in managed
                       and path != '.github' and not path.startswith('.github/')) if engine() == 'electrical-astro' else []
    plan = {'version': 1, 'builder': engine(), 'domain': domain, 'builder_root': str(ROOT),
            'source_commit': run(['git', 'rev-parse', 'HEAD'], capture=True),
            'source_fingerprint': source, 'dist': str(dist), 'expected_head': head, 'expected_tree': tree_sha,
            'html_pages': html_count, 'files': files, 'remote_tree': remote,
            'changed_files': sum(f['changed'] for f in files),
            'changed_bytes': sum(f['size'] for f in files if f['changed']),
            'deletions': deletions}
    save(destination, plan)
    print(f"{domain}: {html_count} pages built locally; {plan['changed_files']} changed files, "
          f"{plan['changed_bytes']:,} bytes, {len(deletions)} deletions; plan {destination}", flush=True)
    return plan


def check_plan(plan):
    if plan['builder'] != engine() or Path(plan['builder_root']) != ROOT or plan['domain'] not in approved_sites():
        raise ValueError('Plan is not for this builder and a reviewed live domain')
    domain = plan['domain']
    dist = ROOT / 'dist' / domain
    if Path(plan['dist']) != dist or fingerprint() != plan['source_fingerprint']:
        raise ValueError('Source or artifact location changed after preview; rebuild the plan')
    inventory = {name for name, _ in output_files(dist, domain)}
    planned = [row['path'] for row in plan['files']]
    if len(planned) != len(set(planned)) or set(planned) != inventory:
        raise ValueError('The saved plan does not cover the complete compiled output')
    for row in plan['files']:
        if not safe_path(row['path']):
            raise ValueError('Unsafe plan path')
        raw = (dist / row['path']).read_bytes()
        if blob_sha(raw) != row['sha'] or len(raw) != row['size']:
            raise ValueError('Build output changed after preview: ' + row['path'])


def encoded_file(dist, row):
    raw = (dist / row['path']).read_bytes()
    if len(raw) != row['size'] or blob_sha(raw) != row['sha']:
        raise ValueError('Build output changed during publication: ' + row['path'])
    return base64.b64encode(raw).decode()


def publish(api, plan, receipt_path):
    run([sys.executable, 'scripts/prepare-local-assets.py', '--check'])
    check_plan(plan)
    domain = plan['domain']
    head, tree_sha, current = api.snapshot(domain)
    if head != plan['expected_head']:
        raise ValueError('Published main changed after preview; rebuild/review against the latest head')
    if tree_sha != plan['expected_tree'] or current != plan['remote_tree']:
        raise ValueError('Remote tree differs from the reviewed plan')
    managed = {row['path'] for row in plan['files']}
    expected_deletions = sorted(path for path in current if path not in managed
                               and path != '.github' and not path.startswith('.github/')) if engine() == 'electrical-astro' else []
    if plan['deletions'] != expected_deletions:
        raise ValueError('Saved deletions do not match this builder publication policy')
    for row in plan['files']:
        changed_now = row['path'] not in current or current[row['path']]['sha'] != row['sha']
        if row['changed'] is not changed_now:
            raise ValueError('Saved changed-file flags do not match the reviewed remote tree')
    changed = [row for row in plan['files'] if row['changed']]
    deletions = plan['deletions']
    if not changed and not deletions:
        result = {'status': 'already-current', 'domain': domain, 'commit': head}
        save(receipt_path, result)
        return result
    result = {'status': 'publication-outcome-unknown', 'domain': domain, 'expected_head': head}
    # A lost response must be reconciled from GitHub before any retry.
    save(receipt_path, result)
    dist = Path(plan['dist'])
    if sum((r['size'] + 2) // 3 * 4 for r in changed) <= 6 * 1024 * 1024 and len(changed) <= 500:
        additions = [{'path': row['path'], 'contents': encoded_file(dist, row)}
                     for row in changed]
        query = 'mutation($input:CreateCommitOnBranchInput!){createCommitOnBranch(input:$input){commit{oid}}}'
        data = {'branch': {'repositoryNameWithOwner': f'{OWNER}/{domain}', 'branchName': 'main'},
                'expectedHeadOid': head, 'message': {'headline': 'Deploy site built locally on netleads'},
                'fileChanges': {'additions': additions, 'deletions': [{'path': path} for path in deletions]}}
        commit = api.request('/graphql', {'query': query, 'variables': {'input': data}})['data']['createCommitOnBranch']['commit']['oid']
    else:
        # Stage large binary payloads without exposing a partial site commit.
        prefix = f'/repos/{OWNER}/{domain}/git'
        tree_rows = []
        for row in changed:
            data = encoded_file(dist, row)
            sha = api.request(prefix + '/blobs', {'content': data, 'encoding': 'base64'})['sha']
            if sha != row['sha']:
                raise ValueError('Uploaded blob SHA mismatch')
            tree_rows.append({'path': row['path'], 'mode': '100644', 'type': 'blob', 'sha': sha})
        tree_rows.extend({'path': path, 'mode': current[path]['mode'], 'type': current[path]['type'], 'sha': None}
                         for path in deletions)
        tree = api.request(prefix + '/trees', {'base_tree': tree_sha, 'tree': tree_rows})['sha']
        commit = api.request(prefix + '/commits', {'message': 'Deploy site built locally on netleads',
                                                  'tree': tree, 'parents': [head]})['sha']
        api.request(prefix + '/refs/heads/main', {'sha': commit, 'force': False}, method='PATCH')
    result.update({'status': 'committed-awaiting-tree-verification', 'commit': commit})
    save(receipt_path, result)
    tree = api.request(f'/repos/{OWNER}/{domain}/git/trees/{commit}?recursive=1')
    if tree.get('truncated'):
        raise ValueError('Incomplete post-publication tree')
    after = {r['path']: {'sha': r['sha'], 'mode': r['mode'], 'type': r['type']}
             for r in tree['tree'] if r['type'] != 'tree'}
    expected = dict(current)
    for path in deletions:
        del expected[path]
    expected.update({r['path']: {'sha': r['sha'], 'mode': '100644', 'type': 'blob'} for r in changed})
    if expected != after:
        raise ValueError('Published tree does not match the complete compiled output plan')
    result.update({'status': 'published', 'changed_files': len(changed), 'deleted_files': len(deletions), 'tree_verified': True,
                   'commit_url': f'https://github.com/{OWNER}/{domain}/commit/{commit}'})
    save(receipt_path, result)
    print(f'{domain}: published local build {commit}; GitHub Pages will serve it', flush=True)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('domains', nargs='*', help='Live domains, individually or comma-separated')
    parser.add_argument('--all-live', action='store_true')
    parser.add_argument('--build-only', action='store_true')
    parser.add_argument('--publish', action='store_true', help='Publish after building and printing the exact diff plan')
    parser.add_argument('--publish-plan', type=Path, help='Publish a saved, unchanged build plan without rebuilding')
    parser.add_argument('--dry-run', action='store_true', help='Build and preview only (the default)')
    parser.add_argument('--no-sync', action='store_true', help=argparse.SUPPRESS)
    args = parser.parse_args()
    if args.build_only and (args.publish or args.publish_plan):
        parser.error('--build-only cannot publish')
    if args.dry_run and (args.publish or args.publish_plan):
        parser.error('--dry-run cannot publish')
    sites = approved_sites()
    selected = sorted({d for value in args.domains for d in value.split(',') if d})
    if args.all_live:
        if selected or args.publish_plan:
            parser.error('--all-live cannot be combined with domains or a saved plan')
        selected = sorted(sites)
    if args.publish_plan:
        if selected:
            parser.error('A saved plan cannot be combined with domains')
    elif not selected or any(d not in sites or not re.fullmatch(r'[a-z0-9-]+\.ca', d) for d in selected):
        parser.error('Select exact reviewed live domains, or --all-live; staged configurations are excluded')
    state = ROOT / '.local-deploy'
    state.mkdir(exist_ok=True)
    with (state / 'build.lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise ValueError('Another local build/deploy is already running in this builder') from None
        version = tuple(int(n) for n in run(['node', '-p', 'process.versions.node'], capture=True).split('.'))
        if version < (22, 12, 0):
            raise ValueError('Node >=22.12 is required')
        if args.publish_plan:
            receipt = args.publish_plan.with_name('receipt.json')
            if receipt.exists():
                raise ValueError('This plan already has a publication receipt; inspect/reconcile it before retry')
            publish(API(), json.loads(args.publish_plan.read_text()), receipt)
            return 0
        run(['npm', 'ci'])
        run([sys.executable, 'scripts/prepare-local-assets.py'])
        api = None if args.build_only else API()
        batch = state / (datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ') + '-' + uuid.uuid4().hex[:8])
        results, errors = [], []
        print(f'{engine()}: {len(selected)} live sites; builds run on {os.uname().nodename}', flush=True)
        for domain in selected:
            try:
                dist, source, count = build(domain)
                if args.build_only:
                    results.append({'domain': domain, 'status': 'built', 'html_pages': count, 'dist': str(dist)})
                    print(f'{domain}: built and validated {count} pages at {dist}', flush=True)
                    continue
                destination = batch / domain / 'plan.json'
                plan = plan_build(api, dist, domain, source, count, destination)
                result = publish(api, plan, destination.with_name('receipt.json')) if args.publish else {'domain': domain, 'status': 'preview', 'plan': str(destination)}
                results.append(result)
            except Exception as error:
                errors.append({'domain': domain, 'error': str(error)})
                print(f'{domain}: FAILED: {error}', file=sys.stderr, flush=True)
        save(batch / 'summary.json', {'builder': engine(), 'selected': selected, 'results': results, 'errors': errors})
        print(f"Done: {len(results)} succeeded, {len(errors)} failed; {batch / 'summary.json'}", flush=True)
        return 1 if errors else 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, RuntimeError, OSError, subprocess.CalledProcessError) as error:
        print('ERROR: ' + str(error), file=sys.stderr)
        sys.exit(1)
