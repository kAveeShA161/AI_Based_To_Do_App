import express from 'express';
import { login, logout, resgister } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/register', resgister);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

export default authRouter; 