import React from "react";
import { Navigate } from "react-router-dom";
import { isTokenValid, clearAuth } from "./auth";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token || !isTokenValid(token)) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;
