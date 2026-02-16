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
            user: req.body.userId,
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
        const tasks = await Task.find({ user: req.body.userId }).sort({ createdAt: -1 });
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

        if (task.user.toString() !== req.body.userId) {
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

        if (task.user.toString() !== req.body.userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        await Task.findByIdAndDelete(id);

        return res.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
