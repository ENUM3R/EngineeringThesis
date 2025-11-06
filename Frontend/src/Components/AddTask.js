import React, { useState } from "react";
import PropTypes from "prop-types";

export default function AddTask({ onSubmit, onClose, defaultValues }) {
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

    const [start_time, setStartTime] = useState(defaultValues?.start_time || "");
    const [end_time, setEndTime] = useState(defaultValues?.end_time || "");
    const [isCyclic, setIsCyclic] = useState(defaultValues?.is_cyclic || false);
    const [frequency, setFrequency] = useState(defaultValues?.frequency || "weekly");
    const [occurrencesCount, setOccurrencesCount] = useState(defaultValues?.occurrences_count || 12);
    const [isSplit, setIsSplit] = useState(false);
    const [splitCount, setSplitCount] = useState(2);
    const [splits, setSplits] = useState([
        { title: "", start_date: "", end_date: "", priority: 1 },
        { title: "", start_date: "", end_date: "", priority: 1 }
    ]);
    const handleSubmit = (event) => {
        event.preventDefault();
        const taskData = {
            title,
            description,
            priority,
            status,
            start_date: start_date ? new Date(start_date).toISOString() : null,
            end_date: end_date ? new Date(end_date).toISOString() : null,
            start_time: start_time || null,
            end_time: end_time || null,
        };
        
        if (isCyclic) {
            taskData.frequency = frequency;
            taskData.occurrences_count = occurrencesCount;
        }
        
        if (isSplit) {
            taskData.subtasks = splits.map(split => ({
                title: split.title || "Untitled Subtask",
                start_date: split.start_date ? new Date(split.start_date).toISOString() : null,
                end_date: split.end_date ? new Date(split.end_date).toISOString() : null,
                priority: Number(split.priority) || 1
            }));
        }
        
        onSubmit(taskData, isCyclic, isSplit);
    };

    const handleCancel = (e) => {
        e?.stopPropagation();
        onClose();
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
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
                maxHeight: "90vh",
                overflowY: "auto",
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
                    <label>Estimated Points: {
                        (() => {
                            const hours = 1; // Default hours
                            const days = start_date && end_date 
                                ? Math.max(1, Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)))
                                : 1;
                            const calculated = Number(priority) * hours * days;
                            return calculated;
                        })()
                    }</label>
                    <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>
                        (Calculated: Priority × Hours × Days)
                    </div>
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
                        onClick={handleCancel}
                        style={{
                            backgroundColor: "red",
                            color: "black",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <hr />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                    type="button"
                    onClick={() => setIsCyclic(!isCyclic)}
                    style={{
                        backgroundColor: isCyclic ? "#00ff40ff" : "#444",
                        color: isCyclic ? "black" : "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #666",
                    }}
                >
                🔁 {isCyclic ? "Remove Cyclic" : "Make Cyclic"}
                </button>
                {isCyclic && (
                    <div style={{ marginTop: "10px" }}>
                        <label>Frequency:</label>
                        <br />
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            style={{ width: "100%", marginTop: "4px" }}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                        </select>
                        <br />
                        <label style={{ marginTop: "8px", display: "block" }}>Number of Occurrences: {occurrencesCount}</label>
                        <input
                            type="range"
                            min="2"
                            max="12"
                            value={occurrencesCount}
                            onChange={(e) => setOccurrencesCount(parseInt(e.target.value))}
                            style={{ width: "100%", marginTop: "4px" }}
                        />
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setIsSplit(!isSplit)}
                    style={{
                        backgroundColor: isSplit ? "#00ff40ff" : "#444",
                        color: isSplit ? "black" : "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #666",
                    }}
                >
                ➕ {isSplit ? "Remove Split" : "Split Task"}
                </button>
                {isSplit && (
                    <div style={{ marginTop: "10px", border: "1px solid #666", padding: "10px", borderRadius: "4px" }}>
                        <label>Number of Splits:</label>
                        <input
                            type="number"
                            min="2"
                            max="10"
                            value={splitCount}
                            onChange={(e) => {
                                const count = parseInt(e.target.value) || 2;
                                setSplitCount(count);
                                setSplits(Array(count).fill(null).map((_, i) => 
                                    splits[i] || { title: "", start_date: "", end_date: "", priority: 1 }
                                ));
                            }}
                            style={{ width: "60px", marginLeft: "10px" }}
                        />
                        {splits.map((split, index) => (
                            <div key={index} style={{ marginTop: "10px", padding: "8px", backgroundColor: "#333", borderRadius: "4px" }}>
                                <b>Subtask {index + 1}</b>
                                <input
                                    type="text"
                                    placeholder="Subtask title"
                                    value={split.title}
                                    onChange={(e) => {
                                        const newSplits = [...splits];
                                        newSplits[index].title = e.target.value;
                                        setSplits(newSplits);
                                    }}
                                    style={{ width: "100%", marginTop: "4px" }}
                                />
                                <div style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                                    <input
                                        type="datetime-local"
                                        placeholder="Start"
                                        value={split.start_date}
                                        onChange={(e) => {
                                            const newSplits = [...splits];
                                            newSplits[index].start_date = e.target.value;
                                            setSplits(newSplits);
                                        }}
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        type="datetime-local"
                                        placeholder="End"
                                        value={split.end_date}
                                        onChange={(e) => {
                                            const newSplits = [...splits];
                                            newSplits[index].end_date = e.target.value;
                                            setSplits(newSplits);
                                        }}
                                        style={{ flex: 1 }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={split.priority}
                                    onChange={(e) => {
                                        const newSplits = [...splits];
                                        newSplits[index].priority = e.target.value;
                                        setSplits(newSplits);
                                    }}
                                    style={{ width: "100%", marginTop: "4px" }}
                                />
                                <label>Priority: {split.priority}</label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

AddTask.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    defaultValues: PropTypes.object,
};
