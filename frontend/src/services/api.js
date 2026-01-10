import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// AI Mentor
export const askMentor = (question) => {
  return axios.post(`${API_BASE}/mentor`, { question });
};

// Leaderboard
export const getLeaderboard = () => {
  return axios.get(`${API_BASE}/leaderboard`);
};

// (Optional – for later use)
export const runCode = (code) => {
  return axios.post(`${API_BASE}/run`, { code });
};
