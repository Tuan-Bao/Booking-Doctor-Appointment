import React, { useState } from "react";
import "./Login.css";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { API_URL, setToken } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/patient/login`, {
          email: form.email,
          password: form.password,
        });
        if (res.data.message === "Success") {
          setToken(res.data.token);
          localStorage.setItem("token", res.data.token);
          toast.success("Login successful!");
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          setError(res.data.message);
          // console.log(res.data);
        }
      } else {
        const res = await axios.post(`${API_URL}/patient/register`, {
          username: form.username,
          email: form.email,
          password: form.password,
        });
        if (res.data.message === "Success") {
          toast.success(
            "Register successful! Please check your email to verify."
          );
          setTimeout(() => {
            setIsLogin(true);
          }, 1000);
        } else {
          setError(res.data.message);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* <div className="login-tabs">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div> */}
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <p className="login-desc">
          {isLogin
            ? "Please login to book appointment"
            : "Create an account to book appointment"}
        </p>
        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}
        <div className="login-switch">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <span onClick={() => setIsLogin(false)}>Register here</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setIsLogin(true)}>Login here</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
