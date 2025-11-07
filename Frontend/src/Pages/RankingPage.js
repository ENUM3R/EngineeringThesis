import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Mock data - in a real app, this would come from an API
const mockUsers = [
    { id: 1, rank: 1, name: "Alex Chen", points: 2850, currentMonth: 450, last3Months: 2100, avatar: "👨‍💻" },
    { id: 2, rank: 2, name: "Jordan Smith", points: 2620, currentMonth: 420, last3Months: 1950, avatar: "👩‍💼" },
    { id: 3, rank: 3, name: "Casey Williams", points: 2340, currentMonth: 380, last3Months: 1800, avatar: "👨‍🎨" },
    { id: 4, rank: 4, name: "Morgan Davis", points: 2100, currentMonth: 350, last3Months: 1650, avatar: "👩‍🚀" },
    { id: 5, rank: 5, name: "Taylor Johnson", points: 1890, currentMonth: 320, last3Months: 1500, avatar: "👨‍🏫" },
    { id: 6, rank: 6, name: "Riley Brown", points: 1650, currentMonth: 280, last3Months: 1350, avatar: "👩‍⚕️" },
    { id: 7, rank: 7, name: "Jordan Lee", points: 1420, currentMonth: 250, last3Months: 1200, avatar: "👨‍🍳" },
    { id: 8, rank: 8, name: "Casey Martinez", points: 1280, currentMonth: 220, last3Months: 1050, avatar: "👩‍🎭" },
];

// Achievements - easily expandable
const achievements = [
    { id: 1, title: "Rising Star", description: "Reach 500 points", icon: "⭐", points: 50 },
    { id: 2, title: "Champion", description: "Reach 2000 points", icon: "🏆", points: 200 },
    { id: 3, title: "Speed Demon", description: "Gain 100 points in one day", icon: "⚡", points: 100 },
    { id: 4, title: "Consistency King", description: "Maintain 7-day streak", icon: "🔥", points: 150 },
    { id: 5, title: "Elite Member", description: "Rank in top 10", icon: "💎", points: 300 },
    { id: 6, title: "Legendary", description: "Reach 3000 points", icon: "👑", points: 500 },
    { id: 7, title: "Task Master", description: "Complete 100 tasks", icon: "✅", points: 250 },
    { id: 8, title: "Early Bird", description: "Complete 10 tasks before 9 AM", icon: "🌅", points: 75 },
    { id: 9, title: "Night Owl", description: "Complete 10 tasks after 10 PM", icon: "🦉", points: 75 },
    { id: 10, title: "Weekend Warrior", description: "Complete 20 tasks on weekends", icon: "🏋️", points: 120 },
];

export default function RankingPage() {
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);

    // Mock: Get achievements for a user (in real app, this would come from API)
    const getUserAchievements = (userId) => {
        // Randomly assign some achievements for demo
        return achievements.filter((_, index) => index % 2 === userId % 2 || index < 3);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="w-full max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="text-4xl">🏆</span>
                        <h1 className="text-4xl font-bold text-white">Global Rankings</h1>
                        <span className="text-4xl">🏆</span>
                    </div>
                    <p className="text-slate-400">Compete with others and unlock achievements</p>
                    <button
                        onClick={() => navigate("/calendar")}
                        className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Back to Calendar
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Leaderboard */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>🥇</span>
                                    Leaderboard
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-700">
                                {mockUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                                        className="w-full px-6 py-4 hover:bg-slate-700/50 transition-colors text-left group"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Rank Badge */}
                                            <div
                                                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                                    user.rank === 1
                                                        ? "bg-yellow-500"
                                                        : user.rank === 2
                                                            ? "bg-slate-400"
                                                            : user.rank === 3
                                                                ? "bg-orange-500"
                                                                : "bg-slate-600"
                                                }`}
                                            >
                                                {user.rank}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{user.avatar}</span>
                                                    <div className="flex-1">
                                                        <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                                                            {user.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Points */}
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-400">{user.points.toLocaleString()}</p>
                                                <p className="text-xs text-slate-400">points</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Achievements Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>⭐</span>
                                Achievements
                            </h2>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {achievements.map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 hover:border-blue-500 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl flex-shrink-0">{achievement.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-semibold text-sm">{achievement.title}</h3>
                                                <p className="text-slate-400 text-xs">{achievement.description}</p>
                                                <p className="text-yellow-400 text-xs mt-1">{achievement.points} points</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected User Details */}
                {selectedUser && (
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-white mb-4">
                                {mockUsers.find((u) => u.id === selectedUser)?.name}s Statistics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <p className="text-slate-400 text-sm">Total Points</p>
                                    <p className="text-2xl font-bold text-white">
                                        {mockUsers.find((u) => u.id === selectedUser)?.points.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <p className="text-slate-400 text-sm">This Month</p>
                                    <p className="text-2xl font-bold text-white">
                                        {mockUsers.find((u) => u.id === selectedUser)?.currentMonth.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <p className="text-slate-400 text-sm">Last 3 Months</p>
                                    <p className="text-2xl font-bold text-white">
                                        {mockUsers.find((u) => u.id === selectedUser)?.last3Months.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <h4 className="text-md font-semibold text-white mb-3">Achievements</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {getUserAchievements(selectedUser).map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500 transition-colors"
                                    >
                                        <span className="text-3xl">{achievement.icon}</span>
                                        <p className="text-center text-white text-xs font-semibold line-clamp-2">{achievement.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

