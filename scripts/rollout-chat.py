#!/usr/bin/env python3
"""Patch published HTML for reviewed company chat without rebuilding pages.

City checkouts belong only on the GitHub Actions runner. This script uses exact
byte-preserving replacements, validates every file before writing anything, and
only changes chat tags, the assistant notice and prior chat opt-out metadata.
Assets, styles, other metadata and the existing conversion flow are preserved.
"""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit

ENGINE = "plumbing-astro"
# Exact approved core sites from website-sites.json, reviewed 2026-10-12.
# BEGIN APPROVED SITES
APPROVED_SITES = frozenset([
  "ajaxplumbingpros.ca",
  "amherstburgplumbingpros.ca",
  "ancasterplumbingpros.ca",
  "auroraplumbingpros.ca",
  "aylmerplumbing.ca",
  "ayrplumbing.ca",
  "bayfieldplumbing.ca",
  "beavertonplumbingpros.ca",
  "bowmanvilleplumbingpros.ca",
  "bramptonplumbingpros.ca",
  "brantfordplumbingpros.ca",
  "burlingtonplumbingpros.ca",
  "caledoniaplumbingpros.ca",
  "caledonplumbingpros.ca",
  "cambridgeplumbingpros.ca",
  "chathamkentplumbing.ca",
  "chathamplumbingpros.ca",
  "clintonplumbing.ca",
  "dorchesterplumbing.ca",
  "dunnvilleplumbingpros.ca",
  "eastgwillimburyplumbingpros.ca",
  "elmiraplumbing.ca",
  "exeterplumbing.ca",
  "forestplumbing.ca",
  "georgetownplumbingpros.ca",
  "glencoeplumbing.ca",
  "goderichplumbing.ca",
  "grandbendplumbing.ca",
  "guelphplumbingpros.ca",
  "hamiltonplumbingpros.ca",
  "ildertonplumbing.ca",
  "ingersollplumbing.ca",
  "keswickplumbingpros.ca",
  "kingcityplumbingpros.ca",
  "kitchenerplumbingpros.ca",
  "komokaplumbing.ca",
  "lakeshoreplumbing.ca",
  "lasalleplumbing.ca",
  "leamingtonplumbingpros.ca",
  "listowelplumbing.ca",
  "londonplumbingpros.ca",
  "lucanplumbing.ca",
  "markhamplumbingpros.ca",
  "miltonplumbingpros.ca",
  "mississaugaplumbingpros.ca",
  "mitchellplumbingpros.ca",
  "mountbrydgesplumbing.ca",
  "nanticokeplumbing.ca",
  "newmarketplumbingpros.ca",
  "norfolkplumbing.ca",
  "northyorkplumbingpros.ca",
  "oakvilleplumbingpros.ca",
  "oshawaplumbingpros.ca",
  "owensoundplumbingpros.ca",
  "parisplumbingpros.ca",
  "petroliaplumbing.ca",
  "pickeringplumbingpros.ca",
  "portdoverplumbing.ca",
  "portperryplumbingpros.ca",
  "richmondhillplumbingpros.ca",
  "ridgetownplumbing.ca",
  "sarniaplumbing.ca",
  "saugeenshoresplumbing.ca",
  "seaforthplumbing.ca",
  "simcoeplumbingpros.ca",
  "stmarysplumbing.ca",
  "stouffvilleplumbingpros.ca",
  "stratfordplumbing.ca",
  "strathroyplumbing.ca",
  "stthomasplumbing.ca",
  "tecumsehplumbingpros.ca",
  "tillsonburgplumbingpros.ca",
  "torontoplumbingpros.ca",
  "uxbridgeplumbingpros.ca",
  "vaughanplumbingpros.ca",
  "wallaceburgplumbing.ca",
  "waterlooplumbingpros.ca",
  "whitbyplumbingpros.ca",
  "windsorplumbing.ca",
  "winghamplumbing.ca",
  "woodstockplumbingpros.ca"
])
# END APPROVED SITES

CHAT_TAG = '<script src="https://hvac-agent.headbangermarketing.com/assets/chat-widget.js?v=20261013-1" data-api="https://hvac-agent.headbangermarketing.com" data-privacy="/privacy-policy/" defer></script>'
PRIVACY_TEXT = (
    'Your chat messages are processed by the enquiry team and Anthropic to provide automated answers. '
    'If you choose to submit an enquiry and agree to the consent notice, the enquiry team records your '
    'contact details, property location and request, and forwards them to a relevant service provider. '
    'Coverage, quotes and appointments require separate confirmation. Do not send payment '
    'details or other sensitive information through chat.'
)
PRIVACY_BLOCK = '<h2>Automated Assistant</h2><p>' + PRIVACY_TEXT + '</p>'
PRIVACY_PATTERN = re.compile(r'<h2>Automated Assistant</h2>\s*<p>' + re.escape(PRIVACY_TEXT) + r'</p>')
PRIVACY_ANCHOR = '<h2>Search Reports and Browser Settings</h2>'
SCRIPT_PATTERN = re.compile(r'<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?</script\s*>', re.I)
BODY_CLOSE = re.compile(r'</body\s*>', re.I)


class RolloutError(ValueError):
    pass


def selected_sites(value):
    """Reject broad/staged selection before a matrix or city checkout exists."""
    if not isinstance(value, str) or value.strip().lower() == 'all':
        raise RolloutError('Chat-only rollout requires an explicit reviewed domain list, never all.')
    domains = [domain.strip() for domain in value.split(',')]
    if not domains or any(not domain or domain not in APPROVED_SITES for domain in domains):
        raise RolloutError('Chat-only selection contains an empty, unknown or unassigned domain.')
    return sorted(set(domains))


class ScriptSource(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.src = None

    def handle_starttag(self, tag, attrs):
        if tag.lower() == 'script' and self.src is None:
            self.src = dict(attrs).get('src')


def chat_script(tag):
    parser = ScriptSource()
    parser.feed(tag)
    if not parser.src:
        return False
    try:
        return urlsplit(parser.src).path.rsplit('/', 1)[-1] == 'chat-widget.js'
    except ValueError:
        return False


def remove_chat_tags(html):
    return SCRIPT_PATTERN.sub(lambda match: '' if chat_script(match.group()) else match.group(), html)


CHAT_META_PATTERN = re.compile(r'<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?</script\s*>|<meta\b[^>]*>', re.I)

class ChatMeta(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.off = False
    def handle_starttag(self, tag, attrs):
        if tag.lower() == 'meta':
            attrs = dict(attrs)
            self.off = attrs.get('name', '').lower() == 'hc-chat' and attrs.get('content', '').lower() == 'off'

def remove_chat_optout(html):
    def replace(match):
        parser = ChatMeta()
        parser.feed(match.group())
        return '' if parser.off else match.group()
    return CHAT_META_PATTERN.sub(replace, html)


def retained_markup(html):
    """Everything outside the two explicitly authorized additions, byte exact."""
    return PRIVACY_PATTERN.sub('', remove_chat_tags(remove_chat_optout(html)))


def transform(html, privacy=False):
    html = remove_chat_optout(html)
    closes = list(BODY_CLOSE.finditer(html))
    if len(closes) != 1:
        raise RolloutError('Published HTML must contain exactly one closing body tag.')
    existing = [match for match in SCRIPT_PATTERN.finditer(html) if chat_script(match.group())]
    if existing:
        first = existing[0].start()
        html = SCRIPT_PATTERN.sub(
            lambda match: (CHAT_TAG if match.start() == first else '')
            if chat_script(match.group()) else match.group(), html)
    else:
        # No template/build operation: insert only this one new script.
        position = closes[0].start()
        html = html[:position] + CHAT_TAG + html[position:]
    if privacy:
        matches = list(PRIVACY_PATTERN.finditer(html))
        if len(matches) > 1:
            raise RolloutError('Automated Assistant privacy notice is duplicated; review before rollout.')
        if not matches:
            if re.search(r'<h[1-6]\b[^>]*>\s*Automated Assistant\s*</h[1-6]>', html, re.I):
                raise RolloutError('An existing different assistant privacy notice requires review.')
            if html.count(PRIVACY_ANCHOR) != 1:
                raise RolloutError('Existing privacy notice anchor was not found exactly once.')
            html = html.replace(PRIVACY_ANCHOR, PRIVACY_BLOCK + PRIVACY_ANCHOR, 1)
    return html


def patch_tree(root, site):
    if site not in APPROVED_SITES:
        raise RolloutError('This domain is not approved for company chat in ' + ENGINE + '.')
    root = Path(root).resolve()
    if not root.is_dir():
        raise RolloutError('Published checkout is missing.')
    cname = root / 'CNAME'
    if cname.exists() and cname.read_text().strip().lower().removeprefix('www.') != site:
        raise RolloutError('Published checkout CNAME does not match the selected domain.')
    privacy_page = root / 'privacy-policy/index.html'
    if not privacy_page.is_file():
        raise RolloutError('The existing privacy-policy/index.html page is required.')
    changes = []
    files = sorted(path for path in root.rglob('*.html') if '.git' not in path.relative_to(root).parts)
    for path in files:
        if path.is_symlink() or not path.resolve().is_relative_to(root):
            raise RolloutError('Published HTML must stay inside the checked-out repository.')
        raw = path.read_bytes()
        try:
            before = raw.decode('utf-8')
        except UnicodeDecodeError as error:
            raise RolloutError('Published HTML must be UTF-8.') from error
        after = transform(before, privacy=path == privacy_page)
        if retained_markup(before) != retained_markup(after):
            raise RolloutError('Presentation or existing markup changed outside the permitted chat/privacy update.')
        if sum(chat_script(match.group()) for match in SCRIPT_PATTERN.finditer(after)) != 1:
            raise RolloutError('Each published HTML page must contain exactly one chat script.')
        if path == privacy_page and len(PRIVACY_PATTERN.findall(after)) != 1:
            raise RolloutError('The assistant privacy notice must appear exactly once.')
        if after != before:
            changes.append((path, after.encode('utf-8')))
    # Transform and verify every page before writing any page.
    for path, raw in changes:
        path.write_bytes(raw)
    return {'site': site, 'engine': ENGINE, 'html_pages_verified': len(files),
            'changed_html_pages': len(changes), 'retained_markup_equal': True,
            'changed_files': [str(path.relative_to(root)) for path, _ in changes]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--select', help='Emit a GitHub Actions matrix from an exact approved domain list.')
    parser.add_argument('--root', help='Published city repository checkout on the CI runner.')
    parser.add_argument('--site', help='The exact approved domain being patched.')
    args = parser.parse_args()
    try:
        if args.select is not None:
            if args.root or args.site:
                raise RolloutError('Selection and patch modes are separate.')
            print('list=' + json.dumps(selected_sites(args.select), separators=(',', ':')))
        elif args.root and args.site:
            print(json.dumps(patch_tree(args.root, args.site), separators=(',', ':')))
        else:
            raise RolloutError('Supply --select, or both --root and --site.')
    except RolloutError as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
