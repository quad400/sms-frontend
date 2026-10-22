# Shared: Architecture and Conventions

## 1. Authentication and session

1. `POST /api/session/login` (Next route handler) calls `POST /auth/login`. On success it stores the access and refresh tokens in `httpOnly` cookies and returns only `{ user }`. If the backend returns a 2FA challenge, it returns `{ challenge }` and the UI shows the code screen, which calls `POST /auth/2fa/verify`.
2. `middleware.ts` runs on every request. It reads the cookie, decodes the expiry, and if the access token is within 60 seconds of expiring calls `POST /auth/refresh` and rewrites the cookies. If refresh fails, redirect to `/login?next=<path>`.
3. After login the app calls `GET /auth/me` once on the server and passes the result to the layout through a React context provider. It is re-fetched on window focus.
4. The middleware also does coarse portal gating: `/parent/*` requires `userType = parent`, `/student/*` requires `student`, `/it/*` requires any system permission. Fine-grained checks stay in the UI (`PermissionGate`) and, authoritatively, on the backend.
5. Idle timeout: after the school's configured idle period (setting group `security-policy`) show a 60-second warning dialog, then call `POST /auth/logout`.
6. 2FA enrolment (`POST /auth/2fa/enroll`) is forced on first login if the school policy enforces it. The page blocks all other navigation until confirmed.

## 2. Permission handling

- `usePermissions()` returns `can('fees.invoice.create')`. `<PermissionGate permission="...">` hides UI. Prefer a disabled button with a tooltip when the user would wonder why an action is missing.
- The menu is built from a static config where each item declares the permission needed to see it.
- The UI never checks a role name.
- **Scope is enforced by the backend.** Teachers get empty lists for classes they are not allocated to. The UI must handle a 404 on an out-of-scope id (integer ids are guessable) with the standard "not found or not available to you" page, never a raw error.

## 3. API client

- `lib/api/client.ts` wraps `openapi-fetch`. All calls go through the cookie-authenticated proxy at `/api/proxy/*`.
- Every request carries `X-Request-Id` (a fresh UUID) so support can match a user's problem to a backend log line. The error screen shows the `requestId` from the error body with a copy button.
- **Error shape** is always `{ statusCode, code, message, details, requestId }`. A single `mapError()` turns it into: field errors (400 with `details`), a toast (409 and 422, using `message`), a full-page state (403, 404), or a retry banner (5xx, network).
- Error `code` values drive special handling, for example `INVOICE_ALREADY_PAID`, `LICENSE_READ_ONLY`, `MODULE_NOT_LICENSED`.
- **`LICENSE_READ_ONLY`:** a global banner appears and every mutation button is disabled app-wide. Reads continue.
- **Idempotency:** `lib/api/idempotency.ts` creates a key per user intent (not per click). Payment, checkout and sync forms generate the key when the form mounts and reuse it on retry. Disable submit while pending.
- **Pagination:** list endpoints return `{ data, meta: { page, pageSize, total } }`. `DataTable` keeps `page`, `pageSize`, `sort` and filters in the URL query string so lists are shareable and survive refresh.
- **Ids:** path ids are integers. Ids from `BigInt` tables arrive as strings. Treat all ids as opaque, never do arithmetic on them. Parse path params with Zod `z.coerce.number().int().positive()` and call `notFound()` on failure.
- **Money:** `amountMinor` is an integer. `MoneyText` formats with `Intl.NumberFormat` using the school currency and `minorUnitDigits` from the currency record. Money inputs convert typed decimals to minor units with string math, never floats.

## 4. Lookups

- `GET /lookups` is fetched on the server in the root layout, cached with `unstable_cache` (revalidate hourly, tag `lookups`), and hydrated into a `LookupProvider`.
- Helpers: `lookup('fees.invoiceStatus').byCode('paid')`, `.byId(3)`, and `<StatusBadge lookup="fees.invoiceStatus" id={x} />`. Badge colour comes from a code-to-colour map in `lib/lookups/colours.ts`.
- Selects and filters are populated from the same source. Logic uses `code`, writes use `id`.

## 5. Async jobs (202 responses)

Used by batch invoice generation, promotions, imports, exports, report runs, diagnostics, backups and report-card regeneration.

- The mutation returns `{ jobId, statusUrl }`. `useAsyncJob(statusUrl)` polls every 2 s (backing off to 10 s) until a terminal status.
- `<AsyncJobBanner>` shows progress at the top of the page, survives navigation by keeping active jobs in a small client store, and raises a toast when finished.
- On completion, invalidate the affected queries.

## 6. Files

- Upload: `POST /files` (multipart) from `<FileUploader>` with client-side type and size checks that mirror the backend limits, plus a progress bar. The returned file id is then attached by the owning endpoint.
- Download and view: call `GET /files/:id/download-url` or `GET /documents/:id`, then open the signed URL. Signed URLs expire fast, so never cache them.

## 7. Offline (staff attendance and score entry)

1. The service worker (Serwist) caches the app shell, the staff dashboard, class lists for the teacher's allocated classes, and today's timetable, refreshed whenever online.
2. A Dexie `outbox` table stores pending operations: `{ clientRef, entity, action, payload, clientTimestamp, status }`. `clientRef` is `crypto.randomUUID()` generated when the teacher marks the entry.
3. A sync worker (on `online` events and every 30 s while online) sends pending items as one `POST /sync/batches` with an `Idempotency-Key`. Each result updates its local status: `applied`, `duplicate`, `conflict`, `rejected`.
4. UI: a sync chip in the header (Offline, Syncing 12, All synced, 2 need attention). The attention list shows conflicts from `GET /sync/conflicts` with the server value and the teacher's value. Users with `offline-sync.conflict.resolve` choose `keepServer` or `applyClient` via `POST /sync/conflicts/:id/resolve`. Others see the outcome only.
5. Locked registers and submitted assessments reject offline edits. Show the server reason.
6. Never queue anything else offline. Payments, publishing, approvals and admin edits are online only.

## 8. Layout shells

| Shell | Structure |
|---|---|
| AdminShell | Left sidebar (collapsible, grouped by area, permission filtered), top bar with global search, campus switcher (only if the user has more than one campus), notifications bell, account menu. Content max width 1440. Page header with title, breadcrumbs and the primary action on the right |
| StaffShell | Same pattern with a leaner sidebar. On phones it becomes a bottom tab bar (Today, Attendance, Scores, Messages, More) |
| ParentShell | Top bar with the child switcher and bell. Bottom tab bar on phones (Home, Results, Fees, Messages, More). Single column content, max width 960 |
| StudentShell | Like ParentShell without the child switcher |
| ITShell | Left sidebar, dense status-first pages, a persistent status strip (license state, backup state, queue failures) |
| PublicShell | Centered card for auth pages, simple header and footer with school name and logo |

The campus switcher stores a `campusId` filter in a cookie. List endpoints receive it as `campusId` where supported. It can never widen access beyond the user's campuses.

## 9. Shared components (`components/patterns`)

| Component | Behaviour |
|---|---|
| `DataTable` | Server pagination, sorting, column visibility, row selection, sticky header, URL state, export through `POST /exports`, empty and error states. Virtualised above 200 rows on one page |
| `FilterBar` | Debounced search `q`, lookup selects, date ranges, saved views in local storage |
| `EntityHeader` | Photo or icon, title, status badge, key facts, action menu |
| Record tabs | Each tab is its own route (`/admin/students/12/fees`), so tabs lazy load and deep link |
| `ReasonDialog` | Required reason for cancel, reject, reopen, edit-after-lock. Reason goes in the request body |
| `ConfirmDialog` | For destructive actions. States what will happen and which notifications go out |
| `StatusBadge` | Lookup-based colour and label |
| `ClassPicker` | Session, campus and class selects that remember the last choice |
| `ChildSwitcher` | Parent portal. Reads `GET /portal/children`, keeps the selected `studentId` in the URL |
| `MoneyText`, `MoneyInput` | See money rules above |
| `PermissionGate` | See above |
| `SignedFileLink` | Fetches a fresh signed URL on click |

## 10. Design system and quality bar

- **Visual direction:** calm, high contrast, school-friendly. A neutral base with one brand colour taken from the school profile, applied through CSS variables so every install is themed without code changes. Dark mode supported.
- **Typography:** one humanist sans for UI (Inter or Source Sans 3), tabular numerals for money and scores via `font-variant-numeric: tabular-nums`.
- **Density:** admin tables compact with a comfortable toggle. Parent and student screens use 44 px minimum touch targets.
- **Accessibility:** WCAG 2.2 AA. Everything keyboard reachable, visible focus rings, form errors announced with `aria-live`, status never conveyed by colour alone, `prefers-reduced-motion` respected.
- **Performance budgets:** parent and student home route under 150 KB of JavaScript. Largest Contentful Paint under 2.5 s on a mid-range Android phone on a throttled connection.
- **Printing:** report cards, receipts and statements open as backend PDFs. Pages needing print (class lists, timetables, attendance sheets) have a print stylesheet.
- **Empty states** explain the page and offer the next action. **Errors** are specific and recoverable.
- **Vocabulary:** use the school terms exactly: Session, Term, Class, Arm, Enrolment, Guardian, CA.
- **Tests per page:** one Playwright happy path, one permission-denied path, one out-of-scope id path, one axe scan.
