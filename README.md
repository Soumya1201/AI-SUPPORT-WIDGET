# 🤖 AI Customer Support Widget — SaaS Platform

A production-ready, embeddable AI-powered customer support chat widget built with the MERN stack + Gemini AI.

## 📁 Folder Structure

```
ai-support-widget/
├── backend/                  # Node.js + Express API
│   ├── config/               # DB & environment config
│   ├── controllers/          # Route logic
│   ├── middleware/           # Auth, error, rate limiting
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   └── utils/                # Helpers (AI, token gen)
├── frontend/                 # React + Vite dashboard
│   └── src/
│       ├── api/              # Axios API calls
│       ├── components/       # Reusable UI components
│       ├── context/          # Auth context
│       ├── hooks/            # Custom hooks
│       ├── pages/            # Route pages
│       └── utils/            # Formatters, helpers
├── widget/                   # Embeddable chat widget
│   └── src/                  # Widget source
└── shared/                   # Shared constants/types
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install

# Widget
cd widget && npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` in the `backend/` folder and fill in your values.

### 3. Run Dev Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — Widget (build the embeddable script)
cd widget && npm run build
```

## 📦 Deploy

- **Backend** → [Railway](https://railway.app) or [Render](https://render.com)
- **Frontend** → [Vercel](https://vercel.com)
- **Database** → [MongoDB Atlas](https://mongodb.com/atlas)
- **Widget JS** → Host the built `widget.js` on your CDN or backend `/public` folder

## 🔌 Embedding the Widget

```html
<script
  src="https://yourdomain.com/widget.js"
  data-bot-id="YOUR_BOT_ID_HERE"
></script>
```

Add this tag before `</body>` on any website. That's it!
