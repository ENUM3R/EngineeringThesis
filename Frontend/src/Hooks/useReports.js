import { useState, useEffect } from "react";
import axios from "axios";
import useTasks from "./useTasks";

const API_URL = "http://127.0.0.1:8000/api/tasks/";

export default function useReports() {
    const { events, doneEvents, fetchEvents } = useTasks();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateStats();
    }, [events, doneEvents]);

    const calculateStats = async () => {
        setLoading(true);
        try {
            // Fetch all tasks including done ones
            const allTasks = [...events, ...doneEvents];
            
            const now = new Date();
            const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            
            // Tasks by month
            const thisMonthTasks = allTasks.filter(task => {
                const taskDate = new Date(task.end);
                return taskDate >= currentMonth && task.status === "done";
            });
            
            const last3MonthsTasks = allTasks.filter(task => {
                const taskDate = new Date(task.end);
                return taskDate >= threeMonthsAgo && task.status === "done";
            });
            
            // Points earned
            const thisMonthPoints = thisMonthTasks.reduce((sum, task) => sum + (task.points || 0), 0);
            const last3MonthsPoints = last3MonthsTasks.reduce((sum, task) => sum + (task.points || 0), 0);
            const totalPoints = allTasks.filter(t => t.status === "done").reduce((sum, task) => sum + (task.points || 0), 0);
            
            // Tasks by priority
            const tasksByPriority = {};
            allTasks.forEach(task => {
                const priority = task.priority || 0;
                tasksByPriority[priority] = (tasksByPriority[priority] || 0) + 1;
            });
            
            // Tasks by status
            const tasksByStatus = {};
            allTasks.forEach(task => {
                const status = task.status || "pending";
                tasksByStatus[status] = (tasksByStatus[status] || 0) + 1;
            });
            
            // Task durations
            const taskDurations = allTasks
                .filter(task => task.start && task.end)
                .map(task => {
                    const start = new Date(task.start);
                    const end = new Date(task.end);
                    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                });
            
            const avgDuration = taskDurations.length > 0
                ? Math.round(taskDurations.reduce((a, b) => a + b, 0) / taskDurations.length)
                : 0;
            
            // Weekly task completion (last 7 days)
            const weekData = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                const dayTasks = allTasks.filter(task => {
                    const taskDate = new Date(task.end);
                    return taskDate.toDateString() === date.toDateString() && task.status === "done";
                });
                const pendingTasks = allTasks.filter(task => {
                    const taskDate = new Date(task.end);
                    return taskDate.toDateString() === date.toDateString() && task.status !== "done" && task.status !== "abandoned";
                });
                weekData.push({
                    name: dayName,
                    completed: dayTasks.length,
                    pending: pendingTasks.length
                });
            }
            
            // Points over time (last 6 weeks)
            const pointsData = [];
            for (let i = 5; i >= 0; i--) {
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - (i * 7));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                const weekTasks = allTasks.filter(task => {
                    const taskDate = new Date(task.end);
                    return taskDate >= weekStart && taskDate <= weekEnd && task.status === "done";
                });
                
                const weekPoints = weekTasks.reduce((sum, task) => sum + (task.points || 0), 0);
                pointsData.push({
                    name: `Week ${6 - i}`,
                    points: weekPoints
                });
            }
            
            // Achievements (mock for now - in real app would come from API)
            const achievements = [
                { name: "Gold", value: Math.floor(thisMonthTasks.length / 10), color: "#fbbf24" },
                { name: "Silver", value: Math.floor(thisMonthTasks.length / 5), color: "#c7d2fe" },
                { name: "Bronze", value: thisMonthTasks.length, color: "#d97706" },
            ];
            
            setStats({
                totalTasksCompleted: allTasks.filter(t => t.status === "done").length,
                thisMonthTasks: thisMonthTasks.length,
                last3MonthsTasks: last3MonthsTasks.length,
                totalPoints,
                thisMonthPoints,
                last3MonthsPoints,
                tasksByPriority,
                tasksByStatus,
                avgDuration,
                weekData,
                pointsData,
                achievements,
                recentAchievements: thisMonthTasks.slice(-4).map(task => ({
                    name: task.title,
                    description: `Completed on ${new Date(task.end).toLocaleDateString()}`,
                    icon: "✅",
                    points: task.points || 0
                }))
            });
        } catch (error) {
            console.error("Error calculating stats:", error);
        } finally {
            setLoading(false);
        }
    };

    return { stats, loading, refreshStats: calculateStats };
}

