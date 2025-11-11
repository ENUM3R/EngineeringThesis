import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useRankings from "../Hooks/useRankings";

export default function RankingPage() {
    const navigate = useNavigate();
    const { rankings, achievements, loading, fetchUserStats } = useRankings();
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserStats, setSelectedUserStats] = useState(null);
    const [loadingUserStats, setLoadingUserStats] = useState(false);

    useEffect(() => {
        if (selectedUser) {
            setLoadingUserStats(true);
            fetchUserStats(selectedUser)
                .then((stats) => {
                    setSelectedUserStats(stats);
                })
                .catch((err) => {
                    console.error("Error fetching user stats:", err);
                    setSelectedUserStats(null);
                })
                .finally(() => {
                    setLoadingUserStats(false);
                });
        } else {
            setSelectedUserStats(null);
        }
    }, [selectedUser, fetchUserStats]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
                <div className="w-full max-w-6xl mx-auto space-y-8">
                    <div className="text-center py-20 text-slate-400">Loading rankings...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="w-full max-w-6xl mx-auto space-y-8">
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
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>🥇</span>
                                    Leaderboard
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-700">
                                {rankings.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-slate-400">
                                        No rankings available yet. Complete tasks to earn points and appear on the leaderboard!
                                    </div>
                                ) : (
                                    rankings.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                                            className="w-full px-6 py-4 hover:bg-slate-700/50 transition-colors text-left group"
                                        >
                                            <div className="flex items-center gap-4">
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

                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-400">{user.points.toLocaleString()}</p>
                                                    <p className="text-xs text-slate-400">points</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>⭐</span>
                                Achievements
                            </h2>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {achievements.length === 0 ? (
                                    <div className="text-center text-slate-400 text-sm py-4">No achievements available</div>
                                ) : (
                                    achievements.map((achievement) => (
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
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {selectedUser && (
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                        <div className="mb-4">
                            {loadingUserStats ? (
                                <div className="text-center py-8 text-slate-400">Loading user statistics...</div>
                            ) : selectedUserStats ? (
                                <>
                                    <h3 className="text-lg font-bold text-white mb-4">
                                        {selectedUserStats.username}s Statistics
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-slate-400 text-sm">Total Points</p>
                                            <p className="text-2xl font-bold text-white">
                                                {selectedUserStats.total_points.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-slate-400 text-sm">This Month</p>
                                            <p className="text-2xl font-bold text-white">
                                                {selectedUserStats.current_month.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-slate-400 text-sm">Last 3 Months</p>
                                            <p className="text-2xl font-bold text-white">
                                                {selectedUserStats.last3_months.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <h4 className="text-md font-semibold text-white mb-3">Achievements</h4>
                                    {selectedUserStats.achievements && selectedUserStats.achievements.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                            {selectedUserStats.achievements.map((achievement) => (
                                                <div
                                                    key={achievement.id}
                                                    className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500 transition-colors"
                                                >
                                                    <span className="text-3xl">{achievement.icon}</span>
                                                    <p className="text-center text-white text-xs font-semibold line-clamp-2">{achievement.title}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-400 py-4">No achievements earned yet</div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 text-slate-400">Failed to load user statistics</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

