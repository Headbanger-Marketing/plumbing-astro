#!/usr/bin/env python3
"""Exercise the release-time check against real compiled-style form markup."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('form_contract', Path(__file__).with_name('validate-form-contract.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
POLICY = json.loads((Path(__file__).parents[1] / 'release-policy.json').read_text())['visual']['formContract']


class CompiledFormContractTests(unittest.TestCase):
    def markup(self):
        fields = []
        for field in POLICY['fields']:
            name = field['name']
            placeholder = {'$siteCity': 'London', '$serviceExample': 'e.g. Equipment will not start…'}.get(field['placeholder'], field['placeholder'])
            required = ' required' if field['required'] else ''
            marker = '<span aria-hidden="true">*</span>' if field['required'] else ''
            attrs = f'id="{name}" name="{name}" data-quote-field="{name}"{required}'
            if field['type'] == 'select-one':
                control = f'<select {attrs}><option value="">{placeholder}</option><option value="repair">Repair</option></select>'
            elif field['type'] == 'textarea':
                control = f'<textarea {attrs} placeholder="{placeholder}"></textarea>'
            else:
                control = f'<input {attrs} type="{field["type"]}" placeholder="{placeholder}">'
            fields.append(f'<div><label for="{name}">{field["label"]} {marker}</label>{control}<span class="error-text">Validation message</span></div>')
        return (f'<form data-quote-contract="{POLICY["id"]}"><h2 data-quote-heading>{POLICY["heading"]}</h2>'
                f'<p data-quote-support>{POLICY["support"][0]}</p>' + ''.join(fields) +
                f'<label><input type="checkbox" name="consent" required>Consent <a href="/privacy-policy/">Privacy notice</a></label>'
                f'<input name="website" type="text" hidden><button type="submit" disabled><svg aria-hidden="true"></svg>{POLICY["submit"]}</button></form>')

    def check_markup(self, markup, policy=POLICY):
        with tempfile.TemporaryDirectory() as directory:
            (Path(directory) / 'index.html').write_text(markup)
            return module.validate(Path(directory), policy, 'London')

    def test_accepts_reviewed_markup_with_disabled_submit_and_preserved_consent(self):
        result = self.check_markup(self.markup())
        self.assertEqual(result, {'forms': 1, 'pages': 1, 'errors': []})

    def test_rejects_incomplete_or_changed_form_contracts(self):
        original = self.markup()
        changes = {
            'missing marker': ('data-quote-contract="2026-10-15"', ''),
            'submission field name': ('name="email"', 'name="unread_email"'),
            'disabled fieldset': ('<div><label for="phone">', '<fieldset disabled><div><label for="phone">'),
            'missing phone requirement': ('name="phone" data-quote-field="phone" required', 'name="phone" data-quote-field="phone"'),
            'missing postal requirement': ('name="postal" data-quote-field="postal" required', 'name="postal" data-quote-field="postal"'),
            'required work choice': ('name="service" data-quote-field="service"', 'name="service" data-quote-field="service" required'),
            'prefilled city': ('name="city"', 'name="city" value="London"'),
            'wrong local city': ('placeholder="London"', 'placeholder="Unrelated city"'),
            'hidden address': ('name="address"', 'name="address" hidden'),
            'optional suffix': ('>Work to discuss ', '>Work to discuss (optional) '),
            'required asterisk': ('Full Name <span aria-hidden="true">*</span>', 'Full Name'),
            'empty option': ('value="">Choose the work', 'value="repair">Choose the work'),
            'heading': ('>Get a Free Quote<', '>Book an appointment<'),
            'support': (POLICY['support'][0], 'Guaranteed immediate appointment.'),
            'submit': ('Request My Free Quote', 'Send now'),
            'collapsed fields': ('<div><label for="address">', '<details><summary>Address</summary><div><label for="address">'),
        }
        for name, (before, after) in changes.items():
            with self.subTest(name=name):
                self.assertIn(before, original)
                self.assertTrue(self.check_markup(original.replace(before, after))['errors'])

    def test_checks_every_output_page(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'index.html').write_text(self.markup())
            (root / 'contact').mkdir()
            (root / 'contact' / 'index.html').write_text(self.markup().replace('data-quote-contract="2026-10-15"', ''))
            result = module.validate(root, POLICY)
            self.assertEqual(result['forms'], 2)
            self.assertTrue(any('contact/index.html' in error for error in result['errors']))

    def test_no_output_and_unknown_contract_fail_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            self.assertTrue(module.validate(Path(directory), POLICY)['errors'])
        self.assertTrue(self.check_markup(self.markup(), {**POLICY, 'id': 'unreviewed'})['errors'])

    def test_legacy_release_without_policy_remains_unchanged(self):
        self.assertEqual(self.check_markup('<form></form>', None)['errors'], [])


if __name__ == '__main__':
    unittest.main()
