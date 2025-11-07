import React, { useState } from "react";
import PropTypes from "prop-types";

export default function AddTask({ onSubmit, onClose, defaultValues }) {
    const [title, setTitle] = useState(defaultValues?.title || "");
    const [description, setDescription] = useState(defaultValues?.description || "");
    const [priority, setPriority] = useState(defaultValues?.priority || 1);
    const [status, setStatus] = useState(defaultValues?.status || "pending");
    const [start_date, setStartDate] = useState(
        defaultValues?.start_date
            ? new Date(defaultValues.start_date).toISOString().slice(0, 16)
            : ""
    );
    const [end_date, setEndDate] = useState(
        defaultValues?.end_date
            ? new Date(defaultValues.end_date).toISOString().slice(0, 16)
            : ""
    );

    const [start_time, setStartTime] = useState(defaultValues?.start_time || "");
    const [end_time, setEndTime] = useState(defaultValues?.end_time || "");
    const [isCyclic, setIsCyclic] = useState(defaultValues?.is_cyclic || false);
    const [frequency, setFrequency] = useState(defaultValues?.frequency || "weekly");
    const [occurrencesCount, setOccurrencesCount] = useState(defaultValues?.occurrences_count || 12);
    const [isSplit, setIsSplit] = useState(false);
    const [splitCount, setSplitCount] = useState(2);
    const [splits, setSplits] = useState([
        { title: "", start_date: "", end_date: "", priority: 1 },
        { title: "", start_date: "", end_date: "", priority: 1 }
    ]);
    
    const handleSubmit = (event) => {
        event.preventDefault();
        const taskData = {
            title,
            description,
            priority,
            status,
            start_date: start_date ? new Date(start_date).toISOString() : null,
            end_date: end_date ? new Date(end_date).toISOString() : null,
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
        
        onSubmit(taskData, isCyclic, isSplit);
    };

    const handleCancel = (e) => {
        e?.stopPropagation();
        onClose();
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-5 rounded-lg z-[10000] w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto"
        >
            <h3 className="text-white text-xl font-bold mb-4">Create Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-white text-sm font-medium block mb-1">Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="text-white text-sm font-medium block mb-1">Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500 min-h-[80px]"
                    />
                </div>

                <div>
                    <label className="text-white text-sm font-medium block mb-1">Priority: {priority}</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full"
                    />
                </div>
                
                <div>
                    <label className="text-white text-sm font-medium block mb-1">Estimated Points: {
                        (() => {
                            const days = start_date && end_date 
                                ? Math.max(1, Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)))
                                : 1;
                            return Number(priority) * days * 10;
                        })()
                    }</label>
                    <div className="text-xs text-gray-400 mt-1">
                        (Calculated: (End Date - Start Date) × Priority × 10)
                    </div>
                </div>

                <div>
                    <label className="text-white text-sm font-medium block mb-1">Start Date:</label>
                    <input
                        type="datetime-local"
                        value={start_date}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="text-white text-sm font-medium block mb-1">End Date:</label>
                    <input
                        type="datetime-local"
                        value={end_date}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="text-white text-sm font-medium block mb-1">Work Session (Optional):</label>
                    <div className="flex gap-2">
                        <input
                            type="time"
                            value={start_time}
                            onChange={(e) => setStartTime(e.target.value)}
                            placeholder="Start"
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500"
                        />
                        <input
                            type="time"
                            value={end_time}
                            onChange={(e) => setEndTime(e.target.value)}
                            placeholder="End"
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-white text-sm font-medium block mb-1">Status:</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500"
                    >
                        <option value="pending" className="bg-gray-700">Pending</option>
                        <option value="in progress" className="bg-gray-700">In Progress</option>
                        <option value="completed" className="bg-gray-700">Completed</option>
                        <option value="done" className="bg-gray-700">Done</option>
                        <option value="abandoned" className="bg-gray-700">Abandoned</option>
                        <option value="overdue" className="bg-gray-700">Overdue</option>
                    </select>
                </div>

                <hr className="my-4 border-gray-600" />
                
                <div className="flex justify-between gap-4 mb-4">
                    <button
                        type="button"
                        onClick={() => setIsCyclic(!isCyclic)}
                        className={`px-4 py-2 rounded transition-colors ${
                            isCyclic 
                                ? "bg-green-500 text-black" 
                                : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                    >
                        🔁 {isCyclic ? "Remove Cyclic" : "Make Cyclic"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsSplit(!isSplit)}
                        className={`px-4 py-2 rounded transition-colors ${
                            isSplit 
                                ? "bg-green-500 text-black" 
                                : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                    >
                        ➕ {isSplit ? "Remove Split" : "Split Task"}
                    </button>
                </div>

                {isCyclic && (
                    <div className="mb-4">
                        <label className="text-white text-sm font-medium block mb-1">Frequency:</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value="daily" className="bg-gray-700">Daily</option>
                            <option value="weekly" className="bg-gray-700">Weekly</option>
                            <option value="monthly" className="bg-gray-700">Monthly</option>
                            <option value="quarterly" className="bg-gray-700">Quarterly</option>
                        </select>
                        <label className="text-white text-sm font-medium block mt-3 mb-1">Number of Occurrences: {occurrencesCount}</label>
                        <input
                            type="range"
                            min="2"
                            max="12"
                            value={occurrencesCount}
                            onChange={(e) => setOccurrencesCount(parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>
                )}

                {isSplit && (
                    <div className="mb-4 border border-gray-600 p-4 rounded-lg">
                        <label className="text-white text-sm font-medium block mb-2">Number of Splits:</label>
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
                            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500"
                        />
                        {splits.map((split, index) => (
                            <div key={index} className="mt-3 p-3 bg-gray-800 rounded-lg">
                                <b className="text-white text-sm font-medium block mb-2">Subtask {index + 1}</b>
                                <input
                                    type="text"
                                    placeholder="Subtask title"
                                    value={split.title}
                                    onChange={(e) => {
                                        const newSplits = [...splits];
                                        newSplits[index].title = e.target.value;
                                        setSplits(newSplits);
                                    }}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500 mb-2"
                                />
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="datetime-local"
                                        placeholder="Start"
                                        value={split.start_date}
                                        onChange={(e) => {
                                            const newSplits = [...splits];
                                            newSplits[index].start_date = e.target.value;
                                            setSplits(newSplits);
                                        }}
                                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500"
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
                                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <label className="text-white text-sm font-medium block mb-1">Priority: {split.priority}</label>
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
                                    className="w-full"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex justify-between gap-4">
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white border-none px-4 py-2 rounded transition-colors"
                    >
                        Add
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-red-600 hover:bg-red-700 text-white border-none px-4 py-2 rounded transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

AddTask.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    defaultValues: PropTypes.object,
};
