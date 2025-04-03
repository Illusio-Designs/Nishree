import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../../styles/auth/ForgotPassword.css';
import { forgotPassword } from '../../../services/authService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await forgotPassword(email);
            setMessage(response.message || 'Reset link sent to your email');
            // Redirect to login page after 3 seconds
            setTimeout(() => {
                navigate('/admin/login', { 
                    state: { message: 'Please check your email for the reset link.' }
                });
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-container">
            <div className="forgot-card">
                <div>
                    <h2 className="forgot-title">Forgot Password</h2>
                    <p className="forgot-subtitle">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="success-message" role="alert">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="forgot-form">
                    <div className="form-group">
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="forgot-input"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <button
                            type="submit"
                            disabled={isLoading || !email}
                            className="forgot-button"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <Link to="/admin/login" className="back-link">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;