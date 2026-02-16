import React from 'react';

const TaskCard = ({ task, onUpdate, onDelete }) => {
    const priorityColors = {
        High: "bg-red-100 text-red-700",
        Medium: "bg-yellow-100 text-yellow-700",
        Low: "bg-green-100 text-green-700",
    };

    const handleCheckboxChange = () => {
        onUpdate(task._id, { isCompleted: !task.isCompleted });
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

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

    return (
        <>
            <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow ${task.isCompleted ? 'opacity-75' : ''}`}>
                <div className="pt-1">
                    <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={handleCheckboxChange}
                        className="w-6 h-6 rounded border-gray-300 text-red-400 focus:ring-red-400 cursor-pointer"
                    />
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-xl font-semibold text-gray-800 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                            {task.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority] || "bg-gray-100"}`}>
                            {task.priority}
                        </span>
                    </div>

                    <p className={`text-xl text-gray-600 mb-4 ${task.isCompleted ? 'text-gray-400' : ''}`}>
                        {task.description}
                    </p>

                    <div className="flex items-center justify-between w-full mt-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <i className="fa-regular fa-calendar"></i>
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                            </div>
                            {task.category && (
                                <div className="flex items-center gap-1">
                                    <i className="fa-solid fa-tag"></i>
                                    {task.category}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleDeleteClick}
                            className="text-xl text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                            title="Delete Task"
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>

            {showDeleteConfirm && (
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
