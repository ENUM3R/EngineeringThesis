// External libraries
import React, { useEffect, useState } from "react";
import { Calendar as MiniCal } from "react-big-calendar";
import { dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./themes.css"

//Hooks
import useTasks from "./Hooks/useTasks";
import { useAuth } from "./Hooks/useAuth";

// Components
import { CustomToolbar } from "./Components/CustomToolbar";
import AddTask from "./Components/AddTask";
import DeleteTask from "./Components/DeleteTask";
import EditTask from "./Components/EditTask";
import TaskOptions from "./Components/TaskOptions";
import TaskPicker from "./Components/TaskPicker";
import TaskList from "./Components/TaskList";
import { QuarterView } from "./Components/QuarterView";

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

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [triggerRefresh, setTriggerRefresh] = useState(false);

    const [taskToAdd, setAddTask] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const [taskToDelete, setTaskToDelete] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);

    const [dayOptionsPos, setDayOptionsPos] = useState(null);
    const [dayOptionsDate, setDayOptionsDate] = useState(null);

    const [taskListForDay, setTaskListForDay] = useState(null);
    const [taskActionType, setTaskActionType] = useState(null);

    const [taskListMode, setTaskListMode] = useState(null);

    const { events, doneEvents, addTask, deleteTask, editTask, markDone, fetchEvents, createCyclicTask, createSplitTask } = useTasks();
    const { points, getProfile } = useAuth();

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    useEffect(() => {
        fetchEvents();
        getProfile(); // Refresh points on mount and refresh
    }, [triggerRefresh]);

    const handleSelectSlot = (slotInfo) => {
        setDayOptionsPos({ x: 300, y: 200 });
        setDayOptionsDate({ start: slotInfo.start, end: slotInfo.end });
    };

    const handleSelectEvent = (event) => {
        setTaskToEdit(event);
    };

    // Include done tasks in calendar but with blur effect
    const allEvents = [...events, ...doneEvents];
    
    const filteredEvents = allEvents.filter((e) => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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

            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                padding: "0 10px"
            }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{
                        background: "#222",
                        color: "white",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                    }}>
                        POINTS: {points}
                    </div>
                    <button
                        onClick={() => {
                            // Placeholder for future marketplace
                            alert("Marketplace coming soon!");
                        }}
                        style={{
                            background: "#4a148c",
                            color: "white",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            fontWeight: "bold",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        🛒 Marketplace
                    </button>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
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

                    <button
                        onClick={() => setTriggerRefresh(!triggerRefresh)}
                        style={{
                            backgroundColor: "#008cff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "6px 12px",
                            cursor: "pointer",
                        }}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div style={{
                display: "flex",
                gap: "10px",
                marginBottom: "12px",
                padding: "0 10px"
            }}>
                <input
                    type="text"
                    placeholder="Search task..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: "1px solid #777",
                        width: "200px"
                    }}
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: "1px solid #777",
                    }}
                >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                    <option value="done">Done</option>
                </select>

                <button
                    onClick={() => setTaskListMode("active")}
                    style={{
                        backgroundColor: "#00b52e",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "6px 12px",
                        cursor: "pointer"
                    }}
                >
                    Open Task List
                </button>
            </div>

            <MiniCal
                localizer={localizer}
                events={filteredEvents}
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
                        <CustomToolbar
                            {...props}
                            currentView={currentView}
                            setCurrentView={setCurrentView}
                            onOpenTaskList={setTaskListMode}
                        />
                    ),
                }}

                formats={{
                    dayHeaderFormat: (date, culture, local) => local.format(date, "dd MM", culture),
                    monthHeaderFormat: (date, culture, local) => local.format(date, "MMMM yyyy", culture),
                    quarterHeaderFormat: (date) =>
                        `Quarter: ${date.toLocaleString("en-US", { month: "long", year: "numeric" })}`,
                }}
                eventPropGetter={(event) => {
                    let backgroundColor = "#777";
                    let opacity = 1;
                    let filter = "none";
                    
                    switch (event.status){
                    case "pending": backgroundColor = "#fda80bb6"; break;
                    case "in progress": backgroundColor = "#b007ffff"; break;
                    case "completed": backgroundColor = "#14fff3ff"; break;
                    case "overdue": backgroundColor = "#f70073"; break;
                    case "done": 
                        backgroundColor = "#00ff22"; 
                        opacity = 0.8;
                        filter = "blur(1px)";
                        break;
                    case "abandoned":
                        backgroundColor = "#888888";
                        opacity = 0.8;
                        filter = "blur(1px)";
                        break;
                    }
                    return { 
                        style: { 
                            backgroundColor, 
                            color: "#fff",
                            opacity,
                            filter
                        } 
                    };
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
                    onClose={() => setDayOptionsPos(null)}
                    onDone={async (taskId) => {
                        if (taskId) {
                            try {
                                await markDone(taskId);
                                await getProfile(); // Refresh points display
                                await fetchEvents(); // Refresh calendar
                            } catch (err) {
                                console.error("Error marking task as done:", err);
                                alert("Error marking task as done. Please try again.");
                            }
                        }
                    }}
                    task={null}
                />
            )}

            {taskToAdd && (
                <AddTask
                    onSubmit={async (data, isCyclic, isSplit) => {
                        if (isCyclic) {
                            await createCyclicTask(data);
                        } else if (isSplit) {
                            await createSplitTask(data);
                        } else {
                            await addTask(data, selectedDate);
                        }
                        setAddTask(false);
                    }}
                    onClose={() => setAddTask(false)}
                    defaultValues={{}}
                />
            )}

            {taskToDelete && (
                <DeleteTask
                    task={taskToDelete}
                    onDelete={async (task_id) => {
                        await deleteTask(task_id);
                        setTaskToDelete(null);
                    }}
                    onClose={() => setTaskToDelete(null)}
                />
            )}

            {taskToEdit && (
                <EditTask
                    task={taskToEdit}
                    onSubmit={async (data, isCyclic, isSplit, shouldMarkDone) => {
                        await editTask(data);
                        // If status is "done" or "abandoned", mark task as done to add points
                        if (shouldMarkDone && (data.status === "done" || data.status === "abandoned")) {
                            try {
                                await markDone(data.task_id);
                                await getProfile();
                            } catch (err) {
                                console.error("Error marking task as done:", err);
                            }
                        }
                        setTaskToEdit(null);
                    }}
                    onClose={() => setTaskToEdit(null)}
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
                    onClose={() => {
                        setTaskListForDay(null);
                        setTaskActionType(null);
                    }}
                />
            )}

            {taskListMode && (
                <TaskList
                    mode={taskListMode}
                    onClose={() => setTaskListMode(null)}
                />
            )}
        </div>
    );
}
