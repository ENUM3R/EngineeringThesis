import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/tasks/";

export default function useTasks() {
    const [events, setEvents] = useState([]);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(API_URL);
            const formatted = res.data.map((event) => ({
                task_id: event.task_id,
                id: event.task_id,
                title: event.title,
                start: new Date(event.start_time),
                end: new Date(event.end_time),
                end_raw: event.end_time,
                priority: Number(event.priority) || 0,
                points: Number(event.points) || 0,
                status: event.status,
            }));
            setEvents(formatted);
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    const addTask = async (taskData, selectedDate) => {
        try {
            await axios.post(API_URL, {
                ...taskData,
                start_time: selectedDate.start,
                end_time: selectedDate.end_time || selectedDate.end,
                points: 0,
            });
            await fetchEvents();
        } catch (err) {
            console.error("Error adding task:", err);
        }
    };

    const deleteTask = async (id) => {
        try {
            await axios.delete(`${API_URL}${id}/`);
            await fetchEvents();
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const editTask = async (updatedTask) => {
        try {
            await axios.put(`${API_URL}${updatedTask.task_id}/`, updatedTask);
            await fetchEvents();
        } catch (err) {
            console.error("Error editing task:", err.response?.data || err);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("access")) fetchEvents();
    }, []);

    return { events, fetchEvents, addTask, deleteTask, editTask };
}
