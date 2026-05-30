import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

const CreateTask = () => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState([]);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const priorityButtonStyles = {
        Low: "bg-green-100 text-green-700",
        Medium: "bg-yellow-300 text-yellow-700",
        High: "bg-red-100 text-red-700",
    };

    const handleCancel = () => {
        setShowCancelConfirm(true);
    };

    const confirmCancel = () => {
        navigate("/");
    };

    const closeCancelConfirm = () => {
        setShowCancelConfirm(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.post(
                backendUrl + "/api/task/create",
                {
                    title,
                    description,
                    dueDate,
                    priority,
                    category,
                    tags,
                },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Task created successfully");
                navigate("/");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <div className="flex justify-center px-4 py-6 sm:px-6 sm:py-8">

                <form
                    onSubmit={handleCreate}
                    className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-md sm:p-6 md:p-8"
                >
                    <div className="mb-8">
                        <p className="flex items-center gap-2 text-base text-gray-600 cursor-pointer sm:text-lg" onClick={() => navigate("/")}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 sm:h-6 sm:w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back
                        </p>

                        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Create New Task</h1>
                        <p className="mt-2 text-base text-gray-600 sm:text-lg">Add a new task to your list</p>
                    </div>

                    <label className="text-base font-medium text-gray-700 sm:text-lg">
                        Task Title
                    </label>
                    <input
                        type="text"
                        placeholder="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-lg"
                    />

                    <label className="mt-5 block text-base font-medium text-gray-700 sm:text-lg">
                        Description
                    </label>
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-2 h-32 w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-lg"
                    />

                    <label className="mt-5 block text-base font-medium text-gray-700 sm:text-lg">
                        Due Date
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-lg"
                    />

                    <label className="mt-5 block text-base font-medium text-gray-700 sm:text-lg">
                        Difficulty Level
                    </label>
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {["Low", "Medium", "High"].map((level) => (
                            <button
                                type="button"
                                key={level}
                                onClick={() => setPriority(level)}
                                className={`rounded-lg px-4 py-3 text-base font-medium sm:text-lg ${priority === level
                                    ? priorityButtonStyles[level]
                                    : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    <label className="mt-5 block text-base font-medium text-gray-700 sm:text-lg">
                        Category (Optional)
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Work, Personal, Study"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-lg"
                    />

                    <label className="mt-5 block text-base font-medium text-gray-700 sm:text-lg">
                        Tags  (Optional)
                    </label>
                    <input
                        type="text"
                        placeholder="Add a tag and press Enter"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-lg"
                    />

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                        <button
                            type="button"
                            className="w-full rounded-lg border-2 border-red-400 bg-white py-3 text-base text-red-400 hover:bg-red-500 hover:text-white cursor-pointer sm:text-lg"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-full rounded-lg border-red-400 bg-red-400 py-3 text-base text-white hover:bg-red-500 cursor-pointer sm:text-lg"
                        >
                            Create Task
                        </button>
                    </div>

                </form>
            </div>

            {showCancelConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 transition-opacity">
                    <div className="w-full max-w-md scale-100 transform rounded-lg bg-white p-5 shadow-2xl transition-all sm:p-6">
                        <h2 className="mb-4 text-lg font-bold text-gray-800 sm:text-xl">Discard changes?</h2>
                        <p className="mb-6 text-base text-gray-600 sm:text-lg">Are you sure you want to cancel? Your unsaved changes will be lost.</p>
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                onClick={closeCancelConfirm}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-gray-200 cursor-pointer sm:text-lg"
                            >
                                No, Keep Editing
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="rounded-lg bg-red-500 px-4 py-2 text-base font-medium text-white shadow-sm transition-colors hover:bg-red-600 cursor-pointer sm:text-lg"
                            >
                                Yes, Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateTask;
