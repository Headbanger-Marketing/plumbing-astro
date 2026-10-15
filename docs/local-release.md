# Local releases from pushed main

The four non-branded trade builders compile on the netleads Mac. A launchd worker checks each builder's remote `main` every 60 seconds and processes unprocessed source changes. The versioned `.githooks/post-merge` writes a local hint; only pushed `origin/main` commits authorize releases. Changes merged on GitHub are detected even if no local merge hook ran. Backlogged commits are combined into a release of the latest main, compared with the last successful source version.

## Normal workflow

1. Make and test source changes on a branch. Merge the reviewed change into main and push it.
2. The worker fetches a bare source mirror on the internal disk and creates a clean worktree at that exact commit. It never reads unfinished working checkouts or clones city deployment repositories.
3. City configs/content and domain-specific wordmarks select that city. Shared or unknown build inputs select this builder's registered live portfolio. Documentation-only changes do not deploy sites. Controller-only changes validate the two pilots and must produce zero changed/deleted output; they cannot overwrite independently published work.
4. The worker runs the existing deployment safety tests, release/rollback recovery tests and headless browser fixture tests. It builds and validates all selected outputs, and retains compiled artifacts in a content-addressed store.
5. It verifies the current public pilot output before capturing its layout. The candidate must pass desktop/mobile heading-gap, webfont-loading, overflow, component-order, photograph, hero/form-placement and form-contract checks. Before/candidate screenshots are retained. Browser probes allow GET/HEAD only and never submit enquiries.
6. Up to two selected pilots publish first. Each must pass native GitHub Pages, exact public-file and browser checks before remaining sites publish. Every remaining site's native Pages job and public changed output are checked. One-city changes stay one-city releases.

Source changes appear on GitHub with the `local-release/netleads` commit status. Local `status.json`, per-builder state and per-release logs contain the full result. A failed or uncertain publication blocks that builder; other builders continue. No failed write is retried automatically. The previous cloud Astro build workflows remain disabled; native city Pages hosting remains enabled. EV, brands, rebates, landscaping and client flows are unchanged.

## Worker operation

State, logs, source mirrors and artifacts are on the internal disk at `~/.local/state/headbanger-releases`. The Mac must be awake, logged in and connected to the network. After sleep/offline time, the next poll detects pending main changes. Fetch failures before publication are retried on later polls; uncertain writes are never retried automatically. Internal-disk state and the worker's copied `gh` executable avoid removable-SSD background restrictions. Credentials remain in the existing gh login; no secrets are copied into release records.

From a builder source repository:

```bash
npm run release:worker -- status
npm run release:worker -- pause
npm run release:worker -- enable
npm run release:worker -- resume hvac-astro
```

`enable` requires a successful no-change full-scope rehearsal for all four builders. This adopts the exact public baseline without changing site files; only registered live sites are included. `resume` explicitly retries only the named builder and preserves its existing plans/receipts. It can resume verification of a known published commit. If a newer descendant main arrives, the worker retains the old receipts and creates fresh plans from the last successful source; it never reuses stale plans. Any uncertain publication still blocks automatic progress. Source main is rechecked before each plan and publication, so an older build stops when newer main arrives.

If a failed release published nothing, `abandon <builder>` archives its pending state so a newer main can be processed. If it published changes, roll those changes back first. Abandon refuses unknown outcomes or published sites without a reconciled rollback. Do not edit state files or remove receipts to bypass these guards.

## Rollback

Every release records the source/base commits, selected domains, compiled artifact checksums, exact previous remote trees, expected heads, publication receipts and verification evidence. Rollback restores the affected compiled paths as **new commits**, preserving unrelated files. It preflights every target and refuses newer remote work. It takes the same global lock as the worker, then places that builder on an operator hold before any restoration. It never force-pushes.

```bash
# Preview restoration of a release; no remote changes.
npm run release:site -- rollback /absolute/path/to/release

# Publish and verify that restoration.
npm run release:site -- rollback /absolute/path/to/release --publish
```

After rollback, revert/reconcile the source change on main before explicitly resuming the worker. Restoring source alone does not restore a previously published site. A partially successful rollback retains its receipts; reconcile and resume verification instead of deleting records. Existing known-published rollback receipts can be verified again without repeating their writes.

## Installation and maintenance

The controller source is `scripts/release-worker.py` in HVAC; identical release/test implementations are checked into all four builders. `release-policy.json` holds each builder's preferred pilots and explicit visual/form change policies. Intentional design or form changes need a reviewed policy change; do not disable checks just to clear a failure.

```bash
# Install from clean source whose HEAD equals remote main for all four builders.
python3 scripts/release-worker.py install --builders-root /absolute/path/to/builders
# Rehearse each builder before enabling (use its own builder name). Initial rehearsals refuse any changed/deleted output, so setup cannot overwrite parallel live work.
python3 scripts/release-worker.py rehearse hvac-astro --all-registered --publish
# Load the installed LaunchAgent and enable only after all rehearsals pass.
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.headbanger.local-releases.plist
python3 scripts/release-worker.py enable
```

The installer preserves existing custom Git hooks. Polling is authoritative even when the optional merge hook cannot be installed. It freezes the current live-domain allowlists in worker state so adding a staged config or changing the source allowlist does not silently launch another domain. A new site's launch and worker enrollment require the portfolio's normal explicit launch review.

Run `npm run test:local-deploy` and `npm run test:release` after deployment-tool changes. Use Node >=22.12, Python with BeautifulSoup and installed Google Chrome. Playwright Core is pinned in package-lock.json; production application dependencies are unchanged. The controller refreshes its versioned worker code from HVAC main for the next launch. Keep source mirrors and content-addressed artifacts: they are the recovery record, not disposable caches. Successful and safely superseded runs automatically remove their clean temporary source/dependency worktree while retaining plans, receipts, compiled artifacts and browser evidence. Failed or unexpectedly modified worktrees remain for recovery.

The low-level `local-deploy.py` remains available for build previews and deliberate recovery. Routine releases use this gated worker flow. Refer to the local deployment SOP for its atomic publication and unknown-outcome recovery rules.
