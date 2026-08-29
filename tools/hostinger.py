#!/usr/bin/env python3
"""
Hostinger management CLI for the Little Oummah webshop project.

A dependency-free (stdlib-only) wrapper around the Hostinger Developer API
(https://developers.hostinger.com). It is designed to manage domains, DNS
records and VPS instances.

Authentication
--------------
Set a token in the environment (NEVER hard-code it, NEVER paste it in chat):

    export HOSTINGER_API_TOKEN="xxxxxxxx"

Optionally override the API base URL (useful for testing):

    export HOSTINGER_API_BASE="https://developers.hostinger.com/api"

Quick start
-----------
    python3 tools/hostinger.py check          # connectivity + auth test
    python3 tools/hostinger.py domains list    # list your domains
    python3 tools/hostinger.py dns get example.com
    python3 tools/hostinger.py dns set example.com A @ 185.185.185.185 --ttl 3600
    python3 tools/hostinger.py dns delete example.com A www
    python3 tools/hostinger.py vps list
    python3 tools/hostinger.py raw GET /domains/v1/portfolio   # call any endpoint

Notes
-----
The Hostinger API surface changes over time. Every command ultimately routes
through `api_request`, and the generic `raw` command lets you call any endpoint
directly, so this tool can adapt without code changes if a path moves.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

DEFAULT_BASE = os.environ.get(
    "HOSTINGER_API_BASE", "https://developers.hostinger.com/api"
).rstrip("/")
TOKEN_ENV = "HOSTINGER_API_TOKEN"


class HostingerError(Exception):
    """Raised for any non-recoverable problem talking to the API."""


def _token() -> str:
    token = os.environ.get(TOKEN_ENV, "").strip()
    if not token:
        raise HostingerError(
            f"No API token found. Set it with:\n"
            f'    export {TOKEN_ENV}="<your-hostinger-token>"\n'
            f"Create one in hPanel -> Account -> API."
        )
    return token


def api_request(method: str, path: str, body: dict | None = None) -> dict | list | None:
    """Perform an authenticated request and return parsed JSON (or None)."""
    url = path if path.startswith("http") else f"{DEFAULT_BASE}/{path.lstrip('/')}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method.upper())
    req.add_header("Authorization", f"Bearer {_token()}")
    req.add_header("Accept", "application/json")
    if data is not None:
        req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode().strip()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace").strip()
        # Distinguish the Claude Code egress proxy block from a real API error.
        if exc.code == 403 and (
            "host_not_allowed" in detail
            or "not in allowlist" in detail
            or exc.headers.get("x-deny-reason")
        ):
            raise HostingerError(
                "Blocked by the environment network policy (egress allowlist), "
                "NOT by Hostinger. The proxy refused to reach the API host.\n"
                "Fix: recreate/reconfigure this Claude Code environment with a "
                "network policy that permits 'developers.hostinger.com'.\n"
                "Docs: https://code.claude.com/docs/en/claude-code-on-the-web"
            ) from exc
        raise HostingerError(f"HTTP {exc.code} on {method} {url}\n{detail}") from exc
    except urllib.error.URLError as exc:
        raise HostingerError(f"Network error reaching {url}: {exc.reason}") from exc


def _print(obj) -> None:
    print(json.dumps(obj, indent=2, ensure_ascii=False))


# --------------------------------------------------------------------------- #
# Commands
# --------------------------------------------------------------------------- #
def cmd_check(_args) -> None:
    """Verify connectivity + authentication end to end."""
    print(f"API base: {DEFAULT_BASE}")
    print(f"Token:    {'set' if os.environ.get(TOKEN_ENV) else 'MISSING'}")
    print("Calling /domains/v1/portfolio ...")
    result = api_request("GET", "/domains/v1/portfolio")
    n = len(result) if isinstance(result, list) else "?"
    print(f"OK - authenticated. {n} domain(s) visible.")


def cmd_domains_list(_args) -> None:
    _print(api_request("GET", "/domains/v1/portfolio"))


def cmd_domains_availability(args) -> None:
    body = {"domain": args.domain, "tlds": args.tlds or ["com", "net", "org"]}
    _print(api_request("POST", "/domains/v1/availability", body))


def cmd_dns_get(args) -> None:
    _print(api_request("GET", f"/dns/v1/zones/{args.domain}"))


def cmd_dns_set(args) -> None:
    """Create/overwrite a single DNS record (name + type) in a zone."""
    record = {
        "name": args.name,
        "type": args.type.upper(),
        "ttl": args.ttl,
        "records": [{"content": args.value}],
    }
    body = {"overwrite": True, "zone": [record]}
    _print(api_request("PUT", f"/dns/v1/zones/{args.domain}", body))


def cmd_dns_delete(args) -> None:
    body = {"filters": [{"name": args.name, "type": args.type.upper()}]}
    _print(api_request("DELETE", f"/dns/v1/zones/{args.domain}", body))


def cmd_vps_list(_args) -> None:
    _print(api_request("GET", "/vps/v1/virtual-machines"))


def cmd_raw(args) -> None:
    body = json.loads(args.body) if args.body else None
    _print(api_request(args.method, args.path, body))


# --------------------------------------------------------------------------- #
# Argument parsing
# --------------------------------------------------------------------------- #
def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Hostinger management CLI")
    sub = p.add_subparsers(dest="command", required=True)

    sub.add_parser("check", help="connectivity + auth test").set_defaults(func=cmd_check)

    domains = sub.add_parser("domains", help="domain management").add_subparsers(
        dest="sub", required=True
    )
    domains.add_parser("list", help="list owned domains").set_defaults(
        func=cmd_domains_list
    )
    avail = domains.add_parser("availability", help="check domain availability")
    avail.add_argument("domain", help="base name, e.g. little-oummah")
    avail.add_argument("--tlds", nargs="*", help="TLDs to check (default com net org)")
    avail.set_defaults(func=cmd_domains_availability)

    dns = sub.add_parser("dns", help="DNS record management").add_subparsers(
        dest="sub", required=True
    )
    g = dns.add_parser("get", help="show all records for a zone")
    g.add_argument("domain")
    g.set_defaults(func=cmd_dns_get)
    s = dns.add_parser("set", help="create/overwrite a record")
    s.add_argument("domain")
    s.add_argument("type", help="A, AAAA, CNAME, TXT, MX, ...")
    s.add_argument("name", help="record name, e.g. @ or www")
    s.add_argument("value", help="record content / target")
    s.add_argument("--ttl", type=int, default=14400)
    s.set_defaults(func=cmd_dns_set)
    d = dns.add_parser("delete", help="delete a record by name+type")
    d.add_argument("domain")
    d.add_argument("type")
    d.add_argument("name")
    d.set_defaults(func=cmd_dns_delete)

    vps = sub.add_parser("vps", help="VPS management").add_subparsers(
        dest="sub", required=True
    )
    vps.add_parser("list", help="list virtual machines").set_defaults(func=cmd_vps_list)

    raw = sub.add_parser("raw", help="call any endpoint directly")
    raw.add_argument("method", help="GET, POST, PUT, DELETE")
    raw.add_argument("path", help="e.g. /domains/v1/portfolio")
    raw.add_argument("--body", help="JSON string for the request body")
    raw.set_defaults(func=cmd_raw)

    return p


def main(argv: list[str]) -> int:
    args = build_parser().parse_args(argv)
    try:
        args.func(args)
        return 0
    except HostingerError as exc:
        print(f"\n[hostinger] {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
