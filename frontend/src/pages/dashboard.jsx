import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import TaskCard from "../components/TaskCard";
import { AppContext } from "../context/AppContext";

const moodOptions = [
    {
        id: "motivated",
        label: "Motivated",
        iconClass: "fa-solid fa-face-smile-beam",
        description: "Show the highest-priority tasks first.",
        priorities: ["High"],
        accent: "from-emerald-400 to-teal-500",
        ring: "ring-emerald-200",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
    },
    {
        id: "low-energy",
        label: "Low Energy",
        iconClass: "fa-solid fa-face-frown",
        description: "Pick medium-priority tasks that feel manageable.",
        priorities: ["Medium"],
        accent: "from-amber-400 to-orange-500",
        ring: "ring-amber-200",
        bg: "bg-amber-50",
        text: "text-amber-700",
    },
    {
        id: "tired",
        label: "Tired",
        iconClass: "fa-solid fa-bed",
        description: "Show easy tasks that need less mental effort.",
        priorities: ["Low"],
        accent: "from-violet-400 to-indigo-500",
        ring: "ring-violet-200",
        bg: "bg-violet-50",
        text: "text-violet-700",
    },
];

const Dashboard = () => {
    const { userData, backendUrl } = useContext(AppContext);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMood, setSelectedMood] = useState("motivated");

    const fetchDashboard = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/dashboard`, {
                withCredentials: true,
            });

            if (data.success) {
                setDashboard(data.data);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTask = async (taskId, updates) => {
        try {
            const { data } = await axios.put(
                `${backendUrl}/api/task/update/${taskId}`,
                updates,
                { withCredentials: true }
            );

            if (data.success) {
                fetchDashboard();
                toast.success("Task updated");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [backendUrl]);

    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour < 12) return "Good Morning";
        if (hour < 16) return "Good Afternoon";
        if (hour < 18) return "Good Evening";
        return "Good Night";
    };

    const sortedTodayTasks = [...(dashboard?.todayTasks || [])].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
            return Number(a.isCompleted) - Number(b.isCompleted);
        }

        const order = { High: 1, Medium: 2, Low: 3 };
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

        if (aDate !== bDate) {
            return aDate - bDate;
        }

        return (order[a.priority] || 4) - (order[b.priority] || 4);
    });

    const activeMood =
        moodOptions.find((mood) => mood.id === selectedMood) || moodOptions[0];

    const filteredTodayTasks = sortedTodayTasks.filter((task) =>
        activeMood.priorities.includes(task.priority || "Medium")
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {getGreeting()}, {userData?.fullName} !
                    </h1>

                    <p className="mt-1 text-base text-gray-500 sm:text-lg">
                        You have {dashboard?.todayTasks?.filter((task) => !task.isCompleted).length || 0} tasks pending today. Let&apos;s make it a productive day!
                    </p>
                </div>

                <div className="mb-8 rounded-3xl border border-gray-100 bg-white px-4 py-6 shadow-sm sm:mb-10 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                            How are you feeling today?
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 sm:text-base">
                            We&apos;ll adjust your task recommendations based on your energy.
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {moodOptions.map((mood) => {
                            const isActive = mood.id === selectedMood;

                            return (
                                <button
                                    key={mood.id}
                                    type="button"
                                    onClick={() => setSelectedMood(mood.id)}
                                    className={`rounded-2xl border px-4 py-5 text-center transition-all duration-200 ${isActive
                                        ? `${mood.bg} ${mood.text} border-transparent ring-2 ${mood.ring} shadow-md`
                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm"
                                        }`}
                                >
                                    <div
                                        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-3xl ${isActive
                                            ? `bg-gradient-to-br ${mood.accent} text-white shadow-sm`
                                            : "bg-gray-100"
                                            }`}
                                    >
                                        <i className={mood.iconClass} aria-hidden="true"></i>
                                    </div>

                                    <p className="mt-4 text-sm font-semibold sm:text-base">
                                        {mood.label}
                                    </p>

                                    <p className="mt-2 text-xs leading-5 text-gray-500">
                                        {mood.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3 xl:gap-6">
                    <div className="flex rounded-xl bg-white p-6 shadow-sm">
                        <i className="fa fa-bullseye rounded-full bg-blue-100 px-4 py-4 text-2xl text-blue-500"></i>
                        <div className="ml-4">
                            <p className="text-lg text-gray-500">Completion Rate</p>
                            <h2 className="text-2xl font-bold">
                                {loading ? "--" : `${dashboard?.completionRate ?? 0}%`}
                            </h2>
                        </div>
                    </div>

                    <div className="flex rounded-xl bg-white p-6 shadow-sm">
                        <i className="fa fa-trophy rounded-full bg-green-100 px-4 py-4 text-2xl text-green-500"></i>
                        <div className="ml-4">
                            <p className="text-lg text-gray-500">Focus Streak</p>
                            <h2 className="text-2xl font-bold">
                                {loading ? "--" : `${dashboard?.focusStreak ?? 0} Days`}
                            </h2>
                        </div>
                    </div>

                    <div className="flex rounded-xl bg-white p-6 shadow-sm">
                        <i className="fa fa-bolt rounded-full bg-purple-100 px-4 py-4 text-2xl text-purple-500"></i>
                        <div className="ml-4">
                            <p className="text-lg text-gray-500">Tasks Done</p>
                            <h2 className="text-2xl font-bold">
                                {loading ? "--" : dashboard?.tasksDone ?? 0}
                            </h2>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Today&apos;s Focus</h2>
                            <p className="text-sm text-gray-500">
                                {activeMood.label} mode is showing {filteredTodayTasks.length} matching task{filteredTodayTasks.length === 1 ? "" : "s"}.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:gap-6">
                        {loading ? (
                            <div className="rounded-xl bg-white p-8 text-center text-gray-500">
                                Loading dashboard...
                            </div>
                        ) : filteredTodayTasks.length > 0 ? (
                            filteredTodayTasks.map((task) => (
                                <TaskCard key={task._id} task={task} onUpdate={handleUpdateTask} />
                            ))
                        ) : (
                            <div className="rounded-xl bg-white p-8 text-center text-gray-500">
                                
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
