import React from "react";
import StyledDatePicker from "./StyledDatePicker";

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
    const [difficultyMenuOpen, setDifficultyMenuOpen] = React.useState(false);
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
        setDifficultyMenuOpen(false);
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
        setDifficultyMenuOpen(false);
    };

    return (
        <>
            <div className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3 hover:shadow-md transition-shadow sm:gap-4 sm:p-6 ${task.isCompleted ? "opacity-75" : ""}`}>
                {!readOnly && (
                    <div className="pt-1">
                        <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={handleCheckboxChange}
                            className="h-5 w-5 cursor-pointer rounded border-gray-300 text-teal-500 focus:ring-teal-400 sm:h-6 sm:w-6"
                        />
                    </div>
                )}

                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2 gap-3">
                        <h3 className={`text-base font-semibold text-gray-800 sm:text-xl ${task.isCompleted ? "line-through text-gray-500" : ""}`}>
                            {task.title}
                        </h3>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap sm:px-3 sm:text-sm ${priorityColors[task.priority] || "bg-gray-100"}`}>
                                {task.priority} Difficulty
                            </span>
                            {readOnly && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap sm:px-3 sm:text-sm ${statusPillClass}`}>
                                    {task.isCompleted ? "Done" : "To Do"}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className={`mb-4 text-sm text-gray-600 sm:text-xl ${task.isCompleted ? "text-gray-400" : ""}`}>
                        {task.description || "No description"}
                    </p>

                    <div className="flex items-center justify-between w-full mt-4 gap-4">
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap sm:gap-4 sm:text-sm">
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
                                    className="p-2 text-base text-gray-400 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50 sm:text-xl"
                                    title="Edit Task"
                                >
                                    <i className="fa-solid fa-pen"></i>
                                </button>

                                {onDelete && (
                                    <button
                                        onClick={handleDeleteClick}
                                        className="p-2 text-base text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 sm:text-xl"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6">
                    <div className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
                        <h2 className="mb-5 text-xl font-bold text-gray-800 sm:text-2xl">Edit Task</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 sm:text-lg">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => handleEditChange("title", e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-xl"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 sm:text-lg">
                                    Description
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => handleEditChange("description", e.target.value)}
                                    className="mt-2 h-28 w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-xl"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 sm:text-lg">
                                        Due Date
                                    </label>
                                    <StyledDatePicker
                                        value={editForm.dueDate}
                                        onChange={(value) => handleEditChange("dueDate", value)}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700 sm:text-lg">
                                        Difficulty Level
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setDifficultyMenuOpen((current) => !current)}
                                        className="mt-2 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-xl"
                                    >
                                        <span>{editForm.priority}</span>
                                        <i className={`fa-solid fa-chevron-down ml-2 text-[10px] transition-transform ${difficultyMenuOpen ? "rotate-180" : ""}`} aria-hidden="true"></i>
                                    </button>

                                    {difficultyMenuOpen && (
                                        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                                            {["High", "Medium", "Low"].map((level) => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    onClick={() => {
                                                        handleEditChange("priority", level);
                                                        setDifficultyMenuOpen(false);
                                                    }}
                                                    className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition-colors sm:text-base ${
                                                        editForm.priority === level
                                                            ? "bg-red-400 text-white"
                                                            : "text-gray-600 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 sm:text-lg">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.category}
                                        onChange={(e) => handleEditChange("category", e.target.value)}
                                        className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 sm:text-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeEditModal}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 cursor-pointer sm:text-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600 cursor-pointer sm:text-xl"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!readOnly && showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 transition-opacity sm:px-6">
                    <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl transform transition-all scale-100 sm:p-6">
                        <h2 className="mb-4 text-lg font-bold text-gray-800 sm:text-xl">Delete Task?</h2>
                        <p className="mb-6 text-sm text-gray-600 sm:text-xl">Are you sure you want to delete this task? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 cursor-pointer sm:text-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600 cursor-pointer sm:text-xl"
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
