#!/usr/bin/env python3
"""Focused deployment safety checks. Uses temporary Git repos and fake APIs only."""

import base64
import contextlib
import copy
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch


sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location("local_deploy", Path(__file__).with_name("local-deploy.py"))
DEPLOY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DEPLOY)
DOMAIN = "reviewedexample.ca"
HEAD = "a" * 40
TREE = "b" * 40
COMMIT = "c" * 40


class FakeAPI:
    """Implement the small atomic-commit API path without making a request."""

    def __init__(self, head=HEAD, remote=None, omit_unknown=False):
        self.head = head
        self.remote = copy.deepcopy(remote or {})
        self.after = copy.deepcopy(self.remote)
        self.requests = []
        self.snapshots = []
        self.omit_unknown = omit_unknown

    @property
    def writes(self):
        return [row for row in self.requests if row[1] is not None or row[2] not in (None, "GET")]

    def snapshot(self, domain):
        self.snapshots.append(domain)
        return self.head, TREE, copy.deepcopy(self.remote)

    def request(self, path, data=None, method=None):
        self.requests.append((path, data, method))
        if path == "/graphql":
            mutation = data["variables"]["input"]
            if mutation["expectedHeadOid"] != self.head:
                raise AssertionError("Mutation lost its optimistic head guard")
            for row in mutation["fileChanges"]["additions"]:
                raw = base64.b64decode(row["contents"], validate=True)
                self.after[row["path"]] = {"sha": DEPLOY.blob_sha(raw), "mode": "100644", "type": "blob"}
            for row in mutation["fileChanges"].get("deletions", []):
                self.after.pop(row["path"], None)
            if self.omit_unknown:
                self.after.pop("preserve-me.txt", None)
            return {"data": {"createCommitOnBranch": {"commit": {"oid": COMMIT}}}}
        if path.endswith("/trees/" + COMMIT + "?recursive=1"):
            return {"truncated": False, "tree": [{"path": path, **row} for path, row in self.after.items()]}
        if path.endswith("/blobs") and data is not None:
            if data["encoding"] != "base64":
                raise AssertionError("Binary uploads must declare base64 encoding")
            return {"sha": DEPLOY.blob_sha(base64.b64decode(data["content"], validate=True))}
        if path.endswith("/trees") and data is not None:
            if data["base_tree"] != TREE:
                raise AssertionError("Large deployment did not preserve the remote base tree")
            for row in data["tree"]:
                if row["sha"] is None:
                    self.after.pop(row["path"], None)
                else:
                    self.after[row["path"]] = {key: row[key] for key in ("sha", "mode", "type")}
            return {"sha": "1" * 40}
        if path.endswith("/commits") and data is not None:
            if data["parents"] != [self.head] or data["tree"] != "1" * 40:
                raise AssertionError("Large deployment lost its expected parent or staged tree")
            return {"sha": COMMIT}
        if path.endswith("/refs/heads/main") and data is not None:
            if method != "PATCH" or data != {"sha": COMMIT, "force": False}:
                raise AssertionError("Large deployment may only fast-forward the expected commit")
            return {"object": {"sha": COMMIT}}
        raise AssertionError("Unexpected fake API request: " + path)


class DeploymentSafetyTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="local-deploy-test-")
        self.root = Path(self.temporary.name)
        self.root_patch = patch.object(DEPLOY, "ROOT", self.root)
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)
        self.addCleanup(self.temporary.cleanup)
        self.quiet = contextlib.ExitStack()
        self.quiet.enter_context(contextlib.redirect_stdout(io.StringIO()))
        self.quiet.enter_context(contextlib.redirect_stderr(io.StringIO()))
        self.addCleanup(self.quiet.close)
        self.git("init", "-q")
        self.git("config", "user.name", "Deployment tests")
        self.git("config", "user.email", "tests@example.invalid")
        (self.root / "package.json").write_text(json.dumps({"name": "plumbing-astro"}))
        (self.root / "scripts").mkdir()
        (self.root / "scripts/rollout-chat.py").write_text("APPROVED_SITES = frozenset([" + repr(DOMAIN) + "])\n")
        (self.root / "src").mkdir()
        (self.root / "src/tracked.txt").write_text("tracked source")
        self.git("add", ".")
        self.git("commit", "-qm", "Test fixture")
        self.dist = self.root / "dist" / DOMAIN
        self.dist.mkdir(parents=True)
        (self.dist / "index.html").write_text("<html><header>Site</header><main>Reviewed build</main></html>\n")
        (self.dist / "CNAME").write_text(DOMAIN + "\n")
        self.remote = {
            "preserve-me.txt": {"sha": "d" * 40, "mode": "100644", "type": "blob"},
            ".github/workflows/pages.yml": {"sha": "e" * 40, "mode": "100644", "type": "blob"},
        }
        self.plan_path = self.root / ".local-deploy/run" / DOMAIN / "plan.json"
        self.real_run = DEPLOY.run

    def git(self, *arguments, input=None):
        return subprocess.run(["git", "-C", str(self.root), *arguments], input=input,
                              capture_output=True, check=True).stdout

    def plan(self, api=None):
        return DEPLOY.plan_build(api or FakeAPI(remote=self.remote), self.dist, DOMAIN,
                                 DEPLOY.fingerprint(), 1, self.plan_path)

    def run_without_asset_check(self, command, **arguments):
        if command[1:] == ["scripts/prepare-local-assets.py", "--check"]:
            return None
        return self.real_run(command, **arguments)

    def test_staged_domain_is_refused_before_build_or_api(self):
        with patch.object(sys, "argv", ["local-deploy.py", "stagedexample.ca"]), \
                patch.object(DEPLOY, "run") as run, patch.object(DEPLOY, "API") as api:
            with self.assertRaises(SystemExit) as error:
                DEPLOY.main()
        self.assertEqual(error.exception.code, 2)
        run.assert_not_called()
        api.assert_not_called()
        self.assertFalse((self.root / ".local-deploy").exists())

    def test_changed_build_output_aborts_before_api_write(self):
        plan = self.plan()
        (self.dist / "index.html").write_text("tampered output")
        api = FakeAPI(remote=self.remote)
        with patch.object(DEPLOY, "run", side_effect=self.run_without_asset_check), \
                self.assertRaisesRegex(ValueError, "Build output changed"):
            DEPLOY.publish(api, plan, self.plan_path.with_name("receipt.json"))
        self.assertEqual(api.writes, [])
        self.assertEqual(api.snapshots, [])
        self.assertFalse(self.plan_path.with_name("receipt.json").exists())

    def test_changed_remote_head_aborts_before_api_write(self):
        plan = self.plan()
        api = FakeAPI(head="f" * 40, remote=self.remote)
        with patch.object(DEPLOY, "run", side_effect=self.run_without_asset_check), \
                self.assertRaisesRegex(ValueError, "main changed"):
            DEPLOY.publish(api, plan, self.plan_path.with_name("receipt.json"))
        self.assertEqual(api.writes, [])
        self.assertFalse(self.plan_path.with_name("receipt.json").exists())

    def test_plan_cannot_omit_a_compiled_file(self):
        plan = self.plan()
        plan["files"] = plan["files"][:-1]
        api = FakeAPI(remote=self.remote)
        with patch.object(DEPLOY, "run", side_effect=self.run_without_asset_check), \
                self.assertRaisesRegex(ValueError, "complete compiled output"):
            DEPLOY.publish(api, plan, self.plan_path.with_name("receipt.json"))
        self.assertEqual(api.writes, [])
        self.assertEqual(api.snapshots, [])

    def test_plan_cannot_hide_a_changed_file(self):
        plan = self.plan()
        plan["files"][0]["changed"] = False
        api = FakeAPI(remote=self.remote)
        with patch.object(DEPLOY, "run", side_effect=self.run_without_asset_check), \
                self.assertRaisesRegex(ValueError, "changed-file flags"):
            DEPLOY.publish(api, plan, self.plan_path.with_name("receipt.json"))
        self.assertEqual(api.writes, [])

    def test_remote_tree_change_with_same_head_aborts_before_write(self):
        plan = self.plan()
        modified = copy.deepcopy(self.remote)
        modified["preserve-me.txt"]["sha"] = "0" * 40
        api = FakeAPI(remote=modified)
        with patch.object(DEPLOY, "run", side_effect=self.run_without_asset_check), \
                self.assertRaisesRegex(ValueError, "Remote tree differs"):
            DEPLOY.publish(api, plan, self.plan_path.with_name("receipt.json"))
        self.assertEqual(api.writes, [])

    def test_unknown_remote_files_survive_and_atomic_head_is_used(self):
        api = FakeAPI(remote=self.remote)
        plan = self.plan(api)
        with patch.object(DEPLOY, "run", side_effect=self.run_without_asset_check):
            result = DEPLOY.publish(api, plan, self.plan_path.with_name("receipt.json"))
        self.assertEqual(result["status"], "published")
        self.assertTrue(result["tree_verified"])
        self.assertEqual(len(api.writes), 1)
        for name, row in self.remote.items():
            self.assertEqual(api.after[name], row)
        self.assertEqual(plan["deletions"], [])

    def test_post_publish_verification_rejects_lost_unknown_file(self):
        api = FakeAPI(remote=self.remote, omit_unknown=True)
        plan = self.plan(api)
        receipt = self.plan_path.with_name("receipt.json")
        with patch.object(DEPLOY, "run", side_effect=self.run_without_asset_check), \
                self.assertRaisesRegex(ValueError, "Published tree"):
            DEPLOY.publish(api, plan, receipt)
        self.assertEqual(json.loads(receipt.read_text())["status"], "committed-awaiting-tree-verification")

    def test_large_binary_publish_preserves_base_tree_and_never_forces_ref(self):
        # Base64 exceeds the small atomic-mutation ceiling and exercises REST.
        (self.dist / "large-photo.bin").write_bytes(bytes(range(256)) * (5 * 4096))
        api = FakeAPI(remote=self.remote)
        plan = self.plan(api)
        with patch.object(DEPLOY, "run", side_effect=self.run_without_asset_check):
            result = DEPLOY.publish(api, plan, self.plan_path.with_name("receipt.json"))
        self.assertEqual(result["status"], "published")
        self.assertFalse(any(path == "/graphql" for path, _, _ in api.requests))
        self.assertTrue(any(path.endswith("/refs/heads/main") for path, _, _ in api.requests))
        for name, row in self.remote.items():
            self.assertEqual(api.after[name], row)

    def test_electrical_removes_stale_output_and_preserves_github_workflows(self):
        (self.root / "package.json").write_text(json.dumps({"name": "electrical-astro"}))
        api = FakeAPI(remote=self.remote)
        plan = self.plan(api)
        self.assertEqual(plan["deletions"], ["preserve-me.txt"])
        with patch.object(DEPLOY, "run", side_effect=self.run_without_asset_check):
            result = DEPLOY.publish(api, plan, self.plan_path.with_name("receipt.json"))
        self.assertEqual(result["status"], "published")
        self.assertEqual(result["deleted_files"], 1)
        self.assertNotIn("preserve-me.txt", api.after)
        self.assertEqual(api.after[".github/workflows/pages.yml"], self.remote[".github/workflows/pages.yml"])

    def test_binary_blob_ids_match_git(self):
        for raw in (b"", b"\x00\xff\x80image\r\n\x00", bytes(range(256)) * 257):
            with self.subTest(size=len(raw)):
                expected = self.git("hash-object", "--stdin", input=raw).decode().strip()
                self.assertEqual(DEPLOY.blob_sha(raw), expected)

    def test_saved_plan_with_any_publication_receipt_cannot_repeat(self):
        plan = self.plan()
        receipt = self.plan_path.with_name("receipt.json")
        for status in ("published", "publication-outcome-unknown", "committed-awaiting-tree-verification"):
            with self.subTest(status=status):
                receipt.write_text(json.dumps({"status": status}))
                with patch.object(sys, "argv", ["local-deploy.py", "--publish-plan", str(self.plan_path)]), \
                        patch.object(DEPLOY, "run", return_value="22.12.0"), \
                        patch.object(DEPLOY, "API") as api, patch.object(DEPLOY, "publish") as publish:
                    with self.assertRaisesRegex(ValueError, "publication receipt"):
                        DEPLOY.main()
                api.assert_not_called()
                publish.assert_not_called()

    def test_untracked_source_edits_change_the_source_fingerprint(self):
        original = DEPLOY.fingerprint()
        source = self.root / "src/new-untracked.txt"
        source.write_text("first edit")
        first = DEPLOY.fingerprint()
        source.write_text("second edit")
        second = DEPLOY.fingerprint()
        self.assertEqual(len({original, first, second}), 3)
        self.assertIn("?? src/new-untracked.txt", self.git("status", "--short").decode())

    def test_second_operation_in_same_builder_is_locked_out(self):
        state = self.root / ".local-deploy"
        state.mkdir()
        with (state / "build.lock").open("a") as lock:
            DEPLOY.fcntl.flock(lock, DEPLOY.fcntl.LOCK_EX | DEPLOY.fcntl.LOCK_NB)
            with patch.object(sys, "argv", ["local-deploy.py", DOMAIN, "--build-only"]), \
                    patch.object(DEPLOY, "run") as run, patch.object(DEPLOY, "API") as api:
                with self.assertRaisesRegex(ValueError, "already running"):
                    DEPLOY.main()
        run.assert_not_called()
        api.assert_not_called()


if __name__ == "__main__":
    unittest.main(verbosity=2)
