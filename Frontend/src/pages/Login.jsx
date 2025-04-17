import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData);
      toast.success("Login successful!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Header />
      <div className="auth-container">
        <ToastContainer position="top-center" className="toast" />
        <div className="auth-card">
          <h2 className="auth-title">Login</h2>

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
              <Link to="/forgot-password" className="auth-link">
                Forgot your password?
              </Link>
            </div>

            <div className="form-group">
              <button
                type="submit"
                disabled={isLoading}
                className="auth-button"
              >
                {isLoading ? "Signing in..." : "Sign in as Admin"}
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link to="/register" className="auth-link">
              Don't have an admin account? Sign up
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
