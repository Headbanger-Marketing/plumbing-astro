#!/usr/bin/env python3
"""Verify moved/space-containing paths, phone suppression and failed exports."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

scripts = Path(__file__).resolve().parent
brands = ["allservicelondon-site", "bilcke-site", "bobcase-site", "ferngully-site",
          "hayter-site", "hoffmeyer-site", "poulsen-site", "rays-site"]
with tempfile.TemporaryDirectory(prefix="chat context ") as temp:
    workspace = Path(temp) / "relocated portfolio"
    builder = workspace / "builders/preview-engine"
    (builder / "scripts").mkdir(parents=True)
    (builder / "src/lib").mkdir(parents=True)
    (builder / "src/sites").mkdir()
    shutil.copy2(scripts / "gen-chat-context.mjs", builder / "scripts")
    shutil.copy2(scripts.parent / "src/lib/phone-visibility.ts", builder / "src/lib")
    (builder / "package.json").write_text('{"type":"module"}\n')
    (builder / "src/sites/example.ca.ts").write_text('''export const site = {
      domain: 'example.ca', brand: 'Fixture', city: 'London', regionAbbr: 'ON',
      phone: {display: '(548) 708-8216', tel: '+15487088216'},
      url: 'https://example.ca', serviceAreas: ['London']
    };''')
    for i, name in enumerate(brands):
        target = workspace / "brands" / name / "src/data/site.ts"
        target.parent.mkdir(parents=True)
        target.write_text(f'''export const site = {{domain:'brand{i}.ca', name:'Brand {i}',
          phone:{{display:'(519) 455-7330',tel:'+15194557330'}},
          address:{{locality:'London',region:'ON',street:'Private fixture street'}},
          url:'https://brand{i}.ca', knowsAbout:['Electrical service']}};''')
    env = {**os.environ, "HVAC_WORKSPACE": str(workspace)}
    command = ["node", str(builder / "scripts/gen-chat-context.mjs")]

    def run():
        return subprocess.run(command, env=env, cwd=temp, text=True, capture_output=True)

    result = run()
    assert result.returncode == 0, result.stderr
    output = builder / "scripts/n8n/sites.json"
    payload = json.loads(output.read_text())
    assert payload["byPortfolio"] == {"network": 1, "brand": 8, "rebate": 2}
    assert payload["count"] == 11
    assert all(site["trackingPhone"] is None for site in payload["sites"].values())
    assert 'Private fixture street' not in output.read_text()
    assert "ontariofurnacerebates.ca" in payload["sites"]
    original = output.read_bytes()

    missing = workspace / "brands/rays-site/src/data/site.ts"
    saved = missing.read_text()
    missing.unlink()
    result = run()
    assert result.returncode != 0 and 'Missing brand context' in result.stderr
    assert output.read_bytes() == original
    missing.write_text('export const site = { invalid syntax;')
    result = run()
    assert result.returncode != 0
    assert output.read_bytes() == original
    assert not list((builder / "scripts").glob('.gen-chat-*-extract.mjs'))
    missing.write_text(saved)
    result = run()
    assert result.returncode == 0, result.stderr
    assert json.loads(output.read_text())["byPortfolio"]["brand"] == 8
print("Chat context relocation, phone policy, missing/broken source and recovery checks passed")
