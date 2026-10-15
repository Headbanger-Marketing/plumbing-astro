// A reviewed presentation change must satisfy its complete contract and retain
// the existing consent, anti-spam fields and submission destination.
export function formContractErrors(before = [], after = [], contract) {
  const generic = 'Form fields, consent, action or routing attributes changed';
  if (!contract) return JSON.stringify(before) === JSON.stringify(after) ? [] : [generic];
  if (contract.id !== '2026-10-15' || !Array.isArray(contract.fields) || contract.fields.length !== 8) {
    return ['Unrecognized reviewed form contract'];
  }
  if (before.length !== after.length) return ['Reviewed form contract cannot add or remove forms'];
  const errors = [];
  const names = contract.fields.map(field => field.name);
  const clean = text => String(text || '').replace(/\s+/g, ' ').trim();
  for (let index = 0; index < after.length; index++) {
    const previous = before[index], current = after[index];
    if (current.contract !== contract.id) {
      if (JSON.stringify(previous) !== JSON.stringify(current)) errors.push(`${generic}: unapproved form ${index}`);
      continue;
    }
    const fail = message => errors.push(`Reviewed form ${index}: ${message}`);
    for (const key of ['id', 'action', 'method', 'routing', 'redirect', 'submitGuard', 'noValidate', 'consent', 'privacyLinks', 'securityCopy']) {
      if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) fail(`preserved ${key} changed`);
    }
    const core = current.fields.filter(field => names.includes(field.role || field.name));
    if (JSON.stringify(core.map(field => field.role || field.name)) !== JSON.stringify(names)) fail('field order differs from the approved eight fields');
    for (const expected of contract.fields) {
      const matches = core.filter(field => (field.role || field.name) === expected.name);
      if (matches.length !== 1) {fail(`missing or duplicated ${expected.name}`);continue;}
      const field = matches[0];
      const prior = previous.fields.find(candidate => (candidate.role || candidate.name) === expected.name);
      if (field.name !== (expected.submissionName || expected.name)) fail(`${expected.name} submission name differs`);
      if (prior && (prior.name !== field.name || JSON.stringify(prior.routing) !== JSON.stringify(field.routing))) fail(`${expected.name} submission mapping changed`);
      if (field.type !== expected.type || field.required !== expected.required) fail(`${expected.name} type or requiredness differs`);
      if (!field.visible || field.collapsed || field.disabled) fail(`${expected.name} is hidden, collapsed or disabled`);
      if (clean(field.label).replace(/\s*\*\s*/g, '').trim() !== expected.label) fail(`${expected.name} label differs`);
      if (expected.required && !field.requiredMarker) fail(`${expected.name} required asterisk missing`);
      if (/optional/i.test(field.label || '') || /optional/i.test(field.placeholder || '')) fail(`${expected.name} contains an optional suffix`);
      if (expected.placeholder === '$siteCity') {
        if (!clean(field.placeholder) || field.prefilled) fail('city must use a nonempty local placeholder and no submitted prefill');
      } else if (expected.placeholder === '$serviceExample') {
        if (!clean(field.placeholder)) fail('message example missing');
      } else if (field.placeholder !== expected.placeholder) fail(`${expected.name} placeholder differs`);
      if (expected.name === 'service' && (!field.emptyOption || field.emptyOption.text !== 'Choose the work')) fail('optional service choice must retain the empty Choose the work option');
    }
    const noncore = fields => fields.filter(field => !names.includes(field.role || field.name));
    if (JSON.stringify(noncore(previous.fields)) !== JSON.stringify(noncore(current.fields))) fail('consent, hidden, or anti-spam fields changed');
    if (current.heading !== contract.heading) fail('heading differs');
    if (!contract.support.includes(current.support)) fail('supporting sentence is outside the reviewed service wording');
    if (JSON.stringify(current.submitLabels) !== JSON.stringify([contract.submit])) fail('submit button label differs');
    if (current.collapsedDetails) fail('collapsed optional section remains');
  }
  return errors;
}
