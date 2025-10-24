import { useState, useEffect } from "react";
import axios from "axios";

export default function useTasks(){
    const [events, setEvents] = useState([]);

    const fetchEvents = async () => {
        try{
            const res = await axios.get("http://127.0.0.1:8000/api/tasks/");
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
        } catch(err){
            console.error("Error while fetching events: ", err);
        }
    };

    const addTask = async (taskData, selectedDate) => {
        try {
            await axios.post("http://127.0.0.1:8000/api/tasks/",{
                ...taskData,
                start_time: selectedDate.start,
                end_time: selectedDate.end_time || selectedDate.end,
                points: 0,
            });
            await fetchEvents();
        } catch (err){
            console.error("Error while adding task: ", err);
        }
    };

    const deleteTask = async (id) => {
        try{
            await axios.delete(`http://127.0.0.1:8000/api/tasks/${id}/`);
            await fetchEvents();
        } catch (err) {
            console.error("Error while deleting task: ", err);
        }
    };

    const editTask = async (updatedTask) => {
        try {
            const payload = {
                title: updatedTask.title,
                description: updatedTask.description,
                priority: updatedTask.priority,
                points: updatedTask.points,
                status: updatedTask.status,
                start_time: updatedTask.start_time,
                end_time: updatedTask.end_time,
            };
            await axios.put(`http://127.0.0.1:8000/api/tasks/${updatedTask.task_id}/`, payload);

            await fetchEvents();
        } catch (err) {
            console.error("Error while editing task: ", err.response?.data || err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return {events, fetchEvents, addTask, deleteTask, editTask};
}