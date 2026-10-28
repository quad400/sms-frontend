# SMS Frontend — Cursor Rules Index

Place this folder at `sms-frontend/.cursor/rules/`. Specs live in `docs/`. Bootstrap guide: [`../../GETTING-STARTED.md`](../../GETTING-STARTED.md).

| File | Applies | Covers |
|---|---|---|
| `00-project-overview.mdc` | Always | Stack, golden rules, no stubs, never-do |
| `15-architecture-layers.mdc` | Always | RSC pages, feature domains, hooks→api, one-job components |
| `10-source-layout.mdc` | `src/**` | Folders, import boundaries, shells |
| `20-auth-and-permissions.mdc` | `src/**` | Cookies, portals, PermissionGate |
| `30-api-client-and-data.mdc` | `src/**` | Proxy, who may call API, errors, money, lookups, jobs |
| `40-ui-patterns.mdc` | `src/**` | Clean/reusable/fast UI: layers, patterns, forms, perf |
| `50-offline-and-async.mdc` | `src/**` | Outbox, sync chip, 202 jobs, pay return |
| `60-building-pages.mdc` | `src/**` | Spec map, page checklist, build order |
| `70-testing.mdc` | `src/**`, `e2e/**` | Vitest, Playwright, axe minima |

`00` and `15` always load. The rest load when matching files are in play. Globs use `src/**` (this app root), not a nested `apps/web`. Update rules when product decisions change; keep page-level detail in the markdown specs, not here.
