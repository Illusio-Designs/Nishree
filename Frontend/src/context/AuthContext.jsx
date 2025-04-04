import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../services/userService";
import { login, logout, register, googleAuth } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser(token);
      setUser(userData);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (credentials) => {
    try {
      const response = await login(credentials);
      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        setUser(response.user);
        return response;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      const response = await googleAuth();
      if (response.user) {
        setUser(response.user);
        return response;
      }
    } catch (error) {
      console.error("Google Login failed:", error);
      throw error;
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await register(userData);
      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        setUser(response.user);
        return response;
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginUser,
        logout: logoutUser,
        register: registerUser,
        googleLogin,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
