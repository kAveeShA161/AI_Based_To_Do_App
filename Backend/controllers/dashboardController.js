import userModel from "../models/userModel.js";
import taskModel from "../models/taskModel.js";

const allowedMoods = ["motivated", "low-energy", "tired"];

const getDateKey = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split("T")[0];
};

export const getDashboardData = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const lastActive = user.lastActiveDate
            ? new Date(user.lastActiveDate).setHours(0, 0, 0, 0)
            : null;
        const todayTime = today.getTime();
        let shouldSaveUser = false;

        if (!lastActive) {
            user.focusStreak = 1;
            user.lastActiveDate = today;
            shouldSaveUser = true;
        } else if (lastActive !== todayTime) {
            const diffDays = (today - lastActive) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                user.focusStreak += 1;
            } else if (diffDays > 1) {
                user.focusStreak = 1;
            }
            user.lastActiveDate = today;
            shouldSaveUser = true;

            if (user.focusStreak > user.longestStreak) {
                user.longestStreak = user.focusStreak;
            }
        }

        if (shouldSaveUser) {
            await user.save();
        }

        const [totalTasks, completedTasks, todayTasks] = await Promise.all([
            taskModel.countDocuments({ user: req.userId }),
            taskModel.countDocuments({ user: req.userId, isCompleted: true }),
            taskModel
                .find({
                    user: req.userId,
                    dueDate: { $gte: today, $lt: tomorrow },
                })
                .select("title description dueDate priority category tags isCompleted createdAt")
                .sort({ isCompleted: 1, dueDate: 1, createdAt: -1 })
                .lean(),
        ]);

        const completionRate =
            totalTasks === 0
                ? 0
                : Math.round((completedTasks / totalTasks) * 100);

        res.json({
            success: true,
            data: {
                focusStreak: user.focusStreak,
                longestStreak: user.longestStreak,
                completionRate,
                tasksDone: completedTasks,
                todayTasks,
                totalTasks,
                todayMood: user.todayMood || "",
            },
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const saveDailyMood = async (req, res) => {
    try {
        const { mood } = req.body;

        if (!allowedMoods.includes(mood)) {
            return res.json({ success: false, message: "Invalid mood selected" });
        }

        const user = await userModel.findById(req.userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayKey = getDateKey(today);
        const moodHistory = Array.isArray(user.moodHistory) ? user.moodHistory : [];
        const existingMood = moodHistory.find(
            (entry) => getDateKey(entry.date) === todayKey
        );

        if (existingMood) {
            existingMood.mood = mood;
        } else {
            moodHistory.push({ date: today, mood });
        }

        user.moodHistory = moodHistory;
        user.todayMood = mood;
        await user.save();

        return res.json({
            success: true,
            message: "Mood saved successfully",
            mood,
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const getCalendarHistory = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select("moodHistory todayMood");

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const tasks = await taskModel
            .find({ user: req.userId })
            .select(
                "title description dueDate priority category tags isCompleted completedAt createdAt updatedAt"
            )
            .sort({ dueDate: 1, createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            data: {
                tasks,
                moodHistory: user.moodHistory || [],
                todayMood: user.todayMood || "",
            },
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
