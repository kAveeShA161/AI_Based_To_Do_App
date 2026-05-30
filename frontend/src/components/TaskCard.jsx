import React from "react";

const TaskCard = ({ task, onUpdate, onDelete, readOnly = false }) => {
    const priorityColors = {
        High: "bg-red-100 text-red-700",
        Medium: "bg-yellow-100 text-yellow-700",
        Low: "bg-green-100 text-green-700",
    };
    const statusPillClass = task.isCompleted
        ? "bg-emerald-100 text-emerald-700"
        : "bg-amber-100 text-amber-700";

    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [editForm, setEditForm] = React.useState({
        title: task.title || "",
        description: task.description || "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        priority: task.priority || "Medium",
        category: task.category || "",
    });

    React.useEffect(() => {
        setEditForm({
            title: task.title || "",
            description: task.description || "",
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
            priority: task.priority || "Medium",
            category: task.category || "",
        });
    }, [task]);

    const handleCheckboxChange = () => {
        if (readOnly || !onUpdate) {
            return;
        }
        onUpdate(task._id, { isCompleted: !task.isCompleted });
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        onDelete(task._id);
        setShowDeleteConfirm(false);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const openEditModal = () => {
        setEditForm({
            title: task.title || "",
            description: task.description || "",
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
            priority: task.priority || "Medium",
            category: task.category || "",
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
    };

    const handleEditChange = (field, value) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleEditSave = () => {
        if (!onUpdate) {
            return;
        }
        onUpdate(task._id, {
            title: editForm.title.trim(),
            description: editForm.description.trim(),
            dueDate: editForm.dueDate || "",
            priority: editForm.priority,
            category: editForm.category.trim(),
        });
        setShowEditModal(false);
    };

    return (
        <>
            <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow ${task.isCompleted ? "opacity-75" : ""}`}>
                {!readOnly && (
                    <div className="pt-1">
                        <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={handleCheckboxChange}
                            className="w-6 h-6 rounded border-gray-300 text-red-400 focus:ring-red-400 cursor-pointer"
                        />
                    </div>
                )}

                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2 gap-3">
                        <h3 className={`text-xl font-semibold text-gray-800 ${task.isCompleted ? "line-through text-gray-500" : ""}`}>
                            {task.title}
                        </h3>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${priorityColors[task.priority] || "bg-gray-100"}`}>
                                {task.priority} Difficulty
                            </span>
                            {readOnly && (
                                <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${statusPillClass}`}>
                                    {task.isCompleted ? "Done" : "To Do"}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className={`text-xl text-gray-600 mb-4 ${task.isCompleted ? "text-gray-400" : ""}`}>
                        {task.description || "No description"}
                    </p>

                    <div className="flex items-center justify-between w-full mt-4 gap-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                            <div className="flex items-center gap-1">
                                <i className="fa-regular fa-calendar"></i>
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
                            </div>
                            {task.category && (
                                <div className="flex items-center gap-1">
                                    <i className="fa-solid fa-tag"></i>
                                    {task.category}
                                </div>
                            )}
                        </div>

                        {!readOnly && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={openEditModal}
                                    className="text-xl text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50"
                                    title="Edit Task"
                                >
                                    <i className="fa-solid fa-pen"></i>
                                </button>

                                {onDelete && (
                                    <button
                                        onClick={handleDeleteClick}
                                        className="text-xl text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                        title="Delete Task"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {!readOnly && showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
                        <h2 className="text-2xl font-bold mb-5 text-gray-800">Edit Task</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-lg font-medium text-gray-700">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => handleEditChange("title", e.target.value)}
                                    className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                                />
                            </div>

                            <div>
                                <label className="text-lg font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => handleEditChange("description", e.target.value)}
                                    className="text-xl w-full h-28 border border-gray-200 rounded-lg px-4 py-3 mt-2 outline-none resize-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-lg font-medium text-gray-700">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.dueDate}
                                        onChange={(e) => handleEditChange("dueDate", e.target.value)}
                                        className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                                    />
                                </div>

                                <div>
                                    <label className="text-lg font-medium text-gray-700">
                                        Difficulty Level
                                    </label>
                                    <select
                                        value={editForm.priority}
                                        onChange={(e) => handleEditChange("priority", e.target.value)}
                                        className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 cursor-pointer"
                                    >
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-lg font-medium text-gray-700">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.category}
                                        onChange={(e) => handleEditChange("category", e.target.value)}
                                        className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeEditModal}
                                className="text-xl px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                className="text-xl px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium cursor-pointer transition-colors shadow-sm"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!readOnly && showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-150 transform transition-all scale-100">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Delete Task?</h2>
                        <p className="text-xl text-gray-600 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="text-xl px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="text-xl px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium cursor-pointer transition-colors shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TaskCard;
