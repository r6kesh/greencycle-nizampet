# GreenCycle — Go Live Guide

Follow these steps in order. Each step links to exactly where you need to go.

---

## STEP 1 — Set Up MongoDB Atlas (Free Cloud Database)

> **Why**: Your backend currently uses `localhost` MongoDB which only works on your PC.
> Atlas is a free cloud database everyone can reach.

1. Go to **[cloud.mongodb.com](https://cloud.mongodb.com)** → Sign up free
2. Click **"Build a Database"** → Choose **Free** tier → Region: **Mumbai (ap-south-1)** → Create
3. Create a DB user:
   - Username: `greencycle`
   - Password: choose something like `GC@password2024` — **write it down**
4. Add IP Access: click **"Allow Access from Anywhere"** (`0.0.0.0/0`)
5. Click **Connect** → **Drivers** → Copy the URI (looks like `mongodb+srv://greencycle:...`)
6. Open `backend/.env` and replace `MONGODB_URI=...` with your copied URI

---

## STEP 2 — Create GitHub Repository

> **Why**: Railway and Vercel need your code on GitHub to deploy.

Open **PowerShell** in the `scrapnizampet` folder and run:

```powershell
# Initialize git
git init
git add .
git commit -m "GreenCycle initial commit"

# Go to github.com → click New Repository
# Name it: greencycle
# Make it Private → Create
# Then run the commands GitHub shows (git remote add origin...)
git branch -M main
git push -u origin main
```

---

## STEP 3 — Deploy Backend to Railway (Free)

1. Go to **[railway.app](https://railway.app)** → Sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo** → select `greencycle`
3. Choose the **`backend`** folder as the root
4. Go to **Variables** tab → Add each line from your `backend/.env`:
   - `MONGODB_URI` = your Atlas URI
   - `JWT_SECRET` = `greencycle-super-secret-jwt-key-change-in-prod`
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `BUSINESS_PHONE` = `+918309108691`
   - `ADMIN_PHONE` = `+918309108691`
   - `ADMIN_PASSWORD` = `GreenCycle@2024`
5. Railway will give you a URL like `https://greencycle-backend.up.railway.app`
6. Update that URL in:
   - `mobile/app.json` → `extra.apiUrl`
   - `customer-web/src/api.js` → `API_BASE` fallback (or set env var)

**Test it**: Visit `https://your-railway-url.up.railway.app/api/health` — should show `{"success": true}`

---

## STEP 4 — Seed the Database (Add Categories & Admin)

After backend is running on Railway:

```powershell
cd backend
# Make sure MONGODB_URI in .env is set to Atlas
npm run seed
```

This adds all scrap categories and the admin user to the database.

---

## STEP 5 — Deploy Customer Website to Vercel

1. Install Vercel CLI:
   ```powershell
   npm install -g vercel
   ```
2. Deploy customer website:
   ```powershell
   cd customer-web
   vercel --prod
   ```
   - When asked **"What is your project's name?"** → `greencycle-customer`
   - When asked **"In which directory is your code located?"** → `./`
   - Framework detected: **Vite** ✅
3. Set environment variable in Vercel dashboard:
   - `VITE_API_URL` = `https://your-railway-url.up.railway.app/api`
4. Your site goes live at `https://greencycle-customer.vercel.app` 🎉

---

## STEP 6 — Deploy Admin Panel to Vercel

```powershell
cd admin
vercel --prod
```
- Project name: `greencycle-admin`
- Set `VITE_API_URL` in Vercel dashboard as above

Admin live at: `https://greencycle-admin.vercel.app`

---

## STEP 7 — Build Android APK (Free — No Play Store Needed Yet)

This builds a `.apk` file you can share via WhatsApp / link. **Free.**

### 7a. Create Expo Account
1. Go to **[expo.dev](https://expo.dev)** → Sign up free
2. Remember your username (e.g., `rakesh2024`)

### 7b. Build the APK

Open PowerShell in the `mobile` folder:

```powershell
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Login with your new Expo account
eas login

# Link project to Expo (run once)
eas init

# Build the preview APK (free, shareable link)
eas build --platform android --profile preview
```

⏳ **Wait 10-15 minutes** — EAS builds in the cloud.

When done, you get a **download link** for the `.apk` file. Share it with anyone!

### 7c. Install on Android Phone
1. Download the APK to the phone
2. Go to **Settings → Install Unknown Apps** → allow
3. Open the downloaded APK → Install
4. Open **GreenCycle** ✅

---

## STEP 8 — Submit to Google Play Store (Optional, $25 one-time)

1. Go to **[play.google.com/console](https://play.google.com/console)** → Pay $25, create account
2. Create new app → name: `GreenCycle`
3. Build production AAB:
   ```powershell
   eas build --platform android --profile production
   ```
4. Download the `.aab` file from EAS dashboard
5. In Play Console → **Create release** → Upload the AAB → Fill details → Submit for review
6. Google reviews in **3-7 days** → then it's live!

---

## Summary — What Goes Where

| Component | URL | Platform |
|-----------|-----|----------|
| Backend API | `https://xxx.up.railway.app` | Railway |
| Customer Website | `https://greencycle-customer.vercel.app` | Vercel |
| Admin Panel | `https://greencycle-admin.vercel.app` | Vercel |
| Android App | Play Store / APK link | EAS Build |

---

## Need Help?

Call/WhatsApp: +91 8309108691

> **Admin Login**: Phone `+918309108691`, Password `GreenCycle@2024`
