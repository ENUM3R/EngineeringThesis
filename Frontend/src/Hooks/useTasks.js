import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/tasks/";

export default function useTasks() {
    const [events, setEvents] = useState([]);

    const authHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
    });

    const formatTasks = (data) =>
        data.map((event) => ({
            task_id: event.id,
            id: event.id,
            title: event.title,
            start: event.start_date ? new Date(event.start_date) : new Date(event.end_date),
            end: event.end_date ? new Date(event.end_date) : new Date(event.start_date),
            priority: Number(event.priority) || 0,
            points: Number(event.points) || 0,
            status: event.status,
        }));

    const fetchEvents = async () => {
        try {
            const res = await axios.get(API_URL, authHeader());
            setEvents(formatTasks(res.data));
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };
    
    const addTask = async (taskData, selectedDate) => {
        try {
            const res = await axios.post(API_URL, taskData, authHeader());

            setEvents((prev) => [
                ...prev,
                {
                    id: res.data.id,
                    task_id: res.data.id,
                    title: res.data.title,
                    start: new Date(res.data.start_date || selectedDate.start),
                    end: new Date(res.data.end_date || selectedDate.end),
                    priority: Number(res.data.priority) || 0,
                    points: Number(res.data.points) || 0,
                    status: res.data.status,
                },
            ]);
        } catch (err) {
            console.error("Error adding task:", err.response?.data || err);
        }
    };

    const deleteTask = async (id) => {
        try {
            await axios.delete(`${API_URL}${id}/`, authHeader());
            setEvents((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const editTask = async (updatedTask) => {
        try {
            const res = await axios.put(`${API_URL}${updatedTask.task_id}/`, updatedTask, authHeader());

            setEvents((prev) =>
                prev.map((task) =>
                    task.id === updatedTask.id
                        ? {
                            ...task,
                            title: res.data.title,
                            start: new Date(res.data.start_date),
                            end: new Date(res.data.end_date),
                            status: res.data.status,
                            priority: Number(res.data.priority) || 0,
                            points: Number(res.data.points) || 0,
                        }
                        : task
                )
            );
        } catch (err) {
            console.error("Error editing task:", err.response?.data || err);
        }
    };

    const markDone = async (taskId) => {
        try {
            await axios.post(`${API_URL}${taskId}/mark_done/`, {}, authHeader());
            await fetchEvents();
        } catch (err) {
            console.error("Error marking done:", err.response?.data || err);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("access")) fetchEvents();
    }, []);

    return { events, fetchEvents, addTask, deleteTask, editTask, markDone };
}
