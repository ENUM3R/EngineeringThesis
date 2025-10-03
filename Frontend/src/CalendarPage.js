import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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
  const [events, setEvents] = useState([]);

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

  const handleSelectSlot = ({start, end}) => {
    const action = window.prompt("Type 'add' to add new task or 'del' to delete task: ");
    if (action === 'add') {
      const title = window.prompt("Task Name: ");
      const description = window.prompt("Task description: ");
      const priority = window.prompt("Task priority");
      axios.post('http://127.0.0.1:8000/api/tasks/',{
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
	if (confirm_del){
		axios.delete(`http://127.0.0.1:8000/api/tasks/${event.id}/`)
		.then(() => fetchEvents());
	}
  }

  return (
    <div style={{ height: 600, margin: "50px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        style={{ height: 600 }}
      />
    </div>
  );
}
