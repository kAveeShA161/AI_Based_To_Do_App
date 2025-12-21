import express from 'express';
import { login, logout, resgister, sendVerifyOTP, verifyEmail } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post('/register', resgister);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOTP);
authRouter.post('/verify-email', userAuth, verifyEmail);

export default authRouter; 