// src/components/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  // Nếu đã login rồi (có token) thì redirect về root
  if (token) {
    return <Navigate to="/" replace />;
  }
  // Ngược lại hiển thị component con (ví dụ Login)
  return children;
};

export default PublicRoute;
