import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./themes.css"

import useTasks from "./Hooks/useTasks";
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
    const [currentView, setCurrentView] = useState(Views.MONTH);

    const [taskToAdd, setAddTask] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [dayOptionsPos, setDayOptionsPos] = useState(null);
    const [dayOptionsDate, setDayOptionsDate] = useState(null);
    const [taskListForDay, setTaskListForDay] = useState(null);
    const [taskActionType, setTaskActionType] = useState(null);

    const {events, fetchEvents, addTask, deleteTask, editTask} = useTasks();

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    useEffect(() => {
        const handleOutsideClick = () => setDayOptionsPos(null);
        if (dayOptionsPos) document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [dayOptionsPos]);

    const handleSelectSlot = (slotInfo) => {
        const defaultX = window.innerWidth / 2 - 75;
        const defaultY = window.innerHeight / 2 - 100;
        setDayOptionsPos({ x: defaultX, y: defaultY });
        setDayOptionsDate({ start: slotInfo.start, end: slotInfo.end });
    };

    const handleSelectEvent = (event) => {
        const task = events.find(e => e.id === event.id || e.id === event.task_id);
        if (task) setTaskToDelete(task);
    };

    return (
        <div
            className="calendar-container"
            style={{
                height: 600,
                margin: "50px",
                padding: "10px",
                borderRadius: "8px",
                position: "relative",
            }}
        >
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
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
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                style={{
                    height: 550,
                    borderRadius: "8px",
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
                onView={setCurrentView}
                components={{
                    toolbar: (props) => (
                        <CustomToolbar {...props} currentView={currentView} setCurrentView={setCurrentView} />
                    ),
                }}
                eventPropGetter={(event) => {
                    let backgroundColor = "#777";
                    switch (event.status){
                    case "pending":
                        backgroundColor = "#fda80bb6";
                        break;
                    case "in progress":
                        backgroundColor = "#b007ffff";
                        break;
                    case "completed":
                        backgroundColor = "#14fff3ff";
                        break;
                    case "overdue":
                        backgroundColor = "#f70073";
                        break;
                    case "done":
                        backgroundColor = "#00ff22";
                        break;
                    }
                    return { style: { backgroundColor, color: "#fff" } };
                }}
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
                        if (tasksForDay.length === 1) setTaskToDelete(tasksForDay[0]);
                        else if (tasksForDay.length > 1) {
                            setTaskListForDay(tasksForDay);
                            setTaskActionType("delete");
                        }
                        setDayOptionsPos(null);
                    }}
                    onEdit={() => {
                        const tasksForDay = events.filter(
                            (e) => e.start.toDateString() === dayOptionsDate.start.toDateString()
                        );
                        if (tasksForDay.length === 1) setTaskToEdit(tasksForDay[0]);
                        else if (tasksForDay.length > 1) {
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
                    onSubmit={async (data) => {
                        await addTask(data, selectedDate);
                        setAddTask(false);
                    }}
                    onCancel={() => setAddTask(false)}
                    defaultValues={{}}
                />
            )}
            {taskToDelete && (
                <DeleteTask
                    task={taskToDelete}
                    onDelete={async () => {
                        await deleteTask(taskToDelete.id);
                        setTaskToDelete(null);
                    }}
                    onCancel={() => setTaskToDelete(null)}
                />
            )}
            {taskToEdit && (
                <EditTask
                    task={taskToEdit}
                    onSubmit={async (data) => {
                        await editTask(data);
                        setTaskToEdit(null);
                    }}
                    onCancel={() => setTaskToEdit(null)}
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
