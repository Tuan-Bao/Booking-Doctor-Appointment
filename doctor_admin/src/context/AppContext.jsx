import { createContext, useState, useContext } from "react";
import axios from "axios";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:5000/api";

  const login = async (email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = role === "admin" ? "admin/login" : "doctor/login";
      const response = await axios.post(
        `${API_URL}/${endpoint}`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data.message === "Success") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        return { success: true, role: data.role };
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  const contextValue = {
    loading,
    error,
    login,
    logout,
    API_URL,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
