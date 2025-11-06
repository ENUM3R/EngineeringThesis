import React from "react";
import PropTypes from "prop-types";

export default function DeleteTask({task, onDelete, onClose}){
    if (!task){
        return null;
    }
    return (
        <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#2b2b2b",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            zIndex: 10000,
            width: "400px",
            maxWidth: "90vw",
        }}>
            <h3>Delete Task</h3>
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Points:</strong> {task.points || 0}</p>
            <p><strong>End Time:</strong> {new Date(task.end).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <div style={{ marginTop:'10px', display:"flex", justifyContent:'space-between' }}>
                <button
                    onClick={() => onDelete(task.task_id)}
                    style={{ backgroundColor:'red', color:'#fff', border:'none', padding:'5px 10px', borderRadius:'4px' }}
                >
                    Delete
                </button>

                <button
                    onClick={onClose}
                    style={{
                        backgroundColor:'#ccc',
                        color:'#000',
                        border:'none',
                        padding:'5px 10px',
                        borderRadius:'4px'
                    }}
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