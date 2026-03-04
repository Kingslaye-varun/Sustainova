# 📤 How to Push SUSTAINOVA to GitHub

## Step 1: Create GitHub Repo

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `sustainova`
3. Description: `Smart Office Building PWA — React + Tailwind v4 + Express + MongoDB · Solar Decathlon India`
4. Set to **Public** (or Private)
5. ❌ Do NOT initialize with README (we already have one)
6. Click **Create repository**

## Step 2: Push From Terminal

Run these commands in `C:\Users\rahat\OneDrive\Documents\sdi\sustainova`:

```bash
git remote add origin https://github.com/YOUR_USERNAME/sustainova.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Set up MongoDB Atlas (Free)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Whitelist IP → Add `0.0.0.0/0` for development
5. Click **Connect** → **Connect your application**
6. Copy the connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/sustainova
   ```
7. Paste it in `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/sustainova
   ```

## Step 4: Start the App

### Backend:
```bash
cd backend
npm run dev
# Should print: ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

### Frontend:
```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

## Step 5: Seed Initial Data (via Postman)

1. Import `SUSTAINOVA_API.postman_collection.json` into Postman
2. Run **Register Admin** → copy the token
3. Run **Seed Parking Data (Admin)** → seeds 320 parking slots
4. Run **Get Gym Cycles** → auto-seeds 40 cycles
5. All set! 🎉
