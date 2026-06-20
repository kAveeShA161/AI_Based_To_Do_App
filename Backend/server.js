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

app.use(cors({ credentials: true, 
  origin: 'https://ai-based-to-do-app.vercel.app' 
}));

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});