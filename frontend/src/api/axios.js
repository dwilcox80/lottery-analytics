import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export function fetchAnalytics(lottery) {
  return api.get(`/lottery/analytics/`, {
    params: { lottery },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });
}