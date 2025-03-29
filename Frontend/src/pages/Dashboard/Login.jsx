import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, googleAuth } from '../../services/api';
import './Styles/Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import GoogleLogin from 'react-google-login';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login({ email, password });
            if (rememberMe) {
                localStorage.setItem('email', email);
            }
            localStorage.setItem('token', response.token);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        setLoading(true);
        try {
            // First authenticate with Google
            const googleToken = response.tokenId;
            await googleAuth({ googleToken });
            
            // Then handle the callback
            window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/callback`;
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
        <div className="container">
            <div className="form-box">
                <h2>Welcome Back</h2>
                
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group password-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
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

                    <div className="form-group remember-me">
                        <label>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Remember me
                        </label>
                        <a href="/forgot-password" className="forgot-password">
                            Forgot Password?
                        </a>
                    </div>

                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="or-divider">
                        <div></div>
                        <span>OR</span>
                        <div></div>
                    </div>

                    <div className="form-group">
                        <GoogleLogin
                            clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                            buttonText="Login with Google"
                            onSuccess={handleGoogleSuccess}
                            onFailure={() => console.error('Google login failed')}
                            cookiePolicy={"single_host_origin"}
                            render={(renderProps) => (
                                <button
                                    className="google-btn btn"
                                    onClick={renderProps.onClick}
                                    disabled={renderProps.disabled || loading}
                                >
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                                        alt="Google"
                                    />
                                    Login with Google
                                </button>
                            )}
                        />
                    </div>

                    <div className="register-link">
                        Don't have an account?{' '}
                        <a href="/register">Register</a>
                    </div>
                </form>
            </div>
        </div>
        </div>
    );
};

export default Login;