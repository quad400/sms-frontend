# Admin implementation tasks

Inventory: [pages.md](./pages.md). Expanded specs: [`docs/01`](../../../01-dashboard-and-people.md)–[`docs/07`](../../../07-access-and-settings.md).

Rules for every task: real APIs only · `pageSize` ≤ 10 · `PermissionGate` · generic 403 copy · Playwright happy / denied / out-of-scope + axe where noted.

---

## Wave 0 — Shell & shared foundation

- [x] **W0.1** `AdminShell`: collapsible grouped sidebar, top bar slot, content max 1440, page header pattern
- [x] **W0.2** Permission-filtered nav from `/auth/me` (omit items without permission; never blank placeholders)
- [x] **W0.3** Campus switcher (cookie `campusId`; only if >1 campus; never exceed `campusIds`)
- [x] **W0.4** Account menu → `/admin/account` (reuse `features/account`)
- [x] **W0.5** Notifications bell stub (badge when gap 7 exists)
- [x] **W0.6** Global search stub / wire when gap 6 exists
- [x] **W0.7** Shared patterns: `DataTable`, `FilterBar`, `EntityHeader`, `ConfirmDialog`, `ReasonDialog`, `StatusBadge`, `ClassPicker`, `PermissionGate`, `AsyncJobBanner` (MoneyText / MoneyInput / SignedFileLink deferred to later waves)
- [x] **W0.8** Lookups client (`GET /lookups` or interim) — no hardcoded lookup ids
- [x] **W0.9** Density toggle (compact / comfortable) persisted locally

---

## Wave 1 — Dashboard, people, access

### Dashboard
- [x] **A1.1** KPI row: enrolled, attendance today, fees collected, outstanding (`GET /reports/dashboards/*`)
- [x] **A1.2** Attendance trend + enrolment-by-level charts
- [x] **A1.3** Needs-attention list + latest announcements (permission-omit cards)
- [x] **A1.4** Deep-links from KPIs / attention rows; “Updated N min ago” + skeletons

### Students
- [x] **A2.1** Students list: filters, table, View / Edit / Archive
- [x] **A2.2** Export (`POST /exports`) + Import entry (opens C1 when ready) — Import disabled until Wave 2; Export omitted until endpoint polish
- [x] **A3.1** Add student form (Personal, Contact, Guardians, Enrolment, Medical gated, Photo) — core personal/contact/campus; guardians/photo via profile
- [x] **A3.2** Edit student; field errors; 409 duplicate warning
- [x] **A4.1** Student profile `EntityHeader` + Overview tab
- [x] **A4.2** Tabs: Guardians, Enrolment (+ transfer dialog), Attendance, Results, Fees
- [x] **A4.3** Tabs: Medical (access notice), Consents & data, Audit
- [x] **A4.4** Archive / Print ID / read-only archived banner / 404 page — Print ID deferred (SignedFileLink)

### Guardians & staff
- [x] **A5.1** Guardians list
- [x] **A5.2** Guardian profile + Send reset link
- [x] **A6.1** Staff list (filters, Add, Import, Archive)
- [x] **A7.1** Staff add / edit (optional login + roles)
- [x] **A8.1** Staff profile tabs: Overview, Allocations, Leave, Staff attendance, Account, Audit — attendance tab deferred

### Leave, promotions, transfers
- [x] **A9.1** Leave requests approve/reject + leave types tab
- [x] **A10.1** Promotion wizard: scope → preview → confirm → `AsyncJobBanner`
- [x] **A10.2** Promotion reverse + term/results warnings
- [x] **A11.1** Transfers report (create only from A4)

### Access
- [x] **G1.1** Users list + drawer (no parent/student create)
- [x] **G2.1** Roles list
- [x] **G3.1** Role editor permission matrix + ConfirmDialog + self-lock guard
- [x] **G5.1** School profile (brand, timezone, currency)

---

## Wave 2 — Structure, academics, attendance

### Structure
- [x] **B1.1** Campuses cards; disable Add at licence limit — create surfaces licence errors from API
- [x] **B2.1** Sessions & terms: activate, close term ConfirmDialog, holidays
- [x] **B3.1** Classes grid + drawer (roster, allocations, timetable, attendance rate)
- [x] **B4.1** Subjects table + level × subject matrix
- [x] **B5.1** Houses colour cards + member counts

### Timetable & plans
- [x] **B6.1** Allocations matrix (class / teacher view); double-book warning
- [x] **B7.1** Timetable builder: grid, drag, clash on 422, autosave, Publish — cell selects (no drag palette)
- [x] **B7.2** Timetable print stylesheet (A4 landscape) — print button + print: utilities
- [x] **B8.1** Lesson plans review tabs + Approve

### Attendance
- [x] **B9.1** Attendance overview (date, campus, unsubmitted highlight)
- [x] **B10.1** Register detail: correct marks, reopen + ReasonDialog
- [x] **B11.1** Attendance reports + export — reports table; export deferred
- [x] **B12.1** Staff attendance daily grid

### Shared import
- [x] **C1.1** Import wizard: template → dry-run → errors CSV → commit (wire to Students/Staff first)

---

## Wave 3 — Assessment & report cards

- [x] **C2.1** Grading scales band editor (gap/overlap validation; duplicate when locked)
- [x] **C3.1** Assessment schemes (weights total 100)
- [x] **C4.1** Approval workflows (ordered steps per level)
- [x] **C5.1** Assessments list / overview
- [x] **C6.1** Score sheets: lock rules; edit-locked + reason when permitted
- [x] **C7.1** Result sheets list
- [x] **C8.1** Result sheet detail: Compute → Approve/Reject → Publish; withheld dialog
- [x] **C9.1** Report cards list + signed PDF preview / regenerate
- [x] **C10.1** Report card template editor (HTML/CSS + preview PDF)
- [x] **C1.2** Extend import wizard to scores — entity option in wizard

---

## Wave 4 — Fees

- [x] **D0.1** Money helpers enforced (minor units; `MoneyText` / `MoneyInput` everywhere)
- [x] **D1.1** Fee structures (version when invoices exist)
- [x] **D2.1** Discounts & scholarships award UI
- [x] **D3.1** Invoices list + status chips
- [x] **D4.1** Create draft → Issue
- [x] **D5.1** Batch generate + skip list
- [x] **D6.1** Invoice detail: Payments / Adjustments / Reminders / History + action stack
- [x] **D7.1** Record payment dialog (**Idempotency-Key** on open)
- [x] **D8.1** Receipts list + resend
- [x] **D9.1** Reconciliation: match/dismiss; bank statement import
- [x] **D10.1** Debtors + bulk reminders
- [x] **D11.1** Fee-clearance settings + Test panel
- [x] **D12.1** Student account statement + print PDF
- [x] **C1.3** Extend import wizard to fee structures / opening balances

---

## Wave 5 — Admissions & communication

### Admissions
- [x] **E1.1** Intakes
- [x] **E2.1** Applications table + board
- [x] **E3.1** Application detail (decision flow)
- [x] **E4.1** Entrance tests
- [x] **E5.1** Offers
- [x] **E6.1** Public form settings + `/apply` preview
- [x] **E0.1** Enrolment appears only after acceptance invoice paid (no fake complete)

### Communication
- [x] **F1.1** Announcements (audience targets, publish + delivery estimate)
- [x] **F2.1** Messages two-pane inbox (recipients when gap 5)
- [x] **F3.1** School calendar month / week / list
- [x] **F4.1** Reminders
- [x] **F5.1** Notification templates (channels + preview)
- [x] **F6.1** Delivery log + retry failed

---

## Wave 6 — Reports, settings, data protection

- [x] **G4.1** Audit log filters + before/after JSON diff + export
- [x] **G6.1** Settings groups (`fee-clearance`, `reminders`, `attendance`, `student-id`, `security-policy`, `notifications`, `admissions`)
- [x] **G7.1** Feature modules / licence badges
- [x] **G8.1** Document templates (receipt, ID, letter — same pattern as C10)
- [x] **G9.1** Report catalogue / runs / schedules
- [x] **G10.1** Imports & exports history
- [x] **G11.1** NDPA: erasure queue, consent register, retention; ReasonDialog on process

---

## Cross-cutting (run with each wave)

- [x] **X.1** Generic 403 UI (“You don’t have access to this.”) — no permission-key leak
- [x] **X.2** Async jobs: `AsyncJobBanner` + poll backoff (imports, batches, compute, publish, promotions)
- [x] **X.3** PDFs only via `SignedFileLink`
- [x] **X.4** Deep-links to `/it` only where noted (never own ops chrome)
- [ ] **X.5** Per-page Playwright: happy path, permission-denied, out-of-scope id, axe

---

## Backend gaps (unblock polish)

| Gap | Unblocks | Owner note |
|---|---|---|
| 1 Lookups | All pickers | Prefer before Wave 1 lists |
| 2 `/auth/me` shape | W0.2–W0.3 | Required for Wave 0 |
| 5 Message recipients | F2.1 | Can stub compose until ready |
| 6 Global search | W0.6 | Optional until Wave 6 |
| 7 Unread counts | W0.5 | Bell badge |
| 8 Approvals inbox | A1.3 | Dashboard attention |
| 9 Job streaming | X.2 | Polling first is enough |
