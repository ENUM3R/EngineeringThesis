import React, { useState } from "react";
import PropTypes from "prop-types";

export default function TaskPicker({ tasks, onSelect, onCancel }) {
    const [sortType, setSortType] = useState("priority");

    const toTime = (x) => {
        if (!x) return 0;
        if (x instanceof Date) return x.getTime();
        const d = new Date(x);
        return isNaN(d.getTime()) ? 0 : d.getTime();
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        // descending: highest priority first
        if (sortType === "priority") {
            return (Number(b.priority) || 0) - (Number(a.priority) || 0);
        }
        // ascending: earliest end first
        if (sortType === "endtime") {
            return toTime(a.end) - toTime(b.end);
        }
        return 0;
    });

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
                width: "350px",
            }}
        >
            <h3>Select Task</h3>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <button
                    onClick={() => setSortType("priority")}
                    style={{
                        backgroundColor: sortType === "priority" ? "#007bff" : "#444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "5px 10px",
                    }}
                >
          Sort by Priority
                </button>
                <button
                    onClick={() => setSortType("endtime")}
                    style={{
                        backgroundColor: sortType === "endtime" ? "#007bff" : "#444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "5px 10px",
                    }}
                >
          Sort by End Time
                </button>
            </div>

            <ul style={{ maxHeight: "200px", overflowY: "auto", padding: 0, listStyle: "none" }}>
                {sortedTasks.map((task) => (
                    <li
                        key={task.id}
                        onClick={() => onSelect(task)}
                        style={{
                            backgroundColor: "#3a3a3a",
                            padding: "8px",
                            margin: "4px 0",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        <strong>{task.title}</strong> <br />
            Priority: {task.priority || 0} | End: {new Date(task.end).toLocaleDateString()} <br />
            Status: {task.status}
                    </li>
                ))}
            </ul>

            <button
                onClick={onCancel}
                style={{
                    marginTop: "10px",
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                }}
            >
        Cancel
            </button>
        </div>
    );
}

TaskPicker.propTypes = {
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
            priority: PropTypes.number,
            end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
            status: PropTypes.string,
        })
    ).isRequired,
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};
