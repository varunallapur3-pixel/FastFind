import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { placesRouter } from './routes/places';
import { authRouter } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api/v1/places', placesRouter);
app.use('/api/v1/auth', authRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', system: 'FindFast AI API v1.0', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 FindFast AI Backend Server running on http://localhost:${PORT}`);
  console.log(`📍 Places API: http://localhost:${PORT}/api/v1/places/search`);
  console.log(`⭐ Top-Rated API: http://localhost:${PORT}/api/v1/places/top-rated?q=cafe`);
});
