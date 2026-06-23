# 🛠️ Hostinger Management Toolkit

A stdlib-only Python CLI (`hostinger.py`) to manage **domains, DNS records and
VPS instances** for the Little Oummah project via the
[Hostinger Developer API](https://developers.hostinger.com).

Everything is ready to run. Two things must be configured **by the account
owner** before it can reach Hostinger — see "Enabling access" below.

---

## Enabling access (one-time, owner only)

Claude cannot grant itself access. Both steps below happen outside the chat.

### 1. Open the network so the environment can reach Hostinger
By default this Claude Code environment blocks outbound traffic to
`developers.hostinger.com` (you will see `Host not in allowlist`). Recreate or
reconfigure the environment with a **network policy that allows**:

- `developers.hostinger.com`
- `api.hostinger.com`

Docs: https://code.claude.com/docs/en/claude-code-on-the-web

### 2. Provide the API token as a secret (never paste it in chat)
1. In **hPanel → Account → API**, create a token. Grant only the scopes you
   need (DNS / Domains / VPS) — avoid full account access where possible.
2. Add it to the environment as a secret / environment variable named:

   ```
   HOSTINGER_API_TOKEN
   ```

Once both are done, the commands below work immediately.

---

## Usage

```bash
# Verify connectivity + authentication end-to-end
python3 tools/hostinger.py check

# Domains
python3 tools/hostinger.py domains list
python3 tools/hostinger.py domains availability little-oummah --tlds com nl be fr de

# DNS
python3 tools/hostinger.py dns get example.com
python3 tools/hostinger.py dns set example.com A   @   185.185.185.185 --ttl 3600
python3 tools/hostinger.py dns set example.com CNAME www example.com
python3 tools/hostinger.py dns set example.com TXT @ "v=spf1 include:_spf.hostinger.com ~all"
python3 tools/hostinger.py dns delete example.com A www

# VPS
python3 tools/hostinger.py vps list

# Escape hatch: call any endpoint directly (adapts if a path moves)
python3 tools/hostinger.py raw GET /domains/v1/portfolio
python3 tools/hostinger.py raw POST /dns/v1/zones/example.com --body '{"overwrite":true,"zone":[...]}'
```

## Diagnostics
The CLI tells you exactly what is wrong instead of failing silently:

| Symptom | Meaning |
|---------|---------|
| `No API token found` | `HOSTINGER_API_TOKEN` is not set (step 2). |
| `Blocked by the environment network policy` | The egress allowlist blocks Hostinger (step 1). |
| `HTTP 401` | Token is set but invalid/expired. |
| `HTTP 403` (from Hostinger) | Token lacks the required scope. |

## Security notes
- The token is read **only** from the environment — it is never written to
  disk or committed.
- Prefer a scoped token over full access; a mistake then can't affect your
  whole account.
- The Hostinger API surface evolves. Built-in commands cover the common cases;
  use `raw` for anything else without changing code.
