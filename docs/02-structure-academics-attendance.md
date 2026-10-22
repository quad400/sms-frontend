# Admin 02: School Structure, Academics and Attendance

## B1. Campuses
- **Route:** `/admin/campuses` | **Permission:** `school-structure.campus.list`
- **Layout:** card grid (name, code, address, student count, active flag). **Add campus** opens a side sheet. If the licence campus limit is reached the button is disabled with the limit shown (`GET /license/usage`).
- **Actions:** `POST /campuses`, `PATCH /campuses/:id`.

## B2. Sessions and terms
- **Route:** `/admin/sessions` | **Permission:** `school-structure.session.list`
- **Layout:** left list of sessions (active one badged), right panel for the selected session showing three term cards (dates, status, holidays count) in a horizontal timeline.
- **Actions:** `POST /sessions`, `PATCH /sessions/:id`, `POST /sessions/:id/activate`. Per term: edit dates `PATCH /terms/:id`, **Activate** `POST /terms/:id/activate`, **Close term** `POST /terms/:id/close` with a ConfirmDialog that lists what locks (scores, registers) and what is triggered. Holidays are edited inside the term card.
- **Data:** `GET /sessions`, `GET /sessions/:id`, `GET /terms?sessionId=`.

## B3. Levels, arms and classes
- **Route:** `/admin/classes` | **Permission:** `school-structure.class.list`
- **Layout:** header with session and campus selects. Main area is a grid grouped by level (Primary 1 to SS3). Each level row shows its class chips (Arm A, B, C) with student counts and form teacher. **Add class** and **Add level** are in the header menu.
- **Actions:** `POST /classes` (level, arm, form teacher), `PATCH /classes/:id`, `DELETE /classes/:id` (409 if it has enrolments, show a clear message). `GET/POST/PATCH /levels`.
- **Class detail drawer:** roster (`GET /students?classId=`), subjects and teachers (`GET /allocations?classId=`), timetable link, attendance rate.

## B4. Subjects and curriculum
- **Route:** `/admin/subjects` | **Permission:** `school-structure.subject.list`
- **Layout:** two tabs. **Subjects:** simple table (code, name, active). **Curriculum:** matrix with subjects as rows, levels as columns and checkboxes (compulsory or optional toggle). Save per level `PUT /levels/:id/curriculum-subjects`.
- **Data:** `GET /subjects`, `GET /curriculum-subjects`.

## B5. Houses
- **Route:** `/admin/houses` | **Permission:** `school-structure.house.list`. Cards with colour, member count. `POST /houses`, `PATCH /houses/:id`. Assign students from the student form or bulk from the list.

## B6. Staff allocations matrix
- **Route:** `/admin/allocations` | **Permission:** `staff.allocation.list`
- **Layout:** class selector on top. Table with subjects as rows and a teacher select per row for the chosen class. A second view flips it to teacher by class.
- **Data:** `GET /allocations?classId=&sessionId=`, `GET /staff`. **Actions:** save per teacher `PUT /staff/:id/allocations`. Warn if a teacher is double booked in the timetable.

## B7. Timetables
- **Route:** `/admin/timetables`, `/admin/timetables/:id` | **Permission:** `academics.timetable.list`
- **List:** class, term, status (draft or published), last published.
- **Builder (detail):** weekly grid with weekdays as columns and time slots as rows (breaks greyed). Each cell holds subject, teacher and room. Drag a subject chip from a right-hand palette (only subjects in the curriculum, with the allocated teacher prefilled) onto a cell. Clashes (teacher in two places, room reused) show a red outline and a message from the backend's 422.
- **Actions:** `POST /timetables`, `PUT /timetables/:id/slots` (autosave debounced, plus an explicit Save), `POST /timetables/:id/publish` (ConfirmDialog). Time slots and rooms are managed in a side sheet (settings group or dedicated endpoints when added).
- **Print:** print stylesheet gives a clean A4 landscape grid.

## B8. Lesson plans review
- **Route:** `/admin/lesson-plans` | **Permission:** `academics.lesson-plan.list`
- **Layout:** table (teacher, subject, class, week, status) with a status tabs row (Submitted, Approved, Draft). Row opens a reading pane. **Approve** `POST /lesson-plans/:id/approve`.
- **Data:** `GET /lesson-plans`, `GET /lesson-plans/:id`.

## B9. Attendance overview
- **Route:** `/admin/attendance` | **Permission:** `attendance.register.list`
- **Layout:** date picker and campus on top. Left: classes table with columns (class, teacher, register status, present, absent, late, rate). Rows without a submitted register are highlighted. Right: summary tiles and a trend chart.
- **Data:** `GET /attendance/registers?date=&campusId=`, `GET /attendance/summaries`.
- **Actions:** row opens register detail (B10). **Remind teacher** sends through `POST /announcements` style reminder only when a reminder endpoint exists, otherwise copy a link.

## B10. Register detail
- **Route:** `/admin/attendance/registers/:id` | **Permission:** `attendance.register.read`
- **Layout:** header with class, date, status. Table of students with mark selector (present, absent, late, excused) and note.
- **Actions:** admins with `attendance.entry.mark` can correct `PUT /attendance/registers/:id/entries`. `POST /attendance/registers/:id/reopen` (ReasonDialog) when submitted.

## B11. Attendance reports
- **Route:** `/admin/attendance/reports` | **Permission:** `attendance.summary.read`
- **Layout:** filters (class, level, date range). Chart plus a table of students with the lowest attendance (threshold input). Export with `POST /exports`.
- **Data:** `GET /attendance/summaries`, `GET /students/:id/attendance`.

## B12. Staff attendance
- **Route:** `/admin/staff-attendance` | **Permission:** `attendance.staff.list`
- **Layout:** date picker, table of staff with mark selector. **Save** `PUT /staff-attendance`. Data `GET /staff-attendance`.
