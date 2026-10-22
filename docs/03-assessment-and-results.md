# Admin 03: Assessment, Results and Report Cards

Lifecycle shown everywhere as a four-step progress chip: **Draft, Submitted, Approved, Published**. Scores lock on submission. Editing afterwards needs `assessment.score.edit-locked` and a reason, and is audited.

## C1. Import wizard (shared pattern, used here, in students, staff and fees)
- **Route:** opens as a full-screen dialog from any page with an Import button | **Permission:** `import-export.import.create`
- **Steps:** 1 pick entity (students, guardians, staff, scores, fee structures, opening balances), download template (`GET /import-templates/:entity`). 2 upload file (`POST /imports` with `dryRun=true`, 202). 3 validation result: counts of valid and error rows, error table with row, column and message (`GET /imports/:id`, `GET /imports/:id/errors`), download errors as CSV. 4 **Commit** (`POST /imports/:id/commit`, 202) with progress. Cancel any time (`POST /imports/:id/cancel`).
- **Rule:** commit is disabled until a dry run completes. Show "X rows will be created or updated" before confirming.

## C2. Grading scales
- **Route:** `/admin/grading-scales` | **Permission:** `assessment.grading-scale.list`
- **Layout:** left list of scales (name, applies to level or all, default flag). Right editor: an editable band table (min score, max score, grade, remark, grade point) with live validation for gaps and overlaps and a coverage bar from 0 to 100.
- **Data and actions:** `GET /grading-scales`, `POST /grading-scales`, `PUT /grading-scales/:id` (409 if used by an approved result this session, show why and offer **Duplicate as new scale**).

## C3. Assessment schemes
- **Route:** `/admin/assessment-schemes` | **Permission:** `assessment.scheme.list`
- **Layout:** per level scheme editor. Rows are components (CA1, CA2, Exam) with weight and max score. A running total badge must reach 100 before Save is enabled. The exam flag marks the exam component.
- **Actions:** `GET /assessment-schemes`, `POST /assessment-schemes`, `PUT /assessment-schemes/:id`.

## C4. Approval workflows
- **Route:** `/admin/approval-workflows` | **Permission:** `assessment.workflow.read`
- **Layout:** per level ordered list of approval steps (step order, approver role). Add, reorder by drag, remove. `GET /approval-workflows`, `PUT /approval-workflows/:level`. Roles from `GET /roles`.

## C5. Assessments overview (exams officer)
- **Route:** `/admin/assessments` | **Permission:** `assessment.assessment.list`
- **Layout:** filters (session, term, class, subject, status). Table of assessments with component, teacher, entered count out of class size, status. Rows with low completion are flagged. **Create assessment** (`POST /assessments`).
- **Row opens** the score sheet (C6) for review.

## C6. Score sheet
- **Route:** `/admin/assessments/:id` | **Permission:** `assessment.score.list`
- **Layout:** header (class, subject, component, max score, status). Table with student, score input, absent toggle, last edited by.
- **Actions:** teachers enter scores in the staff portal. Admins can correct after submission: clicking a locked cell opens a ReasonDialog then `PATCH /scores/:id` (needs `assessment.score.edit-locked`) and the edit history is shown in a drawer. Unsubmitted sheets can be submitted by an admin with `assessment.score.submit` (`POST /assessments/:id/submit`).

## C7. Result sheets
- **Route:** `/admin/results` | **Permission:** `assessment.result-sheet.list`
- **Layout:** filters (session, term, level, class, status). Table: class, completion (subjects fully scored), computed at, status chip, approver, actions.
- **Data:** `GET /result-sheets`.

## C8. Result sheet detail
- **Route:** `/admin/results/:id` | **Permission:** `assessment.result-sheet.read`
- **Layout:** sticky header with class, term, status chip and the primary action that fits the status (Compute, Approve, Publish). Below, three tabs:
  1. **Overview:** completion by subject (progress bars, with a link to missing score sheets), grade distribution chart, class average, highest and lowest.
  2. **Student results:** wide table, one row per student, subject columns, total, average, position, grade. Frozen first columns. Comments editable per student (teacher and principal comments).
  3. **Approvals:** step timeline from the workflow with who approved or rejected and when, with reasons.
- **Actions:** **Compute** `POST /result-sheets/:id/compute` (202, banner), **Approve** `POST /result-sheets/:id/approve` (only for the user's own approval step, needs `assessment.result.approve`), **Reject** `POST /result-sheets/:id/reject` (ReasonDialog), **Publish** `POST /result-sheets/:id/publish`.
- **Fee clearance behaviour:** after Publish the response lists students withheld by the fee-clearance policy. Show a result dialog "42 published, 6 withheld" with the withheld list, each linking to the student's fees tab. Withheld students appear with a lock icon in the table.
- **Rules:** Approve is hidden until the sheet is submitted. Publish is disabled until approved. After publishing, the sheet is read-only.

## C9. Report cards
- **Route:** `/admin/report-cards` | **Permission:** `assessment.report-card.list`
- **Layout:** filters (session, term, class, student search, state: generated, published, withheld). Table: student, class, template version, generated at, state, actions (View PDF, Regenerate). Bulk **Download class pack** is a future export.
- **Actions:** **View** uses `GET /report-cards/:id` then opens the signed PDF in a side preview panel. **Regenerate** `POST /report-cards/:id/regenerate` (202), choosing current or a chosen template version.
- **Data:** `GET /report-cards`.

## C10. Report card templates
- **Route:** `/admin/templates/report-cards` | **Permission:** `documents.template.list`
- **Layout:** version list on the left, HTML and CSS editor in the middle (Monaco, with a variables list sidebar), live preview on the right using `POST /document-templates/:id/preview` (202, then show the PDF).
- **Actions:** `POST /document-templates/:id/versions` creates a new immutable version. Past report cards keep the version they were made with. The same page pattern serves receipt, ID card and letter templates through a type tab.
