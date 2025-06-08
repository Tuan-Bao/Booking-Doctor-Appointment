import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { isTokenValid, clearAuth } from "./utils/auth";
import { ToastContainer } from "react-toastify";
import { AppProvider } from "./context/AppContext";
import Login from "./pages/Login/Login";
import AdminHeader from "./components/Admin/Header/Header";
import AdminNavBar from "./components/Admin/NavBar/NavBar";
import AdminDashboard from "./pages/Admin/Dashboard/Dashboard";
import AdminAppointments from "./pages/Admin/Appointments/Appointments";
import AdminDoctorList from "./pages/Admin/Doctors List/DoctorList";
import AdminPatientList from "./pages/Admin/Patients List/PatientList";
import AdminSpecializations from "./pages/Admin/Specializations/Specializations";
import AdminDoctorDetails from "./pages/Admin/DoctorDetails/AdminDoctorDetails";
import AdminPatientDetails from "./pages/Admin/PatientDetails/AdminPatientDetails";

import DoctorHeader from "./components/Doctor/Header/Header";
import DoctorNavBar from "./components/Doctor/NavBar/NavBar";
import DoctorDashboard from "./pages/Doctor/Dashboard/Dashboard";
import DoctorAppointments from "./pages/Doctor/Appointments/Appointments";
import DoctorProfile from "./pages/Doctor/Profile/Profile";
import DoctorSchedule from "./pages/Doctor/Schedule/Schedule";
import DoctorPatientDetails from "./pages/Doctor/Patients/PatientDetails";

const PrivateRoute = ({ children, role }) => {
  const storedRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (!token || !isTokenValid(token)) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  if (role && storedRole !== role) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {role === "admin" && (
        <>
          <AdminHeader />
          <AdminNavBar />
          <div
            className="admin-content"
            style={{ marginLeft: "210px", marginTop: "70px", padding: "20px" }}
          >
            {children}
          </div>
        </>
      )}
      {role == "doctor" && (
        <>
          <DoctorHeader />
          <DoctorNavBar />
          <div
            className="doctor-content"
            style={{ marginLeft: "210px", marginTop: "70px", padding: "20px" }}
          >
            {children}
          </div>
        </>
      )}
    </>
  );
};

const DefaultRoute = () => {
  const storedRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (storedRole === "admin") {
    return <Navigate to="/admin/dashboard" />;
  }

  if (storedRole === "doctor") {
    return <Navigate to="/doctor/dashboard" />;
  }

  return <Navigate to="/login" />;
};

function App() {
  return (
    <AppProvider>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/appointments"
            element={
              <PrivateRoute role="admin">
                <AdminAppointments />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/specializations"
            element={
              <PrivateRoute role="admin">
                <AdminSpecializations />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/doctors-list"
            element={
              <PrivateRoute role="admin">
                <AdminDoctorList />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/patients-list"
            element={
              <PrivateRoute role="admin">
                <AdminPatientList />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/doctor/:user_id"
            element={
              <PrivateRoute role="admin">
                <AdminDoctorDetails />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/patient/:user_id"
            element={
              <PrivateRoute role="admin">
                <AdminPatientDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <PrivateRoute role="doctor">
                <DoctorDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/doctor/appointments"
            element={
              <PrivateRoute role="doctor">
                <DoctorAppointments />
              </PrivateRoute>
            }
          />

          <Route
            path="/doctor/profile"
            element={
              <PrivateRoute role="doctor">
                <DoctorProfile />
              </PrivateRoute>
            }
          />

          <Route
            path="/doctor/schedule"
            element={
              <PrivateRoute role="doctor">
                <DoctorSchedule />
              </PrivateRoute>
            }
          />

          <Route
            path="/doctor/patient/:user_id"
            element={
              <PrivateRoute role="doctor">
                <DoctorPatientDetails />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<DefaultRoute />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
