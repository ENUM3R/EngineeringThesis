import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { QuarterView } from './Components/QuarterView';
import { CustomToolbar } from './Components/CustomToolbar';


const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function CalendarPage() {
  //Theme state
  const [theme, setTheme] = useState('dark');
  const [events, setEvents] = useState([]);
  const [currentView, setCurrentView] = useState(Views.MONTH);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    axios.get('http://127.0.0.1:8000/api/tasks/')
      .then(res => {
        const formattedEvents = res.data.map(event => ({
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
    const action = window.prompt("Type 'add' to add new task or 'del' to delete task:");
    if (action === 'add') {
      const title = window.prompt("Task Name:");
      const description = window.prompt("Task description:");
      const priority = window.prompt("Task priority");
      axios.post('http://127.0.0.1:8000/api/tasks/', {
        title,
        description,
        start_time: start,
        end_time: end,
        priority,
        points: 0,
        status: "pending",
      }).then(() => fetchEvents());
    }
  };

  const handleSelectEvent = (event) => {
    const confirm_del = window.confirm(`Delete task: ${event.title}?`);
    if (confirm_del) {
      axios.delete(`http://127.0.0.1:8000/api/tasks/${event.id}/`)
        .then(() => fetchEvents());
    }
  };

  return (
    <div style={{
      height: 600,
      margin: "50px",
      backgroundColor: theme === 'dark' ? "#1e1e1e" : "#f9f9f9",
      color: theme === 'dark' ? "#fff" : "#000",
      padding: "10px",
      borderRadius: "8px",
    }}>
      {/* Theme toggle button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            backgroundColor: theme === 'dark' ? '#1e34f5ff' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
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
          backgroundColor: theme === 'dark' ? "#1e1e1e" : "#fff",
          color: theme === 'dark' ? "#fff" : "#000",
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
         components={{ toolbar: (props) => <CustomToolbar {...props} 
		 currentView={currentView}
		 setCurrentView={setCurrentView} /> }}
  		 {...(currentView === 'quarter' ? { quarterViewTheme: theme } : {})} 
      />
    </div>
  );
}
