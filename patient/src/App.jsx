import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home/Home";
import Doctor from "./pages/Doctor/Doctor";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Login from "./pages/Login/Login";
import Navbar from "./components/Navbar/Navbar";
import MyProfile from "./pages/MyProfile/MyProfile";
import MyAppointments from "./pages/MyAppointments/MyAppointments";
import MyPayments from "./pages/MyPayments/MyPayments";
import Appointment from "./pages/Appointment/Appointment";
import Footer from "./components/Footer/Footer";
import PayAppointment from "./pages/PayAppointment/PayAppointment";
import ChangePassword from "./pages/ChangePassword/ChangePassword";
import { AppContextProvider } from "./context/AppContext";
import PrivateRoute from "./utils/PrivateRoute";
import PublicRoute from "./utils/PublicRoute";

const App = () => {
  return (
    <AppContextProvider>
      <div className="app">
        <ToastContainer />
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctor />} />
          <Route path="/doctors/:speciality_id" element={<Doctor />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/my-profile"
            element={
              <PrivateRoute>
                <MyProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <PrivateRoute>
                <MyAppointments />
              </PrivateRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <PrivateRoute>
                <MyPayments />
              </PrivateRoute>
            }
          />
          <Route
            path="/payment/:appointment_id"
            element={
              <PrivateRoute>
                <PayAppointment />
              </PrivateRoute>
            }
          />
          <Route
            path="/appointment/:user_id"
            element={
              <PrivateRoute>
                <Appointment />
              </PrivateRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <ChangePassword />
              </PrivateRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
    </AppContextProvider>
  );
};

export default App;
