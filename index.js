import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import { initAuth, getAuth } from './lib/auth.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import classRoutes from './routes/classRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Allow ALL origins that contain your Vercel domains
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.CLIENT_URL,
    ].filter(Boolean);

    // Allow Vercel preview deployments too
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

let initialized = false;
async function initialize() {
  if (initialized) return;
  await initAuth();
  await connectDB();
  initialized = true;
}

app.all('/api/auth/*', async (req, res, next) => {
  await initialize();
  return toNodeHandler(getAuth())(req, res, next);
});

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

app.use(async (req, res, next) => {
  try { await initialize(); next(); }
  catch (error) { console.error('Init failed:', error); res.status(500).json({ message: 'Server init failed' }); }
});

app.use('/api/jwt', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/trainers', trainerRoutes);

app.get('/', (req, res) => res.json({ status: 'OK', app: 'ApexForge API' }));
app.get('/health', (req, res) => res.json({ status: 'OK', app: 'ApexForge API' }));

// Must be registered after all routes — Express identifies error middleware
// by its 4-argument signature (err, req, res, next)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`ApexForge Server running on port ${PORT}`));
}

export default app;
