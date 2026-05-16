#!/usr/bin/env python3
"""PyForge practice target.

A tiny, fully deterministic HTTP server (stdlib only, no deps) that the lab
containers practice against at http://192.168.58.101/. It replaces the old
static-nginx target so that:

  * POST /echo really reflects the posted `user` field (real lab, not a stub).
  * GET /status/<code> returns that exact status (enables hidden test cases
    that vary the request instead of a single fixed response).
  * The Server header is a fixed string so header labs are stable.

Everything here is intentionally constant — the labs assert on exact bytes.
"""
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

FIXTURES = os.path.join(os.path.dirname(__file__), "fixtures")

PAGES = {
    "/": os.path.join(FIXTURES, "index.html"),
    "/about": os.path.join(FIXTURES, "about", "index.html"),
    "/contact": os.path.join(FIXTURES, "contact", "index.html"),
}


class Target(BaseHTTPRequestHandler):
    # Fixed identity so `r.headers["Server"]` is deterministic.
    server_version = "PyForgeHTTP/1.0"
    sys_version = ""
    protocol_version = "HTTP/1.1"

    # Default version_string() joins server_version + " " + sys_version, which
    # leaves a trailing space. Labs assert the exact header, so pin it.
    def version_string(self):
        return self.server_version

    def _send(self, code, body=b"", ctype="text/html; charset=utf-8"):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path in PAGES:
            with open(PAGES[path], "rb") as f:
                return self._send(200, f.read())
        if path.startswith("/status/"):
            try:
                code = int(path.split("/")[2])
            except (ValueError, IndexError):
                code = 400
            return self._send(code, f"status {code}\n".encode())
        return self._send(404, b"not found\n", "text/plain; charset=utf-8")

    def do_POST(self):
        if urlparse(self.path).path == "/echo":
            length = int(self.headers.get("Content-Length", 0) or 0)
            raw = self.rfile.read(length).decode("utf-8", "replace") if length else ""
            fields = parse_qs(raw)
            user = fields.get("user", [""])[0]
            return self._send(200, f"user={user}\n".encode(),
                              "text/plain; charset=utf-8")
        return self._send(404, b"not found\n", "text/plain; charset=utf-8")

    def log_message(self, *args):  # quiet — keep container logs clean
        pass


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 80), Target).serve_forever()
