# Admin 05: Admissions

Flow: application, decision, offer, acceptance payment, enrolment. Each transition is event driven, so the UI shows status and never "completes" a step the backend does by itself. Enrolment appears automatically after the acceptance invoice is paid.

## E1. Intakes
- **Route:** `/admin/admissions/intakes` | **Permission:** `admissions.intake.list`
- **Layout:** cards per intake (name, campus, session, window dates, applications count, capacity fill bars per level). **Add intake** opens a sheet with name, campus, session, opens and closes dates, capacity per level (repeatable row).
- **Actions:** `GET /intakes`, `POST /intakes`, `PATCH /intakes/:id`.

## E2. Applications
- **Route:** `/admin/admissions/applications` | **Permission:** `admissions.application.list`
- **Layout:** header with a view toggle **Table** and **Board**. Filters: intake, level, status, search. The board has columns Submitted, Under review, Decision made, Offer issued, Accepted, Enrolled. Cards show name, level, age, test score, days in stage.
- **Data:** `GET /applications`. Cards open E3 as a right side panel on the board, full page from the table.

## E3. Application detail
- **Route:** `/admin/admissions/applications/:id` | **Permission:** `admissions.application.read`
- **Layout:** header with applicant name, application number, status chip and the next step button (changes with status). Left column: tabs **Details** (child and guardians, editable with `PATCH /applications/:id`, audited), **Documents** (list with preview and type), **Test** (scores), **Timeline** (events and decisions). Right column: decision card and offer card.
- **Actions:** **Record decision** (`POST /applications/:id/decision` with decision type admit, waitlist or reject and a reason), **Issue offer** (`POST /applications/:id/offer`, expiry date, level), **Withdraw offer** (`POST /applications/:id/offer/withdraw`, ReasonDialog).
- **Rules:** Issue offer appears only after an admit decision. The offer card shows the acceptance invoice status (linked to fees) and the enrolment confirmation time once it happens.

## E4. Entrance tests
- **Route:** `/admin/admissions/tests`, `/admin/admissions/tests/:id` | **Permission:** `admissions.test.list`
- **Layout:** list of tests (title, intake, date, venue, candidates). Detail has a candidates table with a score input per row and an attendance toggle. **Assign candidates** opens a picker of applications from the intake (`POST /entrance-tests/:id/candidates`). **Save results** `PUT /entrance-tests/:id/results`.
- **Data:** `GET /entrance-tests`, `POST /entrance-tests`.

## E5. Offers
- **Route:** `/admin/admissions/offers` | **Permission:** `admissions.application.list`
- **Layout:** table filtered to offer states: issued, accepted, expired, withdrawn, with acceptance invoice status and a reminder action. Derived from `GET /applications?status=offer-issued` and related statuses.

## E6. Admission form settings
- **Route:** `/admin/admissions/form` | **Permission:** `config.setting.update`
- **Layout:** required documents list, instructions text, consent wording. Stored in a settings group (`admissions`) through `GET/PUT /settings/admissions`. Preview opens `/apply`.
