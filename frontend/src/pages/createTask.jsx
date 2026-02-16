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
        <div>
            <NavBar />
            <div className="min-h-screen bg-gray-50 flex justify-center p-6">

                <form
                    onSubmit={handleCreate}
                    className="bg-white shadow-md rounded-2xl p-8 w-full max-w-2xl"
                >
                    <div className="items-center gap-2">
                        <p className="text-xl flex items-center gap-2 text-gray-600 cursor-pointer" onClick={() => navigate("/")}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back
                        </p><br />

                        <h1 className="text-3xl flex items-center gap-2 font-bold">Create New Task</h1>
                        <p className="text-xl flex items-center gap-2 text-gray-600">Add a new task to your list</p><br />
                    </div>

                    <label className="text-xl font-medium text-gray-700">
                        Task Title
                    </label>
                    <input
                        type="text"
                        placeholder="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                    /><br />

                    <label className="text-xl font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="text-xl w-full h-32 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                    /><br />

                    <label className="text-xl font-medium text-gray-700">
                        Due Date
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                    /><br />

                    <label className="text-xl font-medium text-gray-700">
                        Priority
                    </label>
                    <div className="w-full flex gap-4 mb-4">
                        {["Low", "Medium", "High"].map((level) => (
                            <button
                                type="button"
                                key={level}
                                onClick={() => setPriority(level)}
                                className={`text-xl px-17.5 py-2 rounded ${priority === level
                                    ? "bg-yellow-300 text-yellow-700"
                                    : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    <label className="text-xl font-medium text-gray-700">
                        Category (Optional)
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Work, Personal, Study"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                    /><br />

                    <label className="text-xl font-medium text-gray-700">
                        Tags  (Optional)
                    </label>
                    <input
                        type="text"
                        placeholder="Add a tag and press Enter"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                    /><br />
                    <br />

                    <div className="flex gap-4">
                        <button
                            type="button"
                            className="text-xl w-full bg-white text-red-400 border-red-400 border-2 py-3 rounded-lg hover:bg-red-500 hover:text-white cursor-pointer"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="text-xl w-full bg-red-400 text-white border-red-400 py-3 rounded-lg hover:bg-red-500 cursor-pointer"
                        >
                            Create Task
                        </button>
                    </div>

                </form>
            </div>

            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-150 transform transition-all scale-100">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Discard changes?</h2>
                        <p className="text-xl text-gray-600 mb-6">Are you sure you want to cancel? Your unsaved changes will be lost.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeCancelConfirm}
                                className="text-xl px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium cursor-pointer transition-colors"
                            >
                                No, Keep Editing
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="text-xl px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium cursor-pointer transition-colors shadow-sm"
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
