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
import { useUserPreferences } from "./Context/UserPreferencesContext";

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
    const { availablePoints, getProfile } = useAuth();
    const { statusColors } = useUserPreferences();

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    useEffect(() => {
        fetchEvents();
        getProfile();
    }, [triggerRefresh]);

    const handleSelectSlot = (slotInfo) => {
        setDayOptionsPos({ x: 300, y: 200 });
        setDayOptionsDate({ start: slotInfo.start, end: slotInfo.end });
    };

    const handleSelectEvent = (event) => {
        setTaskToEdit(event);
    };
    const allEvents = [...events, ...doneEvents];
    
    const filteredEvents = allEvents.filter((e) => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div
            className="calendar-container h-[600px] m-[50px] p-2.5 rounded-lg relative"
        >

            <div className="flex justify-between items-center mb-2.5 px-2.5">
                <div className="flex gap-2.5 items-center">
                    <div className="bg-gray-800 text-white px-3.5 py-1.5 rounded-md font-bold">
                        POINTS: {availablePoints}
                    </div>
                    <button
                        onClick={() => {
                            window.location.href = "/marketplace";
                        }}
                        className="bg-purple-900 text-white px-3.5 py-1.5 rounded-md font-bold border-none cursor-pointer hover:bg-purple-800 transition-colors"
                    >
                        🛒 Marketplace
                    </button>
                    <button
                        onClick={() => {
                            window.location.href = "/reports";
                        }}
                        className="bg-blue-600 text-white px-3.5 py-1.5 rounded-md font-bold border-none cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                        📊 Reports
                    </button>
                </div>

                <div className="flex gap-2.5">
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className={`${theme === "dark" ? "bg-blue-600" : "bg-gray-700"} text-white border-none rounded px-3 py-1.5 cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                        Switch to {theme === "dark" ? "Light" : "Dark"} Mode
                    </button>

                    <button
                        onClick={() => setTriggerRefresh(!triggerRefresh)}
                        className="bg-blue-500 text-white border-none rounded px-3 py-1.5 cursor-pointer hover:bg-blue-600 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="flex gap-2.5 mb-3 px-2.5">
                <input
                    type="text"
                    placeholder="Search task..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-2 py-1.5 rounded border border-gray-600 w-[200px] bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2 py-1.5 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
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
                    className="bg-green-600 text-white border-none rounded px-3 py-1.5 cursor-pointer hover:bg-green-700 transition-colors"
                >
                    📋 Task List
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
                className="h-[550px] rounded-lg"
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

                    const statusKey = event.status === "in progress" ? "in progress" : event.status;
                    const statusKeyHyphen = event.status === "in progress" ? "in-progress" : event.status;
                    
                    if (statusColors[statusKey] || statusColors[statusKeyHyphen]) {
                        backgroundColor = statusColors[statusKey] || statusColors[statusKeyHyphen];
                    } else {
                        switch (event.status){
                        case "pending": backgroundColor = "#fda80bb6"; break;
                        case "in progress": backgroundColor = "#b007ffff"; break;
                        case "completed": backgroundColor = "#14fff3ff"; break;
                        case "overdue": 
                            backgroundColor = "#f70073"; 
                            opacity = 1;
                            filter = "none";
                            break;
                        case "done": 
                            backgroundColor = "#00ff22"; 
                            opacity = 1;
                            filter = "none";
                            break;
                        case "abandoned":
                            backgroundColor = "#888888";
                            opacity = 1;
                            filter = "none";
                            break;
                        }
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
                                await getProfile();
                                await fetchEvents();
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
                        try {
                            await deleteTask(task_id);
                            setTaskToDelete(null);
                            await fetchEvents();
                            await getProfile();
                        } catch (error) {
                            console.error("Error deleting task:", error);
                            alert("Failed to delete task. Please try again.");
                        }
                    }}
                    onClose={() => setTaskToDelete(null)}
                />
            )}

            {taskToEdit && (
                <EditTask
                    task={taskToEdit}
                    onSubmit={async (data, isCyclic, isSplit, shouldMarkDone) => {
                        await editTask(data);
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
