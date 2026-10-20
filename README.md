# AYAN — Everything Managed. One Smart Platform.

A modern, production-oriented multi-service management platform for property safety inspections, compliance certifications, and engineer dispatch. Inspired by leading multi-certification platforms, built with custom branding, an integrated multi-step booking engine, dedicated customer and engineer portals, and a complete administrative control panel.

---

## 🚀 Quick Start

### 1. Requirements
- Node.js >= 20.0.0
- npm >= 9.0.0

### 2. Installation
```bash
npm install
```

### 3. Database Initialization & Seeding
The project uses SQLite for zero-setup local development (and can be pointed to PostgreSQL in production simply by changing `DATABASE_URL` and the provider in `prisma/schema.prisma`).
```bash
npm run prisma:push
npm run seed
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Automated Tests & Type Check
```bash
# Run unit & state-machine test suites
npm test

# Run strict TypeScript compiler verification
npm run typecheck

# Build optimized production bundle
npm run build
```

---

## 🔐 Seeded Accounts & Credentials

All test accounts use the password: `Password123`

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ayan.test` | `Password123` | `/admin` |
| **Approved Engineer** | `engineer@ayan.test` | `Password123` | `/engineer` |
| **Pending Engineer** | `pending.engineer@ayan.test` | `Password123` | `/engineer` (awaiting admin verification) |
| **Customer** | `customer@ayan.test` | `Password123` | `/dashboard` |

---

## 🏛 Architecture & Route Directory

### 1. Public Website
- `/` — Premium homepage with announcement banner, search/booking widget, verified service cards, how-it-works process steps, sample testimonials, coverage area checker, and FAQs.
- `/services` — Searchable and filterable service directory with pricing, categories, and direct booking links.
- `/services/[slug]` — Individual service detail pages with breakdown, duration, legal compliance details, and FAQs.
- `/how-it-works` — Transparent customer journey walkthrough.
- `/about` — AYAN mission, company background, and standards.
- `/coverage` — Interactive UK postcode coverage checker.
- `/faqs` — Searchable knowledge base and answers.
- `/contact` — Contact details, office location, and enquiry submission.
- `/legal/terms`, `/legal/privacy`, `/legal/cookies`, `/legal/cancellation` — Comprehensive policy documents.

### 2. Multi-Step Booking Flow (`/book`)
Open to guests — no account is required to start or complete a booking.
1. **Services** — Pick one or more services from the catalogue.
2. **Property** — Postcode coverage check first; the address fields unlock only once the postcode is confirmed as covered.
3. **Job details** — Service-specific questions (appliance counts, property type, yes/no) that can adjust the price. Answers are re-priced on the server.
4. **Date & time** — Live availability with Morning, Afternoon and Evening windows.
5. **Your details** — Name, email, phone and access notes. Guests get an account created automatically.
6. **Review & pay** — Server-priced subtotal, VAT, discount code and total. Pay on completion by default; card payment appears only when the payment provider is configured.
7. **Confirmation** — Cryptographic reference (`AYN-XXXXXX`), next steps, and a one-time link to set a password for a newly created account.

Supporting routes: `/set-password` (one-time guest activation), `/login`, `/register`, `/reset-password`, `/forgot-password`.

### 3. Customer Portal (`/dashboard`)
- `/dashboard` — Live overview of active appointments, completed jobs, documents, next appointment, and a Premium teaser.
- `/dashboard/bookings` — All current and past bookings with status tracking.
- `/dashboard/bookings/[id]` — Detailed booking lifecycle, assigned engineer, event timeline, and PDF invoice.
- `/dashboard/properties` — Saved addresses and property management.
- `/dashboard/documents` — Digital compliance certificates with secure downloads.
- `/dashboard/invoices` — Real invoice records and financial summaries.
- `/dashboard/premium` — **Premium tier (coming soon)**: plan details, feature comparison table, and launch waitlist sign-up.
- `/dashboard/notifications` — Notification inbox for status updates and reminders.
- `/dashboard/support` — Support ticket creation and messaging.
- `/dashboard/profile` & `/dashboard/security` — Account details and password management.

### 4. Engineer Portal (`/engineer`)
- `/engineer` — Performance metrics (jobs awaiting acceptance, jobs in progress, completed, earnings).
- `/engineer/jobs` — Job queue with assigned bookings.
- `/engineer/jobs/[id]` — Job specifications, customer instructions, accept/reject actions, status transition buttons, and certificate/report upload.
- `/engineer/availability` — Weekly operating hours configuration (Monday – Sunday start/end times).
- `/engineer/profile` — Professional bio, headline, coverage cities, and base postcode.
- `/engineer/qualifications` — Accreditations, Gas Safe/NICEIC licence records, expiry dates, and document links submitted for admin review.

### 5. Administrative Control Panel (`/admin`)
Protected by strict server-side `requireAdmin()` guards:
- `/admin` — High-level dashboard with live metrics: revenue, pending dispatch, active appointments, completed jobs, user counts, and recent audit trail.
- `/admin/users` — Directory of customers, engineers, and administrators. Search, filter, suspend accounts, and approve engineer candidates.
- `/admin/users/[id]` — User details, role assignment, engineer credential verification, and activity log.
- `/admin/services` — Service catalogue management. Create, edit, publish/unpublish services, set pricing, duration, manage service categories, and configure per-service booking questions with price adjustments.
- `/admin/services/new` & `/admin/services/[id]` — Full service creation and modification forms.
- `/admin/discounts` — Discount code management: percentage or fixed-amount codes, minimum spend, usage limits and activation windows.
- `/admin/bookings` — Booking management and dispatch. Filter by status, search by reference or postcode.
- `/admin/bookings/[id]` — Booking command center: assign/reassign approved engineers, update lifecycle state, reschedule appointments, record manual payments, and view event logs.
- `/admin/finance` — Settled payments, pending balances, invoice records, refund execution, and one-click CSV export.
- `/admin/premium` — **Premium tier control**: launch status, waitlist size, signup sources, and waitlist CSV export.
- `/admin/content` — CMS management for FAQs, testimonials, announcement banners, and coverage areas.
- `/admin/settings` — System parameters (company name, VAT rate, cancellation policy cut-offs, Premium status/launch window/waitlist toggle) and audit trail.

---

## 💎 Premium Tier (Coming Soon)

Premium is a fully specified, launch-ready plan that **cannot be purchased yet**. It is controlled by three system settings so it can be flipped live without a code change:

| Setting key | Default | Purpose |
| :--- | :--- | :--- |
| `premiumStatus` | `COMING_SOON` | `COMING_SOON` or `LIVE` |
| `premiumLaunchWindow` | `Later this year` | Marketing copy shown to customers |
| `premiumWaitlistOpen` | `true` | Whether customers can still join the waitlist |

- **Customer side** — `/dashboard/premium` shows the plan, a Standard vs Premium comparison table, and a waitlist form that stores the interest in `PremiumWaitlist`. A "Soon" badge is shown in the dashboard navigation and a teaser card appears on the overview.
- **Admin side** — `/admin/premium` shows the status, waitlist size, signup breakdown, and a CSV export. Status/launch window/waitlist availability are edited under `/admin/settings`.
- Set `premiumStatus` to `LIVE` to take the tier live (purchasing itself is not implemented yet).

---

## 🔑 Google Sign-In (OAuth 2.0)

The platform supports signing in with Google alongside email/password, using the OpenID Connect authorization-code flow with PKCE. Google is used purely as an identity provider — no Google access token is stored, and AYAN still issues its own signed session cookie.

### Setup
1. In the [Google Cloud Console](https://console.cloud.google.com/), create a project and enable the **Google Identity Services** (OpenID Connect) API.
2. Create an **OAuth client ID** of type *Web application*.
3. Add the authorised redirect URI:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`
4. Set the environment variables:

```bash
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="https://your-domain.com/api/auth/google/callback" # optional
```

When both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are present, the sign-in and sign-up pages automatically show a **Continue with Google** button; when they are absent the platform stays in password-only mode.

### Flow
1. `GET /api/auth/google` — generates a `state` value and PKCE verifier, stores them in short-lived httpOnly cookies and redirects to Google's consent screen.
2. `GET /api/auth/google/callback` — validates `state`, exchanges the code for a verified profile, then:
   - links to an already-linked account, or
   - links a **verified** Google email to an existing AYAN account, or
   - creates a new customer account with a random, undisclosed password.
3. A normal AYAN session cookie is issued and the user is redirected to their role home (`/dashboard`, `/engineer` or `/admin`).

---

## 🔒 Security & Data Integrity

1. **Role Enforcement on the Server**: Client-side roles are never trusted. All access checks happen via server-side guards (`requireUser`, `requireRole`, `requireAdmin`, `requireEngineer`) validating signed JWT sessions.
2. **Customer Data Isolation**: All database queries are scoped to the authenticated user ID. A customer cannot view or modify bookings, addresses, or documents belonging to another customer.
3. **Integer Money Representation**: Prices and transactions are stored strictly in integer pence (`priceFrom: 6900` = £69.00) to eliminate floating-point arithmetic errors.
4. **Audit Logging**: Sensitive operations (status overrides, refunds, engineer approvals, cancellations, Premium waitlist signups, Google logins) automatically append immutable audit records via `logAudit`.
5. **Secure Cryptographic Tokens**: Reference codes (`AYN-XXXXXX`) and tokens use cryptographically random bytes with non-ambiguous character sets (excluding confusing characters like `0`, `O`, `1`, `I`).
6. **Graceful Integration Fallback**: Optional services (Stripe, transactional SMTP, Google sign-in) operate with clear "unconfigured / mock-safe" states without crashing or blocking users.
7. **OAuth Hardening**: The Google flow uses PKCE, single-use `state`/`verifier` cookies, a strict internal-path allow-list for post-login redirects (no open redirects), and never stores third-party tokens. Server secrets stay in server modules — the login and register pages are server components that pass only boolean feature flags to the client.
8. **Server-Authoritative Pricing**: The browser never calculates money. Quotes come from `quoteBooking` and the final total from `submitBooking`, both of which re-read service prices, answers, discount codes and coverage from the database. Card availability is derived on the server from `env.payments.isConfigured` and passed to the client as a boolean prop.
9. **Guest Booking Safety**: Guest bookings create a `CUSTOMER` account with an undisclosed random password plus a one-time, expiring `PasswordResetToken`; known emails are linked to the existing account. Booking submission is rate-limited per `booking:${session.sub}` for signed-in users and `booking:guest:${contactEmail}` for guests.

---

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router with Server Components & Server Actions)
- **Language**: TypeScript (Strict typing)
- **Styling**: Tailwind CSS
- **Database**: SQLite (local) / PostgreSQL (production-ready via Prisma schema)
- **ORM**: Prisma Client
- **Authentication**: Custom signed session management with `jose` (JWT) and `bcryptjs`, plus optional Google OAuth 2.0 / OpenID Connect (PKCE)
- **Validation**: Zod (shared client and server schemas)
- **Testing**: Jest & ts-jest

