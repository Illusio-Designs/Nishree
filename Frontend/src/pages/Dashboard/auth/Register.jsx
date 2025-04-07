import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../styles/auth/Register.css";
import { register } from "../../../services/authService";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin", // Added role field with default value 'admin'
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "admin",
      });
      if (response.token) {
        toast.success("Registration successful!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <ToastContainer position="top-center" className="toast" />
      <div className="register-card">
        <div>
          <h2 className="register-title">Create Admin Account</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              id="username"
              name="username"
              type="text"
              required
              className="register-input"
              placeholder="Admin Username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>
          <div className="input-group">
            <input
              id="email"
              name="email"
              type="email"
              required
              className="register-input"
              placeholder="Admin Email address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="register-input"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="register-input"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? "Registering Admin..." : "Register as Admin"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link to="/admin/login" className="login-link">
            Already have an admin account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
