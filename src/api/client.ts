import axios from "axios";

// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://meetbyvibe-com-100172.hostingersite.com/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);
