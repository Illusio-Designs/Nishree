import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../../../styles/auth/ResetPassword.css';
import { resetPassword } from '../../../services/authService';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await resetPassword({ token, password: formData.password });
            navigate('/login', { state: { message: 'Password reset successful. Please login with your new password.' } });
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="reset-container">
            <div className="reset-card">
                <div>
                    <h2 className="reset-title">
                        Reset Your Password
                    </h2>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="password" className="sr-only">New Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="reset-input"
                            placeholder="New Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="sr-only">Confirm New Password</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="reset-input"
                            placeholder="Confirm New Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="reset-button"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;