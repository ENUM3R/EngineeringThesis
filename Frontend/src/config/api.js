const DEFAULT_API_BASE = "http://127.0.0.1:8000/api";

export const API_BASE = process.env.REACT_APP_API_URL || DEFAULT_API_BASE;
export const api = (endpoint = "") => `${API_BASE}${endpoint}`;
