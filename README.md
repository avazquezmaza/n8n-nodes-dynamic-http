# n8n-nodes-dynamic-http

A custom n8n community node for making HTTP requests with **per-item dynamic credential selection**. Each item in a workflow batch can use a different API credential, making it ideal for multi-tenant architectures.

---

## Prerequisites

### 1. n8n with custom nodes support

- n8n **v0.187+** (custom community nodes enabled by default)
- Terminal or SSH access to the server or Docker container running n8n (required for GitHub installation)

### 2. An `HTTP Header Auth` credential configured in n8n

This node reads credentials of type **HTTP Header Auth** from n8n's credential store. Create one for each API you want to call:

1. In n8n, go to **Settings → Credentials → Add Credential**
2. Choose **HTTP Header Auth**
3. Fill in the fields:

| Field | What to put | Example |
|---|---|---|
| **Name** (credential display name) | A unique label — this is what you pass to `credentialName` | `acme-api-key` |
| **Name** (header field) | The HTTP header the API expects | `Authorization` |
| **Value** (header field) | Your secret API token | `eyJhbGc...` |

> If the header name is `Authorization`, the node automatically prepends `Bearer ` to the value.
> For any other header name it sends the value as-is.

> **Security**: Credential values are **never written to logs**. If logging is enabled, all tokens, Bearer values, and secrets are automatically masked as `****`.

### 3. Workflow item structure

Each item processed by the node needs at minimum:

```json
{
  "credentialName": "acme-api-key",
  "url": "https://api.example.com/endpoint",
  "company": "Acme Corp"
}
```

| Field | Required | Description |
|---|---|---|
| `credentialName` | ✅ | Name of the n8n `HTTP Header Auth` credential to use |
| `url` | ✅ | Target URL (must be a public HTTPS/HTTP address) |
| `company` | ❌ | Optional label — used as the key for the response output |

---

## Installation

Run this command inside your n8n server or Docker container. npm will clone the repository and compile the TypeScript automatically via the `prepare` script.

### Docker (single container)

```bash
docker exec -it n8n sh
npm install git+https://github.com/avazquezmaza/n8n-nodes-dynamic-http.git
exit
docker restart n8n
```

### Docker Compose with main + worker containers

If you run separate `n8n-main` and `n8n-worker` containers, you must install the node in **both** (workers execute nodes too):

```bash
# Install in main
docker exec -it -u root n8n-main sh -c \
  "cd /home/node/.n8n && mkdir -p nodes && cd nodes && npm install git+https://github.com/avazquezmaza/n8n-nodes-dynamic-http.git"

# Install in worker
docker exec -it -u root n8n-worker sh -c \
  "cd /home/node/.n8n && mkdir -p nodes && cd nodes && npm install git+https://github.com/avazquezmaza/n8n-nodes-dynamic-http.git"

# Restart both
docker restart n8n-main n8n-worker
```

> **Persistence**: If your Docker Compose does not mount a volume for the `.n8n` directory, the installation will be lost when containers are recreated. The recommended solution is to add a shared volume in `docker-compose.yml` pointing to `/home/node/.n8n` so the `nodes/` folder survives restarts and redeployments.

### Bare-metal / local

```bash
npm install git+https://github.com/avazquezmaza/n8n-nodes-dynamic-http.git
systemctl restart n8n   # or: pm2 restart n8n
```

The node will appear in the node picker as **"HTTP Request (Dynamic Credentials)"**.

### Update

```bash
npm install git+https://github.com/avazquezmaza/n8n-nodes-dynamic-http.git --force
# Then restart n8n
```

---

## Usage

Configure the node with expressions so each item drives its own values:

| Node field | Recommended value |
|---|---|
| Credential Name | `={{ $json.credentialName }}` |
| URL | `={{ $json.url }}` |
| Method | `GET` (or `={{ $json.method }}`) |
| Body | `={{ $json.body }}` (POST/PUT/PATCH only) |

The response is returned under the `company` key from the item (falls back to `"N/A"`).

---

## Features

- Per-item dynamic credential selection — each item can use a different API key
- All HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- In-memory credential cache with TTL (2 min) to avoid repeated lookups
- Exponential backoff retry with jitter
- Sanitized logging — credentials, tokens, and API keys are **always masked**
- SSRF protection: blocks private IPs, loopback (127.0.0.0/8), IPv6 private ranges, cloud metadata endpoints
- Input validation: credential name format, body size (max 10 MB), timeout (max 10 min)
- HTTP errors are sanitized before reporting — auth headers are stripped and never appear in n8n's execution journal

---

## Security

| Protection | How |
|---|---|
| Secrets in logs | All `console.log` calls go through `sanitizeLogMessage` + `sanitizeData`. Tokens, Bearer values, API keys, and long opaque strings are replaced with `****`. |
| Secrets in error reports | HTTP errors are stripped of request config (including headers) before being passed to n8n's error reporter. Auth tokens never appear in the execution journal. |
| SSRF | `isValidUrl()` blocks localhost, 127.0.0.0/8, RFC 1918 ranges, 169.254.x (cloud metadata), 100.64.0.0/10 (carrier-grade NAT), IPv6 loopback/link-local/unique-local, IPv4-mapped IPv6. |
| Credential name input | Must be 1–255 chars, `[a-zA-Z0-9_-]` only |
| Body size | Validated as `Buffer.byteLength(body, 'utf8')` (UTF-8 bytes, not JS string length) |
| Timeout | Capped at 10 minutes (600 000 ms) |

---

## Local Development

```bash
git clone https://github.com/avazquezmaza/n8n-nodes-dynamic-http.git
cd n8n-nodes-dynamic-http
npm install
npm run build      # compile TypeScript
npm run dev        # watch mode
npm run lint
npm run lintfix
npx tsc --noEmit   # type-check without emitting
npm audit          # dependency vulnerability check
```

---

## License

MIT
