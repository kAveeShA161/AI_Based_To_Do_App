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
    },
    { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
