# FindFast AI - Backend API Service

Node.js Express + TypeScript backend API service for FindFast AI location search, top-rated place navigation, and user authentication.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server with auto-reload
npm run dev

# 3. Build production bundle
npm run build
```

## 📍 API Endpoints

### 1. Search Places
- **URL**: `GET /api/v1/places/search?q=cafe&category=cafe&sort=rating`
- **Description**: Returns all places matching search query sorted by rating or distance.

### 2. Get Top-Rated Match for Auto-Navigation
- **URL**: `GET /api/v1/places/top-rated?q=cafe`
- **Description**: Returns single highest-rated place + direct Google Maps navigation URL.

### 3. User Authentication
- **URL**: `POST /api/v1/auth/login`
- **URL**: `POST /api/v1/auth/signup`

## 🗄 Database (Optional PostgreSQL Setup)
- Schema definitions are available in `schema.sql`.
