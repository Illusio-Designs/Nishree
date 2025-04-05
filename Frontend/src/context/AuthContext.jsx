import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../services/userService"; // Uncomment this line
import { login, logout, register, googleAuth } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const checkUser = async () => {
    const storedToken = localStorage.getItem("token");
    const expirationTime = localStorage.getItem("tokenExpiration");

    // Check if the token is expired
    if (
      !storedToken ||
      (expirationTime && new Date().getTime() > expirationTime)
    ) {
      setLoading(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return;
    }

    try {
      const userData = await getCurrentUser(storedToken);
      if (userData) {
        setUser(userData);
        setToken(storedToken);
      } else {
        throw new Error("No user data received");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    checkUser();
  }, []);

  const loginUser = async (credentials) => {
    try {
      const response = await login(credentials);
      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        // Set token expiration to 24 hours from now
        const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours
        localStorage.setItem("tokenExpiration", expirationTime);
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
        token, // Add token to the context value
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
