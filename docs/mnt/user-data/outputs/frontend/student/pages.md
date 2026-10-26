# Student Side

Shell: `StudentShell`. Phone-first with desktop Courierdock sidebar. Bottom tabs: **Home**, **Timetable**, **Results**, **More**. Desktop IA matches the expanded stitch pack (Library, Medical, Community & Life), gated by feature flags.

Tone: short sentences, no financial jargon. Fees are visible only if the school enables it (setting) and are informational, with no pay button. Withheld results never mention money.

## Navigation

| Group | Item | Route | Flag |
|---|---|---|---|
| Overview | Dashboard | `/student` | — |
| Academics | Daily Timetable | `/student/timetable` | — |
| Academics | Live Classes | `/student/lessons` | lesson notes always; Meet hub when `lms` |
| Academics | Terminal Results | `/student/results` | — |
| Student Records | Attendance Matrix | `/student/attendance` | — |
| Student Records | Library Borrowing | `/student/library` | `library` |
| Student Records | Medical & Clinic | `/student/medical` | `health-sickbay` |
| Student Records | School Ledger | `/student/fees` | school setting |
| Community & Life | Scholar Lounge | `/student/chatroom` | `student-chat` |
| Community & Life | Campus Dispatches | `/student/announcements` | — |
| Community & Life | School Events | `/student/events` | — |
| System | Account & Settings | `/student/account` | — |

## T1. Home
- **Route:** `/student` | **Permission:** `portal.profile.read`
- **Stitch:** `student_portal_dashboard_overview_courierdock_style`, `student_portal_home_daily_overview`
- **Layout:** greeting, next lesson, today’s timetable, attendance rate, latest announcement, upcoming events (3). Withheld banner when `resultsWithheld`.
- **Data:** `GET /portal/me`, `GET /portal/me/overview`, `GET /portal/announcements`, `GET /portal/events`, timetable for next lesson.

## T2. Timetable
- **Route:** `/student/timetable` | **Permission:** `portal.timetable.read`
- **Stitch:** interactive weekly, desktop timetable, period detail, offline modes, full-week modal
- **Layout:** Daily / Full Week, day tabs, period list with resolved names/times, current period highlight, period detail drawer, offline cache banner.
- **Data:** `GET /portal/me/timetable` (enriched slots).

## T3. Attendance
- **Route:** `/student/attendance` | **Permission:** `portal.attendance.read`
- **Stitch:** `student_portal_streamlined_attendance_record`
- **Layout:** month calendar + summary + list. `GET /portal/me/attendance?from=&to=`.

## T4. Results and report cards
- **Route:** `/student/results`, `/student/report-cards`
- **Stitch:** terminal results, transcripts, dignified withheld
- **Withheld:** “Your results are not available yet. Please see the school office.” — no financial detail.
- **Data:** `GET /portal/me/results` (subjects + withheld), `GET /portal/me/report-cards`.

## T5. Live Classes / lesson notes
- **Route:** `/student/lessons`
- **Stitch:** `student_portal_live_classes_hub_google_meet_integration`
- **Data:** `GET /portal/me/lesson-notes`; when `lms` flag: `GET /portal/me/live-sessions`.

## T6. Fees (optional)
- **Route:** `/student/fees` — read-only. `GET /portal/me/invoices`.

## T7. Announcements and events
- **Routes:** `/student/announcements`, `/student/events`.

## T8. Account
- **Route:** `/student/account`. Profile read-only (“Ask the school office to change this”).

## T9. First login
- **Route:** `/student/welcome`.

## T10. Library (flag `library`)
- **Route:** `/student/library`
- **Stitch:** `student_portal_library_books_borrowing_catalogue`
- **Data:** `GET /portal/me/library`

## T11. Medical (flag `health-sickbay`)
- **Route:** `/student/medical`
- **Stitch:** `student_portal_medical_records_school_clinic_hub`
- **Data:** `GET /portal/me/medical` (audited, student-safe)

## T12. Scholar Lounge (flag `student-chat`)
- **Route:** `/student/chatroom`
- **Stitch:** `student_portal_grade_8_student_chatroom_study_lounge`
- **Data:** `GET /portal/me/chat/channels`, `GET .../messages`
