import { createContext, useEffect, useState, useContext } from "react";
// import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );
  const [userData, setUserData] = useState(null);

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
    setUserData(null);
  };

  const fetchUserData = async () => {
    const res = await axios.get(`${API_URL}/patient/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUserData(res.data.user);
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const API_URL = "http://localhost:5000/api";
  const currencySymbol = "₹";

  const value = {
    API_URL,
    token,
    setToken,
    userData,
    setUserData,
    logout,
    currencySymbol,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
