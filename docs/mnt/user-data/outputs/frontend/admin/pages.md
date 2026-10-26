# Admin Side (school management)

Shell: `AdminShell`. Desktop-first, dense tables, permission-filtered sidebar. Used by principal, registrar, bursar, admissions officer, exams officer, and other school-management accounts (`userType` lands on `/admin`).

**Not for:** day-to-day teacher workflows (Staff), parent payments (Parent), student self-service (Student), or server ops (IT). Those sides stay separate; Admin deep-links into them only where noted.

---

## Shell and IA

| Concern | Spec |
|---|---|
| Layout | Left sidebar (collapsible, grouped, permission-filtered) + top bar. Content max width **1440**. Page header: title, breadcrumbs, primary action on the right. |
| Top bar | Global search (gap 6: `GET /search`), campus switcher (only if the user has more than one campus; stores `campusId` cookie and passes it to list endpoints), notifications bell, account menu. |
| Density | Compact tables with a comfortable density toggle. Keyboard-reachable; WCAG 2.2 AA. |
| Auth | Menus are **permission-driven**. “Admin” is not a hard-coded role. An item appears only if `GET /auth/me` includes its permission. Cards the user cannot see are **omitted**, never blank placeholders. |
| Campus scope | Switcher never widens access beyond `campusIds` from `/auth/me`. |
| Online only | Admin edits are online. No offline outbox (unlike Staff attendance/scores). |
| Shared patterns | `DataTable`, `FilterBar`, `EntityHeader`, record tabs as own routes, `ReasonDialog`, `ConfirmDialog`, `StatusBadge`, `ClassPicker`, `MoneyText` / `MoneyInput`, `PermissionGate`, `SignedFileLink`, `AsyncJobBanner`, import wizard (C1). |
| Account | `/admin/account` reuses shared `features/account` (security, sessions, notification prefs) like Staff/Parent/Student. |

### Sidebar groups (permission filtered)

| Group | Destinations |
|---|---|
| **Overview** | Dashboard |
| **People** | Students, Guardians, Staff, Leave, Promotions, Transfers |
| **Academics** | Campuses, Sessions & terms, Classes, Subjects, Houses, Allocations, Timetables, Lesson plans, Attendance |
| **Results** | Grading scales, Schemes, Workflows, Assessments, Result sheets, Report cards, Templates |
| **Fees** | Structures, Discounts, Invoices, Payments, Reconciliation, Debtors, Clearance, Accounts |
| **Admissions** | Intakes, Applications, Tests, Offers, Form settings |
| **Communication** | Announcements, Messages, Events, Reminders, Notification templates, Deliveries |
| **Reports** | Report catalogue / runs / schedules |
| **Access & Settings** | Users, Roles, Audit, School profile, Settings groups, Modules, Data, Data protection |

Canonical detailed specs also live at repo root: [`docs/01`](../../../01-dashboard-and-people.md)–[`docs/07`](../../../07-access-and-settings.md). This file is the **single inventory** for planning and implementation.

---

## A — Dashboard and people

### A1. Dashboard
- **Route:** `/admin` | **Permission:** `reporting.dashboard.read`
- **Layout:** Top row of **4 KPI cards** (Students enrolled, Attendance today, Fees collected this term, Outstanding balance). Below, two columns. **Left:** attendance trend (14-day line) and enrolment by level (bar). **Right:** **Needs attention** list (open reconciliation exceptions, registers not submitted today, result sheets awaiting approval, unpaid acceptance offers) and latest announcements. Omit any card or list the user lacks permission for.
- **Data:** `GET /reports/dashboards/overview`, `.../attendance`, `.../fees`, `.../enrolment` (parallel). Campus filter from the shell.
- **Actions:** each KPI and attention row deep-links to the filtered destination page.
- **States:** snapshot cards show “Updated N min ago” from the snapshot timestamp. Skeletons on load.

### A2. Students list
- **Route:** `/admin/students` | **Permission:** `students.student.list`
- **Layout:** header (count, **Add student**, **Import**, **Export**). Filter bar: search, campus, class, status, house. Table: photo, student number, name, class, campus, status, primary guardian phone, balance badge (only with `fees.account.read`), row menu (View, Edit, Archive).
- **Data:** `GET /students?...`, `GET /classes`.
- **Actions:** archive `DELETE /students/:id` (ConfirmDialog). Bulk export `POST /exports`.

### A3. Add / edit student
- **Route:** `/admin/students/new`, `/admin/students/:id/edit` | **Permission:** `students.student.create` / `.update`
- **Layout:** two-column form: Personal, Contact, Guardians, Enrolment, Medical (gated `students.medical.update`), Photo.
- **Actions:** `POST /students`, guardians, enrolments, files; edit `PATCH /students/:id`. Student number is backend-generated, read-only after save.
- **States:** field errors from `details`; 409 duplicate match warning.

### A4. Student profile (360°)
- **Route:** `/admin/students/:id` + tab routes | **Permission:** `students.student.read` (tabs gated)
- **Layout:** `EntityHeader` (photo, name, number, class, status, balance; Edit, Transfer, Archive, Print ID). Tabs as own routes:
  1. **Overview** — facts, guardians, attendance rate, latest result, outstanding invoices  
  2. **Guardians** — CRUD links  
  3. **Enrolment history** — enrolments, class change, transfer dialog  
  4. **Attendance** — calendar + list  
  5. **Results** — results + report-card links  
  6. **Fees** — account, invoices, payments, scholarships  
  7. **Medical** — logged access notice; `students.medical.read`  
  8. **Consents & data** — consents, erasure request  
  9. **Audit** — `audit.log.list`
- **States:** archived = read-only banner; unlinked/404 = not-available page.

### A5. Guardians
- **Route:** `/admin/guardians`, `/admin/guardians/:id` | **Permission:** `students.guardian.list`, `.read`
- **List:** name, phone, email, linked children, portal account status.
- **Profile:** contact `PATCH`, children table, **Send reset link** (`POST /users/:id/reset-password`).

### A6–A8. Staff
- **List** `/admin/staff` — filters, Add/Import, archive.  
- **Form** `/admin/staff/new|:id/edit` — optional create login + roles.  
- **Profile** `/admin/staff/:id` — Overview, Allocations matrix, Leave, Staff attendance, Account (roles/campus/reset), Audit.

### A9. Leave management
- **Route:** `/admin/leave` | **Permission:** `staff.leave.list`
- **Tabs:** Requests (approve/reject with reason) · Leave types (`PUT /leave-types`).

### A10. Promotion wizard
- **Route:** `/admin/promotions/new`, `/admin/promotions/:id` | **Permission:** `students.promotion.preview`, `.execute`, `.reverse`
- **Stepper:** scope → editable preview outcomes → confirm → `AsyncJobBanner`. Reverse with ReasonDialog. Warn if term not closed / results not published (do not hard-block).

### A11. Transfers
- **Route:** `/admin/transfers` — read-only report of transfers; create only from student profile (A4).

---

## B — Structure, academics, attendance

### B1–B5. Structure
- **Campuses** `/admin/campuses` — cards; disable Add at licence campus limit (`GET /license/usage`).  
- **Sessions & terms** `/admin/sessions` — activate session/term, close term (ConfirmDialog lists locks), holidays in term card.  
- **Classes** `/admin/classes` — grid by level/arm; drawer: roster, allocations, timetable, attendance rate.  
- **Subjects / curriculum** `/admin/subjects` — subjects table + level×subject matrix.  
- **Houses** `/admin/houses` — colour cards, member counts.

### B6. Allocations matrix
- **Route:** `/admin/allocations` | **Permission:** `staff.allocation.list`
- Class or teacher view; save `PUT /staff/:id/allocations`. Warn on timetable double-booking.

### B7. Timetables
- **Route:** `/admin/timetables`, `/admin/timetables/:id`
- Builder: weekday × time-slot grid, drag subjects, clash outline on 422. Autosave + Publish. Print stylesheet (A4 landscape).

### B8. Lesson plans review
- **Route:** `/admin/lesson-plans` — Submitted / Approved / Draft tabs; Approve action.

### B9–B12. Attendance
- **Overview** `/admin/attendance` — date + campus; classes table vs trend; highlight unsubmitted.  
- **Register detail** `/admin/attendance/registers/:id` — correct marks; reopen with ReasonDialog.  
- **Reports** `/admin/attendance/reports` — lowest attendance table + export.  
- **Staff attendance** `/admin/staff-attendance` — daily mark grid.

---

## C — Assessment, results, report cards

Lifecycle chip everywhere: **Draft → Submitted → Approved → Published**. Scores lock on submit; post-lock edit needs `assessment.score.edit-locked` + reason (audited).

### C1. Import wizard (shared)
Full-screen dialog from any Import button: template → dry-run upload → errors CSV → commit. Used by students, staff, scores, fee structures, opening balances.

### C2–C4. Setup
- **Grading scales** — band editor with gap/overlap validation; duplicate if locked by approved results.  
- **Assessment schemes** — CA/Exam weights must total 100.  
- **Approval workflows** — ordered steps per level (approver role).

### C5–C6. Assessments & score sheets
Exams-officer overview; admin can correct locked cells and submit when permitted.

### C7–C8. Result sheets
List + detail (Overview / Student results / Approvals). Compute → Approve/Reject → Publish. After publish: dialog “N published, M withheld” with fee-clearance links.

### C9–C10. Report cards & templates
Published list with PDF preview / regenerate. Template editor (HTML/CSS + preview PDF); same pattern for receipt, ID, letter templates (G8).

---

## D — Fees

Rules: issued invoices are immutable (credit notes / adjustments only); payments append-only; money in **minor units**; `MoneyText` / `MoneyInput` everywhere.

### D1–D2. Structures, discounts, scholarships
Version structures when invoices exist; award scholarships to students.

### D3–D6. Invoices
List with status chips; create draft → Issue; batch generate with skip list; detail with Payments / Adjustments / Reminders / History and action stack (record payment, checkout link, credit note, cancel).

### D7–D8. Payments
Record payment dialog with **Idempotency-Key** created when dialog opens; receipts list + resend.

### D9–D10. Reconciliation & debtors
Match/dismiss exceptions; import bank statements; bulk reminders on debtors.

### D11. Fee-clearance policy
Settings group: what is gated, rule, exemptions; **Test** panel per student.

### D12. Student account statement
Running balance statement + print PDF.

---

## E — Admissions

Flow: application → decision → offer → acceptance payment → enrolment (enrolment appears when acceptance invoice is paid; UI never fakes completion).

### E1–E6
Intakes · Applications (table + board) · Application detail · Entrance tests · Offers · Public form settings (`/apply` preview).

---

## F — Communication

### F1–F6
Announcements (audience targets, publish with delivery estimate) · Messages (two-pane inbox; recipients scoped — gap 5) · School calendar (month/week/list) · Reminders · Notification templates (per channel, preview) · Delivery log (retry failed).

---

## G — Access, reports, settings

### G1–G3. Users & roles
Users list/drawer (no parent/student create — system-created). Roles list. **Role editor:** module × resource × action permission matrix; ConfirmDialog on save; cannot strip own last role-edit permission.

### G4. Audit log
Read-only filters + JSON before/after diff; export audited.

### G5–G7. Profile, settings, modules
School profile (brand colour, timezone, currency). Settings groups (`fee-clearance`, `reminders`, `attendance`, `student-id`, `security-policy`, `notifications`, `admissions`). Feature flags with licence badges.

### G8–G10. Templates, reports, data
Document templates; report catalogue / runs / schedules; imports & exports history.

### G11. Data protection (NDPA)
Erasure queue, consent register, retention summary; ReasonDialog on process.

---

## Cross-cutting rules

1. **PermissionGate** on every primary action; denied UI is generic (“You don’t have access to this.”) — never leak permission keys.  
2. **Lookups** via `GET /lookups` (gap 1); never hardcode lookup ids.  
3. **Async jobs** (imports, batches, compute, publish, promotions): `AsyncJobBanner` + poll with backoff (gap 9).  
4. **PDFs** only via signed URLs (`SignedFileLink`); frontend never renders report cards.  
5. **Tests per page:** Playwright happy path, permission-denied, out-of-scope id, axe scan.  
6. **IT vs Admin:** health, backups, licence activation, queues, upgrades live under `/it`. Admin may deep-link (e.g. delivery failures → F6; imports monitor ↔ I12) but does not own ops chrome.

---

## Backend gaps that block Admin polish

| Gap | Affects |
|---|---|
| 1 Lookups endpoint | All status/type pickers |
| 2 `/auth/me` shape | Menus, campus switcher |
| 5 Message recipients | F2 compose |
| 6 Global search | Admin header |
| 7 Unread counts | Bell badge |
| 8 Approvals inbox | Dashboard attention + optional Approvals nav |
| 9 Job streaming | Prefer polling first |

---

## Implementation tasks

Checkable subtasks by wave: **[tasks.md](./tasks.md)** (W0 shell → Wave 6 settings/NDPA).

| Wave | Scope |
|---|---|
| 0 | AdminShell, nav, campus, shared patterns |
| 1 | A1 dashboard, people A2–A11, access G1–G3, G5 |
| 2 | Structure B1–B12 + import wizard C1 |
| 3 | Assessment C2–C10 |
| 4 | Fees D1–D12 |
| 5 | Admissions E + Communication F |
| 6 | G4, G6–G11 |

---

## Source map

| Area | This inventory | Expanded write-up |
|---|---|---|
| Dashboard & people | A1–A11 | [`docs/01-dashboard-and-people.md`](../../../01-dashboard-and-people.md) |
| Structure / academics / attendance | B1–B12 | [`docs/02-structure-academics-attendance.md`](../../../02-structure-academics-attendance.md) |
| Assessment | C1–C10 | [`docs/03-assessment-and-results.md`](../../../03-assessment-and-results.md) |
| Fees | D1–D12 | [`docs/04-fees.md`](../../../04-fees.md) |
| Admissions | E1–E6 | [`docs/05-admissions.md`](../../../05-admissions.md) |
| Communication | F1–F6 | [`docs/06-communication.md`](../../../06-communication.md) |
| Access & settings | G1–G11 | [`docs/07-access-and-settings.md`](../../../07-access-and-settings.md) |
