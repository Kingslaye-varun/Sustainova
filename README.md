# 🏢 SUSTAINOVA — Smart Office Building PWA

> **Solar Decathlon India · TATA Realty**  
> Progressive Web App for SUSTAINOVA — a Net-Zero Smart Commercial Office Building in Ghansoli, Navi Mumbai.  
> Team: VESCOA (Architecture) + VESIT (IT)

---

## 📸 Screenshots

| Login | Dashboard | Parking Map |
|-------|-----------|-------------|
| Role-based auth | Live stats + charts | Real-time slot grid |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/sustainova.git
cd sustainova
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env and paste your MONGO_URI
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` 🎉

---

## 📁 Project Structure

```
sustainova/
├── frontend/                  # React + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Header, BottomNav, Layout
│   │   │   └── ui/            # Card, Badge, Button, Input, etc.
│   │   ├── pages/             # One file per page/feature
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Parking.jsx
│   │   │   ├── Gym.jsx
│   │   │   ├── Healthcare.jsx
│   │   │   ├── AQI.jsx
│   │   │   ├── Support.jsx
│   │   │   ├── Maintenance.jsx
│   │   │   ├── Admin.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # JWT auth state
│   │   ├── services/
│   │   │   └── api.js          # Axios API layer
│   │   ├── App.jsx             # Router + protected routes
│   │   └── main.jsx
│   └── vite.config.js         # Tailwind v4 plugin
│
├── backend/                   # Node.js + Express + MongoDB
│   └── src/
│       ├── config/db.js        # MongoDB connection
│       ├── models/             # Mongoose schemas
│       │   ├── User.js         # SN-YYYY-XXXXX auto ID
│       │   ├── Ticket.js
│       │   ├── ParkingSlot.js
│       │   ├── Gym.js
│       │   ├── MaintenanceTask.js
│       │   └── Announcement.js
│       ├── controllers/        # Business logic
│       ├── routes/             # Express routers
│       ├── middleware/
│       │   └── auth.js         # JWT + role guard
│       └── server.js
│
├── .gitignore
└── README.md
```

---

## ✨ Features

| Module | Description |
|--------|------------|
| 🔐 **Auth** | Register/Login with JWT, role-based access, unique ID (SN-2026-XXXXX) |
| 🚗 **Smart Parking** | Real-time floor-wise slot map (H5, B7 etc.), reserve/free slots |
| 🚴 **Gym Energy** | Live cycle occupancy + daily/monthly/yearly energy generated |
| 🏥 **Health AI (NOVA)** | AI chatbot for wellness tips, emergency SOS button |
| 💡 **Sensor Lights** | Floor-wise lighting status (On/Auto-dim/Off) |
| 🌿 **AQI Tracker** | Indoor/outdoor AQI, pollutant breakdown, health tips |
| 🚗 **Carbon Footprint** | Commute mode selector, CO₂ calculator, monthly trend |
| ❓ **Help & Support** | 5-category ticket system with real-time status tracking |
| 🔧 **Maintenance Panel** | Task management for maintenance staff |
| ⚙️ **Admin Panel** | User management, ticket resolution, announcements, system status |
| 🌿 **Plants (Promo)** | Eco awareness cards + CO₂ absorption stats |

---

## 👥 User Roles

| Role | Access |
|------|--------|
| 🟢 **Employee** | Dashboard, Parking, Gym, Healthcare, AQI, Support, Profile |
| 🔴 **Admin** | Everything + Admin Panel + User Management |
| 🟡 **Maintenance** | Dashboard + Maintenance Panel + Support |
| 🔵 **Visitor** | Limited public view |

---

## 🛠️ Tech Stack

### Frontend
| Tech | Version | Use |
|------|---------|-----|
| React | 19 | UI framework |
| Vite | 7 | Build tool |
| **Tailwind CSS v4** | 4.x | Styling (new @tailwindcss/vite plugin) |
| React Router DOM | 7 | Client-side routing |
| Recharts | 2 | Charts & graphs |
| Axios | 1 | HTTP client |
| Lucide React | latest | Icons |

### Backend
| Tech | Version | Use |
|------|---------|-----|
| Node.js | 22 | Runtime |
| Express | 5 | Web framework |
| MongoDB | - | Database |
| Mongoose | 8 | ODM |
| JWT (jsonwebtoken) | - | Authentication |
| bcryptjs | - | Password hashing |
| Morgan | - | HTTP logging |
| dotenv | - | Environment variables |

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register     Register new user
POST /api/auth/login        Login → returns JWT token
GET  /api/auth/me           Get current user (protected)
POST /api/auth/logout       Logout
```

### Users (Admin)
```
GET    /api/users           Get all users
GET    /api/users/:id       Get user by ID
PUT    /api/users/:id       Update user
DELETE /api/users/:id       Deactivate user
```

### Tickets
```
GET  /api/tickets           Get tickets (own or all for admin)
POST /api/tickets           Create ticket
PUT  /api/tickets/:id       Update ticket status / assign
GET  /api/tickets/stats     Ticket statistics (admin)
```

### Parking
```
GET    /api/parking         Get all slots (filter by ?floor=B1)
GET    /api/parking/stats   Summary stats
POST   /api/parking/seed    Seed initial data (admin)
POST   /api/parking/:id/reserve   Reserve a slot
DELETE /api/parking/:id/reserve   Free a slot
```

### Gym
```
GET   /api/gym/cycles           Live cycle status (auto-seeds 40 cycles)
PATCH /api/gym/cycles/:cycleId  Update cycle (IoT feed)
GET   /api/gym/energy           Energy stats + monthly chart
```

### Maintenance
```
GET /api/maintenance        Get tasks
POST /api/maintenance       Create task
PUT  /api/maintenance/:id   Update task status
```

### Announcements
```
GET    /api/announcements       Get announcements (filtered by role)
POST   /api/announcements       Create (admin)
DELETE /api/announcements/:id   Delete (admin)
```

---

## 🧪 Testing with Postman

See `POSTMAN_COLLECTION.md` for the complete Postman collection with all endpoints, example bodies, and auth setup.

### Quick test:
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Varun Rahatgaonkar","email":"varun@gmail.com","password":"test123","role":"employee","department":"IT"}'

# 2. Login → copy token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"varun@gmail.com","password":"test123"}'

# 3. Get parking stats (with token)
curl http://localhost:5000/api/parking/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🌍 Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/sustainova
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GROK_API_KEY=your_grok_api_key   # for Healthcare AI (optional)
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Deployment

```bash
# Build frontend
cd frontend && npm run build

# Deploy backend (e.g. Railway / Render)
# Set environment variables in dashboard
# Point MONGO_URI to MongoDB Atlas

# Frontend → Vercel / Netlify
# vercel --prod
```

---

## 📦 Future Enhancements

- [ ] Real IoT integration (MQTT → WebSocket → React)
- [ ] Grok AI real API integration for healthcare chatbot
- [ ] Three.js 3D building model viewer
- [ ] Push notifications (PWA)
- [ ] Firebase Cloud Messaging
- [ ] Real-time WebSocket updates for parking & gym

---

*SUSTAINOVA · Solar Decathlon India 2026 · VESCOA Architecture + VESIT IT*
