import React from "react";
import { Navigate } from "react-router-dom";

const RoleRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  
  if (!token || !userJson) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userJson);

  if (!allowedRoles.includes(user.role)) {
    // If user is staff, redirect to staff dashboard
    if (user.role === "staff") {
      return <Navigate to="/staff/dashboard" replace />;
    }
    // Fallback redirect
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleRoute;
