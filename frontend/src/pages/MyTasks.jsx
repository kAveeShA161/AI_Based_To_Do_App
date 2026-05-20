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
            case "High Priority":
                return task.priority === "High";
            case "Medium":
                return task.priority === "Medium";
            case "Low":
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
                case "High Priority": return task.priority === "High";
                case "Medium": return task.priority === "Medium";
                case "Low": return task.priority === "Low";
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
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                        <p className="text-2xl text-gray-500 mt-1">{tasks.length} tasks</p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <button
                            type="button"
                            onClick={openCalendar}
                            className="text-xl px-4 py-3 bg-white text-gray-700 rounded-lg border border-gray-200 hover:border-red-300 hover:text-red-500 cursor-pointer w-full sm:w-auto"
                        >
                            <i className="fa-regular fa-calendar-days mr-2" aria-hidden="true"></i>
                            History Calendar
                        </button>

                        <button onClick={() => navigate("/create-task")} className="text-xl px-4 py-3 bg-red-400 text-white rounded-lg hover:bg-red-500 cursor-pointer w-full sm:w-auto">
                            + New Task
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="text-xl w-full xl:flex-1 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-xl w-full xl:w-80 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 cursor-pointer"
                    >
                        <option value="dueDate">Sort by Due Date</option>
                        <option value="priority">Sort by Priority</option>
                    </select>
                </div>

                <div className="text-xl flex flex-wrap gap-3 mb-8 overflow-x-auto pb-2">
                    {[
                        { name: "All Tasks", count: tasks.length, color: "bg-red-400 text-white" },
                        { name: "Today", count: getCount("Today"), icon: "fa-regular fa-calendar" },
                        { name: "Upcoming", count: getCount("Upcoming"), icon: "fa-regular fa-clock" },
                        { name: "Completed", count: getCount("Completed"), icon: "fa-regular fa-circle-check" },
                        { name: "High Priority", count: getCount("High Priority"), icon: "fa-solid fa-circle-exclamation" },
                        { name: "Medium", count: getCount("Medium"), icon: "fa-solid fa-circle-exclamation" },
                        { name: "Low", count: getCount("Low"), icon: "fa-solid fa-circle-exclamation" },
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
