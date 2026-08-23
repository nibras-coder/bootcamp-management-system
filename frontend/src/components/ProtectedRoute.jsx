import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If the user's role is not in the allowed roles, redirect
    // based on their actual role or simply go home.
    if (user.role === "admin")
      return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "mentor")
      return <Navigate to="/mentor-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
