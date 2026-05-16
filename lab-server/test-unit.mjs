// Unit tests for the pure, bug-prone helpers behind the test runner.
// Run with: node --test test-unit.mjs   (no deps — uses node:test)

import { test } from "node:test";
import assert from "node:assert/strict";
import { pyRepr, substituteParam, safeWorkdirFilename } from "./lib/verify.js";

test("pyRepr: primitives", () => {
  assert.equal(pyRepr("hi"), '"hi"');
  assert.equal(pyRepr(42), "42");
  assert.equal(pyRepr(3.5), "3.5");
  assert.equal(pyRepr(true), "True");
  assert.equal(pyRepr(false), "False");
  assert.equal(pyRepr(null), "None");
  assert.equal(pyRepr(undefined), "None");
});

test("pyRepr: strings are quoted/escaped (cheat-safety)", () => {
  assert.equal(pyRepr('a"b'), '"a\\"b"');
  assert.equal(pyRepr("new\nline"), '"new\\nline"');
});

test("pyRepr: lists and dicts", () => {
  assert.equal(pyRepr([1, 2, 3]), "[1, 2, 3]");
  assert.equal(pyRepr(["a", "b"]), '["a", "b"]');
  assert.equal(pyRepr({ name: "x", n: 1 }), '{"name": "x", "n": 1}');
});

// Documents a known caveat (see CLAUDE.md §4): JS can't tell 5.0 from 5, so a
// "whole-number float" input serializes as an int literal. Lab authors must use
// e.g. 5.5 instead of 5.0 — this test pins that behavior so it can't regress
// silently.
test("pyRepr: whole-number float collapses to int (known caveat)", () => {
  assert.equal(pyRepr(5.0), "5");
});

test("substituteParam: rewrites an existing assignment line", () => {
  const code = 'n = 15\nprint(n)';
  assert.equal(substituteParam(code, "n", 0), 'n = 0\nprint(n)');
});

test("substituteParam: preserves indentation context, only the assignment", () => {
  const code = 'url = "http://x/"\nr = get(url)';
  assert.equal(
    substituteParam(code, "url", "http://192.168.58.101/about"),
    'url = "http://192.168.58.101/about"\nr = get(url)'
  );
});

test("substituteParam: prepends when no assignment present", () => {
  const out = substituteParam('print(n)', "n", 7);
  assert.equal(out, 'n = 7\nprint(n)');
});

test("substituteParam: multi-variable (array paramName)", () => {
  const code = 'a = 1\nb = 2\nprint(a + b)';
  const out = substituteParam(code, ["a", "b"], { a: 10, b: 3 });
  assert.equal(out, 'a = 10\nb = 3\nprint(a + b)');
});

test("substituteParam: no-op when input is undefined", () => {
  assert.equal(substituteParam('n = 1', "n", undefined), 'n = 1');
});

test("safeWorkdirFilename: accepts only simple basenames", () => {
  assert.equal(safeWorkdirFilename("solution.py"), "solution.py");
  assert.equal(safeWorkdirFilename("server_test-1.py"), "server_test-1.py");
  assert.throws(() => safeWorkdirFilename("../secret.py"), /Invalid filename/);
  assert.throws(() => safeWorkdirFilename("a/b.py"), /Invalid filename/);
  assert.throws(() => safeWorkdirFilename(";touch nope"), /Invalid filename/);
  assert.throws(() => safeWorkdirFilename(".env"), /Invalid filename/);
});
