# Parent Side

Shell: `ParentShell`. Phone-first, single column, large touch targets. Bottom tabs: **Home**, **Results**, **Fees**, **Messages**, **More**. A **child switcher** in the header selects the active child (`studentId` in the URL). A parent with one child never sees the switcher.

Everything is read through the portal endpoints, which are already filtered to linked children. A child that is not linked returns 404, handled with the standard not-available page.

## R1. Home
- **Route:** `/parent` | **Permission:** `portal.child.list`
- **Layout:** child cards at the top (photo, name, class). Under the selected child: **Today** strip (attendance status for today with a tick or an absence badge), then four tiles: **Attendance rate**, **Latest result** (average and position), **Fees balance** (with Pay now when owing), **Next event**. Below, latest announcements. If fees are overdue, a banner at the top with a Pay now action.
- **Data:** `GET /portal/children`, `GET /portal/children/:studentId/overview`, `GET /portal/announcements`.

## R2. Attendance
- **Route:** `/parent/children/:studentId/attendance` | **Permission:** `portal.attendance.read`
- **Layout:** month calendar with colour and icon per mark (present, absent, late, excused), month navigation, summary row (days present, absent, late, rate). List below for the selected month.
- **Data:** `GET /portal/children/:studentId/attendance?from=&to=`.

## R3. Results
- **Route:** `/parent/children/:studentId/results` | **Permission:** `portal.result.read`
- **Layout:** term selector. Card per subject with score, grade, position, remark, and a mini bar of class average if available. Summary card on top (total, average, class position). Trend chart across terms.
- **Data:** `GET /portal/children/:studentId/results`.
- **Withheld state:** if results are blocked by the school's fee-clearance policy, show a clear, polite notice with the amount needed and a **Pay now** button, not an error.

## R4. Report cards
- **Route:** `/parent/children/:studentId/report-cards` | **Permission:** `portal.report-card.read`
- **Layout:** list of published report cards by session and term. Each row has **View** (opens the signed PDF) and **Download**. Withheld cards show the same fee notice as R3.
- **Data:** `GET /portal/children/:studentId/report-cards`.

## R5. Timetable
- **Route:** `/parent/children/:studentId/timetable` | **Permission:** `portal.timetable.read`
- **Layout:** day tabs (Mon to Fri) with the period list for the selected day, today preselected. `GET /portal/children/:studentId/timetable`.

## R6. Fees
- **Route:** `/parent/children/:studentId/fees` | **Permission:** `portal.invoice.read`
- **Layout:** balance card on top (total owing, due date, **Pay now**). Tabs **Invoices** and **Payments and receipts**. Invoice rows expand to show lines and totals. A single Pay now button pays the oldest or selected invoice.
- **Data:** `GET /portal/children/:studentId/invoices`, `GET /portal/children/:studentId/receipts`.
- **Pay flow:** `POST /portal/children/:studentId/invoices/:invoiceId/checkout-sessions` with an `Idempotency-Key` created when the Pay screen opens. The response contains the gateway URL, redirect to it. The return page `/parent/payments/return?reference=` polls the invoice until it shows paid (up to 60 s), then shows a success screen with the receipt. If it stays pending, show "We are confirming your payment" and the receipt will appear in the list when done. Never mark a payment successful from the redirect alone.
- **Receipts:** **Download** opens the signed PDF from the receipts list.

## R7. Messages
- **Route:** `/parent/messages` | **Permission:** `communication.message.list` (portal scoped)
- **Layout:** thread list then conversation, like a chat. Parents can message the form teacher and subject teachers of their children. `GET /messages/threads`, `POST /messages/threads`, `POST /messages/threads/:id/messages` (with `clientRef`).

## R8. Announcements and events
- **Route:** `/parent/announcements`, `/parent/events`. `GET /portal/announcements`, `GET /portal/events`. Events offer **Add to calendar** (generates an `.ics` on the client).

## R9. Notifications
- **Route:** `/parent/notifications`. Shared inbox component with the bell dropdown. Absence alerts deep link to the attendance page for that date.

## R10. Profile and consents
- **Route:** `/parent/account` | **Permission:** `portal.profile.update`
- **Layout:** tabs **Profile** (own contact details `PATCH /portal/me/contact`), **Children** (list with relationship, read-only), **Notifications** (`GET/PUT /notification-preferences/me`), **Security** (change password, 2FA optional), **Privacy** (consents given for each child and a request-data-correction message that opens a thread to the school).
- **Data:** `GET /portal/me`, `GET /students/:id/consents` for linked children when exposed through the portal.

## R11. First login
- **Route:** `/parent/welcome`. Shown once: force a password change, confirm phone number, choose notification channels, show how to add the app to the home screen (PWA install prompt).
