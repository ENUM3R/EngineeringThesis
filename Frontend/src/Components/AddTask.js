import React, { useState } from "react";
import PropTypes from "prop-types";

export default function AddTask({ onSubmit, onCancel, defaultValues }) {
    const [title, setTitle] = useState(defaultValues?.title || "");
    const [description, setDescription] = useState(defaultValues?.description || "");
    const [priority, setPriority] = useState(defaultValues?.priority || 1);
    const [status, setStatus] = useState(defaultValues?.status || "pending");
    const [end_time, setEndTime] = useState(
        defaultValues?.end_time 
            ? new Date(defaultValues.end_time).toISOString().slice(0, 10)
            : ""
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit({ title, description, priority, status, end_time });
    };

    return (
        <div
            style={{
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
            }}
        >
            <h3>Create Task</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <br />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ width: "100%" }}
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <br />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: "100%" }}
                    />
                </div>
                <div>
                    <label>Priority: {priority}</label>
                    <br />
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    />
                </div>
                <div>
                    <label>End Time:</label>
                    <br />
                    <input
                        type="date"
                        value={end_time} // fixed
                        onChange={(e) => setEndTime(e.target.value)}
                        style={{ width: "100%" }}
                    />
                </div>
                <div>
                    <label>Status: {status}</label>
                    <br />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{ width: "100%" }}
                    >
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="done">Done</option>
                        <option value="abandoned">Abandoned</option>
                    </select>
                </div>
                <div
                    style={{
                        marginTop: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <button
                        type="submit"
                        style={{
                            backgroundColor: "#00ff40ff",
                            color: "black",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                        }}
                    >
            Add
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            backgroundColor: "red",
                            color: "black",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                        }}
                    >
            Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

AddTask.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    defaultValues: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        priority: PropTypes.number,
        status: PropTypes.string,
        end_time: PropTypes.string,
    }),
};
