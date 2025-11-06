import React, { useState } from "react";
import PropTypes from "prop-types";
import TaskOptions from "./TaskOptions";

export default function TaskPicker({ tasks, onSelect, onCancel }) {
    const [sortType, setSortType] = useState("priority");
    const [selectedTask, setSelectedTask] = useState(null);
    const [pos, setPos] = useState(null);

    const sorted = [...tasks].sort((a, b) =>
        sortType === "priority"
            ? b.priority - a.priority
            : new Date(a.end) - new Date(b.end)
    );

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
            <h3>Tasks on this day</h3>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={() => setSortType("priority")}>Sort by Priority</button>
                <button onClick={() => setSortType("end")}>Sort by End Date</button>
            </div>

            <ul style={{ maxHeight: "200px", overflowY: "auto", listStyle: "none", padding: 0 }}>
                {sorted.map((task) => (
                    <li
                        key={task.task_id}
                        onClick={(e) => {
                            setSelectedTask(task);
                            setPos({ x: e.clientX, y: e.clientY });
                        }}
                        style={{
                            backgroundColor: "#3a3a3a",
                            padding: "8px",
                            margin: "4px 0",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        <b>{task.title}</b>
                        <br /> Priority: {task.priority}
                        <br /> End: {task.end.toLocaleDateString()}
                        <br /> Status: {task.status}
                    </li>
                ))}
            </ul>

            <button onClick={onCancel} style={{ backgroundColor: "red", border: "none", padding: "6px" }}>
                Close
            </button>

            {selectedTask && pos && (
                <TaskOptions
                    position={pos}
                    task={selectedTask}
                    onAdd={() => onSelect({ action: "add", task: null })}
                    onEdit={() => onSelect({ action: "edit", task: selectedTask })}
                    onDelete={() => onSelect({ action: "delete", task: selectedTask })}
                    onDone={() => onSelect({ action: "done", task: selectedTask })}
                    onClose={() => {
                        setSelectedTask(null);
                        setPos(null);
                    }}
                />
            )}
        </div>
    );
}

TaskPicker.propTypes = {
    tasks: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};