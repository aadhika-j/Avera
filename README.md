# Student Academic Reminder & Resource Platform

Full-stack MERN app with React (Vite + Tailwind) frontend and Node/Express + MongoDB backend. Features JWT auth with roles (Student, CR/Admin), reminders for internal components, study materials with comments, events, and Socket.IO chat. PWA-ready frontend for future Android WebView or API-based app.

## Structure
- backend/ – Express API, MongoDB models, Swagger setup, Socket.IO server
- frontend/ – Vite React app with Tailwind, auth context, basic pages (dashboard, subjects, materials, events, chat)

## Getting Started
1. Prereqs: Node 18+, MongoDB running locally or Atlas URI.
2. Backend
   - `cd backend`
   - `npm install`
   - Copy `.env.example` to `.env` and set `MONGO_URI`, `JWT_SECRET`, Twilio/SMTP/Cloudinary creds.
   - `npm run dev`
3. Frontend
   - `cd frontend`
   - `npm install`
   - Copy `.env.example` to `.env` and set `VITE_API_BASE` (default http://localhost:5000/api).
   - `npm run dev`

## Notes
- Swagger docs at `/api/docs`.
- Socket.IO initialized; chat page consumes `/api/chat` and real-time events.
- Cron placeholder in backend for reminders; integrate Twilio/Nodemailer later.
- PWA manifest included; add icons in `public/` for installability.
