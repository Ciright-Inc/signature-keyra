# Signaturers — 100% Prompt Compliance Checklist

Application: **signaturers.keyra.ie** (`signature-keyra/`)

## Primary purpose (8 visibility types)

| # | Requirement | Implementation |
|---|-------------|----------------|
| 1 | Signatures inside Keyra world | `querySignatureIndex` + mock/upstream |
| 2 | Documents signed in other worlds | Cross-world index query by UID/EID |
| 3 | Documents created | `created_by_uid` / role `created_by_me` |
| 4 | Lead | `lead_uid` / `lead` |
| 5 | Support | `support_uid` / `support` |
| 6 | Management | `management_uid` / `management` |
| 7 | Associated | `associated_uid_list` / `associated` |
| 8 | Imported vault | `POST /api/signaturers/import` + `imported_flag` |

## Core identity query structure

All fields on `DocumentSignatureRecord` in `src/lib/types/documentSignature.ts`. Feed exposes normalized cards with world context and source-world `person_display_name_from_world`.

## Key query logic (9 steps)

`src/lib/identity/resolveIdentity.ts` + `src/lib/store/signatureIndex.ts` + `src/lib/aggregation/feedAggregator.ts`

1. Resolve UID from session / identity core  
2. Fetch EID mappings  
3. Map EIDs → worlds  
4. Query index by UID/EID/role (upstream body includes all role dimensions)  
5. Normalize + deduplicate  
6. Preserve world context  
7. Source-world display names unchanged  
8. S3 preview/download only after authorization  
9. Cursor pagination + infinite scroll  

## Role categories (UI)

`RoleCategoryTabs` + filter — all 8 categories including **All Documents**.

## Landing hero

Exact spec copy in `SignaturersHero.tsx`. CTAs: View My Signatures, Import Signed Document, Browse Worlds, Open Vault.

## UX

| Feature | Status |
|---------|--------|
| World filter | `VaultFilters` |
| Role filter | Tabs + select |
| Date filter | From / to |
| Signature status filter | ✓ |
| Document status filter | ✓ |
| Search | Debounced `q` |
| Infinite scroll | IntersectionObserver + cursor |
| Secure preview | JWT + `/api/signaturers/file` |
| Download (authorized) | `GET .../download` + role gate |
| Audit trail | `GET .../audit` + panel |
| World badge | ✓ |
| Role badges | Multi-role dedup |
| Imported badge | ✓ |

## Import

All fields in `ImportDocumentForm` + `POST /api/signaturers/import` (UID, optional EID, S3, checksum, audit).

## Security

- UID auth: `requireAuthenticatedUid`  
- EID/world: `documentPermissions.ts` + `authorizedRecord`  
- No S3 keys in API JSON responses  
- Signed URLs expire 5 minutes  
- Checksum on upload + verification on read when metadata present  
- Audit: `src/lib/audit/auditLog.ts`  

## API endpoints

| Endpoint | File |
|----------|------|
| `GET /api/signaturers/feed` | `feed/route.ts` |
| `GET /api/signaturers/worlds` | `worlds/route.ts` |
| `GET /api/signaturers/document/:id` | `document/[document_id]/route.ts` |
| `GET /api/signaturers/document/:id/preview` | `.../preview/route.ts` |
| `GET /api/signaturers/document/:id/download` | `.../download/route.ts` |
| `POST /api/signaturers/import` | `import/route.ts` |
| `GET /api/signaturers/audit/:id` | `audit/[document_id]/route.ts` |

## Deduplication

`deduplicateFeedRecords` — one card per `world_id::document_id`, multiple role badges (see unit test).

## Out of scope (per prompt)

- Document signing / creation flows — **not implemented**

## Local 100% run (no auth backend)

```env
SIGNATURERS_DEV_BYPASS_AUTH=true
SIGNATURERS_USE_MOCK_DATA=true
```

`npm run dev` → http://localhost:3060/vault
