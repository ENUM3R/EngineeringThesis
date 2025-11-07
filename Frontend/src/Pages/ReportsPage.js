import React from "react";
import { useNavigate } from "react-router-dom";
import useReports from "../Hooks/useReports";


// Simple bar chart component
const SimpleBarChart = ({ data, dataKey1, dataKey2, color1, color2 }) => {
    const maxValue = Math.max(...data.map(d => (d[dataKey1] || 0) + (d[dataKey2] || 0)));
    
    return (
        <div className="h-[300px] flex items-end justify-between gap-2">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col-reverse gap-0.5 h-full">
                        {item[dataKey1] > 0 && (
                            <div
                                className="w-full rounded-t"
                                style={{
                                    height: `${(item[dataKey1] / maxValue) * 100}%`,
                                    backgroundColor: color1,
                                }}
                            />
                        )}
                        {item[dataKey2] > 0 && (
                            <div
                                className="w-full rounded-t"
                                style={{
                                    height: `${(item[dataKey2] / maxValue) * 100}%`,
                                    backgroundColor: color2,
                                }}
                            />
                        )}
                    </div>
                    <span className="text-xs text-slate-400">{item.name}</span>
                </div>
            ))}
        </div>
    );
};

// Simple line chart component
const SimpleLineChart = ({ data, dataKey, color }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey]));
    const minValue = Math.min(...data.map(d => d[dataKey]));
    const range = maxValue - minValue || 1;
    
    return (
        <div className="h-[300px] relative">
            <svg className="w-full h-full">
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={data.map((item, index) => {
                        const x = (index / (data.length - 1)) * 100;
                        const y = 100 - ((item[dataKey] - minValue) / range) * 80;
                        return `${x}%,${y}%`;
                    }).join(" ")}
                />
                {data.map((item, index) => {
                    const x = (index / (data.length - 1)) * 100;
                    const y = 100 - ((item[dataKey] - minValue) / range) * 80;
                    return (
                        <circle
                            key={index}
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r="4"
                            fill={color}
                        />
                    );
                })}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400">
                {data.map((item, index) => (
                    <span key={index}>{item.name}</span>
                ))}
            </div>
        </div>
    );
};

// Simple pie chart component
const SimplePieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
        <div className="h-[300px] flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200">
                {data.map((item, index) => {
                    const percentage = (item.value / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    currentAngle += angle;
                    
                    const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                    const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                    const x2 = 100 + 80 * Math.cos((currentAngle - 90) * Math.PI / 180);
                    const y2 = 100 + 80 * Math.sin((currentAngle - 90) * Math.PI / 180);
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    return (
                        <path
                            key={index}
                            d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={item.color}
                        />
                    );
                })}
            </svg>
            <div className="ml-8 space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-white">{item.name}: {item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function ReportsPage() {
    const navigate = useNavigate();
    const { stats, loading } = useReports();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Reports & Statistics</h1>
                    <p className="text-slate-400">Track your performance across tasks, points, and achievements</p>
                    <button
                        onClick={() => navigate("/calendar")}
                        className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Back to Calendar
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading statistics...</div>
                ) : stats ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                                <p className="text-sm text-slate-400 mb-2">Total Tasks Completed</p>
                                <p className="text-3xl font-bold text-blue-400">{stats.totalTasksCompleted}</p>
                                <p className="text-xs text-slate-400 mt-2">{stats.thisMonthTasks} this month</p>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                                <p className="text-sm text-slate-400 mb-2">Total Points Earned</p>
                                <p className="text-3xl font-bold text-blue-400">{stats.totalPoints.toLocaleString()}</p>
                                <p className="text-xs text-slate-400 mt-2">{stats.thisMonthPoints} this month</p>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                                <p className="text-sm text-slate-400 mb-2">Last 3 Months</p>
                                <p className="text-3xl font-bold text-blue-400">{stats.last3MonthsTasks}</p>
                                <p className="text-xs text-slate-400 mt-2">{stats.last3MonthsPoints} points</p>
                            </div>
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                                <p className="text-sm text-slate-400 mb-2">Avg Task Duration</p>
                                <p className="text-2xl font-bold text-blue-400">{stats.avgDuration} days</p>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                                <p className="text-sm text-slate-400 mb-2">Tasks by Priority</p>
                                <div className="mt-2 space-y-1">
                                    {Object.entries(stats.tasksByPriority).slice(0, 3).map(([priority, count]) => (
                                        <p key={priority} className="text-sm text-white">
                                            Priority {priority}: {count}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                                <p className="text-sm text-slate-400 mb-2">Tasks by Status</p>
                                <div className="mt-2 space-y-1">
                                    {Object.entries(stats.tasksByStatus).slice(0, 3).map(([status, count]) => (
                                        <p key={status} className="text-sm text-white capitalize">
                                            {status}: {count}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                                <p className="text-sm text-slate-400 mb-2">This Month Points</p>
                                <p className="text-2xl font-bold text-blue-400">{stats.thisMonthPoints}</p>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Tasks Completed Chart */}
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                                <h2 className="text-lg font-semibold text-white mb-4">Tasks Completed This Week</h2>
                                <SimpleBarChart
                                    data={stats.weekData}
                                    dataKey1="completed"
                                    dataKey2="pending"
                                    color1="#3b82f6"
                                    color2="#6b7280"
                                />
                                <div className="flex gap-4 justify-center mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-blue-500 rounded" />
                                        <span className="text-sm text-slate-400">Completed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-gray-500 rounded" />
                                        <span className="text-sm text-slate-400">Pending</span>
                                    </div>
                                </div>
                            </div>

                            {/* Points Over Time */}
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                                <h2 className="text-lg font-semibold text-white mb-4">Points Over 6 Weeks</h2>
                                <SimpleLineChart
                                    data={stats.pointsData}
                                    dataKey="points"
                                    color="#3b82f6"
                                />
                            </div>
                        </div>

                        {/* Achievement Distribution */}
                        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                            <h2 className="text-lg font-semibold text-white mb-4">Achievement Distribution</h2>
                            <div className="flex justify-center">
                                <SimplePieChart data={stats.achievements} />
                            </div>
                        </div>

                        {/* Achievement Breakdown */}
                        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                            <h2 className="text-lg font-semibold text-white mb-4">Recent Achievements</h2>
                            <div className="space-y-3">
                                {stats.recentAchievements.map((achievement, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700/80 transition-colors"
                                    >
                                        <div className="text-2xl">{achievement.icon}</div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-white text-sm">{achievement.name}</p>
                                            <p className="text-xs text-slate-400">{achievement.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 text-slate-400">No data available</div>
                )}
            </div>
        </div>
    );
}

import PropTypes from "prop-types";

SimpleBarChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    dataKey1: PropTypes.string.isRequired,
    dataKey2: PropTypes.string.isRequired,
    color1: PropTypes.string.isRequired,
    color2: PropTypes.string.isRequired,
};
SimpleLineChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    dataKey: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};
SimplePieChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            color: PropTypes.string,
        })
    ).isRequired,
};
    