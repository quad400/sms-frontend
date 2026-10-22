# Staff Side (teachers, form teachers, approvers)

Shell: `StaffShell`. Phone-first. Bottom tabs: **Today**, **Attendance**, **Scores**, **Messages**, **More**. Desktop gets a sidebar with the same items plus Lesson plans, Leave and Approvals.

Scope rule: every list is already limited by the backend to the teacher's allocated classes and subjects. Never show a class or subject picker with options the teacher cannot use. Build pickers from the teacher's allocations (`GET /staff/me/allocations`, see backend gap 3).

Sync chip (offline status) sits in the header on every page (see `shared/architecture-and-conventions.md` section 7).

## S1. Today (dashboard)
- **Route:** `/staff` | **Permission:** any staff user
- **Layout:** greeting and date. Block 1 **My lessons today** (timeline of periods with class, subject, room, and a quick **Take attendance** button per lesson). Block 2 **To do** (registers not submitted, assessments awaiting scores, lesson plans due, approvals waiting) each as a tappable row with a count. Block 3 latest announcements (3 items). Block 4 sync status if there are pending items.
- **Data:** `GET /staff/me/overview` (gap 3) or composed from `GET /timetables?teacherId=&termId=`, `GET /attendance/registers?date=`, `GET /assessments?...`, `GET /announcements`. Offline: served from cache.

## S2. My timetable
- **Route:** `/staff/timetable` | **Permission:** `academics.timetable.list`
- **Layout:** week grid on desktop, day agenda with a day switcher on phones. Cells show class, subject, room. Current lesson is highlighted. Print button.
- **Data:** `GET /timetables?teacherId=me`. Cached offline.

## S3. My classes
- **Route:** `/staff/classes`, `/staff/classes/:id` | **Permission:** `students.student.list` (scoped)
- **Layout:** cards of allocated classes (subjects taught, student count, form teacher flag). Class page has tabs **Students** (roster with photo, guardian phone, medical alert icon only if the teacher is the form teacher), **Attendance** (class rate), **Scores** (completion per assessment), **Lesson notes**.
- **Data:** `GET /staff/me/allocations`, `GET /students?classId=`, `GET /attendance/summaries?classId=`.

## S4. Take attendance
- **Route:** `/staff/attendance`, `/staff/attendance/:registerId` | **Permission:** `attendance.register.open`, `attendance.entry.mark`
- **Layout:** top: class and date pickers (date defaults to today, past dates need the permission shown). Main: a student list in two modes. **Quick mode** (default): everyone starts as Present, tap a row to cycle Present, Absent, Late, Excused. Big **Mark all present** and a counter bar (Present 28, Absent 2, Late 1). Sticky footer: **Save** and **Submit register**.
- **Data:** `GET /attendance/registers?classId=&date=`, `GET /students?classId=`.
- **Actions:** if no register exists, `POST /attendance/registers` (with `clientRef`). Marks go through `PUT /attendance/registers/:id/entries` online, or into the offline outbox (each entry has its own `clientRef`). **Submit** `POST /attendance/registers/:id/submit` (ConfirmDialog: parents of absent students will be notified). Absent marking triggers the parent alert on the backend, the UI only tells the teacher this will happen.
- **States:** submitted registers are read-only with a **Request reopen** note to the admin. Offline shows saved-on-device chips per row. A conflict (someone else marked) shows in the sync attention list.

## S5. Score entry (gradebook)
- **Route:** `/staff/scores`, `/staff/scores/:assessmentId` | **Permission:** `assessment.score.list`, `.enter`
- **Layout:** list page: class, subject, term filters, then a table of assessments (component, max score, entered x of y, status). Entry page: header (class, subject, component, max score, status chip). A spreadsheet-like grid: student name (frozen), score input, absent toggle. Arrow keys and Enter move down the column. Out-of-range values turn red immediately (client check against max score). Footer: **Save draft** (autosave every 10 s) and **Submit scores**.
- **Data:** `GET /assessments?classId=&subjectId=&termId=`, `GET /assessments/:id/scores`.
- **Actions:** `PUT /assessments/:id/scores` (bulk, with `clientRef` per row) or offline outbox. **Submit** `POST /assessments/:id/submit` after a ConfirmDialog that says scores will lock and lists missing ones. Create an assessment instance (`POST /assessments`) when the component exists but no instance does.
- **Locked state:** submitted assessments are read-only. A **Request correction** button opens a message to the exams officer. Corrections themselves are done by admins (`admin/03` C6).

## S6. Lesson plans and notes
- **Route:** `/staff/lessons` | **Permission:** `academics.lesson-plan.list`, `academics.lesson-note.list`
- **Layout:** two tabs. **Plans:** table (week, subject, class, status), create form with title, objectives, content (rich text), class, subject, week, **Save draft**, **Submit for approval**. **Notes:** list with attachments, editor, **Share to class** (visible in the student portal when the backend supports it).
- **Actions:** `POST/PATCH /lesson-plans`, `POST /lesson-plans/:id/submit`, `POST/PATCH/DELETE /lesson-notes`. Attachments via `POST /files`.

## S7. Messages
- **Route:** `/staff/messages` | **Permission:** `communication.message.list`
- **Layout and behaviour:** same inbox pattern as admin F2. Recipient picker only offers guardians of the teacher's own students. Quick templates for common messages (absence follow up).
- **Data and actions:** `GET /messages/threads`, `POST /messages/threads`, `POST /messages/threads/:id/messages`.

## S8. Announcements and calendar
- **Route:** `/staff/announcements`, `/staff/calendar`. Read-only lists from `GET /announcements`, `GET /events`.

## S9. My leave
- **Route:** `/staff/leave` | **Permission:** `staff.leave.create`
- **Layout:** balance cards per leave type at the top, requests table below, **Request leave** sheet (type, dates, reason). **Cancel** `POST /leave-requests/:id/cancel`.
- **Data:** `GET /leave-types`, `GET /leave-requests`, `POST /leave-requests`.

## S10. Approvals
- **Route:** `/staff/approvals` | **Permission:** shown only when the user holds any approval permission
- **Layout:** one inbox with tabs by type: **Results** (result sheets awaiting this user's approval step), **Lesson plans**, **Leave** (for managers). Each row opens the item with Approve and Reject (ReasonDialog).
- **Data:** `GET /approvals/pending` (gap 8), or `GET /result-sheets?status=submitted`, `GET /lesson-plans?status=submitted`, `GET /leave-requests?status=pending`.
- **Actions:** `POST /result-sheets/:id/approve` or `/reject`, `POST /lesson-plans/:id/approve`, `POST /leave-requests/:id/approve` or `/reject`. Result sheet review opens the read-only version of admin C8.

## S11. Profile and security
- **Route:** `/staff/account` | Everyone
- **Layout:** profile card (`GET /auth/me`), tabs **Security** (change password `POST /auth/password/change`, 2FA enrol or disable, active sessions with revoke `GET /auth/sessions`, `DELETE /auth/sessions/:id`), **Notifications** (`GET/PUT /notification-preferences/me`, channel switches and quiet hours).
- This page component is shared with parent, student and admin through `features/account`.

## S12. Notifications inbox
- **Route:** `/staff/notifications` (bell dropdown for the latest 10). `GET /notifications/inbox`, `POST /notifications/inbox/:id/read`, `POST /notifications/inbox/read-all`. Shared component.
