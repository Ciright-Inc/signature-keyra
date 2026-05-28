# Railway — Signaturers (signaturers.keyra.ie)

## Service setup

1. **New service** → Deploy from GitHub → `Ciright-Inc/signature-keyra` → branch `main`
2. **Root directory:** `/` (repo root; this app is the whole repo)
3. **Custom domain:** `signaturers.keyra.ie` → add in Railway → Settings → Networking
4. **Variables:** paste from `railway.env.example` (see below)
5. Config file `railway.toml` is picked up automatically

## Auth backend (required)

On **simsecure-auth-backend**, add to `CORS_ALLOWED_ORIGINS`:

```text
https://signaturers.keyra.ie
```

Cookie domain should already be `.keyra.ie` for cross-subdomain session.

## Generate secrets

```bash
openssl rand -base64 48
```

Use one value for `KEYRA_SESSION_SECRET` and a second for `SIGNATURERS_PREVIEW_SECRET`.

## Health check

Railway probes `GET /` (see `railway.toml`). Build uses `npm run build`; start uses `PORT` from Railway.

## Without upstream APIs yet

Temporary staging only:

```text
SIGNATURERS_USE_MOCK_DATA=true
```

Do not use mock data in production once identity core and index are live.
