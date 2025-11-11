import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { authService } from '../../../services';
import '../../../Styles/auth/ResetPassword.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await authService.resetPassword({ token, password: formData.password });
            toast.success('Password reset successful');
            setTimeout(() => {
                navigate('/admin/login');
            }, 2000);
        } catch (err) {
            toast.error(err.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="reset-container">
            <ToastContainer position="top-center" />
            <div className="reset-card">
                <h2 className="reset-title">Reset Your Password</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            name="password"
                            type="password"
                            required
                            className="reset-input"
                            placeholder="New Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            className="reset-input"
                            placeholder="Confirm New Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
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