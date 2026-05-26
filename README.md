# Signaturers — signaturers.keyra.ie

Ciright-integrated **Keyra data-representation** application for signatures, signed documents, document-role visibility, and personal signature vault access across the global Keyra / Ciright world structure.

This is **not** a document creation or signing flow. It aggregates, indexes, represents, and navigates documents and signatures connected to a verified Keyra UID across authorized worlds.

## Features

- Unified document/signature feed with UID + multi-EID aggregation
- Role categories: Created, Signed, Lead, Support, Management, Associated, Imported vault
- World filter, role/status/date filters, full-text search
- Cursor-based pagination with infinite scroll
- Secure S3 storage for imports; preview via expiring signed tokens (no raw S3 keys in UI)
- Audit trail per document
- Mock demo data in development (`SIGNATURERS_USE_MOCK_DATA=true`)

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/signaturers/feed` | Paginated unified feed |
| GET | `/api/signaturers/worlds` | Worlds + EIDs for UID |
| GET | `/api/signaturers/document/:id` | Document detail (authorized) |
| GET | `/api/signaturers/document/:id/preview` | Short-lived preview URL |
| GET | `/api/signaturers/document/:id/download` | Authorized download URL |
| POST | `/api/signaturers/import` | Import external signed document |
| GET | `/api/signaturers/audit/:id` | User-visible audit events |

Full spec mapping: **`PROMPT_COMPLIANCE.md`**

## Development (100% local prompt run)

`.env.local` enables dev auth bypass + mock vault data:

```bash
npm install
npm run dev    # http://localhost:3060
npm test       # unit tests
```

Open [http://localhost:3060/vault](http://localhost:3060/vault) for the full experience without external services.

For production: set `NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL`, `KEYRA_IDENTITY_CORE_URL`, `SIGNATURERS_INDEX_URL`; set `SIGNATURERS_DEV_BYPASS_AUTH=false`.

## Upstream integration

| Variable | Purpose |
|----------|---------|
| `KEYRA_IDENTITY_CORE_URL` | Resolve UID → EID/world mappings |
| `SIGNATURERS_INDEX_URL` | Native document/signature index queries |
| `S3_*` / `AWS_*` | Vault object storage for imports |

## Engineering

- Aggregation: `src/lib/aggregation/feedAggregator.ts`
- Authorization: `src/lib/store/signatureIndex.ts`
- Theme: `src/styles/keyra-theme.css` (from `tools/keyra-theme`)
