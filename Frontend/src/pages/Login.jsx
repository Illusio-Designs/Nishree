import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from "react-icons/fa";
import { createUseStyles } from "react-jss";
// React-JSS styles
const useStyles = createUseStyles({
  "@keyframes slideLeft": {
    from: {
      opacity: 0,
      transform: "translateX(30px) scale(0.98)",
    },
    to: {
      opacity: 1,
      transform: "translateX(0px) scale(1)",
    },
  },
  "@keyframes spin": {
    to: {
      transform: "rotate(360deg)",
    },
  },
  loginContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7fa",
    padding: "1rem",
  },
  loginCard: {
    animation: "$slideLeft ease-in 0.3s",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
    borderRadius: "12px",
    width: "100%",
    padding: "2.5rem",
    background: "#fff",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
    },
  },
  loginSubtitle: {
    color: "#64748b",
    marginTop: "0.5rem",
    fontSize: "0.95rem",
  },
  inputIconWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    color: "#94a3b8",
    fontSize: "1rem",
  },
  authInput: {
    width: "100%",
    padding: "0.75rem 2.75rem",
    marginBottom: "0rem",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorMessage: {
    color: "#ef4444",
    fontSize: "0.875rem",
    marginTop: "0.5rem",
    marginBottom: "0",
  },
  passwordInputWrapper: {
    position: "relative",
  },
  passwordToggle: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: "5px",
    fontSize: "1rem",
    transition: "color 0.2s",
    "&:hover": {
      color: "#3b82f6",
    },
  },
  loginOptions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "1.25rem 0",
    "@media (max-width: 640px)": {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "1rem",
    },
  },
  rememberMe: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  rememberCheckbox: {
    width: "18px",
    height: "18px",
    accentColor: "#3b82f6",
    cursor: "pointer",
  },
});

const Login = () => {
  const classes = useStyles();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      await login(formData);
      toast.success("Login successful!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(
        err.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  return (
    <>
      <Header />
      <div className={`auth-container ${classes.loginContainer}`}>
        <ToastContainer position="top-center" className="toast" />
        <div className={`auth-card ${classes.loginCard}`}>
          <div className={classes.loginHeader}>
            <h1 className={`auth-title ${classes.loginTitle}`}> Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className={`form-group ${classes.formGroup}`}>
              <div className={classes.inputIconWrapper}>
                <FaEnvelope className={classes.inputIcon} />
                <input
                  name="email"
                  type="email"
                  required
                  className={`auth-input ${classes.authInput} ${
                    errors.email ? classes.inputError : ""
                  }`}
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className={classes.errorMessage}>{errors.email}</p>
              )}
            </div>

            <div className={`form-group ${classes.formGroup}`}>
              <div
                className={`${classes.inputIconWrapper} ${classes.passwordInputWrapper}`}
              >
                <FaLock className={classes.inputIcon} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`auth-input ${classes.authInput} ${
                    errors.password ? classes.inputError : ""
                  }`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={classes.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className={classes.errorMessage}>{errors.password}</p>
              )}
            </div>

            <div className={classes.loginOptions}>
              <div className={classes.rememberMe}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className={classes.rememberCheckbox}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <Link
                to="/forgot-password"
                className={`auth-link ${classes.forgotLink}`}
              >
                Forgot your password?
              </Link>
            </div>

            <div className={`form-group ${classes.formGroup}`}>
              <button
                type="submit"
                disabled={isLoading}
                className={`auth-button ${classes.loginButton}`}
              >
                {isLoading ? (
                  <>
                    <span className={classes.spinner}></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className={`text-center ${classes.signupPrompt}`}>
            <p>
              Don't have an admin account?{" "}
              <Link
                to="/register"
                className={`auth-link ${classes.signupLink}`}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
