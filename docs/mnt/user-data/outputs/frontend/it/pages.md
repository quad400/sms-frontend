# IT Side (system operator of the self-hosted install)

Shell: `ITShell`. For the person who keeps the school's server running: possibly the school admin, possibly an outsourced technician. Dense, status-first pages. Reachable by anyone holding any of `health.status.read`, `backup.*`, `licensing.*`, `jobs.*`, `system-update.*`, `events.*`, `payments-gateway.*`.

A **status strip** is pinned under the header on every IT page: Health (green, amber, red), Last backup (time and result), Licence (state and days left), Queue failures (count), Outbox lag (seconds). Each chip links to its page. Data refreshes every 30 s from the endpoints below.

## I1. System overview
- **Route:** `/it` | **Permission:** `health.status.read`
- **Layout:** top row with the five status chips as large cards. Below: left **Module health** table (module, status, last check, message), right **Recent issues** (failed jobs, failed backups, dead-letter items, licence warnings) with an action link each. Bottom: system facts card (version, build, uptime, database size, storage used, disk free).
- **Data:** `GET /admin/health`, `GET /system/version`, `GET /admin/backups/status`, `GET /license`, `GET /admin/queues`, `GET /admin/events/outbox`.

## I2. Health
- **Route:** `/it/health` | **Permission:** `health.status.read`
- **Layout:** dependency cards (PostgreSQL, Redis, MinIO, worker, reverse proxy) with state and latency, then per-module indicators. A **Re-check** button refetches. A link to the Prometheus and Grafana views when that profile is enabled.
- **Data:** `GET /admin/health`, `GET /health/ready`.

## I3. Backups
- **Route:** `/it/backups` | **Permission:** `backup.backup.list`
- **Layout:** top status banner (last success time, red if stale per the policy, with the reason of the last failure). Primary button **Back up now** (`POST /admin/backups`, 202). Table: started, finished, trigger (scheduled, manual, pre-upgrade), size, result, location, checksum. Right panel **Policy**: schedule, retention, stale threshold with Save (`PUT /admin/backup-policy`).
- **Restore:** restore is a one-command CLI action by design. The page shows a **How to restore** panel with the exact command and the selected backup id, and a warning. The web UI does not perform restores.
- **Data:** `GET /admin/backups`, `GET /admin/backups/status`, `GET /admin/backup-policy`.

## I4. Licence
- **Route:** `/it/license` | **Permission:** `licensing.license.read`
- **Layout:** state banner (Active, Warning, Grace period, Read-only) with dates. Usage meters for students and campuses against limits, and the module entitlement list. **Activate** area: online (paste key, `POST /license/activate`) or **Offline activation** stepper: generate challenge (`POST /license/activation-challenge`, download file), upload the signed response (`POST /license/activate-offline`).
- **Rules:** in read-only state the whole app shows the global banner, and this page remains the one place that stays writable.
- **Data:** `GET /license`, `GET /license/usage`.

## I5. Updates and upgrades
- **Route:** `/it/updates` | **Permission:** `system-update.version.read`
- **Layout:** current version card with release notes link. **Upgrade readiness** checklist from the preflight (disk space, supported version path, fresh backup, pending migrations) each pass or fail. Migration list (applied, pending). A history table of upgrade runs and outcomes (succeeded, failed, rolled back).
- **Rules:** upgrades are run by `upgrade.sh` on the server. The page shows the exact command and never runs the upgrade from the browser.
- **Data:** `GET /system/version`, `GET /system/migrations`, `GET /system/upgrade-preflight`.

## I6. Queues and dead letters
- **Route:** `/it/queues` | **Permission:** `jobs.queue.read`
- **Layout:** queue cards (notifications, documents, fees-reminders, imports) with waiting, active, failed counts and oldest waiting age. Selecting a queue opens its dead-letter table (job id, failed at, reason, attempts) with a payload drawer (ids only). **Retry** `POST /admin/queues/:name/dead-letter/:jobId/retry` (ConfirmDialog, audited).
- **Data:** `GET /admin/queues`, `GET /admin/queues/:name/dead-letter`.

## I7. Schedules
- **Route:** `/it/schedules` | **Permission:** `jobs.schedule.read`, `.update`
- **Layout:** table of scheduled jobs (fee reminders, overdue sweep, term rollover, backup, licence check, notification retry): cron expression with a plain-language preview, enabled switch, last and next run. Edit in a sheet with a cron helper.
- **Data and actions:** `GET /admin/schedules`, `PATCH /admin/schedules/:key`.

## I8. Event outbox
- **Route:** `/it/events` | **Permission:** `events.outbox.read`
- **Layout:** lag and pending count tiles, table of pending or failed outbox entries (event type, occurred at, attempts, last error). **Redispatch** `POST /admin/events/outbox/:id/redispatch`.
- **Data:** `GET /admin/events/outbox`.

## I9. Integrations
- **Route:** `/it/integrations` | **Permission:** `payments-gateway.provider.list`
- **Layout:** cards for payment providers (Paystack, Flutterwave), SMS and email providers, each with enabled state, last webhook received and its result, and a **Send test** where supported. Secrets are never shown, the card says "Configured through the server environment" and shows only a masked indicator.
- **Data and actions:** `GET /payment-gateways`, `PUT /payment-gateways/:provider` (enable and choose account label). Webhook failures link to the delivery log in admin F6.

## I10. Diagnostics bundle
- **Route:** `/it/diagnostics` | **Permission:** `system-update.diagnostics.create`
- **Layout:** explanation of what is included (logs and configuration with secrets and personal data redacted), **Generate bundle** (`POST /system/diagnostics-bundle`, 202), status then **Download** from `GET /system/diagnostics-bundle/:id`. Previous bundles listed with expiry.

## I11. Security overview
- **Route:** `/it/security` | **Permission:** `audit.log.list`
- **Layout:** failed logins in the last 24 hours, locked accounts (with Unlock through `POST /users/:id/activate`), staff without 2FA when the policy requires it, recent permission changes. Built from `GET /audit-logs` filtered by action, and `GET /users?status=locked`.

## I12. Data tools
- **Route:** `/it/data` | **Permission:** `import-export.import.read`. Imports and exports monitor (same table as admin G10) plus the retention job status for the NDPA workflow.
