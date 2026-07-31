# ⚡ FindFast AI - Instant Top-Rated Place Navigation

[![React](https://img.shields.io/badge/React-18-00dbe9?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)

**FindFast AI** is a futuristic, neon-themed geospatial place finder application. Built on the *Hyper-Fast Neon Synthetic* design system, it automatically identifies, ranks, and navigates users to the **#1 Highest-Rated Place** matching any category or query directly via **Google Maps** or an in-app interactive Leaflet HUD.

---

## 🌟 Key Features

- **⚡ Instant Top-Rated Auto-Navigation**: Type any search query or category (Cafe, Dentist, Hospital, EV Charging, Gym, etc.) to trigger automatic detection and launching of the top-rated location (`4.9 ★`+).
- **🗺 Direct Google Maps Turn-by-Turn Navigation**: One-tap direct routing to destination coordinates and address pre-filled in Google Maps.
- **🛰 Geospatial Interactive Dark Map**: Powered by Leaflet.js with custom pulsing cyan/lime markers, popups, and route polylines.
- **🚦 Live Guidance Overlay**: Speedometer HUD, turn-by-turn maneuvers, remaining ETA countdown, and progress tracking.
- **🔐 User Auth & Saved Favorites**: Sleek authentication modal with token simulation, demo account access, and persistent favorites.

---

## 📂 Repository Structure

```
.
├── 📁 frontend/             # Single-Page Web App (React + Vite + Leaflet)
│   ├── src/                 # Components, Hooks, Services & Types
│   ├── index.html           # Font & asset entrypoint
│   └── package.json
│
└── 📁 backend/              # Node.js + Express API Server
    ├── src/                 # Express API Routes, Middleware & Controllers
    ├── schema.sql           # PostgreSQL + PostGIS Spatial DB Schema
    └── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ & NPM v9+

### 1. Installation

Clone the repository and install dependencies for both frontend and backend:

```bash
git clone https://github.com/your-username/findfast-ai.git
cd findfast-ai

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Local Development

Start both frontend and backend dev servers from the root directory:

```bash
# Terminal 1: Run Frontend UI (http://localhost:3000)
npm run dev:frontend

# Terminal 2: Run Backend API (http://localhost:8000)
npm run dev:backend
```

---

## 🛠 Production Build & Deployment

### Build Everything
```bash
npm run build
```

### Deployment Guidelines
- **Frontend**: Deploy the `frontend/dist` directory to **Vercel**, **Netlify**, or **Cloudflare Pages**.
- **Backend**: Deploy `backend/dist` to **Render**, **Railway**, or **AWS ECS**.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
