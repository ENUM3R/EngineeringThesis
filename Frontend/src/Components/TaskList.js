import React, { useState } from "react";
import PropTypes from "prop-types";
import useTasks from "../Hooks/useTasks";
import TaskOptions from "./TaskOptions";

export default function TaskList({ mode, onClose }) {
    const { tasks } = useTasks();
    const [sortBy, setSortBy] = useState("end");
    const [selectedTask, setSelectedTask] = useState(null);

    const filtered = tasks.filter(t =>
        mode === "active" ? t.status !== "done" : t.status === "done"
    );

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "end") return new Date(a.end_date) - new Date(b.end_date);
        return b.priority - a.priority;
    });

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>{mode === "active" ? "Active Tasks" : "Completed Tasks"}</h2>

                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <button onClick={() => setSortBy("end")}>Sort by End Date</button>
                    <button onClick={() => setSortBy("priority")}>Sort by Priority</button>
                </div>

                {sorted.map(task => (
                    <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        style={{
                            border: "1px solid #444",
                            padding: "6px",
                            borderRadius: "6px",
                            margin: "4px 0",
                            cursor: "pointer",
                        }}
                    >
                        <b>{task.title}</b> | Pri:{task.priority} | End:{task.end_date.slice(0,10)}
                    </div>
                ))}

                <button onClick={onClose}>Close</button>

                {selectedTask && (
                    <TaskOptions
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                    />
                )}
            </div>
        </div>
    );
}

TaskList.propTypes = {
    mode: PropTypes.oneOf(["active", "done"]).isRequired,
    onClose: PropTypes.func.isRequired,
};
