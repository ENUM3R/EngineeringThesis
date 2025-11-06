import React, { useState } from "react";
import PropTypes from "prop-types";
import useTasks from "../Hooks/useTasks";
import { useAuth } from "../Hooks/useAuth";
import AddTask from "./AddTask";
import EditTask from "./EditTask";
import DeleteTask from "./DeleteTask";

export default function TaskList({ mode, onClose }) {
    const { events, doneEvents, addTask, deleteTask, editTask, markDone, createCyclicTask, createSplitTask, fetchEvents } = useTasks();
    const { getProfile } = useAuth();
    const [sortBy, setSortBy] = useState("end");
    const [selectedTask, setSelectedTask] = useState(null);
    const [showAddTask, setShowAddTask] = useState(false);
    const [showEditTask, setShowEditTask] = useState(false);
    const [showDeleteTask, setShowDeleteTask] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // Filter out cyclic occurrences and subtasks - only show main tasks in list
    const mainTasksOnly = (mode === "done" ? doneEvents : events).filter(
        task => !task.is_cyclic_occurrence && !task.is_subtask
    );
    const filtered = mainTasksOnly;

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "end") return a.end - b.end;
        return b.priority - a.priority;
    });

    const handleTaskClick = (task) => {
        setTaskToEdit(task);
        setShowEditTask(true);
    };

    const handleDelete = async (taskId) => {
        await deleteTask(taskId);
        setShowDeleteTask(false);
        setTaskToDelete(null);
        await fetchEvents();
    };

    const handleEdit = async (data, isCyclic, isSplit, shouldMarkDone) => {
        if (isCyclic) {
            // Convert edit to cyclic task creation
            await createCyclicTask(data);
        } else if (isSplit) {
            // Convert edit to split task creation
            await createSplitTask(data);
        } else {
            await editTask(data);
        }
        
        // If status is "done" or "abandoned", mark task as done to add points
        // Abandoned tasks will give 0 points, done tasks will give full/half points
        if (shouldMarkDone && (data.status === "done" || data.status === "abandoned")) {
            try {
                await markDone(data.task_id);
                await getProfile();
            } catch (err) {
                console.error("Error marking task as done:", err);
            }
        }
        
        setShowEditTask(false);
        setTaskToEdit(null);
        await fetchEvents();
    };

    const handleAdd = async (data, isCyclic, isSplit) => {
        if (isCyclic) {
            await createCyclicTask(data);
        } else if (isSplit) {
            await createSplitTask(data);
        } else {
            await addTask(data);
        }
        setShowAddTask(false);
        await fetchEvents();
    };

    const handleMarkDone = async (taskId) => {
        try {
            if (taskId) {
                const response = await markDone(taskId);
                await getProfile(); // Refresh points display
                await fetchEvents();
                // Show success message with points awarded
                if (response && response.points_awarded !== undefined) {
                    alert(`Task marked as done! Points awarded: ${response.points_awarded}`);
                }
            }
        } catch (err) {
            console.error("Error marking task as done:", err);
            alert("Error marking task as done. Please try again.");
        }
    };

    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                zIndex: 10000,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: "#2b2b2b",
                    color: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    width: "80%",
                    maxWidth: "800px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    position: "relative",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2>{mode === "done" ? "Completed Tasks" : "Active Tasks"}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: "red",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        ✕ Close
                    </button>
                </div>

                <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <button
                        onClick={() => setSortBy("end")}
                        style={{
                            backgroundColor: sortBy === "end" ? "#007bff" : "#444",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Sort by End Date
                    </button>
                    <button
                        onClick={() => setSortBy("priority")}
                        style={{
                            backgroundColor: sortBy === "priority" ? "#007bff" : "#444",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Sort by Priority
                    </button>
                    {mode !== "done" && (
                        <button
                            onClick={() => setShowAddTask(true)}
                            style={{
                                backgroundColor: "#00ff40ff",
                                color: "black",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "bold",
                            }}
                        >
                            ➕ Add New Task
                        </button>
                    )}
                </div>

                <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    {sorted.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                            No {mode === "done" ? "completed" : "active"} tasks
                        </div>
                    ) : (
                        sorted.map((task) => (
                            <div
                                key={task.task_id}
                                style={{
                                    border: "1px solid #444",
                                    padding: "12px",
                                    borderRadius: "6px",
                                    margin: "8px 0",
                                    backgroundColor: "#333",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    opacity: task.status === "done" ? 0.5 : 1,
                                    filter: task.status === "done" ? "blur(1px)" : "none",
                                }}
                                onClick={() => handleTaskClick(task)}
                            >
                                <div style={{ flex: 1 }}>
                                    <b style={{ fontSize: "16px" }}>{task.title}</b>
                                    <div style={{ marginTop: "4px", fontSize: "12px", color: "#aaa" }}>
                                        Priority: {task.priority} | Points: {task.points || 0} | End: {task.end.toLocaleDateString()} | Status: {task.status}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    {mode !== "done" && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkDone(task.task_id);
                                                }}
                                                style={{
                                                    backgroundColor: "#00ff22",
                                                    color: "black",
                                                    border: "none",
                                                    padding: "6px 12px",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                ✓ Done
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTaskToDelete(task);
                                                    setShowDeleteTask(true);
                                                }}
                                                style={{
                                                    backgroundColor: "#ff4444",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "6px 12px",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                ✕ Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {showAddTask && (
                    <AddTask
                        onSubmit={handleAdd}
                        onClose={() => setShowAddTask(false)}
                        defaultValues={{}}
                    />
                )}

                {showEditTask && taskToEdit && (
                    <EditTask
                        task={taskToEdit}
                        onSubmit={handleEdit}
                        onClose={() => {
                            setShowEditTask(false);
                            setTaskToEdit(null);
                        }}
                    />
                )}

                {showDeleteTask && taskToDelete && (
                    <DeleteTask
                        task={taskToDelete}
                        onDelete={handleDelete}
                        onClose={() => {
                            setShowDeleteTask(false);
                            setTaskToDelete(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

TaskList.propTypes = {
    mode: PropTypes.oneOf(["active", "done", "all"]).isRequired,
    onClose: PropTypes.func.isRequired,
};
