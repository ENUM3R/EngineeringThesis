import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { QuarterView } from "./Components/QuarterView";
import { CustomToolbar } from "./Components/CustomToolbar";
import TaskForm from "./Components/TaskForm";

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
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = () => {
        axios.get("http://127.0.0.1:8000/api/tasks/").then((res) => {
            const formattedEvents = res.data.map((event) => ({
                id: event.task_id,
                title: event.title,
                start: new Date(event.start_time),
                end: new Date(event.end_time),
                status: event.status,
            }));
            setEvents(formattedEvents);
        });
    };

    const handleSelectSlot = ({ start, end }) => {
        setSelectedDate({ start, end });
        setShowTaskForm(true);
    };

    const handleSelectEvent = (event) => {
        if (window.confirm(`Delete task: ${event.title}?`)) {
            axios
                .delete(`http://127.0.0.1:8000/api/tasks/${event.id}/`)
                .then(() => fetchEvents());
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
                setShowTaskForm(false);
            });
    };
    const handleCancelTask = () => setShowTaskForm(false);

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
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                style={{
                    height: 550,
                    backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
                    color: theme === "dark" ? "#fff" : "#000",
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
            {showTaskForm && (
                <TaskForm onSubmit={handleAddTask} onCancel={handleCancelTask} />
            )}
        </div>
    );
}
