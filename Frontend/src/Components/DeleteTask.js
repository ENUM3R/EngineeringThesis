import React from "react";
import PropTypes from "prop-types";

export default function DeleteTask({task, onDelete, onCancel}){
    if (!task){
        return null;
    }
    return (
        <div style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#2b2b2b",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            zIndex: 1000,
            width: "300px",    
        }}>
            <h3>Delete Task</h3>
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>End Time:</strong> {new Date(task.end).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <div style={{
                marginTop:'10px',
                display:"flex",
                justifyContent:'space-between'
            }}>
                <button
                    onClick={() => onDelete(task)}
                    style={{
                        backgroundColor: 'red',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px'
                    }}>
                    Delete
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        backgroundColor: '#ccc', 
                        color: '#000', 
                        border: 'none', 
                        padding: '5px 10px',
                        borderRadius: '4px'
                    }}>
                Cancel
                </button>
            </div>
        </div>
    );
}
DeleteTask.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        priority: PropTypes.number,
        status: PropTypes.string,
        end: PropTypes.string,
    }),
    onDelete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};