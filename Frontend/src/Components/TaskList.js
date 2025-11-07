import React, { useState } from "react";
import PropTypes from "prop-types";
import useTasks from "../Hooks/useTasks";
import { useAuth } from "../Hooks/useAuth";
import AddTask from "./AddTask";
import EditTask from "./EditTask";
import DeleteTask from "./DeleteTask";

export default function TaskList({ mode: initialMode = "active", onClose }) {
    const { events, doneEvents, addTask, deleteTask, editTask, markDone, createCyclicTask, createSplitTask, fetchEvents } = useTasks();
    const { getProfile } = useAuth();
    const [currentMode, setCurrentMode] = useState(initialMode);
    const [sortBy, setSortBy] = useState("end");
    const [selectedTask, setSelectedTask] = useState(null);
    const [showAddTask, setShowAddTask] = useState(false);
    const [showEditTask, setShowEditTask] = useState(false);
    const [showDeleteTask, setShowDeleteTask] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // Filter out cyclic occurrences and subtasks - only show main tasks in list
    const mainTasksOnly = (currentMode === "done" ? doneEvents : events).filter(
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
        try {
            await deleteTask(taskId);
            setShowDeleteTask(false);
            setTaskToDelete(null);
            // Force refresh both active and done events
            await fetchEvents();
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Failed to delete task. Please try again.");
        }
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
            className="fixed inset-0 bg-black/70 z-[10000] flex justify-center items-center"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 text-white p-5 rounded-lg w-4/5 max-w-[800px] max-h-[90vh] overflow-y-auto relative"
            >
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-bold">Task List</h2>
                    <div className="flex gap-2 items-center">
                        <div className="flex gap-2 bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setCurrentMode("active")}
                                className={`px-4 py-2 rounded transition-colors ${
                                    currentMode === "active"
                                        ? "bg-blue-600 text-white"
                                        : "bg-transparent text-gray-300 hover:text-white"
                                }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setCurrentMode("done")}
                                className={`px-4 py-2 rounded transition-colors ${
                                    currentMode === "done"
                                        ? "bg-blue-600 text-white"
                                        : "bg-transparent text-gray-300 hover:text-white"
                                }`}
                            >
                                Done
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-red-600 text-white border-none px-4 py-2 rounded cursor-pointer hover:bg-red-700 transition-colors"
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>

                <div className="flex gap-2.5 mb-5 flex-wrap">
                    <button
                        onClick={() => setSortBy("end")}
                        className={`${sortBy === "end" ? "bg-blue-600" : "bg-gray-700"} text-white border-none px-4 py-2 rounded cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                        Sort by End Date
                    </button>
                    <button
                        onClick={() => setSortBy("priority")}
                        className={`${sortBy === "priority" ? "bg-blue-600" : "bg-gray-700"} text-white border-none px-4 py-2 rounded cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                        Sort by Priority
                    </button>
                    {currentMode !== "done" && (
                        <button
                            onClick={() => setShowAddTask(true)}
                            className="bg-green-500 text-black border-none px-4 py-2 rounded cursor-pointer font-bold hover:bg-green-600 transition-colors"
                        >
                            ➕ Add New Task
                        </button>
                    )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {sorted.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            No {currentMode === "done" ? "completed" : "active"} tasks
                        </div>
                    ) : (
                        sorted.map((task) => {
                            return (
                                <div
                                    key={task.task_id}
                                    className="border border-gray-600 p-3 rounded-md my-2 bg-gray-700 cursor-pointer flex justify-between items-center hover:bg-gray-600 transition-colors"
                                    onClick={() => handleTaskClick(task)}
                                >
                                    <div className="flex-1">
                                        <b className="text-base text-white">
                                            {task.title}
                                        </b>
                                        <div className="mt-1 text-xs text-gray-300">
                                            Priority: {task.priority} | Points: {task.points || 0} | End: {task.end.toLocaleDateString()} | Status: {task.status}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {currentMode !== "done" && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkDone(task.task_id);
                                                }}
                                                className="bg-green-500 text-black border-none px-3 py-1.5 rounded cursor-pointer text-xs hover:bg-green-600 transition-colors"
                                            >
                                                ✓ Done
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTaskToDelete(task);
                                                setShowDeleteTask(true);
                                            }}
                                            className="bg-red-600 text-white border-none px-3 py-1.5 rounded cursor-pointer text-xs hover:bg-red-700 transition-colors"
                                        >
                                            ✕ Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
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
