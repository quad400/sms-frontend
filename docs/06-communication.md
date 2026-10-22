# Admin 06: Communication and Notifications

## F1. Announcements
- **Route:** `/admin/communication/announcements` | **Permission:** `communication.announcement.list`
- **Layout:** table (title, audience, status, published at, author). **New announcement** opens a full-page editor: title, rich text body (simple toolbar, no raw HTML), audience selector (school, campus, level, class, guardians of class) with multi-target pickers, attachments, **Save draft** or **Publish**.
- **Actions:** `POST /announcements`, `PATCH /announcements/:id`, `POST /announcements/:id/publish` (202, shows the delivery estimate before confirming), `DELETE /announcements/:id`.
- **Data:** `GET /announcements`, `GET /announcements/:id`.

## F2. Messages
- **Route:** `/admin/communication/messages` | **Permission:** `communication.message.list`
- **Layout:** classic two-pane inbox. Left: thread list with unread dots, search. Right: conversation with message input. **New message** picks recipients from the allowed list (see backend gap 5).
- **Actions:** `GET /messages/threads`, `POST /messages/threads`, `GET /messages/threads/:id`, `POST /messages/threads/:id/messages` with a `clientRef` per send.
- **Behaviour:** poll every 20 s while open or use push once available. Sending is optimistic and shows a retry state.

## F3. School calendar
- **Route:** `/admin/communication/events` | **Permission:** `communication.event.list`
- **Layout:** month, week and list views. Events colour by type lookup. Click a date to create. Event form: title, type, start, end, location, campus, description.
- **Actions:** `GET /events`, `POST /events`, `PATCH /events/:id`, `DELETE /events/:id`.

## F4. Reminders
- **Route:** `/admin/communication/reminders` | **Permission:** `communication.reminder.list`
- **Layout:** table (title, audience, remind at, status) and a create sheet. `GET/POST/PATCH /reminders`.

## F5. Notification templates
- **Route:** `/admin/communication/templates` | **Permission:** `notifications.template.list`
- **Layout:** table grouped by template key with one row per channel. Detail editor: subject (email only), body with variable chips inserted from a sidebar list, character counter for SMS, **Preview with sample data** (`POST /notification-templates/:id/preview`), version history.
- **Actions:** `GET/POST /notification-templates`, `PATCH /notification-templates/:id` (creates a new version).

## F6. Delivery log
- **Route:** `/admin/communication/deliveries` | **Permission:** `notifications.delivery.list`
- **Layout:** filters (status, channel, recipient, date range). Table with recipient, channel, template, status, attempts, last error. Row drawer shows each attempt. **Retry** for failed ones (`POST /notifications/deliveries/:id/retry`).
- **Data:** `GET /notifications/deliveries`. Values for status and channel come from lookups.
