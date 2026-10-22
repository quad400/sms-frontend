# SMS Frontend — Getting Started

Next.js 15 App Router app in `apps/web`. Page specs and OpenAPI live in `docs/`.

## What you are building

One Next.js app for a self-hosted school install:

| Side | Who | Prefix | Spec |
|---|---|---|---|
| Public | Guests, applicants | `/` | `docs/pages.md` |
| Admin | Principal, registrar, bursar, … | `/admin` | `docs/01` … `07-*.md` |
| Staff | Teachers, approvers | `/staff` | `docs/mnt/.../staff/pages.md` |
| Parent | Guardians | `/parent` | `…/parent/pages.md` |
| Student | Students | `/student` | `…/student/pages.md` |
| IT | Install operators | `/it` | `…/it/pages.md` |

**API contract:** [`docs/openapi.json`](./docs/openapi.json)  
**Shared behaviour:** [`docs/architecture-and-conventions.md`](./docs/architecture-and-conventions.md)

## Prerequisites

- Node.js 22+ and pnpm 10+
- Running SMS backend (`BACKEND_URL`, default `http://localhost:3000`) with migrations applied (includes `brand_colour` on school profile)

## Setup

```bash
cd sms-frontend
pnpm install
cp apps/web/.env.example apps/web/.env.local
# edit BACKEND_URL / NEXT_PUBLIC_APP_URL if needed
pnpm gen:api
pnpm dev
```

App: [http://localhost:3001](http://localhost:3001)  
Login: `/login`

Never put access/refresh tokens in `NEXT_PUBLIC_*`. The browser talks only to Next; Next talks to the backend via session cookies and `/api/proxy/*`.

## Commands

```bash
pnpm dev              # Next on :3001
pnpm lint
pnpm typecheck
pnpm test             # Vitest
pnpm test:e2e         # Playwright (optional E2E_LOGIN_* for happy path)
pnpm gen:api          # regenerate types from docs/openapi.json
```

## Already implemented (foundation)

- Cookie session: `/api/session/login|refresh|logout|verify-2fa`
- Authenticated proxy: `/api/proxy/[...path]`
- Middleware refresh + portal gating
- Public auth UI: login (incl. 2FA), forgot password, reset password
- Portal shells for admin / staff / parent / student / it
- Design tokens + motion (see `.cursor/rules/40-ui-patterns.mdc`)

## Build order (next)

1. Shared patterns still thin: grow `DataTable`, lookups when `GET /lookups` exists
2. Admin students + structure + users/roles
3. Staff attendance/gradebook + offline
4. Assessment + fees
5. Parent + student portals
6. Admissions + communication, then IT pages

## Rules

- **No stubs.** Wire real OpenAPI operations only.
- Features must not import other features; sides must not import each other’s pages.
- Money = integer minor units. Lookups use `code` for logic and `id` for writes.
