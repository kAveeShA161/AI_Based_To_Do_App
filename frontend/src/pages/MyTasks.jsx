import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import TaskCard from "../components/TaskCard";
import CalendarHistoryModal from "../components/CalendarHistoryModal";
import { useNavigate } from "react-router-dom";

const MyTasks = () => {
    const { backendUrl } = useContext(AppContext);
    const [tasks, setTasks] = useState([]);
    const [moodHistory, setMoodHistory] = useState([]);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [calendarLoaded, setCalendarLoaded] = useState(false);
    const [filter, setFilter] = useState("All Tasks");
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("dueDate");
    const navigate = useNavigate();

    const fetchTasks = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/task/all", {
                withCredentials: true,
            });
            if (data.success) {
                setTasks(data.tasks);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
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
                setMoodHistory(data.data?.moodHistory || []);
                if (!tasks.length && data.data?.tasks) {
                    setTasks(data.data.tasks);
                }
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
                setTasks((prev) => prev.map((task) => (task._id === taskId ? data.task : task)));
                toast.success("Task updated");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const { data } = await axios.delete(
                `${backendUrl}/api/task/delete/${taskId}`,
                { withCredentials: true }
            );

            if (data.success) {
                setTasks(prev => prev.filter(t => t._id !== taskId));
                toast.success("Task deleted");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };


    useEffect(() => {
        fetchTasks();
    }, []);

    const filteredTasks = tasks.filter(task => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const matchesSearch =
            !normalizedSearch ||
            task.title?.toLowerCase().includes(normalizedSearch) ||
            task.description?.toLowerCase().includes(normalizedSearch) ||
            task.category?.toLowerCase().includes(normalizedSearch) ||
            task.tags?.some((tag) => tag?.toLowerCase().includes(normalizedSearch));

        if (!matchesSearch) return false;

        const taskDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
        const today = new Date().setHours(0, 0, 0, 0);

        switch (filter) {
            case "Today":
                return taskDate === today;
            case "Upcoming":
                return taskDate > today;
            case "Completed":
                return task.isCompleted;
            case "High Difficulty":
                return task.priority === "High";
            case "Medium Difficulty":
                return task.priority === "Medium";
            case "Low Difficulty":
                return task.priority === "Low";
            default:
                return true;
        }
    });

    const getCount = (filterName) => {
        const today = new Date().setHours(0, 0, 0, 0);

        return tasks.filter(task => {
            const taskDate = new Date(task.dueDate).setHours(0, 0, 0, 0);

            switch (filterName) {
                case "Today": return taskDate === today;
                case "Upcoming": return taskDate > today;
                case "Completed": return task.isCompleted;
                case "High Difficulty": return task.priority === "High";
                case "Medium Difficulty": return task.priority === "Medium";
                case "Low Difficulty": return task.priority === "Low";
                default: return true;
            }
        }).length;
    };

    const compareTasks = (a, b) => {
        if (a.isCompleted !== b.isCompleted) {
            return Number(a.isCompleted) - Number(b.isCompleted);
        }

        const order = { High: 1, Medium: 2, Low: 3 };
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

        if (sortBy === "priority") {
            const priorityCompare = (order[a.priority] || 4) - (order[b.priority] || 4);
            if (priorityCompare !== 0) {
                return priorityCompare;
            }

            return aDate - bDate;
        }

        if (aDate !== bDate) {
            return aDate - bDate;
        }

        return (order[a.priority] || 4) - (order[b.priority] || 4);
    };

    const openCalendar = async () => {
        setCalendarOpen(true);
        if (!calendarLoaded && !calendarLoading) {
            await fetchCalendarHistory();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 lg:pl-72">
            <NavBar />

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Tasks</h1>
                        <p className="mt-1 text-sm text-gray-500 sm:text-2xl">{tasks.length} tasks</p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <button
                            type="button"
                            onClick={openCalendar}
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 hover:border-red-300 hover:text-red-500 cursor-pointer sm:w-auto sm:text-xl"
                        >
                            <i className="fa-regular fa-calendar-days mr-2" aria-hidden="true"></i>
                            History Calendar
                        </button>

                        <button onClick={() => navigate("/create-task")} className="w-full rounded-lg bg-red-400 px-4 py-3 text-sm text-white hover:bg-red-500 cursor-pointer sm:w-auto sm:text-xl">
                            + New Task
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-xl xl:flex-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 cursor-pointer sm:text-xl xl:w-80"
                    >
                        <option value="dueDate">Sort by Due Date</option>
                        <option value="priority">Sort by Difficulty</option>
                    </select>
                </div>

                <div className="relative mb-8 sm:hidden">
                    <button
                        type="button"
                        onClick={() => setFilterMenuOpen((current) => !current)}
                        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm"
                    >
                        <span>Filter by: {filter}</span>
                        <i className={`fa-solid fa-chevron-down text-xs transition-transform ${filterMenuOpen ? "rotate-180" : ""}`} aria-hidden="true"></i>
                    </button>

                    {filterMenuOpen && (
                        <div className="absolute left-0 right-0 top-14 z-20 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                            {[
                                { name: "All Tasks", count: tasks.length, color: "bg-red-400 text-white" },
                                { name: "Today", count: getCount("Today"), icon: "fa-regular fa-calendar" },
                                { name: "Upcoming", count: getCount("Upcoming"), icon: "fa-regular fa-clock" },
                                { name: "Completed", count: getCount("Completed"), icon: "fa-regular fa-circle-check" },
                                { name: "High Difficulty", count: getCount("High Difficulty"), icon: "fa-solid fa-circle-exclamation" },
                                { name: "Medium Difficulty", count: getCount("Medium Difficulty"), icon: "fa-solid fa-circle-exclamation" },
                                { name: "Low Difficulty", count: getCount("Low Difficulty"), icon: "fa-solid fa-circle-exclamation" },
                            ].map((f) => (
                                <button
                                    key={f.name}
                                    type="button"
                                    onClick={() => {
                                        setFilter(f.name);
                                        setFilterMenuOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                                        filter === f.name
                                            ? "bg-red-400 text-white"
                                            : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {f.icon && <i className={f.icon} aria-hidden="true"></i>}
                                        {f.name}
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${filter === f.name ? "bg-white/20" : "bg-gray-100"}`}>
                                        {f.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-8 hidden flex-wrap gap-3 overflow-x-auto pb-2 text-xl sm:flex">
                    {[
                        { name: "All Tasks", count: tasks.length, color: "bg-red-400 text-white" },
                        { name: "Today", count: getCount("Today"), icon: "fa-regular fa-calendar" },
                        { name: "Upcoming", count: getCount("Upcoming"), icon: "fa-regular fa-clock" },
                        { name: "Completed", count: getCount("Completed"), icon: "fa-regular fa-circle-check" },
                        { name: "High Difficulty", count: getCount("High Difficulty"), icon: "fa-solid fa-circle-exclamation" },
                        { name: "Medium Difficulty", count: getCount("Medium Difficulty"), icon: "fa-solid fa-circle-exclamation" },
                        { name: "Low Difficulty", count: getCount("Low Difficulty"), icon: "fa-solid fa-circle-exclamation" },
                    ].map((f) => (
                        <button
                            key={f.name}
                            onClick={() => setFilter(f.name)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap
                                ${filter === f.name
                                    ? "bg-red-400 text-white shadow-md"
                                    : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent"
                                }`}
                        >
                            {f.icon && <i className={f.icon}></i>}
                            {f.name}
                            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${filter === f.name ? "bg-white/20" : "bg-gray-100"}`}>
                                {f.count}
                            </span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 xl:gap-6">
                        {filteredTasks.length > 0 ? (
                            [...filteredTasks].sort(compareTasks).map(task => (
                                <TaskCard key={task._id} task={task} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-xl">No tasks found</p>
                                <p className="text-sm mt-2">Try adjusting your filters or create a new task</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CalendarHistoryModal
                open={calendarOpen}
                onClose={() => setCalendarOpen(false)}
                tasks={tasks}
                moodHistory={moodHistory}
                loading={calendarLoading}
            />
        </div>
    );
};

export default MyTasks;
