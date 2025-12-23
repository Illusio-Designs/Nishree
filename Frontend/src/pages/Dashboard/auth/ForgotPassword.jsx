import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { authService } from '../../../services';
import '../../../styles/auth/ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authService.forgotPassword(email);
            toast.success('Reset link sent to your email');
            setTimeout(() => {
                navigate('/admin/login');
            }, 3000);
        } catch (err) {
            toast.error(err.message || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-container">
            <ToastContainer position="top-center" />
            <div className="forgot-card">
                <h2 className="forgot-title">Forgot Password</h2>
                <p className="forgot-subtitle">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="forgot-form">
                    <div className="form-group">
                        <input
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