import React, { useState } from "react";
import PropTypes from "prop-types";

export default function AddTask({ onSubmit, onCancel, defaultValues }) {
    const [title, setTitle] = useState(defaultValues?.title || "");
    const [description, setDescription] = useState(defaultValues?.description || "");
    const [priority, setPriority] = useState(defaultValues?.priority || 1);
    const [status, setStatus] = useState(defaultValues?.status || "pending");
    const [start_date, setStartDate] = useState(
        defaultValues?.start_date
            ? new Date(defaultValues.start_date).toISOString().slice(0, 16)
            : ""
    );
    const [end_date, setEndDate] = useState(
        defaultValues?.end_date
            ? new Date(defaultValues.end_date).toISOString().slice(0, 16)
            : ""
    );

    // Optional work session hours
    const [start_time, setStartTime] = useState(defaultValues?.start_time || "");
    const [end_time, setEndTime] = useState(defaultValues?.end_time || "");

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit({
            title,
            description,
            priority,
            status,
            start_date,
            end_date,
            start_time: start_time || null,
            end_time: end_time || null
        });
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
                width: "330px",
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
                        style={{ width: "100%" }}
                    />
                </div>

                <div>
                    <label>Start Date:</label>
                    <br />
                    <input
                        type="datetime-local"
                        value={start_date}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ width: "100%" }}
                    />
                </div>

                <div>
                    <label>End Date:</label>
                    <br />
                    <input
                        type="datetime-local"
                        value={end_date}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ width: "100%" }}
                        required
                    />
                </div>

                <hr />
                <label>Work Session (Optional):</label>
                <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="time"
                        value={start_time}
                        onChange={(e) => setStartTime(e.target.value)}
                        style={{ flex: 1 }}
                        placeholder="Start"
                    />
                    <input
                        type="time"
                        value={end_time}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={{ flex: 1 }}
                        placeholder="End"
                    />
                </div>

                <div>
                    <label>Status:</label>
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
                        <option value="overdue">Overdue</option>
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

            <hr />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                    style={{
                        backgroundColor: "#444",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #666",
                    }}
                >
                    🔁 Make Cyclic
                </button>
                <button
                    style={{
                        backgroundColor: "#444",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #666",
                    }}
                >
                    ➕ Split Task
                </button>
            </div>
        </div>
    );
}

AddTask.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    defaultValues: PropTypes.object,
};
