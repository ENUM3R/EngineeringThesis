import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function EditTask({ task, onSubmit, onClose }) {
    const [title, setTitle] = useState(task.title || '');
    const [description, setDescription] = useState(task.description || '');
    const [priority, setPriority] = useState(task.priority || 1);
    const [status, setStatus] = useState(task.status || 'pending');
    const [start_time, setStartTime] = useState(task.start_time || "");
    const [end_time, setEndTime] = useState(task.end_time || "");
    const [isCyclic, setIsCyclic] = useState(task.is_cyclic || false);
    const [frequency, setFrequency] = useState(task.frequency || "daily");
    const [occurrencesCount, setOccurrencesCount] = useState(task.occurrences_count || 12);
    const [isSplit, setIsSplit] = useState(false);
    const [splitCount, setSplitCount] = useState(2);
    const [splits, setSplits] = useState([
        { title: "", start_date: "", end_date: "", priority: 1 },
        { title: "", start_date: "", end_date: "", priority: 1 }
    ]);
    const [endDate, setEndDate] = useState(
        task.end ? new Date(task.end).toISOString().slice(0, 10) : ''
    );
    
    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedStart = task.start
            ? new Date(task.start).toISOString()
            : new Date().toISOString();

        const formattedEnd = endDate
            ? (() => { const d = new Date(endDate); d.setHours(23, 59, 59); return d.toISOString(); })()
            : (task.end ? new Date(task.end).toISOString() : new Date().toISOString());

        const taskData = {
            task_id: task.task_id,
            title,
            description,
            priority: Number(priority),
            points: task.points || 0,
            status,
            start_date: formattedStart,
            end_date: formattedEnd,
            start_time: start_time || null,
            end_time: end_time || null,
        };
        
        if (isCyclic) {
            taskData.frequency = frequency;
            taskData.occurrences_count = occurrencesCount;
        }
        
        if (isSplit) {
            taskData.subtasks = splits.map(split => ({
                title: split.title || "Untitled Subtask",
                start_date: split.start_date ? new Date(split.start_date).toISOString() : null,
                end_date: split.end_date ? new Date(split.end_date).toISOString() : null,
                priority: Number(split.priority) || 1
            }));
        }
        
        // If status is set to "done" or "abandoned", mark task as done and add points
        // Abandoned tasks give 0 points, done tasks give full/half points
        if (status === "done" || status === "abandoned") {
            onSubmit(taskData, isCyclic, isSplit, true); // Pass true to indicate should mark done
        } else {
            onSubmit(taskData, isCyclic, isSplit, false);
        }
    };

    const handleClose = (e) => {
        e?.stopPropagation();
        onClose();
    };

    return (  
        <div 
            onClick={(e) => e.stopPropagation()}
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#2b2b2b',
                color: 'white',
                padding: '20px',
                borderRadius: '8px',
                zIndex: 10000,
                width: '400px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflowY: 'auto',
            }}
        >
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
                    <label>Points: {
                        (() => {
                            if (task.points) return task.points;
                            const hours = 1; // Default hours
                            const days = task.start && task.end
                                ? Math.max(1, Math.ceil((new Date(task.end) - new Date(task.start)) / (1000 * 60 * 60 * 24)))
                                : 1;
                            return Number(priority) * hours * days;
                        })()
                    }</label>
                    <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>
                        (Calculated: Priority × Hours × Days)
                    </div>
                </div>
                <div>
                    <label>Start Time (Optional):</label>
                    <br />
                    <input
                        type="time"
                        value={start_time}
                        onChange={(e) => setStartTime(e.target.value)}
                        style={{ width: "100%" }}
                    />
                </div>
                <div>
                    <label>End Time (Optional):</label>
                    <br />
                    <input
                        type="time"
                        value={end_time}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={{ width: "100%" }}
                    />
                </div>
                <div>
                    <label>End Date:</label><br />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%' }} />
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
                
                <hr style={{ margin: '15px 0', borderColor: '#555' }} />
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <button
                        type="button"
                        onClick={() => setIsCyclic(!isCyclic)}
                        style={{
                            backgroundColor: isCyclic ? "#00ff40ff" : "#444",
                            color: isCyclic ? "black" : "white",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: "1px solid #666",
                            cursor: "pointer",
                        }}
                    >
                        🔁 {isCyclic ? "Remove Cyclic" : "Make Cyclic"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsSplit(!isSplit)}
                        style={{
                            backgroundColor: isSplit ? "#00ff40ff" : "#444",
                            color: isSplit ? "black" : "white",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: "1px solid #666",
                            cursor: "pointer",
                        }}
                    >
                        ➕ {isSplit ? "Remove Split" : "Split Task"}
                    </button>
                </div>
                
                {isCyclic && (
                    <div style={{ marginBottom: "10px" }}>
                        <label>Frequency:</label>
                        <br />
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            style={{ width: "100%", marginTop: "4px" }}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                        </select>
                        <br />
                        <label style={{ marginTop: "8px", display: "block" }}>Number of Occurrences: {occurrencesCount}</label>
                        <input
                            type="range"
                            min="2"
                            max="12"
                            value={occurrencesCount}
                            onChange={(e) => setOccurrencesCount(parseInt(e.target.value))}
                            style={{ width: "100%", marginTop: "4px" }}
                        />
                    </div>
                )}
                
                {isSplit && (
                    <div style={{ marginBottom: "10px", border: "1px solid #666", padding: "10px", borderRadius: "4px" }}>
                        <label>Number of Splits:</label>
                        <input
                            type="number"
                            min="2"
                            max="10"
                            value={splitCount}
                            onChange={(e) => {
                                const count = parseInt(e.target.value) || 2;
                                setSplitCount(count);
                                setSplits(Array(count).fill(null).map((_, i) => 
                                    splits[i] || { title: "", start_date: "", end_date: "", priority: 1 }
                                ));
                            }}
                            style={{ width: "60px", marginLeft: "10px" }}
                        />
                        {splits.map((split, index) => (
                            <div key={index} style={{ marginTop: "10px", padding: "8px", backgroundColor: "#333", borderRadius: "4px" }}>
                                <b>Subtask {index + 1}</b>
                                <input
                                    type="text"
                                    placeholder="Subtask title"
                                    value={split.title}
                                    onChange={(e) => {
                                        const newSplits = [...splits];
                                        newSplits[index].title = e.target.value;
                                        setSplits(newSplits);
                                    }}
                                    style={{ width: "100%", marginTop: "4px" }}
                                />
                                <div style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                                    <input
                                        type="datetime-local"
                                        placeholder="Start"
                                        value={split.start_date}
                                        onChange={(e) => {
                                            const newSplits = [...splits];
                                            newSplits[index].start_date = e.target.value;
                                            setSplits(newSplits);
                                        }}
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        type="datetime-local"
                                        placeholder="End"
                                        value={split.end_date}
                                        onChange={(e) => {
                                            const newSplits = [...splits];
                                            newSplits[index].end_date = e.target.value;
                                            setSplits(newSplits);
                                        }}
                                        style={{ flex: 1 }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={split.priority}
                                    onChange={(e) => {
                                        const newSplits = [...splits];
                                        newSplits[index].priority = e.target.value;
                                        setSplits(newSplits);
                                    }}
                                    style={{ width: "100%", marginTop: "4px" }}
                                />
                                <label>Priority: {split.priority}</label>
                            </div>
                        ))}
                    </div>
                )}
                
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Save</button>
                    <button type="button" onClick={handleClose} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Cancel</button>
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
        start: PropTypes.string,
        end: PropTypes.string,
        start_time: PropTypes.string,
        end_time: PropTypes.string,
        is_cyclic: PropTypes.bool,
        frequency: PropTypes.string,
        occurrences_count: PropTypes.number,
    }).isRequired,

    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};