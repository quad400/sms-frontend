# Public Side (no login, or applicant token)

Shell: `PublicShell`. School name and logo come from a public profile (add `GET /school-profile/public` if `GET /school-profile` stays authenticated).

## P1. Login
- **Route:** `/login`
- **Layout:** centered card. Logo and school name on top, email or phone field, password field with show toggle, "Forgot password" link under it, primary button.
- **Actions:** `POST /api/session/login` handler, which calls `POST /auth/login`. A 2FA challenge swaps the card for a six-digit code input and a recovery code link (`POST /auth/2fa/verify`).
- **States:** wrong credentials show one generic message. Repeated failures show the rate-limit message with the wait time. Locked accounts show "contact the school".
- **After login:** redirect to `next` if it is a safe internal path, else the portal for `userType`.

## P2. Forgot password
- **Route:** `/forgot-password`. One field, `POST /auth/password/forgot`. Always show "If an account exists, we sent instructions." (the backend always returns 202).

## P3. Reset password
- **Route:** `/reset-password?token=`. New password and confirm fields with a strength meter and rules list. `POST /auth/password/reset`. On success go to login with a success toast. An expired token shows a "request a new link" action.

## P4. Admissions: apply
- **Route:** `/apply`
- **Data:** `GET /admission-forms/current` (form definition and open intake windows).
- **Layout:** multi-step form with a progress header and sticky footer (Back, Save and continue).
  1. Child: name, date of birth, gender, level applied for (from the intake), previous school.
  2. Guardians: one or more, each with relationship, name, phone, email, primary contact flag.
  3. Documents: one uploader per required document type.
  4. Review and submit, with a consent checkbox.
- **Actions:** documents upload with `POST /files`, then attach with `POST /applications/:id/documents`. Final submit is `POST /applications` with a `clientRef` generated when the form opens, so a double submit never creates two applications.
- **After submit:** confirmation page with the application number and a status link. The applicant token is shown once with a copy button and also emailed.
- **States:** a closed intake shows a friendly message with the next opening date. Drafts autosave to local storage (never documents).

## P5. Application status
- **Route:** `/application-status`. Fields: application number and applicant token. `GET /applications/status`.
- **Layout:** vertical timeline (Submitted, Review, Test, Decision, Offer, Acceptance, Enrolled) with the current step highlighted, the latest message, and any action needed (upload missing document, accept offer, pay).

## P6. Accept offer
- **Route:** `/accept-offer?application=&token=`. Shows the offer summary (level, expiry, acceptance fee from the linked invoice). `POST /applications/:id/offer/accept`, then a Pay button that starts a checkout session and redirects to the gateway URL.
- **States:** expired or withdrawn offers show a clear message and the school's contact details.
