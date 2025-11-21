import { useState, useEffect } from "react";
import axios from "axios";
import { api } from "../config/api";

const RANKINGS_ENDPOINT = "/profile/rankings/";
const ACHIEVEMENTS_ENDPOINT = "/profile/achievements/";
const userStatsEndpoint = (userId) => `/profile/${userId}/user_stats/`;

export default function useRankings() {
    const [rankings, setRankings] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const authHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
    });

    const fetchRankings = async () => {
        try {
            const response = await axios.get(api(RANKINGS_ENDPOINT), authHeader());
            setRankings(response.data);
        } catch (err) {
            console.error("Error fetching rankings:", err);
            setError(err.message);
        }
    };

    const fetchAchievements = async () => {
        try {
            const response = await axios.get(api(ACHIEVEMENTS_ENDPOINT), authHeader());
            setAchievements(response.data);
        } catch (err) {
            console.error("Error fetching achievements:", err);
            setError(err.message);
        }
    };

    const fetchUserAchievements = async (userId) => {
        try {
            const response = await axios.get(api(userStatsEndpoint(userId)), authHeader());
            return response.data.achievements || [];
        } catch (err) {
            console.error("Error fetching user achievements:", err);
            return [];
        }
    };

    const fetchUserStats = async (userId) => {
        try {
            const response = await axios.get(api(userStatsEndpoint(userId)), authHeader());
            return response.data;
        } catch (err) {
            console.error("Error fetching user stats:", err);
            return null;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            await Promise.all([fetchRankings(), fetchAchievements()]);
            setLoading(false);
        };
        loadData();
    }, []);

    return {
        rankings,
        achievements,
        loading,
        error,
        fetchUserAchievements,
        fetchUserStats,
        refreshRankings: fetchRankings,
        refreshAchievements: fetchAchievements,
    };
}

