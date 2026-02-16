import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import TaskCard from "../components/TaskCard";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
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

                    <p className="text-gray-500 mt-1">
                        You have {dashboard?.todayTasks?.length || 0} tasks pending today.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <p className="text-gray-500">Completion Rate</p>
                        <h2 className="text-3xl font-bold">{dashboard.completionRate}%</h2>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <p className="text-gray-500">Focus Streak</p>
                        <h2 className="text-3xl font-bold">{dashboard.focusStreak} Days</h2>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <p className="text-gray-500">Tasks Done</p>
                        <h2 className="text-3xl font-bold">{dashboard.tasksDone}</h2>
                    </div>

                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">Today's Focus</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {dashboard?.todayTasks?.length > 0 ? (
                            dashboard.todayTasks.map(task => (
                                <TaskCard key={task._id} task={task} />
                            ))
                        ) : (
                            <div className="bg-white p-8 rounded-xl text-center text-gray-500">
                                No tasks scheduled for today. Relax!
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;