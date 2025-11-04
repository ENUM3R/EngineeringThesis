import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function EditTask({ task, onSubmit, onCancel }) {
    const [title, setTitle] = useState(task.title || '');
    const [description, setDescription] = useState(task.description || '');
    const [priority, setPriority] = useState(task.priority || 1);
    const [status, setStatus] = useState(task.status || 'pending');
    const [endTime, setEndTime] = useState(task.end ? new Date(task.end).toISOString().slice(0, 10) : '');

    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedStart = task.start
            ? new Date(task.start).toISOString()
            : new Date().toISOString();

        const formattedEnd = endTime
            ? (() => { const d = new Date(endTime); d.setHours(23, 59, 59); return d.toISOString(); })()
            : new Date().toISOString();

        onSubmit({
            task_id: task.task_id,
            title,
            description,
            priority: Number(priority),
            points: task.points || 0,
            status,
            start_date: formattedStart,
            end_date: formattedEnd,
        });
    };

    return (  
        <div style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#2b2b2b',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            zIndex: 1000,
            width: '300px'
        }}>
            <h3>Edit Task</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label><br />
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%' }} />
                </div>
                <div>
                    <label>Description:</label><br />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                    <label>Priority: {priority}</label><br />
                    <input type="range" min="1" max="10" value={priority} onChange={e => setPriority(e.target.value)} />
                </div>
                <div>
                    <label>End Time:</label><br />
                    <input type="date" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                    <label>Status: {status}</label><br />
                    <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="done">Done</option>
                        <option value="abandoned">Abandoned</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Save</button>
                    <button type="button" onClick={onCancel} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

EditTask.propTypes = {
    task: PropTypes.shape({
        task_id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        priority: PropTypes.number,
        status: PropTypes.string,
        points: PropTypes.number,
        end: PropTypes.string,
        start: PropTypes.string,
    }).isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

