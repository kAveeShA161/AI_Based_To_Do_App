import Task from "../models/taskModel.js";

// Create Task
export const createTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority, category, tags } =
            req.body;

        if (!title) {
            return res.json({ success: false, message: "Title is required" });
        }

        const newTask = new Task({
            user: req.userId,
            title,
            description,
            dueDate,
            priority,
            category,
            tags,
        });

        await newTask.save();

        return res.json({
            success: true,
            message: "Task created successfully",
            task: newTask,
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get User Tasks
export const getUserTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
        return res.json({ success: true, tasks });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Update Task
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, dueDate, priority, category, tags, isCompleted } = req.body;

        const task = await Task.findById(id);

        if (!task) {
            return res.json({ success: false, message: "Task not found" });
        }

        if (task.user.toString() !== req.userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.dueDate = dueDate || task.dueDate;
        task.priority = priority || task.priority;
        task.category = category || task.category;
        task.tags = tags || task.tags;

        if (isCompleted !== undefined) {
            task.isCompleted = isCompleted;
        }

        await task.save();

        return res.json({ success: true, message: "Task updated successfully", task });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Delete Task
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.json({ success: false, message: "Task not found" });
        }

        if (task.user.toString() !== req.userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        await Task.findByIdAndDelete(id);

        return res.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const createBulkTasks = async (req, res) => {
    try {
        const { tasks } = req.body;
        const userId = req.userId;

        if (!tasks || !Array.isArray(tasks)) {
            return res.json({ success: false, message: "Tasks required" });
        }

        if (!userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const formattedTasks = tasks.map(t => ({
            user: userId,
            title: t.title?.trim(),
            description: t.description?.trim() || "",
            dueDate: t.dueDate || undefined,
            priority: t.priority || "Medium",
            category: t.category?.trim() || "",
            tags: Array.isArray(t.tags) ? t.tags : [],
        }));

        if (formattedTasks.some((task) => !task.title)) {
            return res.json({ success: false, message: "Each task needs a title" });
        }

        await Task.insertMany(formattedTasks);

        return res.json({
            success: true,
            message: "Tasks created successfully"
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
