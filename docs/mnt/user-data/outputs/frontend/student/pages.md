# Student Side

Shell: `StudentShell`. Phone-first, simple, friendly. Bottom tabs: **Home**, **Timetable**, **Results**, **More**. Students have read-only access to their own record. All data comes from the student's own portal endpoints (`/portal/me/*`, see backend gap 4). Until those exist, the same data is available through `/portal/children/:studentId/*` only if the backend allows a student to read their own id.

Tone: short sentences, no financial jargon. Fees are visible only if the school enables it (setting) and are informational, with no pay button.

## T1. Home
- **Route:** `/student` | **Permission:** `portal.profile.read`
- **Layout:** greeting with the student's name and class. **Next lesson** card (subject, room, time). Today's timetable list. Attendance rate tile. Latest announcement. Upcoming events (3).
- **Data:** `GET /portal/me`, `GET /portal/me/overview`, `GET /portal/announcements`, `GET /portal/events`.

## T2. Timetable
- **Route:** `/student/timetable` | **Permission:** `portal.timetable.read`
- **Layout:** day tabs with period list, current period highlighted. Works offline from cache. `GET /portal/me/timetable`.

## T3. Attendance
- **Route:** `/student/attendance` | **Permission:** `portal.attendance.read`
- **Layout:** month calendar and summary counts, same component as R2 without the child switcher. `GET /portal/me/attendance`.

## T4. Results and report cards
- **Route:** `/student/results`, `/student/report-cards` | **Permission:** `portal.result.read`, `portal.report-card.read`
- **Layout:** term selector, subject cards (score, grade, position, remark), report card list with View PDF. A withheld state shows "Your results are not available yet. Please see the school office." with no financial detail.
- **Data:** `GET /portal/me/results`, `GET /portal/me/report-cards`.

## T5. Learning material (when available)
- **Route:** `/student/lessons`. Lesson notes shared by teachers for the student's class, with downloads. Needs a student-facing endpoint for shared lesson notes (add `GET /portal/me/lesson-notes`). Hidden until the backend provides it. Phase 2 LMS assignments will slot in here without changing other pages.

## T6. Fees (optional)
- **Route:** `/student/fees`, shown only when the school allows it. Read-only invoice and balance summary from `GET /portal/me/invoices`.

## T7. Announcements and events
- **Route:** `/student/announcements`, `/student/events`. `GET /portal/announcements`, `GET /portal/events`.

## T8. Account
- **Route:** `/student/account`. Profile (read-only), change password, notification preferences, active sessions. Shared `features/account` component. Students cannot edit personal details, they see "Ask the school office to change this".

## T9. First login
- **Route:** `/student/welcome`. Force a password change, short tour of the tabs, PWA install prompt.
