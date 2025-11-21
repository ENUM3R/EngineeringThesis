import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { api } from "../config/api";

const TASKS_URL = api("/tasks/");

export default function ReminderNotification() {
    const [reminders, setReminders] = useState([]);
    const [showNotification, setShowNotification] = useState(false);

    const authHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
    });

    useEffect(() => {
        if (!localStorage.getItem("access")) {
            return;
        }

        const checkReminders = async () => {
            try {
                const res = await axios.get(TASKS_URL, authHeader());
                const now = new Date();
                const activeReminders = res.data.filter((task) => {
                    if (!task.reminder_date) return false;
                    const reminderDate = new Date(task.reminder_date);
                    // Check if reminder date is today or in the past
                    const reminderDateOnly = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());
                    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    
                    // Show reminder if it's today or past, and task is not done/abandoned
                    return reminderDateOnly <= todayOnly && 
                           task.status !== "done" && 
                           task.status !== "abandoned" &&
                           (!task.end_date || new Date(task.end_date) >= now);
                });

                if (activeReminders.length > 0) {
                    setReminders(activeReminders);
                    setShowNotification(true);
                }
            } catch (err) {
                console.error("Error checking reminders:", err);
            }
        };

        // Check reminders immediately
        checkReminders();

        // Check reminders every minute
        const interval = setInterval(checkReminders, 60000);

        return () => clearInterval(interval);
    }, []);

    const handleDismiss = (taskId) => {
        setReminders(reminders.filter((r) => r.id !== taskId));
        if (reminders.length === 1) {
            setShowNotification(false);
        }
    };

    const handleDismissAll = () => {
        setReminders([]);
        setShowNotification(false);
    };

    if (!showNotification || reminders.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-[10001] max-w-md">
            {reminders.map((task) => (
                <div
                    key={task.id}
                    className="bg-yellow-600 text-white p-4 rounded-lg shadow-lg mb-2 border-2 border-yellow-400"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="font-bold text-lg mb-1">🔔 Reminder</div>
                            <div className="text-sm mb-2">
                                <strong>{task.title}</strong>
                            </div>
                            <div className="text-xs mb-1">
                                Finish this task before: {task.end_date ? new Date(task.end_date).toLocaleDateString() : "N/A"}
                            </div>
                            {task.location && (
                                <div className="text-xs text-yellow-200">
                                    📍 Location: {task.location}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => handleDismiss(task.id)}
                            className="ml-2 text-white hover:text-yellow-200 font-bold"
                        >
                            ✕
                        </button>
                    </div>
                    {reminders.length > 1 && (
                        <button
                            onClick={handleDismissAll}
                            className="mt-2 text-xs text-yellow-200 hover:text-white underline"
                        >
                            Dismiss All
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

ReminderNotification.propTypes = {};

