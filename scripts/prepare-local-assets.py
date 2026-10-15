#!/usr/bin/env python3
"""Prepare and check the complete image pool used by a local portfolio build.

HVAC uses its verified HTTP snapshot helper. Other builders keep their images
in Git; expand a sparse checkout when necessary without cloning city repos.
Existing working-tree edits and additional assets are retained and reported.
"""

import argparse
import fcntl
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]
IMAGE_PATH = "public/assets/img"


def git(*arguments, check=True):
    return subprocess.run(
        ["git", "-C", str(ROOT), *arguments], check=check, capture_output=True
    )


def configured(name):
    result = git("config", "--bool", "--get", name, check=False)
    return result.returncode == 0 and result.stdout.strip() == b"true"


def indexed_assets():
    assets = []
    for row in git("ls-files", "--stage", "-t", "-z", "--", IMAGE_PATH).stdout.split(b"\0"):
        if not row:
            continue
        metadata, raw_path = row.split(b"\t", 1)
        flag, mode, sha, stage = metadata.decode("ascii").split()
        relative = raw_path.decode("utf-8")
        parts = PurePosixPath(relative).parts
        if (stage != "0" or mode not in ("100644", "100755", "120000")
                or relative.startswith("/") or ".." in parts
                or not relative.startswith(IMAGE_PATH + "/")):
            raise ValueError("Unexpected or unmerged image entry: " + relative)
        assets.append({"path": relative, "sha": sha, "mode": mode, "skip": flag == "S"})
    if not assets:
        raise ValueError("No tracked image pool found in this builder")
    return assets


def present(entry):
    path = ROOT / entry["path"]
    return path.exists() or path.is_symlink()


def blob_hash(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()


def inspect(entry):
    path = ROOT / entry["path"]
    # A substituted parent symlink must never copy files from outside the source.
    if not path.resolve().is_relative_to(ROOT.resolve()):
        raise ValueError("Image path resolves outside the builder: " + entry["path"])
    if entry["mode"] == "120000":
        if not path.is_symlink() or not path.exists():
            raise ValueError("Missing or changed image symlink: " + entry["path"])
        data = os.fsencode(os.readlink(path))
    else:
        if path.is_symlink() or not path.is_file():
            raise ValueError("Expected a regular image file: " + entry["path"])
        data = path.read_bytes()
    return blob_hash(data) == entry["sha"]


def tracked_pool(check_only):
    assets = indexed_assets()
    missing = [entry for entry in assets if not present(entry)]
    materialized = []
    if missing:
        if check_only:
            raise ValueError("Image pool is incomplete; run prepare-local-assets.py first (missing "
                             + str(len(missing)) + " tracked files)")
        # Only restore sparse omissions. An ordinary deletion may be intentional.
        if not configured("core.sparseCheckout") or any(not entry["skip"] for entry in missing):
            raise ValueError("Tracked images are deleted from the working tree; restore or stage those "
                             "deletions deliberately before building")
        arguments = ["sparse-checkout", "add"]
        if configured("core.sparseCheckoutCone"):
            arguments.append(IMAGE_PATH)
        else:
            # `add` keeps the existing sparse mode (unlike `set`, it has no
            # --no-cone option on the Git version bundled with this Mac).
            # Include descendants explicitly to override the Mac's existing
            # !/public/assets/img/** exclusion as well as its directory rule.
            arguments.extend(["/" + IMAGE_PATH + "/", "/" + IMAGE_PATH + "/**"])
        print("[assets] Expanding the builder's sparse image tree (first run may download Git blobs)", flush=True)
        result = git(*arguments, check=False)
        if result.returncode:
            raise RuntimeError(result.stderr.decode("utf-8", errors="replace").strip())
        materialized = [entry["path"] for entry in missing]

    modified = []
    fresh = set(materialized)
    for entry in assets:
        if not inspect(entry):
            if entry["path"] in fresh:
                raise ValueError("Materialized image differs from its Git blob: " + entry["path"])
            modified.append(entry["path"])

    extra = git("ls-files", "--others", "--exclude-standard", "-z", "--", IMAGE_PATH).stdout.split(b"\0")
    extra = [path.decode("utf-8") for path in extra if path]
    # Preserve local additions while refusing an unsafe external symlink.
    for relative in extra:
        path = ROOT / relative
        if not path.resolve().is_relative_to(ROOT.resolve()) or (path.is_symlink() and not path.exists()):
            raise ValueError("Unsafe additional image path: " + relative)
    print(json.dumps({"checked": True, "pool": str(ROOT / IMAGE_PATH),
                      "tracked_files": len(assets), "materialized_files": len(materialized),
                      "modified_files_preserved": modified, "additional_files_preserved": extra}))


def hvac_pool(check_only):
    helper = ROOT / "scripts" / "sync-preview-assets.py"
    expected = {
        ROOT / IMAGE_PATH: ROOT.parent / "hvac-assets" / "img",
        ROOT / "public" / "favicon.ico": ROOT.parent / "hvac-assets" / "favicon.ico",
    }
    for link, target in expected.items():
        if not link.is_symlink() or link.resolve() != target.resolve():
            raise ValueError("HVAC public asset link differs from its verified pool: " + str(link))
    command = [sys.executable, str(helper)]
    if check_only:
        command.append("--check")
    subprocess.run(command, cwd=ROOT, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true",
                        help="Check installed assets without network requests or writes")
    args = parser.parse_args()
    if (ROOT / "scripts" / "sync-preview-assets.py").is_file():
        hvac_pool(args.check)
    elif args.check:
        tracked_pool(True)
    else:
        lock_path = Path(os.fsdecode(git("rev-parse", "--git-path", "local-assets.lock").stdout.strip()))
        if not lock_path.is_absolute():
            lock_path = ROOT / lock_path
        with lock_path.open("a") as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            tracked_pool(False)


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, RuntimeError, subprocess.CalledProcessError) as error:
        raise SystemExit("[assets] " + str(error))
