import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/userService';
import { login, logout, register } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const userData = await getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const loginUser = async (credentials) => {
        const response = await login(credentials);
        setUser(response.user);
        return response;
    };

    const logoutUser = async () => {
        await logout();
        setUser(null);
    };

    const registerUser = async (userData) => {
        const response = await register(userData);
        setUser(response.user);
        return response;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login: loginUser,
                logout: logoutUser,
                register: registerUser,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};