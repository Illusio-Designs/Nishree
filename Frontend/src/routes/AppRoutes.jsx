import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import AdminLogin from "../pages/Dashboard/auth/Login";
import AdminRegister from "../pages/Dashboard/auth/Register";
import AdminForgotPassword from "../pages/Dashboard/auth/ForgotPassword";
import AdminResetPassword from "../pages/Dashboard/auth/ResetPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import Leads from "../pages/dashboard/Leads";
import Customers from "../pages/dashboard/Customers";
import Reports from "../pages/dashboard/Reports";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/admin/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />

      {/* Admin Authentication Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password" element={<AdminResetPassword />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <MainLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
