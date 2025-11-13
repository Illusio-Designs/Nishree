import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, userService } from "../services";
import Loader from "../components/Loader";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await userService.getCurrentUser();
      
      if (userData && userData.id) {
        setUser(userData);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      // Silently handle errors - don't block the app
      console.warn("Auth check failed (this is normal if backend is not running):", error.message);
      
      // Only clear token if it's an authentication error (401)
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
      }
      // Don't set error state - let the app continue
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Check auth in background, but don't block the app
      checkUser();
    } else {
      // No token - immediately set loading to false
      setLoading(false);
    }
  }, []);

  const loginUser = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        setUser(response.user);
        return response;
      }
    } catch (error) {
      setError(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      setLoading(true);
      await authService.logout();
      localStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        setUser(response.user);
        return response;
      }
    } catch (error) {
      setError(error.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Don't block the app while checking auth
  // Protected routes will handle their own loading states

  const updateUserProfile = async (profileData) => {
    try {
      const response = await userService.updateProfile(profileData);
      console.log('Update profile response:', response);
      
      // Immediately refresh user data after update
      if (response) {
        // Wait a moment for backend to process
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const updatedUser = await userService.getCurrentUser();
        if (updatedUser) {
          console.log('Updating user context with:', updatedUser);
          setUser(updatedUser);
        }
        return response;
      }
    } catch (error) {
      console.error('Profile update error in context:', error);
      setError(error.message || "Profile update failed");
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login: loginUser,
    logout: logoutUser,
    register: registerUser,
    updateProfile: updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
