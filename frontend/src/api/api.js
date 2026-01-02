import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// attach token automatically
api.interceptors.request.use((req) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default api;
