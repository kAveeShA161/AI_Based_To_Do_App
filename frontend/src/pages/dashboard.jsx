import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import TaskCard from "../components/TaskCard";
import CalendarHistoryModal from "../components/CalendarHistoryModal";
import { AppContext } from "../context/AppContext";

const moodOptions = [
    {
        id: "motivated",
        label: "Motivated",
        iconClass: "fa-solid fa-face-smile-beam",
        description: "Show all of today's tasks.",
        priorities: ["High", "Medium", "Low"],
        accent: "from-emerald-400 to-teal-500",
        ring: "ring-emerald-200",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
    },
    {
        id: "low-energy",
        label: "Low Energy",
        iconClass: "fa-solid fa-face-frown",
        description: "Pick medium difficulty tasks that feel manageable.",
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
    const [calendarData, setCalendarData] = useState({ tasks: [], moodHistory: [] });
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [calendarLoaded, setCalendarLoaded] = useState(false);
    const [selectedMood, setSelectedMood] = useState("motivated");
    const [showAllTasks, setShowAllTasks] = useState(true);

    const fetchDashboard = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/dashboard`, {
                withCredentials: true,
            });

            if (data.success) {
                setDashboard(data.data);
                if (data.data?.todayMood) {
                    setSelectedMood(data.data.todayMood);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCalendarHistory = async () => {
        try {
            setCalendarLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/dashboard/calendar-history`, {
                withCredentials: true,
            });

            if (data.success) {
                setCalendarData({
                    tasks: data.data?.tasks || [],
                    moodHistory: data.data?.moodHistory || [],
                });
                setCalendarLoaded(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setCalendarLoading(false);
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
                setCalendarData((prev) => ({
                    ...prev,
                    tasks: prev.tasks.map((task) =>
                        task._id === taskId ? { ...task, ...data.task } : task
                    ),
                }));
                fetchDashboard();
                toast.success("Task updated");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleMoodSelect = async (moodId) => {
        setSelectedMood(moodId);
        setShowAllTasks(moodId === "motivated");

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/dashboard/mood`,
                { mood: moodId },
                { withCredentials: true }
            );

            if (!data.success) {
                toast.error(data.message);
                return;
            }

            setDashboard((prev) =>
                prev
                    ? {
                        ...prev,
                        todayMood: moodId,
                    }
                    : prev
            );

            setCalendarData((prev) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayKey = today.toISOString().split("T")[0];
                const nextMoodHistory = [...(prev.moodHistory || [])];
                const existingIndex = nextMoodHistory.findIndex((entry) => {
                    const entryDate = new Date(entry.date);
                    entryDate.setHours(0, 0, 0, 0);
                    return entryDate.toISOString().split("T")[0] === todayKey;
                });

                if (existingIndex >= 0) {
                    nextMoodHistory[existingIndex] = {
                        ...nextMoodHistory[existingIndex],
                        mood: moodId,
                    };
                } else {
                    nextMoodHistory.push({ date: today.toISOString(), mood: moodId });
                }

                return {
                    ...prev,
                    moodHistory: nextMoodHistory,
                };
            });
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const openCalendar = async () => {
        setCalendarOpen(true);
        if (!calendarLoaded && !calendarLoading) {
            await fetchCalendarHistory();
        }
    };

    useEffect(() => {
        fetchDashboard();
        fetchCalendarHistory();
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

    const filteredTodayTasks = showAllTasks
        ? sortedTodayTasks
        : sortedTodayTasks.filter((task) =>
            activeMood.priorities.includes(task.priority || "Medium")
        );

    return (
        <div className="min-h-screen bg-gray-50 lg:pl-72">
            <NavBar />

            <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
                <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            {getGreeting()}, {userData?.fullName} !
                        </h1>

                        <p className="mt-1 text-sm text-gray-500 sm:text-lg">
                            You have {dashboard?.todayTasks?.filter((task) => !task.isCompleted).length || 0} tasks pending today. Let&apos;s make it a productive day!
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCalendar}
                        className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-teal-300 hover:text-teal-600 sm:gap-3 sm:px-5 sm:text-base"
                    >
                        <i className="fa-regular fa-calendar-days text-lg" aria-hidden="true"></i>
                        View History Calendar
                    </button>
                </div>

                <div className="mb-8 rounded-3xl border border-gray-100 bg-white px-4 py-5 shadow-sm sm:mb-10 sm:px-6 sm:py-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-gray-900 sm:text-2xl">
                            How are you feeling today?
                        </h2>
                        <p className="mt-2 text-xs text-gray-500 sm:text-base">
                            We&apos;ll adjust your task recommendations based on your energy.
                        </p>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2 overflow-x-auto pb-1 sm:mt-6 sm:gap-3">
                        {moodOptions.map((mood) => {
                            const isActive = mood.id === selectedMood;

                            return (
                                <button
                                    key={mood.id}
                                    type="button"
                                    onClick={() => handleMoodSelect(mood.id)}
                                    className={`min-w-[108px] rounded-2xl border px-2 py-3 text-center transition-all duration-200 sm:min-w-0 sm:px-4 sm:py-5 ${isActive
                                        ? `${mood.bg} ${mood.text} border-transparent ring-2 ${mood.ring} shadow-md`
                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm"
                                        }`}
                                >
                                    <div
                                        className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xl sm:h-14 sm:w-14 sm:text-3xl ${isActive
                                            ? `bg-gradient-to-br ${mood.accent} text-white shadow-sm`
                                            : "bg-gray-100"
                                            }`}
                                    >
                                        <i className={mood.iconClass} aria-hidden="true"></i>
                                    </div>

                                    <p className="mt-2 text-[10px] font-semibold sm:mt-4 sm:text-base">
                                        {mood.label}
                                    </p>

                                    <p className="mt-1 text-[9px] leading-3 text-gray-500 sm:mt-2 sm:text-xs sm:leading-5">
                                        {mood.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-10 grid grid-cols-3 gap-2 overflow-x-auto pb-1 sm:gap-3 xl:gap-6">
                    <div className="flex min-w-[112px] items-center rounded-xl bg-white p-3 shadow-sm sm:min-w-0 sm:p-6">
                        <i className="fa fa-bullseye rounded-full bg-blue-100 px-2.5 py-2.5 text-base text-blue-500 sm:px-4 sm:py-4 sm:text-2xl"></i>
                        <div className="ml-2 min-w-0 sm:ml-4">
                            <p className="text-[10px] leading-3 text-gray-500 sm:text-lg sm:leading-normal">Completion Rate</p>
                            <h2 className="text-base font-bold sm:text-2xl">
                                {loading ? "--" : `${dashboard?.completionRate ?? 0}%`}
                            </h2>
                        </div>
                    </div>

                    <div className="flex min-w-[112px] items-center rounded-xl bg-white p-3 shadow-sm sm:min-w-0 sm:p-6">
                        <i className="fa fa-trophy rounded-full bg-green-100 px-2.5 py-2.5 text-base text-green-500 sm:px-4 sm:py-4 sm:text-2xl"></i>
                        <div className="ml-2 min-w-0 sm:ml-4">
                            <p className="text-[10px] leading-3 text-gray-500 sm:text-lg sm:leading-normal">Focus Streak</p>
                            <h2 className="text-base font-bold sm:text-2xl">
                                {loading ? "--" : `${dashboard?.focusStreak ?? 0} Days`}
                            </h2>
                        </div>
                    </div>

                    <div className="flex min-w-[112px] items-center rounded-xl bg-white p-3 shadow-sm sm:min-w-0 sm:p-6">
                        <i className="fa fa-bolt rounded-full bg-purple-100 px-2.5 py-2.5 text-base text-purple-500 sm:px-4 sm:py-4 sm:text-2xl"></i>
                        <div className="ml-2 min-w-0 sm:ml-4">
                            <p className="text-[10px] leading-3 text-gray-500 sm:text-lg sm:leading-normal">Tasks Done</p>
                            <h2 className="text-base font-bold sm:text-2xl">
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
                                {showAllTasks
                                    ? `Showing all ${filteredTodayTasks.length} task${filteredTodayTasks.length === 1 ? "" : "s"} for today.`
                                    : `${activeMood.label} mode is showing ${filteredTodayTasks.length} matching task${filteredTodayTasks.length === 1 ? "" : "s"}.`}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAllTasks((prev) => !prev)}
                            className={`inline-flex items-center justify-center gap-2 self-start rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                                showAllTasks
                                    ? "border-teal-200 bg-teal-50 text-teal-700"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                            }`}
                        >
                            <i className="fa-solid fa-layer-group" aria-hidden="true"></i>
                            {showAllTasks ? "Show Mood Tasks" : "Show All Tasks"}
                        </button>
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
                            <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-500 sm:text-base">
                                No tasks match the selected mood right now.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CalendarHistoryModal
                open={calendarOpen}
                onClose={() => setCalendarOpen(false)}
                tasks={calendarData.tasks}
                moodHistory={calendarData.moodHistory}
                loading={calendarLoading}
            />
        </div>
    );
};

export default Dashboard;
