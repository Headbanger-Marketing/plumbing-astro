#!/usr/bin/env python3
"""Check every compiled enquiry form before any release plan can publish."""
import json
from pathlib import Path
import re
import sys
from bs4 import BeautifulSoup


def text(node):
    if node is None:
        return ''
    copy = BeautifulSoup(str(node), 'html.parser')
    container = copy.find()
    for child in container.select('input,select,textarea,button,svg,.error-text'):
        child.decompose()
    for child in container.select('[aria-hidden="true"]'):
        if child.get_text(strip=True) != '*':
            child.decompose()
    return ' '.join(copy.get_text(' ', strip=True).split())


def configured_city(domain):
    sites = Path(__file__).parents[1] / 'src' / 'sites'
    config = sites / (domain + '.json')
    if config.exists():
        return json.loads(config.read_text())['city']
    config = sites / (domain + '.ts')
    match = re.search(r'''(?m)^\s*city:\s*(["'])(.*?)\1\s*,''', config.read_text())
    if not match:
        raise ValueError('Cannot identify the configured site city: ' + domain)
    return match.group(2)


def validate(root, contract, expected_city=None):
    if not contract:
        return {'forms': 0, 'pages': 0, 'errors': []}
    if contract.get('id') != '2026-10-15':
        return {'forms': 0, 'pages': 0, 'errors': ['Unrecognized reviewed form contract']}
    errors = []
    forms_count = pages_count = 0
    names = [field['name'] for field in contract['fields']]
    for page in sorted(Path(root).rglob('*.html')):
        soup = BeautifulSoup(page.read_bytes(), 'html.parser')
        forms = soup.select('form')
        if forms:
            pages_count += 1
        for index, form in enumerate(forms):
            forms_count += 1
            prefix = f'{page.relative_to(root)} form {index}: '
            def fail(message):
                errors.append(prefix + message)
            if form.get('data-quote-contract') != contract['id']:
                fail('Enquiry form is missing the approved contract marker')
                continue
            controls = form.select('input,select,textarea')
            core = [field for field in controls if field.get('data-quote-field', field.get('name')) in names]
            roles = [field.get('data-quote-field', field.get('name')) for field in core]
            if roles != names:
                fail('Approved field order or uniqueness differs')
            for expected in contract['fields']:
                matches = [f for f in core if f.get('data-quote-field', f.get('name')) == expected['name']]
                if len(matches) != 1:
                    fail('Missing or duplicate ' + expected['name'])
                    continue
                field = matches[0]
                if field.get('name') != expected.get('submissionName', expected['name']):
                    fail(expected['name'] + ' submission name differs')
                kind = ('select-one' if field.name == 'select' else 'textarea' if field.name == 'textarea'
                        else field.get('type', 'text').lower())
                if kind != expected['type'] or field.has_attr('required') != expected['required']:
                    fail(expected['name'] + ' type or requiredness differs')
                if field.has_attr('disabled') or field.has_attr('hidden') or any(
                        ancestor.has_attr('hidden') or (ancestor.name == 'fieldset' and ancestor.has_attr('disabled'))
                        or (ancestor.name == 'details' and not ancestor.has_attr('open'))
                        for ancestor in field.parents if ancestor is not form):
                    fail(expected['name'] + ' is hidden, disabled or collapsed')
                label = form.find('label', attrs={'for': field.get('id')}) if field.get('id') else None
                label = label or field.find_parent('label')
                label_text = text(label)
                if re.sub(r'\s*\*\s*', '', label_text).strip() != expected['label']:
                    fail(expected['name'] + ' label differs')
                if expected['required'] and '*' not in label_text:
                    fail(expected['name'] + ' required asterisk missing')
                empty = field.find('option', attrs={'value': ''}) if field.name == 'select' else None
                placeholder = empty.get_text(' ', strip=True) if empty else field.get('placeholder', '')
                if re.search('optional', label_text + ' ' + placeholder, re.I):
                    fail(expected['name'] + ' contains an optional suffix')
                if expected['placeholder'] == '$siteCity':
                    if not placeholder.strip() or field.get('value', '').strip():
                        fail('City must have a local placeholder and no prefilled value')
                    if expected_city is not None and placeholder != expected_city:
                        fail('City placeholder differs from the configured site city')
                elif expected['placeholder'] == '$serviceExample':
                    if not placeholder.strip():
                        fail('Service example missing')
                elif placeholder != expected['placeholder']:
                    fail(expected['name'] + ' placeholder differs')
                if expected['name'] == 'service' and empty is None:
                    fail('Work choice must remain optional with an empty option')
            if text(form.select_one('[data-quote-heading]')) != contract['heading']:
                fail('Heading differs')
            if text(form.select_one('[data-quote-support]')) not in contract['support']:
                fail('Supporting copy differs')
            buttons = form.select('button[type="submit"],input[type="submit"]')
            if len(buttons) != 1 or (buttons[0].get('value', '') if buttons[0].name == 'input' else text(buttons[0])) != contract['submit']:
                fail('Submit label differs')
            if form.select('details:not([open])'):
                fail('Collapsed optional section remains')
    if not forms_count:
        errors.append('No compiled enquiry forms found')
    return {'forms': forms_count, 'pages': pages_count, 'errors': errors}


if __name__ == '__main__':
    city = configured_city(sys.argv[3]) if len(sys.argv) > 3 else None
    result = validate(Path(sys.argv[1]), json.loads(Path(sys.argv[2]).read_text()).get('visual', {}).get('formContract'), city)
    print(json.dumps(result))
    raise SystemExit(int(bool(result['errors'])))
