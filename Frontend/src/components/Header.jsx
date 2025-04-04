import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-container">
                <h1 className="header-title">CRM Dashboard</h1>
                <div className="header-user-section">
                    <span className="user-email">{user?.email}</span>
                    <button
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;