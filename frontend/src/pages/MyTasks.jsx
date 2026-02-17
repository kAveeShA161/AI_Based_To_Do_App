import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import TaskCard from "../components/TaskCard";
import { useNavigate } from "react-router-dom";

const MyTasks = () => {
    const { backendUrl } = useContext(AppContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const handleUpdateTask = async (taskId, updates) => {
        try {
            const { data } = await axios.put(
                `${backendUrl}/api/task/update/${taskId}`,
                updates,
                { withCredentials: true }
            );
            if (data.success) {
                // Optimistic update
                setTasks(tasks.map(t => t._id === taskId ? { ...t, ...updates } : t));
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
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase());

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

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                        <p className="text-2xl text-gray-500 mt-1">{tasks.length} tasks</p>
                    </div>

                    <button onClick={() => navigate("/create-task")} className="text-xl px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 cursor-pointer">
                        + New Task
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 cursor-pointer"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {filteredTasks.length > 0 ? (
                            [...filteredTasks].sort((a, b) => {
                                if (sortBy === "priority") {
                                    const order = { High: 1, Medium: 2, Low: 3 };
                                    return (order[a.priority] || 4) - (order[b.priority] || 4);
                                }
                                return new Date(a.dueDate) - new Date(b.dueDate);
                            }).map(task => (
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
        </div>
    );
};

export default MyTasks;
