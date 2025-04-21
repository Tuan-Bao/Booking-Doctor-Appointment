import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Login from "./pages/Login/Login";
import AdminDashboard from "./pages/Admin/Dashboard/Dashboard";
import DoctorDashboard from "./pages/Doctor/Dashboard/Dashboard";

const PrivateRoute = ({ children, role }) => {
  const storedRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role && storedRole !== role) {
    return <Navigate to="/login" />;
  }

  return children;
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
            path="/doctor/dashboard"
            element={
              <PrivateRoute role="doctor">
                <DoctorDashboard />
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
