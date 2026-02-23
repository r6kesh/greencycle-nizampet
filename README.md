# GreenCycle Premium Scrap Services — Deployment Guide

## 📋 Prerequisites
- Node.js 18+ (https://nodejs.org)
- MongoDB (local or MongoDB Atlas)
- Android Studio (for mobile app)
- npm or yarn

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
npm install
npm run seed     # Seeds database with admin, agent, categories
npm run dev      # Starts server on http://localhost:5000
```

### 2. Admin Dashboard Setup
```bash
cd admin
npm install
npm run dev      # Starts on http://localhost:3000
```

Login with:
- Phone: `+919876543210`
- Password: `admin123456`

### 3. Mobile App Setup
```bash
cd mobile
npm install
npx expo start   # Starts Expo dev server
# Press 'a' to open in Android emulator
```

---

## 🔧 Environment Variables

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `JWT_EXPIRE` | Token expiration (default: 30d) | ✅ |
| `RAZORPAY_KEY_ID` | Razorpay API key | For payments |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | For payments |
| `BUSINESS_PHONE` | Business phone number | ✅ |
| `BUSINESS_WHATSAPP` | WhatsApp number | ✅ |
| `ADMIN_PHONE` | Admin login phone | ✅ |
| `ADMIN_PASSWORD` | Admin login password | ✅ |

---

## 🌐 Production Deployment

### Backend (Render.com)
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set Build Command: `npm install`
4. Set Start Command: `node server.js`
5. Add all environment variables
6. Deploy

### Backend (Railway.app)
1. Create new project
2. Add MongoDB plugin
3. Deploy from GitHub
4. Add environment variables

### Admin Dashboard
```bash
cd admin
npm run build
# Deploy the `dist/` folder to Netlify, Vercel, or any static host
```

### Mobile App (Play Store)
```bash
cd mobile

# Build APK
npx eas build --platform android --profile preview

# Build AAB for Play Store
npx eas build --platform android --profile production

# Submit to Play Store
npx eas submit --platform android
```

Required for EAS Build:
1. Create account at https://expo.dev
2. Run `npx eas login`
3. Run `npx eas build:configure`

---

## 📱 Mobile App Configuration

### Updating API URL
Edit `mobile/src/services/api.js`:
```javascript
// For production:
const API_BASE = 'https://your-backend-url.com/api';
```

### Google Maps (Optional)
1. Get API key from Google Cloud Console
2. Add to `app.json`:
```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_KEY"
    }
  }
}
```

### Firebase Push Notifications
1. Create Firebase project
2. Download `google-services.json`
3. Place in `mobile/` directory
4. Add Firebase config to backend `.env`

---

## 💳 Payment Integration (Razorpay)

### Setup
1. Create account at https://razorpay.com
2. Get Test API keys from Dashboard
3. Add to backend `.env`:
   - `RAZORPAY_KEY_ID=rzp_test_xxxx`
   - `RAZORPAY_KEY_SECRET=xxxx`

### Going Live
1. Complete KYC on Razorpay
2. Switch to Live API keys
3. Update `.env` with production keys

---

## 📊 Database Schema

### Collections
- **users** — Customers, agents, admins
- **categories** — Scrap types with prices
- **bookings** — Pickup bookings with items
- **notifications** — Push/in-app notifications

### Default Data (Seed)
- 1 Admin user
- 1 Demo Agent
- 1 Demo Customer
- 9 Scrap Categories with Indian market prices

---

## 🔐 Security Notes
- JWT tokens expire in 30 days
- Passwords are hashed with bcrypt (10 rounds)
- Admin routes are protected with role-based middleware
- File uploads are limited to 5MB images only
- CORS is configured for all origins (restrict in production)

---

## 📁 Project Structure
```
scrapnizampet/
├── backend/              # Node.js + Express API
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middleware/        # Auth, upload, error handling
│   ├── seeds/            # Database seeder
│   ├── uploads/          # Photo storage
│   ├── server.js         # Entry point
│   └── .env              # Configuration
│
├── admin/                # React + Vite Admin Dashboard
│   ├── src/
│   │   ├── App.jsx       # All pages & components
│   │   ├── api.js        # API service
│   │   ├── index.css     # Premium design system
│   │   └── main.jsx      # Entry point
│   └── index.html
│
├── mobile/               # React Native (Expo) App
│   ├── src/
│   │   ├── screens/      # All app screens
│   │   ├── services/     # API client
│   │   └── theme/        # Design tokens
│   ├── App.js            # Navigation & auth
│   └── app.json          # Expo config
│
└── README.md             # This file
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check `MONGODB_URI` in `.env` |
| Admin login fails | Run `npm run seed` to create admin user |
| Mobile can't connect to API | Update `API_BASE` in `mobile/src/services/api.js` |
| CORS errors | Backend CORS is set to `*` by default |
| Payment fails | Ensure Razorpay test keys are correct |

---

Built with ♻️ by GreenCycle Team
