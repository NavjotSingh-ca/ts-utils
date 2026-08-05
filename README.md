# ts-utils

A small collection of battle-tested TypeScript utilities extracted from a production receipt-management application. Zero dependencies beyond the obvious ones, fully typed, unit-tested.

## Install

```bash
npm install ts-utils
```

Requires Node.js >= 18. TypeScript declarations are bundled.

## Utilities

### Hashing (`src/hash.ts`)

Async SHA-256 helpers for content deduplication and integrity checks.

```ts
import { generateDuplicateHash, generateIntegrityHash } from 'ts-utils';

// Deterministic, normalized hash for detecting duplicate receipts
const dupHash = await generateDuplicateHash('WALMART', '2026-06-01', '42.50');
// same result as generateDuplicateHash('walmart', '2026-06-01', 42.5)

// Hash raw file bytes
const hash = await generateIntegrityHash(await file.arrayBuffer());
```

| Function | Description |
|----------|-------------|
| `generateSHA256(input: string)` | SHA-256 hex digest of a string |
| `generateDuplicateHash(vendor, date, total)` | Normalized hash (lowercase vendor, 2-decimal total) for deduplication |
| `generateIntegrityHash(buffer)` | SHA-256 of `ArrayBuffer` / `Uint8Array` — throws on empty input |
| `generateAuditEventHash(prevHash, event)` | Chained hash for tamper-evident audit logs — throws on malformed previous hash |
| `verifyHashFormat(hash)` | Returns `true` if the string is a valid 64-char hex SHA-256 hash |

### HTML escaping (`src/html-escape.ts`)

```ts
import { escapeHtml } from 'ts-utils';

escapeHtml('<script>alert("x")</script>'); // '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
```

Escapes `& < > " '`. `null`/`undefined` return `''`.

### Sanitization (`src/sanitization.ts`)

Defense-in-depth string sanitizers — never a substitute for server-side validation.

| Function | What it does |
|----------|--------------|
| `sanitizeString(input)` | Strips `<script>`, event handlers (`onerror=`), `javascript:` URIs, `<iframe>/<object>/<embed>/<svg>/<link>/<meta>`; trims; truncates to 5000 chars |
| `sanitizeFilename(name)` | Blocks path traversal (`../`), replaces illegal characters, collapses runs, truncates to 255 chars |
| `sanitizeCurrency(value)` | Parses to a rounded, non-negative number with 2 decimal places; `null`/invalid → `0` |
| `isValidDateString(value)` | `true` only for strict `YYYY-MM-DD` |
| `sanitizeBase64Image(input)` | Validates a base64 image (data URI or raw) — checks magic bytes (PNG/JPEG/WebP/GIF), size cap, and charset. Returns `{ valid: boolean, error?: string }` |

### Exact-cent currency math (`src/finance-utils.ts`)

Money is integers, not floats.

```ts
import { toCents, toDinero, isMathMismatch, formatDineroIntl } from 'ts-utils';

toCents(1.005); // 101 — floating-point-safe

const subtotal = toDinero(100);
const taxes = toDinero(13);

isMathMismatch(10.11, 1.31, 0, 11.41); // true — off by one cent
isMathMismatch(10.11, 1.31, 0, 11.42); // false

formatDineroIntl(1234.56); // '$1,234.56' (CAD, en-CA)
formatDineroIntl(1234.56, 'EUR', 'de-DE'); // '1.234,56 €'
```

| Function | Description |
|----------|-------------|
| `toCents(value)` | Dollars → integer cents with epsilon correction for float errors |
| `toDinero(value)` | Value → integer-cent [dinero.js](https://dinerojs.com/) object (defaults to `$0` for `null`/invalid) |
| `isMathMismatch(subtotal, tax, discount, total)` | Exact cent-level check that the line items sum to the total |
| `formatDineroIntl(value, currency?, locale?)` | Locale-aware currency formatting (defaults CAD / `en-CA`; invalid input → `$0.00`) |

### className merging (`src/cn.ts`)

```ts
import { cn } from 'ts-utils';

cn('p-2', isActive && 'p-4', { 'text-red-500': isError }); // Tailwind conflicts: last wins
```

`clsx` + `tailwind-merge`, same API as the popular `cn()` helper from shadcn/ui.

## Development

```bash
npm install
npm test        # vitest
npm run typecheck
npm run build   # emits type declarations to dist/
```

## License

MIT — Copyright (c) 2026 Navjot Singh.
