# Admin 07: Access, Reports and Settings

## G1. Users
- **Route:** `/admin/access/users` | **Permission:** `users.user.list`
- **Layout:** filters (type, status, campus, search). Table: name, type, email or phone, roles (chips), campuses, last login, status. Row drawer: profile, roles, campus access, sessions, actions (Deactivate or Activate, Reset password).
- **Actions:** `POST /users` (staff and admin accounts only), `PATCH /users/:id`, `POST /users/:id/deactivate`, `POST /users/:id/activate`, `POST /users/:id/reset-password`, `PUT /users/:id/roles`, `PUT /users/:id/campus-access`.
- **Rule:** parent and student accounts are created by the system on enrolment. The Create button does not offer those types.

## G2. Roles
- **Route:** `/admin/access/roles` | **Permission:** `rbac.role.list`
- **Layout:** card or table list of roles (name, description, system flag, user count, permission count). **New role** and **Duplicate**. System roles are read-only with a lock icon.
- **Actions:** `POST /roles`, `DELETE /roles/:id` (409 when assigned, show the user count and a link).

## G3. Role editor (permission matrix)
- **Route:** `/admin/access/roles/:id` | **Permission:** `rbac.role.read`, edit with `rbac.role.assign-permissions`
- **Layout:** header with role name, description, **Save changes** (disabled until dirty) and a "N unsaved changes" chip. Left: module list with a search box and per-module counters (Fees 6/14). Right: the selected module's permissions as a grid with resources as rows and actions as columns (list, read, create, update, delete, and special actions in an "Other" column). Each cell is a checkbox, with a row checkbox for "all on this resource" and a module toggle. Hovering a cell shows its key (`fees.invoice.create`) and description. A bottom bar shows the scope notes that apply (for example "Teachers are limited to allocated classes regardless of these permissions").
- **Data:** `GET /permissions` (catalogue grouped by module), `GET /roles/:id`.
- **Actions:** `PATCH /roles/:id` for name and description, `PUT /roles/:id/permissions` for the set. ConfirmDialog lists added and removed permissions and warns when the role has users.
- **Safety:** the principal cannot remove their own last permission to edit roles. The UI warns when removing a permission that other enabled features depend on (small dependency map in config).

## G4. Audit log
- **Route:** `/admin/access/audit` | **Permission:** `audit.log.list`
- **Layout:** filters (actor, action lookup, target type, date range, request id). Table: time, actor, action, target, summary, IP. Row drawer shows before and after as a JSON diff, request id and IP. **Export** `POST /audit-logs/exports` (202, itself audited). Read-only everywhere.
- **Data:** `GET /audit-logs`, `GET /audit-logs/:id`.

## G5. School profile
- **Route:** `/admin/settings/profile` | **Permission:** `config.profile.read`, `.update`
- **Fields:** school name, logo (uploader), brand colour, timezone, default currency, contact email and phone. `GET/PUT /school-profile`.

## G6. Settings groups
- **Route:** `/admin/settings/:group` | **Permission:** `config.setting.read`, `.update`
- **Layout:** left list of groups (fee-clearance, reminders, attendance, student-id, security-policy, notifications, admissions). Right: a typed form per group generated from a schema map in `features/config/schemas`. Highlights: **student-id** pattern builder with a live example, **reminders** schedule (days before and after due date, channels), **security-policy** (2FA enforcement, idle timeout, password rules), **attendance** (periods, late cut-off), **notifications** (quiet hours defaults).
- **Actions:** `GET /settings/:group`, `PUT /settings/:group`. Show "Changes are audited" on every group.

## G7. Feature flags and modules
- **Route:** `/admin/settings/modules` | **Permission:** `config.flag.read`, `.update`
- **Layout:** list of modules with a switch and a licence badge. Unlicensed modules are disabled with an upgrade hint. `GET /feature-flags`, `PATCH /feature-flags/:key`.

## G8. Document templates (receipts, ID cards, letters)
- Same editor pattern as report card templates (C10), with a type filter. `GET /document-templates?type=`.

## G9. Reports
- **Route:** `/admin/reports` | **Permission:** `reporting.report.list`
- **Layout:** tabs **Catalogue** (cards of available reports with description), **Runs** (history with status and download), **Schedules**. Running a report opens a parameter form generated from `parameterSchema`, then `POST /reports/runs` (202), then a download from `GET /reports/runs/:id`.
- **Schedules:** `GET/POST/PATCH/DELETE /reports/schedules` with cron presets (daily, weekly, monthly), recipients picker.
- **Data:** `GET /reports/catalogue`.

## G10. Data exports and imports history
- **Route:** `/admin/data` | **Permission:** `import-export.export.create`
- **Layout:** two tabs, **Imports** and **Exports**, each a table with status and download or error links. `GET /imports/:id`, `GET /exports/:id`.

## G11. Data protection (NDPA)
- **Route:** `/admin/data-protection` | **Permission:** `students.erasure.create`
- **Layout:** erasure request queue (student, requested at, status), consent register search, retention policy summary. Processing an erasure uses ReasonDialog and shows the audit record link. Uses endpoints from A4 plus the retention job status from IT.
