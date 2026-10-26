# PRD: Student Portal (Student Side)

**Product:** School Management System (SMS) — Student Portal  
**Route prefix:** `/student`  
**Shell:** `StudentShell`  
**Audience for this doc:** product / UX / UI design AI  
**Status:** Phase 1 (with Phase 2 LMS slot noted)  
**Related surfaces (do not design as the same product):** Parent Portal (`/parent`), Staff Portal (`/staff`), Admin (`/admin`)  
**Page inventory:** [pages.md](./pages.md)

---

## 1. Purpose

Give each enrolled student a **phone-first, read-only portal** to see their own school life: today and timetable, attendance, results/report cards, announcements/events, optional fee info, and account/security. Students do **not** manage school data, pay fees, message teachers (Phase 1), or edit personal details.

**Success looks like:** a student on a mid-range Android phone can open the PWA, see “what’s next today,” check results when published, and do this without help from a parent or the school office.

---

## 2. Who this is for

| Persona | Context | Device | Literacy / tone |
|---|---|---|---|
| Secondary / senior student (primary) | Uses daily for timetable & results | Own phone, often weak network | Short sentences, no finance jargon |
| Junior secondary (secondary) | Same, may share device | Phone or school tablet | Same; avoid dense admin UI |
| Parent using student login (edge) | Should still only see that student’s data | Phone | Same constraints; no child switcher |

**Not for:** registrars, bursars, teachers (they use Admin/Staff). Do not borrow Admin table density or Parent “Pay now” patterns.

---

## 3. Product principles (non-negotiable)

1. **Own record only** — one student identity; no child switcher; no browsing other students.
2. **Read-only academic/personal data** — except password, notification prefs, sessions, first-login tour.
3. **Phone-first** — bottom tabs; 44px min touch targets; single column; max content width ~960.
4. **Calm, school-friendly** — high contrast; school brand colour via CSS variables; dark mode supported; no purple-gradient SaaS look.
5. **No financial pressure UX** — fees (if shown) are informational; **no Pay button**. Withheld results never explain fee amounts or clearance rules.
6. **Offline where it matters** — timetable (and shell) from cache; everything else online.
7. **Performance** — Home route JS budget **&lt; 150 KB**; LCP **&lt; 2.5 s** on mid-range Android, throttled network.
8. **Accessibility** — WCAG 2.2 AA; keyboard; visible focus; status not by colour alone; `prefers-reduced-motion`.

---

## 4. Information architecture

### Bottom tabs (primary)

| Tab label | Route | Purpose |
|---|---|---|
| **Home** | `/student` | Today snapshot |
| **Timetable** | `/student/timetable` | Week/day schedule |
| **Results** | `/student/results` (+ report cards) | Scores & PDFs |
| **More** | overflow | Attendance, lessons, fees (optional), announcements, events, account |

### Full route map

| ID | Name | Route | Permission | Visibility |
|---|---|---|---|---|
| T1 | Home | `/student` | `portal.profile.read` | Always (if portal access) |
| T2 | Timetable | `/student/timetable` | `portal.timetable.read` | Always |
| T3 | Attendance | `/student/attendance` | `portal.attendance.read` | More |
| T4a | Results | `/student/results` | `portal.result.read` | Tab |
| T4b | Report cards | `/student/report-cards` | `portal.report-card.read` | From Results / More |
| T5 | Learning material | `/student/lessons` | (lesson notes) | **Hidden until backend** `GET /portal/me/lesson-notes` |
| T6 | Fees | `/student/fees` | school setting + portal invoice read | **Only if school enables student fee visibility** |
| T7a | Announcements | `/student/announcements` | portal announcements | More |
| T7b | Events | `/student/events` | portal events | More |
| T8 | Account | `/student/account` | account/profile | More |
| T9 | First login / welcome | `/student/welcome` | post-auth | Once / until password changed |

### Shell chrome

- **Top:** school name/logo (subtle), notifications bell (if inbox exists), account affordance.
- **No** campus switcher, **no** child switcher, **no** global admin search.
- **Bottom tab bar** on phones; same destinations on larger screens (tabs or equivalent, not Admin sidebar).

---

## 5. Auth, gating, and session (design implications)

- Entry only when `userType = student` (middleware). Wrong type → redirect to that user’s home.
- Idle timeout from school `security-policy`: after idle, **60s warning dialog**, then logout.
- If school forces 2FA on first login, **block all navigation** until enrolled/verified.
- First login: force `/student/welcome` (password change → short tab tour → PWA install prompt).
- Errors: never raw API dumps; show friendly copy + optional `requestId` with copy on hard failures.
- Out-of-scope / wrong id → standard **“not found or not available to you”** page (ids are guessable).

---

## 6. Screen requirements (design each explicitly)

### T1 — Home `/student`

**Job:** Answer “What do I need to know right now?” in one scroll.

**Layout (top → bottom):**

1. Greeting: student **first name** + **class** (e.g. “Good morning, Amina · JSS 2A”).
2. **Next lesson** card: subject, room, start–end time (or “No more lessons today”).
3. **Today’s timetable** list (compact period rows).
4. **Attendance rate** tile (term or YTD — use whatever API returns; label clearly).
5. **Latest announcement** (1): title, short preview, timestamp → tap to full list/detail.
6. **Upcoming events** (max **3**).

**Data:** `GET /portal/me`, `GET /portal/me/overview`, `GET /portal/announcements`, `GET /portal/events`.

**States:**

- Loading: skeletons matching blocks (no layout jump).
- Empty next lesson / empty events: calm empty copy, not error.
- Partial failure: show successful blocks; failed block gets inline retry.

**Do not put on Home:** fee balance, pay CTAs, multi-child cards, KPI dashboards, admin “needs attention.”

---

### T2 — Timetable `/student/timetable`

**Job:** “What’s my schedule today / this week?”

**Layout:**

- Day tabs (Mon–Fri or school week); **today** preselected.
- Period list: time, subject, teacher (if provided), room.
- **Current period highlighted** when viewing today and time falls in a period.

**Data:** `GET /portal/me/timetable`.  
**Offline:** works from cache; show subtle offline indicator when serving cache.

**States:** no periods that day; offline stale cache (“Last updated …”).

---

### T3 — Attendance `/student/attendance`

**Job:** See monthly presence without asking the office.

**Layout:** Same pattern as Parent R2 **without child switcher**:

- Month calendar: present / absent / late / excused (colour **+** icon).
- Month nav; summary row: days present, absent, late, rate %.
- List for selected month under calendar.

**Data:** `GET /portal/me/attendance` (with from/to as needed).

**Copy tone:** factual (“Absent · 12 Mar”), never shaming.

---

### T4 — Results & report cards

**Routes:** `/student/results`, `/student/report-cards`  
**Permissions:** `portal.result.read`, `portal.report-card.read`

**Results layout:**

- Term selector.
- Optional summary: average, class position (if API provides).
- **Subject cards:** score, grade, position, remark.
- Link/nav to report cards.

**Report cards layout:**

- List by session/term.
- **View PDF** / download via signed URL (never invent PDF UI that renders marks client-side).

**Withheld state (critical):**

- Message **exactly in spirit:**  
  **“Your results are not available yet. Please see the school office.”**
- **Do not** show outstanding balance, % paid, “pay to unlock,” or Pay CTA (unlike Parent portal).

**Data:** `GET /portal/me/results`, `GET /portal/me/report-cards`.

---

### T5 — Learning material `/student/lessons` (Phase 1 gated)

**Job:** Download teacher-shared lesson notes for the student’s class.

**Layout:** list by subject/date; title; download/open attachment.  
**Hidden** until `GET /portal/me/lesson-notes` exists.  
**Phase 2:** LMS assignments slot here without changing other tabs’ IA.

---

### T6 — Fees `/student/fees` (optional)

**Visibility:** school setting must allow student fee visibility; else route not in More and direct URL → not available / redirect.

**Layout:** read-only invoice list + balance summary.  
**Data:** `GET /portal/me/invoices`.  
**Forbidden:** Pay now, checkout, card forms, payment return flows.

**Copy:** plain language (“Amount due”, “Paid”) — no bursar jargon (no “debit/credit/reconciliation”).

---

### T7 — Announcements & events

**Routes:** `/student/announcements`, `/student/events`  
**Data:** `GET /portal/announcements`, `GET /portal/events`.  
**Events:** optional “Add to calendar” (client `.ics`) like parent — nice-to-have if shared component exists.

---

### T8 — Account `/student/account`

**Shared** `features/account` pattern, student-constrained:

| Area | Behaviour |
|---|---|
| Profile | **Read-only** personal details |
| Edit personal data | Disabled; helper: **“Ask the school office to change this”** |
| Password | Change password |
| Notifications | Preferences |
| Sessions | Active sessions / sign out others if API supports |

---

### T9 — Welcome `/student/welcome`

**Flow order:**

1. Force password change (cannot skip if required).
2. Short **tour of the four tabs** (Home, Timetable, Results, More) — 3–4 steps max.
3. **PWA install** prompt / instructions (Add to Home Screen).

After completion, never force again (unless password policy re-triggers).

---

## 7. Visual & UX design direction (for the design AI)

**Product feel:** friendly school companion, not a corporate dashboard and not a cartoon kids’ app.

**Must use:**

- One composition per screen; Home = one clear “today” story.
- Brand from **school profile** (logo + brand colour CSS variables).
- Expressive but readable UI font; **tabular nums** for scores and times.
- Soft atmosphere (light gradient/pattern ok) without drowning content.
- **Motion:** 2–3 intentional motions max (e.g. tab indicator, next-lesson highlight pulse once, skeleton → content). Respect reduced motion.

**Avoid:**

- Cards-as-decoration everywhere; cards only when they group a tappable unit (next lesson, subject result).
- Stat strips, pill clusters, badge spam on hero/home.
- Purple-on-white / indigo glow “AI SaaS” default.
- Dense data tables (Admin style).
- Detached floating badges over hero imagery.
- Emoji-heavy UI.

**Density:** comfortable mobile; never compact admin tables.

---

## 8. Content & vocabulary

Use school terms exactly when shown: **Session, Term, Class, Arm, CA** (if used).  
Avoid: invoice ledger language, “entity,” “RBAC,” “scope.”

**Example microcopy bank (use / adapt):**

- Empty timetable: “No lessons on this day.”
- Offline timetable: “You’re offline. Showing your saved timetable.”
- Withheld results: “Your results are not available yet. Please see the school office.”
- Profile edit: “Ask the school office to change this.”
- Fees hidden: do not tease; simply omit the menu item.
- Generic not available: “This isn’t available to you.”

---

## 9. Data & API contract (designer-relevant)

All student data from **self** endpoints (backend gap until ready):

Ideal:

- `GET /portal/me`
- `GET /portal/me/overview`
- `GET /portal/me/timetable`
- `GET /portal/me/attendance`
- `GET /portal/me/results`
- `GET /portal/me/report-cards`
- `GET /portal/me/invoices` (+ receipts if exposed)
- `GET /portal/me/lesson-notes` (future)
- Shared: `GET /portal/announcements`, `GET /portal/events`

Fallback design assumption: same shapes as parent child endpoints but **no** `studentId` in UI; never design a child picker.

Files/PDFs: open via short-lived signed URLs; design “View” as open/download, not embedded complex PDF chrome unless shared pattern exists.

---

## 10. Explicit differences vs Parent Portal (do not merge designs)

| Topic | Parent | Student |
|---|---|---|
| Child switcher | Yes | **Never** |
| Fees | Pay now + checkout | Optional read-only, **no pay** |
| Results withheld | Amount + Pay CTA | Office message **only** |
| Messages | Threads with teachers | **Not in Phase 1 student tabs** |
| Profile edit | Can update own contact | Student personal fields locked |
| Tone | Guardian / finance-aware | Peer / school-day-aware |
| Primary tabs | Home, Results, Fees, Messages, More | Home, Timetable, Results, More |

---

## 11. States every screen must specify in designs

For each screen, provide: **default**, **loading (skeleton)**, **empty**, **error + retry**, **offline** (timetable), **withheld** (results/report cards), **permission hidden** (menu item absent vs disabled-with-tooltip only when user would wonder), **fees module off**, **lessons feature hidden**, **archived/withdrawn student** (if API can return — read-only banner).

---

## 12. Extended product (feature-flagged)

In-scope beyond the original Phase 1 portal pages (see [pages.md](./pages.md)):

| Module | Route | Flag | API |
|---|---|---|---|
| Library | `/student/library` | `library` | `GET /portal/me/library` |
| Medical & Clinic | `/student/medical` | `health-sickbay` | `GET /portal/me/medical` |
| Live Classes (Meet) | `/student/lessons` | `lms` | `GET /portal/me/live-sessions` |
| Scholar Lounge | `/student/chatroom` | `student-chat` | `GET/POST /portal/me/chat/...` |
| Absence / teacher ticket | Timetable drawer | — | `POST /portal/me/absence-requests`, `POST /portal/me/teacher-tickets` |

## 12b. Non-goals

- Paying fees or viewing full payment gateway on the student surface
- Editing name, DOB, class, photo
- Seeing siblings or other students’ full rank lists beyond own position fields
- Offline attendance marking or score entry
- Admin/staff library or medical consoles (separate waves)
- Fake Google SSO or invented cryptoseal marketing UI

---

## 13. Acceptance criteria (design / UX)

1. First viewport of Home answers name/class + next lesson without scrolling on a common phone height, or with at most one short scroll.
2. Bottom tabs are always the four named tabs; secondary pages live under More.
3. Results withheld design contains **zero** money or payment UI.
4. Fees entry point absent when setting off; present and read-only when on.
5. Touch targets ≥ 44px; colour is never the only status cue on attendance.
6. Welcome flow is linear and blocking until password requirement satisfied.
7. Visual system themable by school brand colour without redesigning layouts.
8. Designs cover light + dark, and a mid-size phone + a small phone breakpoint.

---

## 14. Deliverables to ask the design AI for

1. **IA diagram** (tabs + More stack).
2. **High-fidelity mobile screens** for T1–T4, T8, T9 + key states (withheld, offline timetable, empty home).
3. **More menu** inventory with conditional Fees / Lessons.
4. **Component inventory:** next-lesson card, period row, attendance day cell, subject result card, withheld panel, account read-only field + office hint.
5. **Motion notes** (what animates, what doesn’t).
6. **Copy sheet** for empty/error/withheld/offline.
7. **Do / Don’t** moodboard vs Parent and Admin.

---

## 15. Prompt block (paste after this PRD)

```text
You are designing the SMS Student Portal only (routes under /student, StudentShell).
Follow the PRD above exactly. Do not design Admin student management, Parent portal, or payment flows.
Prioritize phone-first UI, the four bottom tabs, read-only student data, withheld-results copy without fees, and optional read-only fees with no Pay button.
Produce: IA, mobile HF screens for Home / Timetable / Results (incl. withheld) / Attendance / Account / Welcome, More menu with conditional items, component list, and light+dark variants.
Call out every empty, loading, offline, and error state on those screens.
```
