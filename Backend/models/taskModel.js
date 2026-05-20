import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        dueDate: {
            type: Date,
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
        category: {
            type: String,
        },
        tags: [
            {
                type: String,
            },
        ],
        isCompleted: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, isCompleted: 1 });

export default mongoose.model("Task", taskSchema);
