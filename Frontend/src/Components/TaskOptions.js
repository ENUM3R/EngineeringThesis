import React from "react";
import PropTypes from "prop-types";

export default function TaskOptions({position, task, onAdd, onDelete, onEdit, onDone, onClose}){
    if(!position) return null;

    const stop = (e) => e.stopPropagation();

    return (
        <div
            onClick={stop}
            style={{
                position: "absolute",
                top: position.y,
                left: position.x,
                backgroundColor: "#2b2b2b",
                color: "white",
                borderRadius: "8px",
                padding: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                zIndex: 1000,
                width: "150px",
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <button style={buttonStyle} onClick={() => { onAdd(); onClose(); }}>➕ Add Task</button>
                <button style={buttonStyle} onClick={() => { onEdit(task); onClose(); }}>✏️ Edit</button>
                <button style={buttonStyle} onClick={() => { onDelete(task); onClose(); }}>❌ Delete</button>
                <button style={buttonStyle} onClick={() => { if (task && task.task_id) { onDone(task.task_id); } onClose(); }}>✅ Mark Done</button>
            </div>
        </div>
    );
}

const buttonStyle = {
    backgroundColor: "#444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "5px",
    cursor: "pointer",
    textAlign: "left",
};

TaskOptions.propTypes = {
    position: PropTypes.object,
    task: PropTypes.object,
    onAdd: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};