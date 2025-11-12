import axios from "axios";

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL + "/api"
    : "https://fullstack-project-k2zq.onrender.com/api"; // fallback

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

console.log("🌐 Using API Base URL:", axiosInstance.defaults.baseURL);
