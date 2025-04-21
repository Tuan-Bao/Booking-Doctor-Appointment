import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import "./Login.css";
import { assets } from "../../assets/assets";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAppContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "doctor",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, role } = formData;

    if (!email || !password) {
      return;
    }

    const result = await login(email, password, role);

    if (result.success) {
      if (result.role === "admin") {
        navigate("/admin/dashboard");
      } else if (result.role === "doctor") {
        navigate("/doctor/dashboard");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form-container">
          <h1 className="login-title">Login To Your Account!</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input"
              >
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
        <div className="login-image">
          <img src={assets.appointment_img} alt="Login" />
        </div>
      </div>
    </div>
  );
};

export default Login;
