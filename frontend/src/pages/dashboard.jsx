import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import TaskCard from "../components/TaskCard";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
    const { userData } = useContext(AppContext);

    const [dashboard, setDashboard] = useState(null);

    const fetchDashboard = async () => {
        try {
            const { data } = await axios.get(
                "http://localhost:5001/api/dashboard",
                { withCredentials: true }
            );

            if (data.success) {
                setDashboard(data.data);
            }
        } catch (error) {
            console.log("Dashboard Error Status:", error.response?.status);
            console.log("Dashboard Error Data:", error.response?.data);
        }

    }

    const handleUpdateTask = async (taskId, updates) => {
        try {
            const { data } = await axios.put(
                `http://localhost:5001/api/task/update/${taskId}`,
                updates,
                { withCredentials: true }
            );
            if (data.success) {
                // Refresh dashboard to update stats and task list
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
    }, []);

    if (!dashboard) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">Loading dashboard...</p>
            </div>
        );
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 16) return "Good Afternoon";
        if (hour < 18) return "Good Evening";
        return "Good Night";
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <div className="max-w-7xl mx-auto px-6 py-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {getGreeting()}, {userData?.fullName} !
                    </h1>

                    <p className="text-xl text-gray-500 mt-1">
                        You have {dashboard?.todayTasks?.filter(t => !t.isCompleted).length || 0} tasks pending today. Let's make it a productive day!
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="flex bg-white p-6 rounded-xl shadow-sm">
                        <i className="fa fa-bullseye py-4 px-4 text-2xl text-blue-500 bg-blue-100 rounded-full"></i>
                        <div className="ml-4">
                            <p className="text-xl text-gray-500">Completion Rate</p>
                            <h2 className="text-2xl font-bold">{dashboard.completionRate}%</h2>
                        </div>

                    </div>

                    <div className="flex bg-white p-6 rounded-xl shadow-sm">
                        <i class="fa fa-trophy py-4 px-4 text-2xl text-green-500 bg-green-100 rounded-full"></i>
                        <div className="ml-4">
                            <p className="text-xl text-gray-500">Focus Streak</p>
                            <h2 className="text-2xl font-bold">{dashboard.focusStreak} Days</h2>
                        </div>

                    </div>

                    <div className="flex bg-white p-6 rounded-xl shadow-sm">
                        <i class="fa fa-bolt py-4 px-4 text-2xl text-purple-500 bg-purple-100 rounded-full"></i>
                        <div className="ml-4">
                            <p className="text-xl text-gray-500">Tasks Done</p>
                            <h2 className="text-2xl font-bold">{dashboard.tasksDone}</h2>
                        </div>

                    </div>

                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">Today's Focus</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {dashboard.todayTasks.length > 0 ? (
                            dashboard.todayTasks.map(task => (
                                <TaskCard key={task._id} task={task} onUpdate={handleUpdateTask} />
                            ))
                        ) : (
                            <div className="bg-white p-8 rounded-xl text-center text-gray-500">
                                No tasks for today 🎉
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;