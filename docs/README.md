# SMS Frontend Specification (Next.js)

This folder defines the whole web frontend: one subfolder per side of the product. Each subfolder lists every page, where things sit on the page, the fields, and the exact backend endpoints used. Paths are relative to `/api/v1` and match `PRD Phase 1 API`.

| Folder | Who uses it | Route prefix | Spec |
|---|---|---|---|
| `public/` | Anyone not logged in: login, password reset, admissions application, offer acceptance | `/` | `public/pages.md` |
| `admin/` | School management: principal, registrar, bursar, admissions officer, exams officer, school admin | `/admin` | `admin/01` to `admin/07` |
| `staff/` | Teachers, form teachers, approvers, any staff doing self-service | `/staff` | `staff/pages.md` |
| `parent/` | Parents and guardians | `/parent` | `parent/pages.md` |
| `student/` | Students | `/student` | `student/pages.md` |
| `it/` | Whoever operates the self-hosted install | `/it` | `it/pages.md` |
| `shared/` | Architecture, API client, components, offline, conventions | n/a | `shared/*.md` |

## 1. Key decisions

1. **One Next.js app, route groups per side.** Not six apps. Each school runs this on one modest server, so one build, one container, one auth session. Sides are isolated by route group and layout, and each side only imports its own feature folder plus `shared/`.
2. **Roles are data, so menus are permission-driven.** "Admin" is not a role the code checks. The `/admin` shell shows a menu item only if `GET /auth/me` returns the permission for it. A bursar sees Fees. A registrar sees Students. The principal sees both.
3. **Portal by user type.** After login, `GET /auth/me` returns `userType` (`staff`, `parent`, `student`, `admin`) and permissions. A parent lands on `/parent`, a student on `/student`, a teacher on `/staff`, school management on `/admin`, and anyone holding `system-update.*`, `backup.*`, `licensing.*` or `jobs.*` also gets `/it`. A user with several can switch from the account menu.
4. **Tokens never touch browser JavaScript.** Next.js route handlers (`/app/api/session/*`) proxy login and refresh, store tokens in `httpOnly`, `Secure`, `SameSite=Lax` cookies, and forward calls to the backend. This keeps XSS from stealing tokens, and the backend stays the only authority on permissions.
5. **Lookups instead of enums.** The backend has no enums, only lookup tables. The frontend loads all lookups once (`GET /lookups`, see gaps) and uses `code` for logic and `id` for writes. Never hardcode ids.
6. **Offline for the three jobs that need it:** taking attendance, entering scores, and viewing the day's timetable. Everything else requires a connection.
7. **Built for modest devices and bad networks:** server components for first paint, small bundles, table virtualisation past 200 rows, skeletons, no layout shift, and every list paginated.

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript strict |
| UI | Tailwind CSS, shadcn/ui (Radix), lucide-react icons |
| Server state | TanStack Query v5 |
| Tables | TanStack Table v8 with server-side pagination, sorting, filtering |
| Forms | React Hook Form + Zod. Schemas are derived from the OpenAPI types where possible |
| API client | `openapi-typescript` + `openapi-fetch` generated from `docs/openapi.json`. CI fails if the generated types drift |
| Charts | Recharts |
| Dates | `date-fns` + `date-fns-tz`. Everything arrives in UTC, display in the school timezone from `GET /school-profile` |
| Offline | Serwist (service worker), Dexie (IndexedDB) outbox, `POST /sync/batches` |
| PDF viewing | Signed URLs from the backend rendered in an `<iframe>` or opened in a new tab. The frontend never renders report cards itself |
| Tests | Vitest + Testing Library, Playwright for end to end, MSW handlers generated from the OpenAPI file |
| Quality | ESLint with import-boundary rules, Prettier, `tsc --noEmit`, axe accessibility checks in Playwright |

## 3. Source layout

```
apps/web/
  src/
    app/
      (public)/                  login, forgot-password, reset-password, apply, application-status, accept-offer
      (admin)/admin/             one folder per area, mirrors admin/01..07
      (staff)/staff/
      (parent)/parent/
      (student)/student/
      (it)/it/
      api/session/               login, refresh, logout route handlers (cookie proxy)
      api/proxy/[...path]/       authenticated pass-through to the backend
      layout.tsx  middleware.ts  error.tsx  not-found.tsx
    features/                    business UI, grouped like backend modules
      students/ staff/ attendance/ academics/ assessment/ fees/
      admissions/ communication/ portal/ reporting/
      rbac/ users/ audit/ config/ notifications/ documents/
      system/ (health, backup, licensing, updates, jobs)
      <feature>/{api,components,hooks,schemas,types}
    components/
      ui/                        shadcn primitives
      patterns/                  DataTable, FilterBar, EntityHeader, StatusBadge, MoneyText,
                                 ConfirmDialog, ReasonDialog, AsyncJobBanner, FileUploader,
                                 PermissionGate, ClassPicker, ChildSwitcher, EmptyState
      shells/                    AdminShell, StaffShell, ParentShell, StudentShell, ITShell, PublicShell
    lib/
      api/ (client, errors, pagination, idempotency)  auth/ (session, permissions)
      lookups/  money/  dates/  offline/ (outbox, sync)  utils/
    styles/
  public/ manifest.webmanifest  icons/
```

Import rules enforced by lint: `app/*` may import `features/*`, `components/*`, `lib/*`. A feature may import `components/*` and `lib/*` but **not another feature**. A side (admin, staff, parent) never imports another side's page code. If two sides need the same widget, it moves to `components/patterns`.

## 4. How to read each page spec

Every page uses the same template:

- **Route** and **Permission** (what must be in `GET /auth/me` permissions, plus scope rules)
- **Layout**: where each block sits on the screen
- **Data**: endpoints read on load
- **Actions**: what the user can do and the endpoint behind it
- **Fields**: for forms and tables
- **States and rules**: loading, empty, errors, async jobs, locks

Endpoints written as `GET /students` are relative to `/api/v1` and are called through the proxy.

## 5. Backend gaps found while writing this

The PRD does not yet cover these. They are needed for the screens below, so add them before building the affected pages.

| # | Gap | Needed by | Proposal |
|---|---|---|---|
| 1 | **Lookup endpoint.** With no enums, the UI needs every lookup table. | All pages with status, type, gender, relationship, mark | `GET /lookups` returns `{ [lookupName]: [{ id, code, name }] }`, cacheable with an ETag. Add `GET /lookups/:name` |
| 2 | **Current user shape.** | Portal routing, menus | `GET /auth/me` must return `userType`, `permissions[]`, `campusIds[]`, and linked ids (`staffId`, `studentId`, `guardianId`) |
| 3 | **Staff self endpoints.** `GET /staff/:id` needs the id first. | Staff portal | `GET /staff/me`, `GET /staff/me/allocations`, `GET /staff/me/overview` (today's lessons, registers not yet submitted, scores awaiting entry, pending approvals) |
| 4 | **Student self endpoints.** `/portal/children/:studentId/*` is parent-shaped. | Student portal | Add `GET /portal/me/{overview,attendance,results,report-cards,timetable,invoices,receipts}` or allow the student's own id on the children routes |
| 5 | **Guardian and student lookups for composing messages.** | Messaging | `GET /messages/recipients?q=` scoped to what the caller may message |
| 6 | **Global search.** | Admin header search | `GET /search?q=&types=students,staff,guardians,invoices` using the `search` platform module |
| 7 | **Unread counts.** | Header badges | `GET /notifications/inbox/unread-count`, and a count field on approvals inboxes |
| 8 | **Approvals inbox.** | Staff and admin | `GET /approvals/pending` returning result sheets, lesson plans, leave requests and offers awaiting the caller |
| 9 | **Server-sent updates for async jobs** (batch invoices, promotions, imports). Polling works, SSE is nicer. | Job banners | Start with polling `GET /<resource>/:id` every 2 s with backoff. Add `GET /jobs/:id/stream` later |
| 10 | **Applicant token header.** The public applicant routes use a token. | Public apply flow | Define the header name and lifetime (suggest `X-Applicant-Token`) |

## 6. Build order

1. `shared/`: session proxy, API client, shells, `DataTable`, `PermissionGate`, lookups, error handling.
2. `public/`: login and password flows.
3. `admin/` students, school structure, users and roles (the foundation).
4. `staff/`: attendance and gradebook, with the offline outbox.
5. `admin/` assessment and report cards, then fees.
6. `parent/` and `student/`.
7. `admin/` admissions and communication, then `it/`.
