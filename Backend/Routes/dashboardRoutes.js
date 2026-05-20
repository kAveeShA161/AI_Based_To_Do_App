import express from "express";
import {
    getCalendarHistory,
    getDashboardData,
    saveDailyMood,
} from "../controllers/dashboardController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.get("/", userAuth, getDashboardData);
router.get("/calendar-history", userAuth, getCalendarHistory);
router.post("/mood", userAuth, saveDailyMood);

export default router;
