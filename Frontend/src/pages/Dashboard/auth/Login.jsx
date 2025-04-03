import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import "../../../styles/auth/AdminLogin.css";
import { login, googleAuth } from "../../../services/authService";
import { useAuth } from '../../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // Get login function from AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(formData);
      if (response.token && response.user) {
        // Update auth context with user data
        await authLogin(response.user, response.token);
        
        toast.success('Login successful!');
        
        // Navigate to dashboard after successful login
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = async () => {
    try {
      await googleAuth();
      toast.success('Google login successful!');
    } catch (err) {
      toast.error(err.message || "Google login failed");
    }
  };

  return (
    <div className="auth-container">
      <ToastContainer position="top-center" className="toast" />
      <div className="auth-card">
        <div>
          <h2 className="auth-title">Admin Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              id="email"
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
              id="password"
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
            <div>
              <Link to="/admin/forgot-password" className="auth-link">
                Forgot your password?
              </Link>
            </div>
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
