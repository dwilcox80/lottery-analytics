import React, {useContext} from "react";
import {AuthContext} from "./AuthContext.jsx";
import {Navigate} from "react-router-dom";

export default function ProtectedRoute({children}) {
    const {user, loading} = useContext(AuthContext);

    if (loading) return null; // or a spinner

    if (!user) return <Navigate to="/login" replace/>;

    return children;
}