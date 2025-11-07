import React from "react";
import PropTypes from "prop-types";

export default function DeleteTask({task, onDelete, onClose}){
    if (!task){
        return null;
    }
    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-5 rounded-lg z-[10000] w-[400px] max-w-[90vw]">
            <h3 className="text-xl font-bold mb-4">Delete Task</h3>
            <div className="space-y-2 mb-4">
                <p><strong>Title:</strong> {task.title}</p>
                <p><strong>Description:</strong> {task.description}</p>
                <p><strong>Priority:</strong> {task.priority}</p>
                <p><strong>Points:</strong> {task.points || 0}</p>
                <p><strong>End Time:</strong> {new Date(task.end).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {task.status}</p>
            </div>
            <div className="mt-2.5 flex justify-between">
                <button
                    onClick={() => onDelete(task.task_id)}
                    className="bg-red-600 text-white border-none px-2.5 py-1.5 rounded hover:bg-red-700 transition-colors"
                >
                    Delete
                </button>

                <button
                    onClick={onClose}
                    className="bg-gray-400 text-black border-none px-2.5 py-1.5 rounded hover:bg-gray-500 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
DeleteTask.propTypes = {
    task: PropTypes.shape({
        task_id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        priority: PropTypes.number,
        status: PropTypes.string,
        end: PropTypes.string,
        points: PropTypes.number,
    }),
    onDelete: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};