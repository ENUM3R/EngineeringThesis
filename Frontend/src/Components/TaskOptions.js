import React from "react";
import PropTypes from "prop-types";

export default function TaskOptions({position, task, onAdd, onDelete, onEdit, onDone, onClose}){
    if(!position) return null;

    const stop = (e) => e.stopPropagation();

    return (
        <div
            onClick={stop}
            className="absolute bg-gray-800 text-white rounded-lg p-2.5 shadow-lg z-[1000] w-[150px]"
            style={{ top: position.y, left: position.x }}
        >
            <div className="flex flex-col gap-1.5">
                <button className="bg-gray-700 text-white border-none rounded px-2.5 py-1 cursor-pointer text-left hover:bg-gray-600 transition-colors" onClick={() => { onAdd(); onClose(); }}>➕ Add Task</button>
                <button className="bg-gray-700 text-white border-none rounded px-2.5 py-1 cursor-pointer text-left hover:bg-gray-600 transition-colors" onClick={() => { onEdit(task); onClose(); }}>✏️ Edit</button>
                <button className="bg-gray-700 text-white border-none rounded px-2.5 py-1 cursor-pointer text-left hover:bg-gray-600 transition-colors" onClick={() => { onDelete(task); onClose(); }}>❌ Delete</button>
                <button className="bg-gray-700 text-white border-none rounded px-2.5 py-1 cursor-pointer text-left hover:bg-gray-600 transition-colors" onClick={() => { if (task && task.task_id) { onDone(task.task_id); } onClose(); }}>✅ Mark Done</button>
            </div>
        </div>
    );
}

TaskOptions.propTypes = {
    position: PropTypes.object,
    task: PropTypes.object,
    onAdd: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};