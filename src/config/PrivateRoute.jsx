// PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ isAdminRequired }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));

  if (!user || (isAdminRequired && !user.is_admin)) {
    // Redirect to login or homepage if not admin
    return <Navigate to="/login" />;
  }

  return <Outlet />; // Render nested routes
};

export default PrivateRoute;
