import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Login from "./pages/Login/Login";
import AdminHeader from "./components/Admin/Header/Header";
import AdminNavBar from "./components/Admin/NavBar/NavBar";
import AdminDashboard from "./pages/Admin/Dashboard/Dashboard";
import AdminAppointments from "./pages/Admin/Appointments/Appointments";
import AdminDoctorList from "./pages/Admin/Doctors List/DoctorList";
import AdminPatientList from "./pages/Admin/Patients List/PatientList";
import AdminSpecializations from "./pages/Admin/Specializations/Specializations";

import DoctorHeader from "./components/Doctor/Header/Header";
import DoctorNavBar from "./components/Doctor/NavBar/NavBar";
import DoctorDashboard from "./pages/Doctor/Dashboard/Dashboard";
import DoctorAppointments from "./pages/Doctor/Appointments/Appointments";
import DoctorProfile from "./pages/Doctor/Profile/Profile";

const PrivateRoute = ({ children, role }) => {
  const storedRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role && storedRole !== role) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      {role === "admin" && (
        <>
          <AdminHeader />
          <AdminNavBar />
          <div
            className="admin-content"
            style={{ marginLeft: "250px", marginTop: "50px", padding: "20px" }}
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
            style={{ marginLeft: "250px", marginTop: "50px", padding: "20px" }}
          >
            {children}
          </div>
        </>
      )}
    </>
  );
};

function App() {
  return (
    <AppProvider>
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

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
