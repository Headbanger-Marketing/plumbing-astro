# Local maintenance tools

Run with Node 22.12+ from the builder checkout. In a copied checkout or worktree, set `HVAC_WORKSPACE` to the portfolio root containing `brands/`.

- `npm run gen:chat-context` writes `scripts/n8n/sites.json`, including network sites, all eight managed brand configs and two rebates. It stops before replacing the existing bundle if a managed brand is missing or cannot be imported. Phone visibility uses the same suppression policy as the site; full street addresses are excluded.
- `npm run test:chat-context` checks moved paths containing spaces, phone suppression, missing and broken sources, output preservation, and recovery using temporary fixtures.
- `node scripts/dev/mock-chat-server.mjs` serves the local preview on `127.0.0.1:8787`. Generate the bundle first. The localhost fallback is this builder's London site. `MOCK_CHAT_PORT` can select another local port. The mock sends no real leads.
- `npm run extract-configs -- <domain>` calls the existing Python extractor. `--all` is explicit and rewrites configs; use it only for an intended extraction. Do not run extraction just to validate a command alias.
- `npm run verify-parity -- <domain> [--new] [--strict]` calls the existing Python verifier. Existing parity mode needs the corresponding local comparison files.

These maintenance commands do not publish chat context or rebuild live sites.

## Local build and publication

Build on this Mac, then publish compiled output to the existing city GitHub Pages repository through the GitHub API. Use the existing authenticated `gh` CLI; do not clone city repositories.

```sh
python3 scripts/local-deploy.py <domain>               # build + publication plan
python3 scripts/local-deploy.py <domain> --build-only  # build only
npm run deploy:site -- <domain> --publish              # build + publish
npm run deploy:all                                    # build + plan for approved live sites
npm run deploy:all -- --publish                       # build + publish approved live sites
python3 scripts/local-deploy.py --publish-plan <plan.json>
```

The default builds locally and saves a publication plan. `--all-live` selects the existing `APPROVED_SITES` in `scripts/rollout-chat.py`, excluding staged configs. One local build runs per builder; a concurrent invocation fails until the running process finishes. The local helper restores required image assets omitted by sparse checkout and performs the build's normalization, redirects and sharing-image generation. Use Python with BeautifulSoup and the locked npm dependencies.

A source push does not publish the site. The cloud workflow is retained only for an explicit rollback, with no automatic source-push trigger. See the portfolio `CLAUDE.md` runbook for scope and the other site families.

For plan/receipt handling, live Pages verification, concurrent edits and recovery, use the [shared local deployment SOP](https://github.com/Headbanger-Marketing/hvac-astro/blob/main/docs/local-deployment.md). The four builder cloud workflows are disabled; individual city Pages publishing remains enabled.
