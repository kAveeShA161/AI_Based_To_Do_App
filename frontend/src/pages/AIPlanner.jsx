import React, { useState, useContext } from "react";
import NavBar from "../components/NavBar";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const AIPlanner = () => {
    const { backendUrl } = useContext(AppContext);

    const [goal, setGoal] = useState("");
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(false);

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
                setSteps(data.steps);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const saveTasks = async () => {
        try {
            await Promise.all(
                steps.map(step =>
                    axios.post(
                        `${backendUrl}/api/task/create`,
                        {
                            title: step,
                            priority: "Medium",
                        },
                        { withCredentials: true }
                    )
                )
            );

            toast.success("Tasks created!");
            setSteps([]);
            setGoal("");

        } catch (error) {
            toast.error("Failed to save tasks");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <div className="max-w-4xl mx-auto px-6 py-8">

                <h1 className="text-2xl font-bold mb-6">AI Task Planner</h1>

                {/* Input Box */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <textarea
                        placeholder="e.g., Prepare for final exams..."
                        className="w-full border rounded-lg p-4 outline-none"
                        rows={3}
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    />

                    <button
                        onClick={generatePlan}
                        className="mt-4 bg-teal-500 text-white px-6 py-2 rounded-lg"
                    >
                        {loading ? "Generating..." : "Generate"}
                    </button>
                </div>

                {/* Steps */}
                {steps.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between mb-4">
                            <h2 className="font-semibold">Suggested Plan</h2>

                            <button
                                onClick={saveTasks}
                                className="bg-red-400 text-white px-4 py-2 rounded-lg"
                            >
                                Save to Tasks
                            </button>
                        </div>

                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-lg bg-gray-50"
                                >
                                    {index + 1}. {step}
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