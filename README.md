# 🏢 SUSTAINOVA — Smart Net-Zero Office Building

> **Solar Decathlon India 2026** · VESCOA Architecture + VESIT IT · TATA Realty  
> Ghansoli, Navi Mumbai

A full-stack Progressive Web App for managing a smart, net-zero office building — smart parking, gym energy generation, AQI monitoring, gate pass management, and an AI health assistant powered by **Google Gemini**.

---

## 🗂️ Project Structure

```
sustainova/
├── backend/            # Node.js + Express + MongoDB API
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       ├── config/
│       ├── server.js
│       └── seed.js     ← Run this to create test accounts!
├── frontend/           # React + Vite PWA
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       └── context/
├── render.yaml         # Backend deployment (Render)
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Gmail account with [App Password](https://support.google.com/accounts/answer/185833)
- [Google AI Studio](https://aistudio.google.com) API key (free)
- [Cloudinary](https://cloudinary.com) account (free)

### 1. Clone & Install

```bash
# Install backend deps
cd sustainova/backend
npm install

# Install frontend deps
cd ../frontend
npm install
```

### 2. Configure Backend Environment

Create `backend/.env` (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?appName=Cluster0

# JWT (change in production!)
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d

# Gemini AI (Google) — for NOVA Health AI chatbot
# Get free key at: https://aistudio.google.com/apikey
GEMINI_API_KEY=AIzaSy...

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Cloudinary — for staff photos & QR code uploads
# Get from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email — Gmail with App Password (NOT your real password)
# App Password: https://myaccount.google.com → Security → 2FA → App Passwords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=noreply@sustainova.in
```

### 3. Seed the Database

```bash
cd backend
node src/seed.js
```

This creates test accounts:

| Role | Email | Password |
|------|-------|----------|
| 👑 **Admin** | `admin@sustainova.in` | `Admin@2026` |
| 👤 **Employee** | `varun@sustainova.in` | `Employee@2026` |
| 🔧 **Maintenance** | `raju@sustainova.in` | `Maintain@2026` |

Also creates:
- ✅ **Staff Gate Pass** for Raju Kumar (`STGP-XXXXXX`)
- ✅ **Visitor Gate Pass** for Aditya Shah → Varun (valid 3 hours)

### 4. Run Everything

```bash
# Terminal 1 — Backend
cd backend
npm run dev      # starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev      # starts on http://localhost:5173
```

---

## 🔑 User Roles & Access

| Role | How to Get Account | Panel |
|------|-------------------|-------|
| **Employee** | Self-register at `/login` | Dashboard, Parking, Gym, AQI, Health AI, Support |
| **Admin** | Created by seeding DB | All above + Admin Panel (Gate Passes, Users, Tickets, Announcements) |
| **Maintenance** | Admin creates via Admin → Gate Passes → Staff Accounts | Maintenance panel + Staff Gate Pass |
| **Visitor** | Admin creates a gate pass → email sent with QR | Public gate pass page only (`/gate-pass/:code`) |

---

## 📱 Key Features

### 🚗 Smart Parking
- Real-time slot map by floor (B1, B2, G, 1–5)
- Reserve / free with 1 click
- Traffic charts (entry/exit by hour)
- Admin can seed parking slots

### 🚴 Gym Energy
- Live cycle occupancy tracking
- Energy generated leaderboard
- Weekly generation chart (kWh)
- Admin can seed 40 cycles

### 🌿 AQI Monitor
- Indoor/outdoor air quality cards
- CO2, PM2.5, TVOC, humidity levels
- Mode recommendations (Fresh Air, Recirculation, etc.)
- Building-wide AQI status badge in navbar

### 🤖 NOVA Health AI (Gemini)
- Powered by **Gemini 2.0 Flash**
- Voice input (STT) via Web Speech API
- Read aloud responses (TTS) via Web Speech API
- **Languages**: English, हिंदी (Hindi), मराठी (Marathi)
- Quick topic pills: Headache, Eye Strain, Back Pain, Stress, etc.
- Emergency contacts, daily wellness tip
- Chat history preserved within session

> ⚠️ **Add your Gemini API key** in `backend/.env`:  
> `GEMINI_API_KEY=AIzaSy...`  
> Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 🪪 Gate Pass System

#### Visitor Gate Passes (Admin → Gate Passes tab)
1. Admin fills: visitor name, email, company, purpose, host, validity, authorized floors
2. System generates QR code, uploads to Cloudinary
3. Email sent to visitor with gate pass link
4. Visitor opens `/gate-pass/VSGP-XXXXXX` — shows QR code, details, status
5. Security scans QR to verify entry
6. Admin can revoke at any time

#### Staff Gate Passes (Admin → Gate Passes → Staff Accounts)
1. Admin fills: name, email, department, floor + uploads photo
2. System creates `maintenance` user account with auto-generated password
3. Staff Gate Pass created with photo, QR code
4. Welcome email sent with credentials + pass link

### 🎫 Support Tickets
- Submit tickets by category (Parking, HVAC, Electrical, Cleaning, IT, Other)
- Track status: Open → In Progress → Resolved
- Admin manages all tickets

### 📢 Announcements
- Admin posts announcements targeting: All, Employees, Maintenance, or Admin
- Appears on dashboard and announcements page

### 👤 Profile
- View your building ID (`SN-2026-XXXXX`)
- Department, floor, role
- Carbon footprint tracker (coming soon)

---

## 🎨 UI Design

- **Desktop**: Top navbar with text links + teal underline on active, right actions (AQI badge, theme toggle, notifications, user chip, logout) + dark footer
- **Mobile**: Sticky header + bottom nav (5 items: Home, Parking, Gym, Health, More) + smooth slide-up "More" drawer
- **Design System**: Custom CSS with `--sn-*` tokens, dark/light theme toggle built-in
- **Fonts**: Inter (body) + Space Grotesk (headings)
- **Colors**: Deep navy `#0A1628`, teal accent `#00C9B1`

---

## 🌐 Testing Gate Passes

After seeding, check the gate pass URLs printed in terminal:

```
# Visitor pass
http://localhost:5173/gate-pass/VSGP-XXXXXX

# Staff pass
http://localhost:5173/gate-pass/STGP-XXXXXX
```

Also available via API (no auth needed):
```
GET /api/gate-pass/visitor/verify/:code
GET /api/gate-pass/staff/verify/:code
```

---

## 🚢 Deployment

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all env vars from `.env` in Render dashboard

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import repo
2. Root directory: `frontend`
3. Framework: Vite
4. Add env var: `VITE_API_URL=https://your-render-backend.onrender.com/api`
5. Deploy

---

## 🔌 API Endpoints

| Group | Endpoints |
|-------|-----------|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Parking | `GET /api/parking/stats`, `GET /api/parking/slots`, `POST /api/parking/reserve/:id`, `POST /api/parking/free/:id`, `POST /api/parking/seed` |
| Gym | `GET /api/gym/cycles`, `POST /api/gym/seed`, `PUT /api/gym/cycle/:id/toggle`, `GET /api/gym/stats` |
| AQI | `GET /api/aqi` (static for now) |
| Health AI | `POST /api/healthcare/chat`, `GET /api/healthcare/tip` |
| Tickets | `GET /api/tickets`, `POST /api/tickets`, `PATCH /api/tickets/:id/status` |
| Announcements | `GET /api/announcements`, `POST /api/announcements` |
| Gate Passes | `POST /api/gate-pass/visitor`, `GET /api/gate-pass/visitor`, `DELETE /api/gate-pass/visitor/:id`, `POST /api/gate-pass/staff`, `GET /api/gate-pass/staff`, `GET /api/gate-pass/visitor/verify/:code` (public), `GET /api/gate-pass/staff/verify/:code` (public) |
| Users | `GET /api/users` (admin only) |

---

## 🧪 Testing Checklist

- [ ] Login with `admin@sustainova.in` / `Admin@2026`
- [ ] View Dashboard — AQI badge in navbar, stat cards, energy chart
- [ ] Theme toggle (dark ↔ light) — top right
- [ ] **Parking** — Reserve slot B1-A01, then free it
- [ ] **Gym** — Toggle a cycle on/off
- [ ] **Health AI** — Ask "I have a headache", try voice mic, switch language to हिंदी
- [ ] **Admin → Gate Passes** — Create a visitor pass (use your own email to get the email)
- [ ] Open the gate pass URL from the email or terminal seed output
- [ ] **Admin → Gate Passes → Staff** — Create maintenance user
- [ ] Login with `raju@sustainova.in` / `Maintain@2026`
- [ ] Check maintenance-specific nav items

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Recharts |
| Styling | Vanilla CSS with CSS custom properties |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Media | Cloudinary (photos + QR codes) |
| Email | Nodemailer (Gmail SMTP) |
| QR Codes | `qrcode` npm package |
| Voice | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| Deploy | Render (backend) + Vercel (frontend) |

---

*Built for Solar Decathlon India 2026 · VESCOA + VESIT · TATA Realty*
