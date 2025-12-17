// frontend/src/api/axios.js
import axios from "axios";
import { AuthContext } from "../auth/AuthContext.jsx";
import { useContext } from "react";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

let interceptorsAttached = false;

export const useAxios = () => {
  const { access, refreshToken } = useContext(AuthContext);

  if (!interceptorsAttached) {
    interceptorsAttached = true;

    api.interceptors.request.use(
      (config) => {
        const token = access || localStorage.getItem("access");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    api.interceptors.response.use(
      (res) => res,
      async (err) => {
        if (err.response?.status === 401) {
          await refreshToken();
        }
        return Promise.reject(err);
      }
    );
  }

  return api;
};

export const useAnalyticsApi = () => {
  const axiosInstance = useAxios();

  const fetchAnalytics = (lottery) => {
    return axiosInstance.get("/lottery/analytics/", {
      params: { lottery },
    });
  };

  return { fetchAnalytics };
};

export default api;