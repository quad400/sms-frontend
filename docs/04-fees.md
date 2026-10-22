# Admin 04: Fees

Rules the UI must respect: invoices are immutable once issued (correct with credit notes or adjustments), payments are append-only, receipts come from payments, money is minor units.

## D1. Fee items and structures
- **Route:** `/admin/fees/structures` | **Permission:** `fees.structure.list`
- **Layout:** filters (campus, session, term, level). Table of structures: name, level, term, version, total, current flag. Detail opens a split view: left items table (fee item select, amount, currency), right a summary with total and "Used by N invoices".
- **Actions:** `POST /fee-structures`, `PUT /fee-structures/:id` (allowed only if no invoice uses it, otherwise the UI offers **Create new version** which prefills a new structure). Fee items (tuition, uniform, etc.) are managed in a side sheet.
- **Import:** structures can be imported (C1).

## D2. Discounts and scholarships
- **Route:** `/admin/fees/discounts` | **Permission:** `fees.discount.list`
- **Layout:** two tabs. **Discounts:** name, type (fixed or percentage), value, active. **Scholarships:** name, sponsor, linked discount, award count. Award drawer: search student, session, start and end date (`POST /scholarships/:id/awards`).
- **Data and actions:** `GET/POST /discounts`, `GET/POST /scholarships`.

## D3. Invoices
- **Route:** `/admin/fees/invoices` | **Permission:** `fees.invoice.list`
- **Layout:** header with **Create invoice** and **Generate batch**. Status chips as quick filters with counts. Filter bar: student search, class, term, campus, date range. Table: invoice number, student, term, total, paid, balance, due date, status, row menu.
- **Data:** `GET /invoices`.

## D4. Create invoice
- **Route:** `/admin/fees/invoices/new?studentId=` | **Permission:** `fees.invoice.create`
- **Layout:** student picker, term, purpose. Line editor (fee item, description, quantity, unit amount) prefilled from the matching structure, discounts picker, live totals card at the right (subtotal, discount, total). Footer: **Save as draft**, **Issue**.
- **Actions:** `POST /invoices`, then `POST /invoices/:id/issue` (ConfirmDialog stating that it becomes immutable).

## D5. Generate batch
- **Route:** `/admin/fees/invoices/batch` | **Permission:** `fees.invoice.generate-batch`
- **Layout:** step 1 scope (campus, session, term, levels or classes), step 2 preview counts and totals (students with no structure are listed as skipped), step 3 confirm. Progress banner afterwards.
- **Actions:** `POST /invoices/batches` (202). Show a result summary with created, skipped and failed counts.

## D6. Invoice detail
- **Route:** `/admin/fees/invoices/:id` | **Permission:** `fees.invoice.read`
- **Layout:** left (main): invoice document view (header with number and status, lines, discounts, totals), below it a tab strip **Payments**, **Adjustments**, **Reminders**, **History**. Right column: student card, balance card, action stack.
- **Actions in the right stack:** **Record payment** (D7), **Pay online link** (`POST /invoices/:id/checkout-sessions`, copy link), **Add credit note** (`POST /invoices/:id/credit-notes`), **Add adjustment** (`POST /invoices/:id/adjustments`), **Cancel invoice** (`POST /invoices/:id/cancel`, ReasonDialog), **Send reminder** (`POST /debtors/reminders`, scoped). Edit amounts is never shown for issued invoices.
- **Data:** `GET /invoices/:id`, `GET /invoices/:id/payments`.

## D7. Record payment
- **Route:** dialog on D6 or `/admin/fees/payments/new` | **Permission:** `fees.payment.record`
- **Fields:** invoice (locked or search), method (cash, POS, bank transfer), amount (MoneyInput, defaults to the balance, warns on overpayment), reference, paid date and time.
- **Actions:** `POST /invoices/:id/payments` with an `Idempotency-Key` created when the dialog opens. On success show the receipt link and a **Print receipt** button (`GET /payments/:id/receipt`).
- **Rule:** if the response is `INVOICE_ALREADY_PAID` show the message and refresh the invoice.

## D8. Payments
- **Route:** `/admin/fees/payments` | **Permission:** `fees.payment.list`
- **Layout:** filters (method, status, date range, campus). Table: receipt number, student, invoice, method, amount, status, paid at, recorded by. Totals strip above (sum for the filter). Row opens payment detail with receipt preview and **Resend receipt** (`POST /payments/:id/receipt/resend`).
- **Data:** `GET /payments`, `GET /payments/:id`.

## D9. Reconciliation queue
- **Route:** `/admin/fees/reconciliation` | **Permission:** `fees.reconciliation.list`
- **Layout:** left list of open exceptions (source icon, amount, reference, date), right pane for the selected one: the raw details and a **Suggested invoices** list (search by reference, student, amount). **Match** `POST /reconciliation/exceptions/:id/match`, **Dismiss** `POST /reconciliation/exceptions/:id/dismiss` (ReasonDialog).
- **Bank statements:** **Import statement** button, `POST /reconciliation/bank-statements` (202). Result shows matched count and new exceptions.
- **Data:** `GET /reconciliation/exceptions`.

## D10. Debtors
- **Route:** `/admin/fees/debtors` | **Permission:** `fees.debtor.list`
- **Layout:** filters (minimum balance, level, term, campus). Table: student, class, invoiced, paid, balance, days overdue, last reminder. Bulk select then **Send reminders** (`POST /debtors/reminders`, 202, ConfirmDialog with recipient count). Export.
- **Data:** `GET /debtors`.

## D11. Fee-clearance policy
- **Route:** `/admin/fees/clearance` | **Permission:** `config.setting.read` and `.update`
- **Layout:** a form for the `fee-clearance` settings group: what is gated (report card publishing, portal result view, exam entry), the rule (minimum percentage paid or maximum outstanding), exemptions list (scholarship students, specific students). A **Test** panel: pick a student and see the evaluation (`GET /students/:id/fee-clearance`).
- **Actions:** `GET/PUT /settings/fee-clearance`. Audited.

## D12. Student account (statement)
- **Route:** `/admin/fees/accounts/:studentId` | **Permission:** `fees.account.read`
- **Layout:** header with balance. Statement table (date, document, debit, credit, running balance). **Print statement** opens a PDF. Data `GET /students/:id/account`.
