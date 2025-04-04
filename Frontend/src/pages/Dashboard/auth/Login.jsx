import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/auth/AdminLogin.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(formData);
      toast.success("Login successful!");
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await googleLogin();
      toast.success("Google login successful!");
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);
    } catch (err) {
      toast.error(err.message || "Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container">
      <ToastContainer position="top-center" className="toast" />
      <div className="auth-card">
        <h2 className="auth-title">Admin Login</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              name="email"
              type="email"
              required
              className="auth-input"
              placeholder="Admin Email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          <div className="form-group password-input-wrapper-login">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="auth-input"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="flex-between">
            <Link to="/admin/forgot-password" className="auth-link">
              Forgot your password?
            </Link>
          </div>

          <div className="form-group">
            <button type="submit" disabled={isLoading} className="auth-button">
              {isLoading ? "Signing in..." : "Sign in as Admin"}
            </button>
          </div>

          <div className="form-group">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="google-button"
              disabled={isLoading}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="google-icon"
              />
              Sign in with Google
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link to="/admin/register" className="auth-link">
            Don't have an admin account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
