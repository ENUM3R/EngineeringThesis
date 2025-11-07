import axios from "axios";
import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000/api";

export function useAuth() {
    const [points, setPoints] = useState(0);
    const [totalPointsEarned, setTotalPointsEarned] = useState(0);
    const [pointsSpent, setPointsSpent] = useState(0);

    const getProfile = async () => {
        try {
            const res = await axios.get(`${API_URL}/profile/me/`);
            setPoints(res.data.current_points || 0);
            setTotalPointsEarned(res.data.total_points_earned || 0);
            setPointsSpent(res.data.points_spent || 0);
        } catch (err) {
            console.log("Profile load failed", err);
        }
    };

    const login = async (username, password) => {
        const response = await axios.post(`${API_URL}/token/`, { username, password });
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);

        await getProfile();
        return response.data;
    };


    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setPoints(0);
        setTotalPointsEarned(0);
        setPointsSpent(0);
    };

    const getAccessToken = () => localStorage.getItem("access");
    const refreshToken = async () => {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) throw new Error("No refresh token");

        const response = await axios.post(`${API_URL}/token/refresh/`, { refresh });
        localStorage.setItem("access", response.data.access);
        return response.data.access;
    };

    const register = async (username, email, password) => {
        await axios.post(`${API_URL}/register/`, { username, email, password });
        await login(username, password);
    };

    axios.interceptors.request.use((config) => {
        const token = getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    axios.interceptors.response.use(
        res => res,
        async (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const newToken = await refreshToken();
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axios(originalRequest);
                } catch {
                    logout();
                    window.location.href = "/login";
                }
            }
            return Promise.reject(error);
        }
    );

    useEffect(() => {
        if (getAccessToken()) getProfile();
    }, []);

    // Available points = current_points - points_spent
    const availablePoints = points - pointsSpent;
    
    return { login, register, logout, points, totalPointsEarned, pointsSpent, availablePoints, getAccessToken, getProfile };
}
