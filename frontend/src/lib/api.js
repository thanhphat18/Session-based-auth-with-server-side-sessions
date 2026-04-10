import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const authClient = axios.create({
  baseURL: `${apiBaseUrl}/api/auth`,
  withCredentials: true,
});
