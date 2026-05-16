#!/usr/bin/env python3
"""
AST gate for PyForge labs.

Receives user source on stdin and a JSON-encoded requirements dict in argv[1].
Exits 0 if all requirements are satisfied; otherwise writes a human message
to stderr and exits non-zero.

Requirements schema:
  {
    "calls":     ["print", "socket.socket", "requests.get"],   # at least one call to each
    "attrs":     ["connect", "send", "bind"],                  # at least one .attr access
    "stmts":     ["For", "If", "Try", "FunctionDef"],          # at least one node of each type
    "defs":      ["greet", "square"],                          # function names that must be defined
    "forbidden": ["__import__", "exec", "eval"],               # must NOT call any of these
    "minLines":  2,                                            # min non-empty source lines
  }

Anything missing → exit code 1 with a diagnostic.
"""
import ast
import json
import sys


def call_name(node: ast.Call) -> str:
    """Best-effort dotted name for a Call node's func."""
    f = node.func
    parts = []
    while isinstance(f, ast.Attribute):
        parts.append(f.attr)
        f = f.value
    if isinstance(f, ast.Name):
        parts.append(f.id)
    return ".".join(reversed(parts))


def main() -> int:
    src = sys.stdin.read()
    try:
        req = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    except Exception as e:
        print(f"AST gate: bad requirements JSON: {e}", file=sys.stderr)
        return 2

    try:
        tree = ast.parse(src)
    except SyntaxError as e:
        print(f"SyntaxError: {e.msg} (line {e.lineno})", file=sys.stderr)
        return 1

    # Collect facts
    all_nodes = list(ast.walk(tree))
    call_nodes = [n for n in all_nodes if isinstance(n, ast.Call)]
    call_names = {call_name(c) for c in call_nodes}
    attr_names = {n.attr for n in all_nodes if isinstance(n, ast.Attribute)}
    func_defs = {n.name for n in all_nodes if isinstance(n, ast.FunctionDef)}
    stmt_types = {type(n).__name__ for n in all_nodes}

    failures = []

    # calls — every required name must appear at least once
    for name in req.get("calls", []):
        if name not in call_names and not any(c.endswith("." + name) or c == name for c in call_names):
            failures.append(f"missing call to {name}()")

    # attrs — every required attribute access must appear
    for attr in req.get("attrs", []):
        if attr not in attr_names:
            failures.append(f"missing attribute access .{attr}")

    # stmts — every required statement type must appear
    for stmt in req.get("stmts", []):
        if stmt not in stmt_types:
            label = {
                "For": "for loop",
                "While": "while loop",
                "If": "if/elif/else block",
                "Try": "try/except block",
                "FunctionDef": "function definition",
                "Return": "return statement",
                "Import": "import statement",
                "ImportFrom": "from … import",
                "ClassDef": "class definition",
                "ListComp": "list comprehension",
                "DictComp": "dict comprehension",
                "Subscript": "slicing or indexing",
                "BinOp": "arithmetic operation",
            }.get(stmt, stmt)
            failures.append(f"missing {label}")

    # defs — every named function must be defined
    for fname in req.get("defs", []):
        if fname not in func_defs:
            failures.append(f"function {fname}() must be defined")

    # forbidden — none of these may be called
    for name in req.get("forbidden", []):
        if name in call_names or any(c.endswith("." + name) for c in call_names):
            failures.append(f"forbidden call: {name}()")

    # minLines
    min_lines = req.get("minLines", 0)
    if min_lines:
        non_empty = sum(1 for line in src.splitlines() if line.strip())
        if non_empty < min_lines:
            failures.append(f"too short: {non_empty} non-empty lines, need at least {min_lines}")

    if failures:
        print("Your code is missing required Python constructs:", file=sys.stderr)
        for f in failures:
            print(f"  • {f}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
