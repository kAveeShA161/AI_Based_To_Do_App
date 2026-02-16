import userModel from "../models/userModel.js";
import taskModel from "../models/taskModel.js";

export const getDashboardData = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastActive = user.lastActiveDate
            ? new Date(user.lastActiveDate).setHours(0, 0, 0, 0)
            : null;

        if (!lastActive) {
            user.focusStreak = 1;
        } else {
            const diffDays = (today - lastActive) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                user.focusStreak += 1;
            } else if (diffDays > 1) {
                user.focusStreak = 1;
            }
        }

        user.lastActiveDate = today;

        if (user.focusStreak > user.longestStreak) {
            user.longestStreak = user.focusStreak;
        }

        await user.save();

        const tasks = await taskModel.find({ user: req.user.id });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.isCompleted).length;

        const completionRate =
            totalTasks === 0
                ? 0
                : Math.round((completedTasks / totalTasks) * 100);


        const todayTaks = tasks.filter(t => {
            if (!t.dueDate) return false;
            const taskDate = new Date(t.dueDate).setHours(0, 0, 0, 0);
            return taskDate === today;
        });

        res.json({
            success: true,
            data: {
                focusStreak: user.focusStreak,
                longestStreak: user.longestStreak,
                completionRate,
                tasksDone: completedTasks,
                todayTasks,
                totalTasks,
            },
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};