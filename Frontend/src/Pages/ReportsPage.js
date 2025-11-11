import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useReports from "../Hooks/useReports";

const SimpleBarChart = ({ data, dataKey1, dataKey2, color1, color2, xAxisLabel, yAxisLabel }) => {
    const maxValue = Math.max(...data.map(d => Math.max((d[dataKey1] || 0), (d[dataKey2] || 0))), 1);
    const yAxisTicks = 5;
    const tickValues = [];
    for (let i = 0; i <= yAxisTicks; i++) {
        tickValues.push(Math.round((maxValue / yAxisTicks) * i));
    }
    
    return (
        <div className="w-full">
            {yAxisLabel && (
                <div className="text-center text-sm text-slate-400 mb-2">{yAxisLabel}</div>
            )}
            <div className="flex gap-4">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between text-xs text-slate-400 pb-6" style={{ minWidth: '40px' }}>
                    {tickValues.reverse().map((value, idx) => (
                        <span key={idx}>{value}</span>
                    ))}
                </div>
                
                <div className="flex-1">
                    <div className="h-[250px] flex items-end justify-between gap-2 pb-6 relative">
                        <div className="absolute inset-0 flex flex-col justify-between">
                            {tickValues.map((_, idx) => (
                                <div key={idx} className="border-t border-slate-700"></div>
                            ))}
                        </div>
                        
                        {data.map((item, index) => {
                            const height1 = maxValue > 0 ? (item[dataKey1] || 0) / maxValue * 100 : 0;
                            const height2 = maxValue > 0 ? (item[dataKey2] || 0) / maxValue * 100 : 0;
                            
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full relative z-10">
                                    <div className="w-full h-full flex flex-col-reverse items-center justify-end gap-0.5">
                                        {item[dataKey1] > 0 && (
                                            <div
                                                className="w-full rounded-t relative group"
                                                style={{
                                                    height: `${height1}%`,
                                                    backgroundColor: color1,
                                                    minHeight: height1 > 0 ? '2px' : '0',
                                                }}
                                                title={`${dataKey1}: ${item[dataKey1]}`}
                                            >
                                                {height1 > 10 && (
                                                    <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-white whitespace-nowrap">
                                                        {item[dataKey1]}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {item[dataKey2] > 0 && (
                                            <div
                                                className="w-full rounded-t relative group"
                                                style={{
                                                    height: `${height2}%`,
                                                    backgroundColor: color2,
                                                    minHeight: height2 > 0 ? '2px' : '0',
                                                }}
                                                title={`${dataKey2}: ${item[dataKey2]}`}
                                            >
                                                {height2 > 10 && (
                                                    <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-white whitespace-nowrap">
                                                        {item[dataKey2]}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400 mt-1">{item.name}</span>
                                </div>
                            );
                        })}
                    </div>
                    {xAxisLabel && (
                        <div className="text-center text-sm text-slate-400 mt-2">{xAxisLabel}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SimpleLineChart = ({ data, dataKey, color, xAxisLabel, yAxisLabel }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey] || 0));
    const minValue = Math.min(...data.map(d => d[dataKey] || 0));
    const range = maxValue - minValue || 1;
    const yAxisTicks = 5;
    const tickValues = [];
    for (let i = 0; i <= yAxisTicks; i++) {
        tickValues.push(Math.round(minValue + (range / yAxisTicks) * i));
    }
    
    const svgWidth = 800;
    const svgHeight = 250;
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;
    
    const coords = data.map((item, index) => {
        const x = padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
        const normalizedY = range > 0 ? (item[dataKey] - minValue) / range : 0.5;
        const y = padding.top + (1 - normalizedY) * chartHeight;
        return { x, y, value: item[dataKey], label: item.name };
    });
    
    const points = coords.map(c => `${c.x},${c.y}`).join(' ');
    
    return (
        <div className="w-full">
            {yAxisLabel && (
                <div className="text-center text-sm text-slate-400 mb-2">{yAxisLabel}</div>
            )}
            <div className="flex gap-4">
                <div className="flex flex-col justify-between text-xs text-slate-400" style={{ minWidth: '50px', height: `${svgHeight}px` }}>
                    {tickValues.reverse().map((value, idx) => (
                        <span key={idx}>{value}</span>
                    ))}
                </div>
                
                <div className="flex-1" style={{ height: `${svgHeight}px` }}>
                    <svg 
                        width="100%" 
                        height="100%" 
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        preserveAspectRatio="xMidYMid meet"
                        className="overflow-visible"
                    >
                        {tickValues.map((tickValue, idx) => {
                            const y = padding.top + (idx / (tickValues.length - 1)) * chartHeight;
                            return (
                                <line
                                    key={idx}
                                    x1={padding.left}
                                    y1={y}
                                    x2={svgWidth - padding.right}
                                    y2={y}
                                    stroke="#475569"
                                    strokeWidth="1"
                                    opacity="0.3"
                                />
                            );
                        })}
                        
                        <line
                            x1={padding.left}
                            y1={padding.top}
                            x2={padding.left}
                            y2={svgHeight - padding.bottom}
                            stroke="#64748b"
                            strokeWidth="2"
                        />
                        
                        <line
                            x1={padding.left}
                            y1={svgHeight - padding.bottom}
                            x2={svgWidth - padding.right}
                            y2={svgHeight - padding.bottom}
                            stroke="#64748b"
                            strokeWidth="2"
                        />
                        
                        <polyline
                            fill="none"
                            stroke={color}
                            strokeWidth="3"
                            points={points}
                        />
                        
                        {coords.map((coord, index) => (
                            <g key={index}>
                                <circle
                                    cx={coord.x}
                                    cy={coord.y}
                                    r="6"
                                    fill={color}
                                    stroke="#fff"
                                    strokeWidth="2"
                                />
                                <text
                                    x={coord.x}
                                    y={coord.y - 15}
                                    textAnchor="middle"
                                    fill="#fff"
                                    fontSize="12"
                                    fontWeight="600"
                                >
                                    {coord.value}
                                </text>
                            </g>
                        ))}
                        
                        {data.map((item, index) => {
                            const x = padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
                            return (
                                <text
                                    key={index}
                                    x={x}
                                    y={svgHeight - padding.bottom + 25}
                                    textAnchor="middle"
                                    fill="#94a3b8"
                                    fontSize="12"
                                >
                                    {item.name}
                                </text>
                            );
                        })}
                    </svg>
                </div>
            </div>
            {xAxisLabel && (
                <div className="text-center text-sm text-slate-400 mt-2">{xAxisLabel}</div>
            )}
        </div>
    );
};

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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                                <h2 className="text-lg font-semibold text-white mb-6">Tasks Completed This Week</h2>
                                <SimpleBarChart
                                    data={stats.weekData}
                                    dataKey1="completed"
                                    dataKey2="pending"
                                    color1="#3b82f6"
                                    color2="#6b7280"
                                    xAxisLabel="Day of Week"
                                    yAxisLabel="Number of Tasks"
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

                            <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                                <h2 className="text-lg font-semibold text-white mb-6">Points Over 6 Weeks</h2>
                                <SimpleLineChart
                                    data={stats.pointsData}
                                    dataKey="points"
                                    color="#3b82f6"
                                    xAxisLabel="Week"
                                    yAxisLabel="Points Earned"
                                />
                            </div>
                        </div>
                        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                            <h2 className="text-lg font-semibold text-white mb-4">Achievement Distribution</h2>
                            <div className="flex justify-center">
                                <SimplePieChart data={stats.achievements} />
                            </div>
                        </div>
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
    xAxisLabel: PropTypes.string,
    yAxisLabel: PropTypes.string,
};
SimpleLineChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    dataKey: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    xAxisLabel: PropTypes.string,
    yAxisLabel: PropTypes.string,
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
    