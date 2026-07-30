# Home Services Marketplace — Build Spec for Antigravity

This document is written to be pasted directly into Antigravity's Agent Manager
as the task description. It gives the agent enough architectural context to
plan a multi-step build instead of guessing. A partial repo skeleton
(folder structure, `package.json`, `.env.example`, and Mongoose model stubs)
already exists in this workspace under `backend/models/` — build on top of it,
don't recreate it from scratch.

---

## 1. What we're building

A three-sided marketplace connecting customers with verified home-service
professionals (electricians, plumbers, cleaners, carpenters, AC techs,
painters). Three separate frontends share one backend:

- `frontend/` — customer-facing app (browse, book, pay, chat, review)
- `pro/` — professional dashboard (availability, job requests, earnings)
- `admin/` — admin panel (verify pros, manage categories, view analytics)
- `backend/` — single Express + MongoDB API serving all three, plus a
  Socket.io layer for real-time job-status updates and in-app chat

## 2. Tech stack (do not substitute without asking)

| Layer | Choice |
|---|---|
| Frontend (all 3 apps) | React.js (Vite) + React Router + Tailwind CSS |
| HTTP client | Axios |
| Real-time | Socket.io (server) / socket.io-client |
| Notifications | React Toastify |
| Backend | Node.js + Express.js, ES modules (`"type": "module"`) |
| Auth | JWT via `jsonwebtoken`, passwords hashed with `bcryptjs` |
| DB | MongoDB Atlas + Mongoose |
| File uploads | Multer → Cloudinary (professional docs, profile images) |
| Payments | Razorpay (Checkout.js client-side, Node SDK server-side) |
| Location | Google Maps / Geocoding API for address search + distance |
| Scheduled jobs | node-cron (booking reminders) |

## 3. Data models (already scaffolded — see `backend/models/`)

`userModel.js`, `professionalModel.js`, `categoryModel.js`,
`bookingModel.js`, `reviewModel.js`, `paymentModel.js`.

Key relationships:
- `professional` references a `user` (role="professional") — one-to-one
- `booking` references `customer` (user), `professional`, and `category`
- `review` is unique per `booking`
- `payment` references `booking`

Booking status state machine (already encoded as an enum in `bookingModel.js`):

```
requested → accepted → in_progress → completed
requested → rejected
requested/accepted → cancelled (cancelledBy: customer|professional|admin)
```

Do not allow illegal transitions server-side (e.g. `completed → requested`).
Put the transition-validation logic in one place (e.g.
`backend/utils/bookingStateMachine.js`) rather than scattering `if` checks
across controllers.

## 4. Backend API surface to build

Organize as `routes/` + `controllers/`, one pair per resource:

- **authRoutes** — `POST /api/user/register`, `POST /api/user/login`,
  `POST /api/professional/register`, `POST /api/professional/login`,
  `POST /api/admin/login`
- **professionalRoutes** — list/search professionals (filter by category,
  location radius, min rating, price range), get profile, update
  availability, toggle `isActive`, upload verification documents
- **categoryRoutes** — CRUD (admin-only for write), public list for read
- **bookingRoutes** — create booking, list bookings (scoped to logged-in
  user's role), update status (role-gated — e.g. only the assigned pro can
  move `accepted → in_progress`), cancel
- **paymentRoutes** — create Razorpay order, verify payment webhook/callback,
  mark booking `paymentStatus: paid`
- **reviewRoutes** — create review (only after `status: completed`), list
  reviews for a professional
- **adminRoutes** — approve/reject professional verification, dashboard
  analytics aggregation (bookings per category, revenue, active pros)

Use JWT middleware (`middleware/auth.js`, `middleware/authPro.js`,
`middleware/authAdmin.js`) to gate routes by role — mirror the three-role
pattern from the original Prescripto-style split rather than one shared
`authUser` for everything, since permissions genuinely differ per role.

## 5. Real-time layer

Use Socket.io rooms keyed by `bookingId`. When a professional updates job
status, emit to that room so the customer's UI updates without polling.
Same room can carry a lightweight chat (`message`, `senderId`, `timestamp`,
`bookingId`) — persist chat messages in a `chatMessage` collection if time
allows, otherwise keep in-memory for MVP and note it as a known limitation.

## 6. Payments

Escrow-lite flow for MVP (full escrow/dispute handling is future scope):
1. Customer books → booking created with `paymentStatus: pending`
2. On accept by pro, customer is prompted to pay (Razorpay order created
   server-side, checkout opens client-side)
3. On successful Razorpay callback, verify signature server-side, mark
   `paymentStatus: paid`, create a `payment` doc
4. On `completed`, no additional payment action needed for MVP (payout to
   pro is manual admin action for now — automate later)

## 7. Build order (suggest to the agent as phases — verify each before next)

1. **Backend foundation**: DB connection (`config/mongodb.js`), server
   bootstrap (`server.js`), auth middleware, user + professional + admin
   auth routes. Verify with a manual register/login round-trip via curl or
   the terminal before moving on.
2. **Core resources**: category CRUD, professional profile/availability
   CRUD, booking creation + status transitions. Verify state machine
   rejects illegal transitions.
3. **Frontend (customer)**: category browse → professional search/filter →
   booking flow → booking history/status view. Wire to real backend, not
   mocks.
4. **Frontend (pro)**: registration + document upload → availability
   management → incoming job requests → status updates.
5. **Frontend (admin)**: login → professional verification queue →
   category management → basic analytics view.
6. **Payments integration**: Razorpay order creation + verification, wired
   into the booking flow.
7. **Real-time layer**: Socket.io status sync + chat.
8. **Polish**: responsive check across the three apps, toast notifications,
   loading/error states, `.env.example` completeness check.

Ask the agent to run and browser-test each phase (Antigravity can drive a
browser) before starting the next, rather than writing all layers first and
debugging at the end.

## 8. Explicit non-goals for MVP (call these out so the agent doesn't scope-creep)

- No live GPS tracking of professionals (future scope)
- No subscription/recurring bookings (future scope)
- No automated payout/dispute resolution — admin handles manually
- No native mobile app
- Single-language (English) UI

## 9. Environment variables

See `backend/.env.example` — already scaffolded. The agent should ask the
user for real Mongo/Razorpay/Cloudinary/Maps credentials rather than
inventing placeholder values that look real.

---

### Suggested first message to paste into Antigravity's Agent Manager

> Using the existing folder structure and Mongoose models under
> `backend/models/`, build out the Home Services Marketplace backend first
> (Phase 1 and 2 from `ANTIGRAVITY_BUILD_SPEC.md` in the repo root), then
> pause for my review before starting on the frontend apps. Ask me for any
> API keys you need rather than hardcoding placeholders.
