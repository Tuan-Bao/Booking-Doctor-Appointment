import { createContext, useState, useContext } from "react";
import axios from "axios";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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
        setUser({
          token: data.token,
          role: data.role,
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        return { success: true, role: data.role };
      } else {
        throw new Error(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Đăng nhập thất bại";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <AppContext.Provider
      value={{ user, loading, error, login, logout, API_URL }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
