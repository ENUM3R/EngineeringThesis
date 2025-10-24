import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { QuarterView } from "./Components/QuarterView";
import { CustomToolbar } from "./Components/CustomToolbar";
import AddTask from "./Components/AddTask";
import DeleteTask from "./Components/DeleteTask";
import EditTask from "./Components/EditTask";
import TaskOptions from "./Components/TaskOptions";
import TaskPicker from "./Components/TaskPicker";

const locales = {
    "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

export default function CalendarPage() {
    const [theme, setTheme] = useState("dark");
    const [events, setEvents] = useState([]);
    const [currentView, setCurrentView] = useState(Views.MONTH);
    const [taskToAdd, setAddTask] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [dayOptionsPos, setDayOptionsPos] = useState(null);
    const [dayOptionsDate, setDayOptionsDate] = useState(null);
    const [taskListForDay, setTaskListForDay] = useState(null);
    const [taskActionType, setTaskActionType] = useState(null);


    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        const handleOutsideClick = () => setDayOptionsPos(null);
        if (dayOptionsPos) document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [dayOptionsPos]);

    const fetchEvents = () => {
        axios.get("http://127.0.0.1:8000/api/tasks/").then((res) => {
            const formattedEvents = res.data.map((event) => ({
                id: event.task_id,
                title: event.title,
                start: new Date(event.start_time),
                end: new Date(event.end_time),
                end_raw: event.end_time,
                priority: Number(event.priority) || 0,
                status: event.status,
            }));
            setEvents(formattedEvents);
        });
    };

    const handleSelectSlot = (slotInfo) => {
        const defaultX = window.innerWidth / 2 - 75;
        const defaultY = window.innerHeight / 2 - 100;

        setDayOptionsPos({ x: defaultX, y: defaultY });
        setDayOptionsDate({ start: slotInfo.start, end: slotInfo.end });
    };


    const handleSelectEvent = (event) => {
        const task = events.find(e => e.id === event.id || e.id === event.task_id);
        if (task) {
            setTaskToDelete(task);
        } else {
            console.error("Task not found for event:", event);
        }
    };
    const handleAddTask = (taskData) => {
        axios
            .post("http://127.0.0.1:8000/api/tasks/", {
                ...taskData,
                start_time: selectedDate.start,
                end_time: taskData.end_time || selectedDate.end,
                points: 0,
            })
            .then(() => {
                fetchEvents();
                setAddTask(false);
            });
    };
    const handleCancelTask = () => setAddTask(false);

    const handleRightClickEvent = (event, e) => {
        e.preventDefault();
        setTaskToDelete(event); 
    };

    const handleDeleteTask = (task) => {
        if (!task || !task.id) return;
        axios
            .delete(`http://127.0.0.1:8000/api/tasks/${task.id}/`)
            .then(() => {
                fetchEvents();
                setTaskToDelete(null);
            })
            .catch(err => console.error(err));
    }
    const handleCancelDelete = () => {
        setTaskToDelete(null);
    }

    const handleEditTask = (task) => {
        setTaskToEdit(task);
    };
    const handleSaveTask = (updatedTask) => {
        axios.put(`http://127.0.0.1:8000/api/tasks/${updatedTask.id}/`, updatedTask)
            .then(() => {
                fetchEvents();
                setTaskToEdit(null);
            })
            .catch(err => console.error(err));
    };

    const handleCancelEdit = () => setTaskToEdit(null);

    return (
        <div
            style={{
                height: 600,
                margin: "50px",
                backgroundColor: theme === "dark" ? "#1e1e1e" : "#f9f9f9",
                color: theme === "dark" ? "#fff" : "#000",
                padding: "10px",
                borderRadius: "8px",
                position: "relative",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "10px",
                }}
            >
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    style={{
                        backgroundColor: theme === "dark" ? "#1e34f5ff" : "#333",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "6px 12px",
                        cursor: "pointer",
                    }}
                >
          Switch to {theme === "dark" ? "Light" : "Dark"} Mode
                </button>
            </div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={(slotInfo, e) => handleSelectSlot(slotInfo, e)}
                onSelectEvent={handleSelectEvent}
                onEventContextMenu={handleRightClickEvent}
                style={{
                    height: 550,
                    backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
                    color: theme === "dark" ? "#fff" : "#000",
                    borderRadius: "8px",
                }}
                eventPropGetter={(event) => {
                    let backgroundColor = getComputedStyle(document.documentElement)
                        .getPropertyValue("--event-color");
                    if (event.status === "pending") backgroundColor = "#fda80bb6";
                    if (event.status === "in progress") backgroundColor = "#b007ffff";
                    if (event.status === "completed") backgroundColor = "#14fff3ff";
                    if (event.status === "overdue") backgroundColor = "#f70073";
                    if (event.status === "done") backgroundColor = "#00ff22";
                    return {
                        style: {
                            backgroundColor,
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "2px 6px",
                            fontSize: "0.9em",
                        },
                    };
                }}
                views={{
                    month: true,
                    week: true,
                    day: true,
                    agenda: true,
                    quarter: QuarterView,
                }}
                defaultView={Views.MONTH}
                view={currentView}
                onView={(view) => setCurrentView(view)}
                components={{
                    toolbar: (props) => (
                        <CustomToolbar
                            {...props}
                            currentView={currentView}
                            setCurrentView={setCurrentView}
                        />
                    ),
                }}
                {...(currentView === "quarter" ? { quarterViewTheme: theme } : {})}
            />
            {dayOptionsPos && (
                <TaskOptions
                    position={dayOptionsPos}
                    onAdd={() => {
                        setAddTask(true);
                        setSelectedDate(dayOptionsDate);
                        setDayOptionsPos(null);
                    }}
                    onDelete={() => {
                        const tasksForDay = events.filter(
                            (e) => e.start.toDateString() === dayOptionsDate.start.toDateString()
                        );
                        if (tasksForDay.length === 1) {
                            setTaskToDelete(tasksForDay[0]);
                        } else if (tasksForDay.length > 1) {
                            setTaskListForDay(tasksForDay);
                            setTaskActionType("delete");
                        }
                        setDayOptionsPos(null);
                    }}
                    onEdit={() => {
                        const tasksForDay = events.filter(
                            (e) => e.start.toDateString() === dayOptionsDate.start.toDateString()
                        );
                        if (tasksForDay.length === 1) {
                            setTaskToEdit(tasksForDay[0]);
                        } else if (tasksForDay.length > 1) {
                            setTaskListForDay(tasksForDay);
                            setTaskActionType("edit");
                        }
                        setDayOptionsPos(null);
                    }}
                    onCancel={() => setDayOptionsPos(null)}
                />
            )}
            {taskToAdd && (
                <AddTask
                    onSubmit={handleAddTask}
                    onCancel={handleCancelTask}
                    defaultValues={{}}
                />
            )}
            {taskToDelete && (
                <DeleteTask
                    task={taskToDelete}
                    onDelete={handleDeleteTask}
                    onCancel={handleCancelDelete}
                />
            )}
            {taskToEdit && (
                <EditTask
                    task={taskToEdit}
                    onSubmit={handleSaveTask}
                    onCancel={handleCancelEdit}
                />
            )}
            {taskListForDay && (
                <TaskPicker
                    tasks={taskListForDay}
                    onSelect={(task) => {
                        if (taskActionType === "delete") setTaskToDelete(task);
                        if (taskActionType === "edit") setTaskToEdit(task);
                        setTaskListForDay(null);
                        setTaskActionType(null);
                    }}
                    onCancel={() => {
                        setTaskListForDay(null);
                        setTaskActionType(null);
                    }}
                />
            )}
        </div>
    );
}
