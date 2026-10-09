# Local maintenance tools

Run with Node 22.12+ from the builder checkout. In a copied checkout or worktree, set `HVAC_WORKSPACE` to the portfolio root containing `brands/`.

- `npm run gen:chat-context` writes `scripts/n8n/sites.json`, including network sites, all eight managed brand configs and two rebates. It stops before replacing the existing bundle if a managed brand is missing or cannot be imported. Phone visibility uses the same suppression policy as the site; full street addresses are excluded.
- `npm run test:chat-context` checks moved paths containing spaces, phone suppression, missing and broken sources, output preservation, and recovery using temporary fixtures.
- `node scripts/dev/mock-chat-server.mjs` serves the local preview on `127.0.0.1:8787`. Generate the bundle first. The localhost fallback is this builder's London site. `MOCK_CHAT_PORT` can select another local port. The mock sends no real leads.
- `npm run extract-configs -- <domain>` calls the existing Python extractor. `--all` is explicit and rewrites configs; use it only for an intended extraction. Do not run extraction just to validate a command alias.
- `npm run verify-parity -- <domain> [--new] [--strict]` calls the existing Python verifier. Existing parity mode needs the corresponding local comparison files.

These commands do not publish chat context or rebuild live sites. Production site updates use the builder's GitHub Actions workflow described in the portfolio runbook.
