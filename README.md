# Home Services Marketplace

A full-stack marketplace platform connecting customers with verified home-service professionals — electricians, plumbers, cleaners, carpenters, AC technicians, and painters. Customers can browse professionals by category and location, book a time slot, track job status in real time, and pay securely. Professionals manage their availability and job requests, while admins verify professionals and oversee the platform.

## Live Demo

| App | Link |
|---|---|
| Customer App | https://home-service-marketplace-theta.vercel.app/ |
| Professional Dashboard | https://home-service-marketplace-pro.vercel.app/ |
| Admin Panel | https://home-service-marketplace-admin.vercel.app/ |
| Backend API | https://home-service-marketplace.onrender.com/ |

> Note: the backend runs on Render's free tier, which sleeps after 15 minutes of inactivity. The first request after a period of inactivity may take 30–50 seconds to respond while it wakes up.

## Features

**Customer**
- Browse professionals by service category, rating, and location radius
- Book a time slot based on a professional's live availability
- Real-time job status tracking (Requested → Accepted → In Progress → Completed)
- In-app chat with the assigned professional
- Secure payments via Razorpay
- Rate and review after job completion

**Professional**
- Register with category, hourly rate, bio, and verification documents
- Manage weekly availability and active/inactive status
- Accept or reject incoming job requests
- Update job status in real time
- Track completed jobs and earnings

**Admin**
- Approve or reject professional verification requests
- Manage service categories (CRUD)
- View all bookings across the platform with status filters
- Analytics dashboard: bookings and revenue this month, bookings per category, professional counts

## Tech Stack

**Frontend** (customer app, pro dashboard, and admin panel — three separate Vite apps)
- React.js + React Router
- Tailwind CSS
- Axios
- React Toastify
- Socket.io-client

**Backend**
- Node.js + Express.js (ES modules)
- Socket.io — real-time job status updates and in-app chat
- JSON Web Tokens — role-based authentication (customer / professional / admin)
- bcryptjs — password hashing
- Multer + Cloudinary — professional verification documents and profile images
- Razorpay — payment processing
- node-cron — scheduled tasks

**Database**
- MongoDB Atlas + Mongoose

## Project Structure

```
backend/    → REST API, Socket.io, auth, database models, payments
frontend/   → Customer-facing app
pro/        → Professional dashboard
admin/      → Admin panel
```

## Data Models

- **User** — name, email, password (hashed), role (customer / professional / admin)
- **Professional** — linked to a User; categories, hourly rate, availability, verification status, documents, rating
- **Category** — name, description, base price
- **Booking** — customer, professional, category, scheduled time, status, price, payment status
- **Review** — booking, rating, comment
- **Payment** — booking, amount, Razorpay order/payment IDs, status

### Booking status flow

```
requested → accepted → in_progress → completed
requested → rejected
requested / accepted → cancelled
```

Illegal transitions (e.g. jumping straight from `requested` to `completed`) are rejected server-side.

## Getting Started (local development)

### Prerequisites
- Node.js v18+
- A MongoDB Atlas cluster (or local MongoDB)
- Cloudinary account (for document/image uploads)
- Razorpay account (test mode is fine for development)
- Google Maps / Geocoding API key (for location-based search)

### 1. Clone the repository
```bash
git clone https://github.com/Sudiksha-chugh/home-service-marketplace.git
cd home-service-marketplace
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env   # then fill in your real values
npm run server
```

Backend runs at `http://localhost:8000`.

### 3. Frontend apps setup
Each of `frontend/`, `pro/`, and `admin/` is a separate Vite app:
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:8000/api
npm run dev
```
Repeat for `pro/` and `admin/` in separate terminals. They'll run on different ports (Vite auto-assigns if the default is taken).

### 4. Seed initial data
```bash
cd backend
node utils/seedAdmin.js
node utils/seedCategories.js
```

## Environment Variables

See `backend/.env.example` for the full list, including `MONGODB_URI`, `JWT_SECRET`, Cloudinary keys, Razorpay keys, Google Maps API key, and admin seed credentials. Each frontend app has its own `.env.example` with `VITE_API_BASE_URL`.

## Deployment

- **Backend** deployed on [Render](https://render.com) (free tier), root directory `backend`, build command `npm install`, start command `npm start`.
- **Frontend apps** deployed on [Vercel](https://vercel.com), one project per app (`frontend`, `pro`, `admin`), each with its own root directory and `VITE_API_BASE_URL` environment variable pointing at the Render backend.
- Each frontend app includes a `vercel.json` with a rewrite rule so client-side routing (React Router) works correctly on page refresh/direct navigation.

## Future Scope

- Live technician location tracking during a job
- Subscription plans for recurring services (e.g. monthly AC servicing)
- AI-based professional recommendations based on job history and ratings
- Automated payouts and a dispute-resolution workflow
- Native mobile app (React Native)
- Multi-language support

## Contributing

Contributions are welcome. Please open a pull request for any enhancements, bug fixes, or new features.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
