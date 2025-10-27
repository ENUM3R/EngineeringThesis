import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// Login user
export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/token/`, { username, password });
    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    return response.data;
};

// Logout user
export const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
};

// Get access token
export const getAccessToken = () => localStorage.getItem("access");

// Refresh token
export const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw new Error("No refresh token");

    try {
        const response = await axios.post(`${API_URL}/token/refresh/`, { refresh });
        localStorage.setItem("access", response.data.access);
        return response.data.access;
    } catch (err) {
        logout();
        throw err;
    }
};

// Register user
export const register = async (username, email, password) => {
    return axios.post(`${API_URL}/register/`, { username, email, password });
};

// Axios interceptors
axios.interceptors.request.use(
    async (config) => {
        const token = getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

axios.interceptors.response.use(
    (response) => response,
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
