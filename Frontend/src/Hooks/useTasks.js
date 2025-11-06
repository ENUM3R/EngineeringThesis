import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/tasks/";

export default function useTasks() {
    const [events, setEvents] = useState([]);
    const [doneEvents, setDoneEvents] = useState([]);

    const authHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
    });

    const formatTasks = (data) => {
        const events = [];
        
        data.forEach((event) => {
            // Add main task
            const endDate = new Date(event.end_date);
            endDate.setHours(0, 0, 0, 0);
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            
            // Check if task is overdue
            const now = new Date();
            const isOverdue = event.end_date && new Date(event.end_date) < now && event.status !== "done" && event.status !== "abandoned";
            let finalStatus = isOverdue ? "overdue" : event.status;
            
            // Abandoned tasks are treated as done for display purposes
            if (event.status === "abandoned") {
                finalStatus = "abandoned"; // Keep status as abandoned
            }
            
            // Add * symbol if task has subtasks
            const titleWithSubtask = (event.subtasks && event.subtasks.length > 0) 
                ? `* ${event.title}` 
                : event.title;
            
            // Calculate points for display
            const calculatedPoints = event.points || (Number(event.priority) || 0) * 1 * 1; // priority * hours * days (default)
            
            const mainEvent = {
                task_id: event.id,
                id: event.id,
                title: titleWithSubtask,
                start: endDate,
                end: endOfDay,
                priority: Number(event.priority) || 0,
                points: calculatedPoints,
                status: finalStatus,
                is_cyclic: event.is_cyclic || false,
                frequency: event.cycle?.frequency || null,
                subtasks: event.subtasks || [],
                occurrences_count: event.cycle?.occurrences_count || 12, // Default 12
            };
            
            // Only add main task once (not duplicated)
            events.push(mainEvent);
            
            // If cyclic, generate occurrences
            if (event.is_cyclic && event.cycle) {
                const frequency = event.cycle.frequency;
                const occurrencesCount = event.cycle.occurrences_count || 12;
                const baseDate = new Date(event.end_date);
                const occurrences = generateCyclicOccurrences(baseDate, frequency, occurrencesCount);
                
                occurrences.forEach((occurrenceDate, index) => {
                    const occEndDate = new Date(occurrenceDate);
                    occEndDate.setHours(0, 0, 0, 0);
                    const occEndOfDay = new Date(occEndDate);
                    occEndOfDay.setHours(23, 59, 59, 999);
                    
                    events.push({
                        task_id: event.id, // Use parent task ID for marking done
                        id: `${event.id}_cyclic_${index}`,
                        title: `${event.title} (${frequency})`,
                        start: occEndDate,
                        end: occEndOfDay,
                        priority: Number(event.priority) || 0,
                        points: Number(event.points) || 0,
                        status: event.status,
                        is_cyclic_occurrence: true,
                        parent_task_id: event.id,
                    });
                });
            }
            
            // Add subtasks
            if (event.subtasks && event.subtasks.length > 0) {
                event.subtasks.forEach((subtask, index) => {
                    const subtaskEndDate = new Date(subtask.end_date);
                    subtaskEndDate.setHours(0, 0, 0, 0);
                    const subtaskEndOfDay = new Date(subtaskEndDate);
                    subtaskEndOfDay.setHours(23, 59, 59, 999);
                    
                    events.push({
                        task_id: event.id, // Use parent task ID, not subtask ID
                        id: `subtask_${subtask.id}`,
                        title: `→ ${subtask.title}`,
                        start: subtaskEndDate,
                        end: subtaskEndOfDay,
                        priority: Number(subtask.priority) || 0,
                        points: 0,
                        status: subtask.status,
                        is_subtask: true,
                        parent_task_id: event.id,
                    });
                });
            }
        });
        
        return events;
    };
    
    const generateCyclicOccurrences = (baseDate, frequency, count) => {
        const occurrences = [];
        const date = new Date(baseDate);
        
        for (let i = 1; i <= count; i++) {
            const newDate = new Date(date);
            
            switch (frequency) {
            case 'daily':
                newDate.setDate(newDate.getDate() + i);
                break;
            case 'weekly':
                newDate.setDate(newDate.getDate() + (i * 7));
                break;
            case 'monthly':
                newDate.setMonth(newDate.getMonth() + i);
                break;
            case 'quarterly':
                newDate.setMonth(newDate.getMonth() + (i * 3));
                break;
            default:
                newDate.setDate(newDate.getDate() + (i * 7)); // Default to weekly
            }
            
            occurrences.push(newDate);
        }
        
        return occurrences;
    };

    const fetchEvents = async () => {
        try {
            // Fetch active tasks
            const res = await axios.get(API_URL, authHeader());
            const all = formatTasks(res.data);
            // Filter out done and abandoned tasks from active (also filter out cyclic occurrences and subtasks)
            setEvents(all.filter(t => 
                t.status !== "done" && 
                t.status !== "abandoned" && 
                !t.is_cyclic_occurrence && 
                !t.is_subtask
            ));
            
            // Fetch done tasks separately
            const doneRes = await axios.get(`${API_URL}?status=done`, authHeader());
            const doneAll = formatTasks(doneRes.data);
            // Include both done and abandoned (but not cyclic occurrences or subtasks)
            setDoneEvents(doneAll.filter(t => 
                (t.status === "done" || t.status === "abandoned") &&
                !t.is_cyclic_occurrence &&
                !t.is_subtask
            ));
        } catch (err) {
            console.error("Error fetching events:", err);
        }
    };

    const addTask = async (taskData) => {
        try {
            await axios.post(API_URL, taskData, authHeader());
            await fetchEvents();
        } catch (err) {
            console.error("Error adding task:", err.response?.data || err);
        }
    };

    const deleteTask = async (id) => {
        try {
            await axios.delete(`${API_URL}${id}/`, authHeader());
            await fetchEvents();
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const editTask = async (updatedTask) => {
        try {
            await axios.put(`${API_URL}${updatedTask.task_id}/`, updatedTask, authHeader());
            await fetchEvents();
        } catch (err) {
            console.error("Error editing task:", err.response?.data || err);
        }
    };

    const markDone = async (taskId) => {
        try {
            const response = await axios.post(`${API_URL}${taskId}/mark_done/`, {}, authHeader());
            await fetchEvents();
            return response.data;
        } catch (err) {
            console.error("Error marking done:", err.response?.data || err);
            throw err;
        }
    };
    const createCyclicTask = async (taskData) => {
        try {
            await axios.post(`${API_URL}create_cyclic/`, taskData, authHeader());
            await fetchEvents();
        } catch (err) {
            console.error("Error creating cyclic task:", err.response?.data || err);
        }
    };
    const createSplitTask = async (taskData) => {
        try {
            await axios.post(`${API_URL}create_split/`, taskData, authHeader());
            await fetchEvents();
        } catch (err) {
            console.error("Error creating split task:", err.response?.data || err);
        }
    };
    useEffect(() => {
        if (localStorage.getItem("access")) fetchEvents();
    }, []);

    return { events, doneEvents, fetchEvents, addTask, deleteTask, editTask, markDone, createCyclicTask, createSplitTask };
}
