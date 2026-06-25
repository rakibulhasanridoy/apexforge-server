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

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

let initialized = false;
async function initialize() {
  if (initialized) return;
  await initAuth();
  await connectDB();
  initialized = true;
}

app.use(async (req, res, next) => {
  try {
    await initialize();
    next();
  } catch (error) {
    console.error('Initialization failed:', error);
    res.status(500).json({ message: 'Server initialization failed' });
  }
});

app.all('/api/auth/*', async (req, res, next) => {
  await initialize();
  const auth = getAuth();
  return toNodeHandler(auth)(req, res, next);
});

app.use('/api/jwt', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/trainers', trainerRoutes);

app.get('/', (req, res) => res.send('Welcome to the ApexForge API.'));
app.get('/health', (req, res) => res.json({ status: 'OK', app: 'ApexForge API' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 ApexForge Server running on port ${PORT}`));
}

export default app;
