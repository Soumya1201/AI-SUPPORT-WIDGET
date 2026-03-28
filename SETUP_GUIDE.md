# 🛠️ Complete Setup & Deployment Guide

## Prerequisites

- Node.js v18+ installed
- A MongoDB Atlas account (free tier works)
- A Google Gemini API key (free at makersuite.google.com)
- Git installed

---

## 📦 Local Development Setup

### Step 1 — Clone & Install Dependencies

```bash
# Clone the repo
git clone <your-repo-url>
cd ai-support-widget

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install widget dependencies
cd ../widget
npm install
```

### Step 2 — Set Up Environment Variables

```bash
# In the backend folder, copy the example .env
cd backend
cp .env.example .env
```

Now edit `backend/.env` with your actual values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/ai-support-widget
JWT_SECRET=your_very_long_random_secret_string_here
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

```bash
# In the frontend folder
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_WIDGET_URL=http://localhost:5000/widget/widget.js
```

### Step 3 — Build the Widget Script

```bash
cd widget
npm run build
# This outputs widget.js to backend/public/widget/widget.js
```

### Step 4 — Run the Development Servers

Open **3 terminal windows**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Dashboard starts at http://localhost:5173
```

**Terminal 3 — Widget (watch mode for development):**
```bash
cd widget
npm run dev
# Rebuilds widget.js on every file change
```

### Step 5 — Test the Widget Locally

Create a test HTML file anywhere on your machine:

```html
<!DOCTYPE html>
<html>
<head><title>Widget Test</title></head>
<body>
  <h1>My Test Website</h1>
  <p>The chat widget should appear in the bottom right corner.</p>

  <!-- Replace YOUR_BOT_ID with a real bot ID from your dashboard -->
  <script
    src="http://localhost:5000/widget/widget.js"
    data-bot-id="YOUR_BOT_ID_HERE"
  ></script>
</body>
</html>
```

Open it with a local server (e.g., `npx serve .`) or directly in your browser.

---

## 🌐 Getting a Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key and paste it into your `backend/.env` as `GEMINI_API_KEY`

---

## ☁️ Production Deployment

### Backend → Railway or Render

**Option A: Railway (recommended)**

1. Push your code to a GitHub repository
2. Go to https://railway.app and sign in
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo, choose the `backend/` directory as root
5. Add environment variables in Railway's dashboard (same as your `.env`)
6. Railway will auto-detect it's a Node.js app and deploy
7. Copy the generated URL (e.g., `https://your-app.railway.app`)

**Option B: Render**

1. Go to https://render.com → New Web Service
2. Connect your GitHub repo
3. Set Root Directory to `backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add all environment variables
7. Deploy!

---

### Frontend → Vercel

1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Set Root Directory to `frontend`
4. Add environment variables:
   - `VITE_API_URL` = `https://your-backend.railway.app/api`
   - `VITE_WIDGET_URL` = `https://your-backend.railway.app/widget/widget.js`
5. Deploy!

---

### MongoDB → Atlas

1. Go to https://mongodb.com/atlas
2. Create a free cluster (M0 Sandbox)
3. Create a database user with password
4. Whitelist IP: `0.0.0.0/0` (allows all IPs — fine for Railway/Render)
5. Click "Connect" → "Connect your application"
6. Copy the connection string and add it to `MONGO_URI` in your backend env vars
7. Replace `<password>` in the string with your actual password

---

### Widget Script — Update the API_BASE URL

After deploying the backend, you **must** update the widget:

```js
// In widget/src/widget.js, line ~15:
const API_BASE = "https://your-backend.railway.app/api"; // ← Update this!
```

Then rebuild and redeploy:
```bash
cd widget && npm run build
# Commit and push — Railway/Render will redeploy automatically
```

---

## 🔗 Connecting Everything

Once deployed, your URLs will look like:

| Service | URL |
|---------|-----|
| Backend API | `https://your-app.railway.app` |
| Frontend Dashboard | `https://your-app.vercel.app` |
| Widget Script | `https://your-app.railway.app/widget/widget.js` |

### Embed snippet (production):
```html
<script
  src="https://your-app.railway.app/widget/widget.js"
  data-bot-id="YOUR_BOT_ID"
></script>
```

---

## 🧪 Testing the Full Flow

1. Register at your frontend URL
2. Create a chatbot with a knowledge base
3. Copy the Bot ID from the dashboard
4. Embed the widget script on any HTML page using that Bot ID
5. Chat with your bot!
6. Check "Conversations" in the dashboard to see the chat history

---

## 🔒 Security Checklist for Production

- [ ] Change `JWT_SECRET` to a strong random string (min 32 chars)
- [ ] Set `NODE_ENV=production` in backend env vars
- [ ] Use MongoDB Atlas with a strong password
- [ ] Add your frontend domain to CORS (`FRONTEND_URL`)
- [ ] Enable MongoDB Atlas network access restrictions (specific IPs in production)
- [ ] Rotate your Gemini API key if exposed

---

## 🐛 Troubleshooting

**Widget not loading?**
- Check browser console for errors
- Verify `data-bot-id` is a valid, active bot ID
- Confirm `API_BASE` in `widget.js` points to your live backend

**AI not responding?**
- Check your Gemini API key is valid
- Look at backend logs for error messages
- Verify the bot's `isActive` is `true`

**CORS errors?**
- Set `FRONTEND_URL` to your frontend's exact origin (no trailing slash)
- For the widget, CORS is already set to allow all origins in `server.js`

**MongoDB connection failed?**
- Verify connection string format in `MONGO_URI`
- Check Atlas Network Access allows your server's IP
- Ensure database user has `readWrite` permissions

---

## 📁 Complete Folder Structure

```
ai-support-widget/
├── README.md
├── SETUP_GUIDE.md
├── shared/
│   └── constants.js
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── server.js                    ← Entry point
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Bot.js
│   │   └── Conversation.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── bot.controller.js
│   │   ├── chat.controller.js
│   │   └── analytics.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── bot.routes.js
│   │   ├── chat.routes.js
│   │   └── analytics.routes.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── ai.js
│   └── public/
│       └── widget/
│           └── widget.js            ← Auto-generated by widget build
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/
│       │   ├── axios.js
│       │   └── services.js
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   └── Layout.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── DashboardPage.jsx
│           ├── CreateBotPage.jsx
│           ├── EditBotPage.jsx
│           ├── BotDetailPage.jsx
│           └── ConversationsPage.jsx
└── widget/
    ├── package.json
    ├── vite.config.js
    └── src/
        └── widget.js                ← The embeddable script source
```
