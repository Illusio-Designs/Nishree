import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, userService } from "../services";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkUser = async () => {
    console.log("=== Auth Check Started ===");
    console.log("API URL:", import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    try {
      const token = localStorage.getItem("token");
      console.log("Token status:", token ? "Present" : "Missing");
      
      if (!token) {
        console.log("No token - setting loading to false");
        setLoading(false);
        return;
      }

      console.log("Fetching user data...");
      const userData = await userService.getCurrentUser();
      console.log("User data received:", userData ? "Success" : "Failed");
      
      if (userData && userData.id) {
        console.log("Setting user data:", userData);
        setUser(userData);
      } else {
        console.log("Invalid user data - clearing token");
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.log("Auth check error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Only clear token if it's an authentication error
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
      }
      setError(error.message || "Authentication failed");
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  // Add a new effect to handle token changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkUser();
    } else {
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        <p>Error: {error}</p>
        <button 
          onClick={() => {
            setError(null);
            checkUser();
          }}
          style={{
            padding: '8px 16px',
            marginTop: '16px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login: loginUser,
    logout: logoutUser,
    register: registerUser,
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
