#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract per-site content from a site's build_pages.py and emit a content.ts file
consumed by the Astro pages.

Background: each site's content (SVC dict, BLOG list, REVIEW_POOL, HOME_SERVICES,
HOME_FAQ) is BESPOKE per site, not just brand substitution. London trio alone
have 3 different content angles. To port faithfully we read the Python source
and emit a TypeScript module with the same data.

Output: src/sites/<domain>/content.ts

Usage:
    python3 scripts/extract-content.py londonhvacpros.ca
    python3 scripts/extract-content.py --all
"""
import ast
import json
import sys
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NETWORK = ROOT.parent / "hvac-network" / "sites"

PILOTS = [
    "londonheatingcooling.ca",
    "londonhvacpros.ca",
    "londonacrepair.ca",
]


def py_to_ts(value, indent=0):
    """Convert a Python literal (parsed by ast.literal_eval) into a TS literal."""
    pad = "  " * indent
    inner_pad = "  " * (indent + 1)
    if isinstance(value, str):
        # Use JSON string quoting (handles quotes, escapes, unicode).
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if value is None:
        return "null"
    if isinstance(value, list):
        if not value:
            return "[]"
        items = [py_to_ts(v, indent + 1) for v in value]
        return "[\n" + ",\n".join(inner_pad + i for i in items) + "\n" + pad + "]"
    if isinstance(value, tuple):
        # Tuples become arrays (TS has no tuple literal distinction at emit time).
        return py_to_ts(list(value), indent)
    if isinstance(value, dict):
        if not value:
            return "{}"
        items = []
        for k, v in value.items():
            # Quote the key only if it isn't a valid identifier.
            key = k if re.match(r"^[a-zA-Z_$][a-zA-Z0-9_$]*$", k) else json.dumps(k, ensure_ascii=False)
            items.append(inner_pad + key + ": " + py_to_ts(v, indent + 1) + ",")
        return "{\n" + "\n".join(items) + "\n" + pad + "}"
    raise TypeError(f"Cannot convert {type(value).__name__} to TS")


def extract_assignments(build_pages_path: Path) -> dict:
    """Parse build_pages.py and return the key data structures as Python values."""
    src = build_pages_path.read_text(encoding="utf-8")
    tree = ast.parse(src)
    result = {}
    # First pass: capture simple scalar assignments (WP, TECH_PHOTO) to resolve
    # f-strings in SVC_PHOTO later.
    scalars: dict = {}
    for node in ast.iter_child_nodes(tree):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    name = target.id
                    if name in ("WP", "TECH_PHOTO"):
                        try:
                            scalars[name] = ast.literal_eval(node.value)
                        except (ValueError, SyntaxError):
                            # Maybe an f-string referencing an earlier scalar.
                            try:
                                scalars[name] = _eval_fstring(node.value, scalars)
                            except Exception:
                                pass

    for node in ast.iter_child_nodes(tree):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    name = target.id
                    if name in ("SVC", "BLOG", "REVIEW_POOL", "HOME_SERVICES", "HOME_FAQ", "SVC_PHOTO"):
                        try:
                            value = ast.literal_eval(node.value)
                            result[name] = value
                        except (ValueError, SyntaxError):
                            # Likely contains f-strings (SVC_PHOTO uses f"{WP}/...").
                            try:
                                value = _eval_with_fstrings(node.value, scalars)
                                result[name] = value
                                print(f"OK: evaluated {name} with f-string substitution")
                            except Exception as e:
                                print(f"WARN: could not literal-eval {name}: {e}", file=sys.stderr)
    # BLOG entries set body=None in the list, then prose comes from blog_bodies().
    m = re.search(r"def blog_bodies\(\):\s*return\s*(\{.*?\n\s*\})", src, re.DOTALL)
    if m:
        try:
            bodies = ast.literal_eval(m.group(1))
            if "BLOG" in result and isinstance(result["BLOG"], list):
                for post in result["BLOG"]:
                    slug = post.get("slug")
                    if slug in bodies:
                        post["body"] = bodies[slug]
        except (ValueError, SyntaxError) as e:
            print(f"WARN: could not parse blog_bodies: {e}", file=sys.stderr)
    return result


def _eval_fstring(node, scalars: dict):
    """Evaluate a single ast.JoinedStr (f-string) node using known scalars."""
    if isinstance(node, ast.Constant):
        return node.value
    if isinstance(node, ast.JoinedStr):
        parts = []
        for v in node.values:
            if isinstance(v, ast.Constant):
                parts.append(v.value)
            elif isinstance(v, ast.FormattedValue):
                parts.append(str(_eval_node(v.value, scalars)))
        return "".join(parts)
    return _eval_node(node, scalars)


def _eval_node(node, scalars: dict):
    """Evaluate a single expression node using known scalars (Name lookup)."""
    if isinstance(node, ast.Constant):
        return node.value
    if isinstance(node, ast.Name):
        if node.id in scalars:
            return scalars[node.id]
        # Fall back: treat undefined Name as its own text (best effort)
        return node.id
    if isinstance(node, ast.JoinedStr):
        return _eval_fstring(node, scalars)
    if isinstance(node, ast.FormattedValue):
        return _eval_node(node.value, scalars)
    return ast.literal_eval(node)


def _eval_with_fstrings(node, scalars: dict):
    """Walk a container node, substituting f-strings with their evaluated values."""
    if isinstance(node, ast.Dict):
        result = {}
        for k_node, v_node in zip(node.keys, node.values):
            k = _eval_with_fstrings(k_node, scalars)
            v = _eval_with_fstrings(v_node, scalars)
            result[k] = v
        return result
    if isinstance(node, ast.List):
        return [_eval_with_fstrings(e, scalars) for e in node.elts]
    if isinstance(node, ast.Tuple):
        return tuple(_eval_with_fstrings(e, scalars) for e in node.elts)
    if isinstance(node, ast.JoinedStr):
        return _eval_fstring(node, scalars)
    if isinstance(node, ast.FormattedValue):
        return _eval_node(node.value, scalars)
    if isinstance(node, ast.Name):
        return scalars.get(node.id, node.id)
    # Fall back to literal_eval for plain constants.
    return ast.literal_eval(node)


def emit_content_ts(domain: str, data: dict) -> str:
    """Build the content.ts file body."""
    lines = [
        f"// Per-site content for {domain}",
        f"// AUTO-GENERATED by scripts/extract-content.py from",
        f"// hvac-network/sites/{domain}/build_pages.py. Do not edit by hand;",
        f"// re-run the extractor after upstream content changes.",
        "",
    ]

    # SVC: dict of slug -> service detail. Convert tuples in 'features' and 'rev'.
    if "SVC" in data:
        lines.append("export const SVC = " + py_to_ts(data["SVC"]) + ";")
        lines.append("")

    # BLOG
    if "BLOG" in data:
        lines.append("export const BLOG = " + py_to_ts(data["BLOG"]) + ";")
        lines.append("")

    # REVIEW_POOL (list of tuples)
    if "REVIEW_POOL" in data:
        lines.append("export const REVIEW_POOL = " + py_to_ts(data["REVIEW_POOL"]) + ";")
        lines.append("")

    # HOME_SERVICES (list of tuples)
    if "HOME_SERVICES" in data:
        lines.append("export const HOME_SERVICES = " + py_to_ts(data["HOME_SERVICES"]) + ";")
        lines.append("")

    # SVC_PHOTO (dict of slug -> [src, alt, w, h])
    if "SVC_PHOTO" in data:
        lines.append("export const SVC_PHOTO = " + py_to_ts(data["SVC_PHOTO"]) + ";")
        lines.append("")

    # HOME_FAQ (list of tuples). Some entries contain Python f-strings (calls), so
    # they can't be literal-evaled. Skip those — index.astro interpolates the last
    # FAQ from the site config as a fallback.
    if "HOME_FAQ" in data:
        clean = []
        for item in data["HOME_FAQ"]:
            if isinstance(item, (tuple, list)) and all(isinstance(x, str) for x in item):
                clean.append(list(item))
            # else: skip the interpolated FAQ (will be filled at render time)
        lines.append("export const HOME_FAQ = " + py_to_ts(clean) + ";")
        lines.append("")

    return "\n".join(lines)


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: extract-content.py <domain> | --all")
        sys.exit(1)
    arg = sys.argv[1]
    domains = PILOTS if arg == "--all" else [arg]
    for d in domains:
        bp = NETWORK / d / "build_pages.py"
        if not bp.exists():
            print(f"SKIP {d}: {bp} not found")
            continue
        data = extract_assignments(bp)
        ts = emit_content_ts(d, data)
        out_dir = ROOT / "src" / "sites" / d
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "content.ts"
        out_path.write_text(ts + "\n", encoding="utf-8")
        print(
            f"OK  {d}: "
            f"{len(data.get('SVC', {}))} services, "
            f"{len(data.get('BLOG', []))} blog posts, "
            f"{len(data.get('REVIEW_POOL', []))} reviews -> "
            f"{out_path.relative_to(ROOT)}"
        )


if __name__ == "__main__":
    main()
