import React, {createContext, useState, useEffect} from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [access, setAccess] = useState(localStorage.getItem("access") || null);
    const [refresh, setRefresh] = useState(localStorage.getItem("refresh") || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (access) {
            api.get("/auth/user/", {headers: {Authorization: `Bearer ${access}`}})
                .then(res => setUser(res.data))
                .catch(() => setUser(null))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [access]);

    const login = async (username, password) => {
        const res = await api.post("/auth/login/", {username, password});
        setAccess(res.data.access);
        setRefresh(res.data.refresh);
        setUser(res.data.user);
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
    };

    const logout = () => {
        setAccess(null);
        setRefresh(null);
        setUser(null);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
    };

    const refreshToken = async () => {
        if (!refresh) return;
        const res = await api.post("/auth/refresh/", {refresh});
        setAccess(res.data.access);
        localStorage.setItem("access", res.data.access);
    };

    return (
        <AuthContext.Provider value={{user, access, login, logout, refreshToken, loading}}>
            {children}
        </AuthContext.Provider>
    );
};