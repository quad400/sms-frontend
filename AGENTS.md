# Agents — SMS Frontend

Start here:

1. **Bootstrap / how to run:** [GETTING-STARTED.md](./GETTING-STARTED.md) — app lives in `apps/web`
2. **Engineering rules:** [.cursor/rules/](./.cursor/rules/) — especially `00-project-overview.mdc` and `40-ui-patterns.mdc`
3. **API contract (real access):** [docs/openapi.json](./docs/openapi.json) — `pnpm gen:api`; call only what it documents
4. **Product specs:** [docs/README.md](./docs/README.md) then the page file for the side you are building
5. **Shared behaviour:** [docs/architecture-and-conventions.md](./docs/architecture-and-conventions.md)

**No stubs.** Session proxy and pages must use real backend operations. Backend lives in `../sms-backend`. Keep `docs/openapi.json` in sync when the API changes.
