# Project memory — Little Oummah Webshop

This file is read automatically at the start of every Claude Code session in
this repo. It exists so the Hostinger setup never has to be re-explained.

## Owner intent (standing instructions)
- The owner wants Claude to have **maximum capability** to manage their
  **Hostinger** infrastructure: building/managing sites, **DNS settings**
  (add/edit), **domain management**, and **security/hardening**.
- Do NOT re-ask whether Claude has Hostinger access or what the goal is — it is
  recorded here. Just proceed to the work, using the toolkit below.
- Communicate with the owner in **Dutch**.

## How Hostinger access works in this environment
Access depends on TWO things the owner controls (Claude cannot self-enable):

1. **Network policy (egress allowlist).** By default this environment blocks
   outbound traffic to Hostinger. Symptom: HTTP 403 with
   `x-deny-reason: host_not_allowed` / `Host not in allowlist`. This is the
   environment proxy, NOT Hostinger. Fix: recreate/reconfigure the Claude Code
   environment to allow `developers.hostinger.com` and `api.hostinger.com`.
   Docs: https://code.claude.com/docs/en/claude-code-on-the-web
2. **API token secret.** A Hostinger API token (hPanel → Account → API) must be
   set as the environment variable `HOSTINGER_API_TOKEN`. Never paste tokens in
   chat; never commit them.

If a command fails, first run `python3 tools/hostinger.py check` to see which of
the two is missing — the CLI reports it explicitly.

## The toolkit (already built — use it, don't rebuild it)
`tools/hostinger.py` — stdlib-only CLI. Full docs in `tools/README.md`.

```bash
python3 tools/hostinger.py check                       # connectivity + auth
python3 tools/hostinger.py domains list
python3 tools/hostinger.py domains availability little-oummah --tlds com nl be fr de
python3 tools/hostinger.py dns get <domain>
python3 tools/hostinger.py dns set <domain> A @ <ip> --ttl 3600
python3 tools/hostinger.py dns set <domain> CNAME www <domain>
python3 tools/hostinger.py dns delete <domain> A www
python3 tools/hostinger.py vps list
python3 tools/hostinger.py raw GET /domains/v1/portfolio   # any endpoint
```

When the API surface differs from the built-in commands, use `raw` rather than
telling the owner something is unavailable.

## Project context
- Little Oummah = Islamic educational toys store (WordPress + WooCommerce,
  TranslatePress for i18n). Currently in a rebranding / SEO phase, English as
  primary language, expanding into the EU (NL, BE, FR, DE).
- Active development branch: `claude/hostinger-access-LKKxF`.
- Open work tracked in `README.md` (SEO overhaul, EU localization).

## Conventions
- Keep tooling dependency-free (stdlib Python) so it runs on the stock image.
- Secrets come only from the environment, never from files or chat.
- Prefer scoped Hostinger tokens over full-account access.
