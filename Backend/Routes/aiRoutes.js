import express from "express";
import userAuth from "../middleware/userAuth.js";
import { generatePlan } from "../controllers/aiController.js";

const router = express.Router();

router.post("/generate", userAuth, generatePlan);

export default router;