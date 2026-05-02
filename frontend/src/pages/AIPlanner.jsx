import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import { AppContext } from "../context/AppContext";

const priorityStyles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
};

const AIPlanner = () => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    const [goal, setGoal] = useState("");
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const generatePlan = async () => {
        if (!goal.trim()) {
            toast.error("Enter a goal");
            return;
        }

        try {
            setLoading(true);

            const { data } = await axios.post(
                `${backendUrl}/api/ai/generate`,
                { goal },
                { withCredentials: true }
            );

            if (data.success) {
                const formatted = data.steps.map((step) => ({
                    title: step,
                    description: "",
                    priority: "Medium",
                    dueDate: "",
                    category: "General",
                }));

                setTasks(formatted);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateTask = (index, field, value) => {
        const updated = [...tasks];
        updated[index][field] = value;
        setTasks(updated);
    };

    const saveTasks = async () => {
        if (!tasks.length) {
            toast.error("No tasks to save");
            return;
        }

        try {
            setSaving(true);

            const { data } = await axios.post(
                `${backendUrl}/api/task/bulk-create`,
                { tasks },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Tasks saved successfully!");
                setTasks([]);
                setGoal("");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save tasks");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        AI Task Planner
                    </h1>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-5 sm:p-6 md:p-8 mb-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center shrink-0">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="w-6 h-6 text-cyan-400"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14Z" />
                            </svg>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                                AI Task Planner
                            </h2>
                            <p className="mt-1 text-sm text-gray-400 sm:text-base">
                                Break down big goals into manageable steps
                            </p>

                            <div className="mt-6 flex flex-col md:flex-row md:items-center gap-4">
                                <input
                                    type="text"
                                    placeholder="e.g., Prepare for final exams, Launch marketing campaign..."
                                    className="min-h-12 flex-1 rounded-2xl border border-cyan-100 bg-cyan-50/40 px-4 py-3 text-base text-gray-700 placeholder:text-gray-400 outline-none focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-100 sm:min-h-14 sm:px-5 sm:text-lg"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                />

                                <button
                                    onClick={generatePlan}
                                    className="w-full rounded-xl bg-teal-400 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-teal-500 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed md:w-auto md:min-w-36 md:text-lg"
                                    disabled={loading}
                                >
                                    {loading ? "Generating..." : "Generate"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {tasks.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-gray-100">
                            <button
                                onClick={() => setTasks([])}
                                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-base text-gray-700 hover:bg-gray-50 cursor-pointer sm:w-auto sm:text-lg"
                            >
                                Clear Draft
                            </button>
                        </div>
                    )}
                </div>

                {tasks.length > 0 && (
                    <div className="bg-white shadow-sm rounded-3xl border border-gray-100 p-5 sm:p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                    Edit Your Tasks
                                </h2>
                                <p className="mt-1 text-sm text-gray-500 sm:text-base">
                                    Review titles, notes, dates, and priority before saving.
                                </p>
                            </div>

                            <button
                                onClick={saveTasks}
                                className="w-full rounded-lg bg-red-400 px-5 py-3 text-base text-white hover:bg-red-500 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed md:w-auto md:text-lg"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save All Tasks"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 xl:gap-6">
                            {tasks.map((task, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-6"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-semibold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-base font-semibold text-gray-800 sm:text-lg">
                                                    Suggested Task
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Adjust the details if needed
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${priorityStyles[task.priority] || "bg-gray-100 text-gray-700"}`}
                                        >
                                            {task.priority} Priority
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-base font-medium text-gray-700 sm:text-lg">
                                                Task Title
                                            </label>
                                            <input
                                                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-lg"
                                                value={task.title}
                                                onChange={(e) =>
                                                    updateTask(index, "title", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="text-base font-medium text-gray-700 sm:text-lg">
                                                Description
                                            </label>
                                            <textarea
                                                className="mt-2 h-28 w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-lg"
                                                placeholder="Add optional notes for this task"
                                                value={task.description}
                                                onChange={(e) =>
                                                    updateTask(index, "description", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-base font-medium text-gray-700 sm:text-lg">
                                                    Priority
                                                </label>
                                                <select
                                                    className="mt-2 w-full cursor-pointer rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-lg"
                                                    value={task.priority}
                                                    onChange={(e) =>
                                                        updateTask(index, "priority", e.target.value)
                                                    }
                                                >
                                                    <option>High</option>
                                                    <option>Medium</option>
                                                    <option>Low</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-base font-medium text-gray-700 sm:text-lg">
                                                    Due Date
                                                </label>
                                                <input
                                                    type="date"
                                                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-lg"
                                                    value={task.dueDate}
                                                    onChange={(e) =>
                                                        updateTask(index, "dueDate", e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <label className="text-base font-medium text-gray-700 sm:text-lg">
                                                    Category
                                                </label>
                                                <input
                                                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-lg"
                                                    placeholder="Work, Personal, Study..."
                                                    value={task.category}
                                                    onChange={(e) =>
                                                        updateTask(index, "category", e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIPlanner;
