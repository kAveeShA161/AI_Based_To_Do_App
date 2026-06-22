import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './Routes/authRoutes.js';
import userRouter from './Routes/userRoutes.js';
import taskRoutes from "./Routes/taskRoutes.js";
import dashboardRoutes from "./Routes/dashboardRoutes.js";
import aiRoutes from "./Routes/aiRoutes.js";

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()),
  'https://ai-based-to-do-app.vercel.app',
  'http://localhost:5173',
].filter(Boolean);

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Api Endpoints
app.get('/', (req, res) => {
  res.send('Hello from server');
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.use("/api/task", taskRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/ai", aiRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
