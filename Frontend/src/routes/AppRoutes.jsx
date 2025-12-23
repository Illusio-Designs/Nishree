import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/home";
import Product from "../pages/Product";
import Collection from "../pages/Collection";
import About from "../pages/About";
import Productinner from "../pages/Productinner";
import CheckoutPage from "../pages/CheckoutPage";
import OrderSuccess from "../pages/OrderSuccess";
import Contact from "../pages/Contact";
import Policies from "../pages/Policies";
import Login from "../pages/login";
import Register from "../pages/register";
import Profile from "../pages/profile";
import AdminLogin from "../pages/Dashboard/auth/Login";
import AdminRegister from "../pages/Dashboard/auth/Register";
import AdminForgotPassword from "../pages/Dashboard/auth/ForgotPassword";
import AdminResetPassword from "../pages/Dashboard/auth/ResetPassword";
import Dashboard from "../pages/Dashboard/Layout/Dashboard";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader size="medium" />;
  return user?.role === 'admin' ? children : <Navigate to="/admin/login" />;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader size="medium" />;
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Product />} />
      <Route path="/product" element={<Navigate to="/products" replace />} />
      <Route path="/collection" element={<Collection />} />
      <Route path="/about" element={<About />} />
      <Route path="/productinner/:id" element={<Productinner />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-success/:orderId" element={<OrderSuccess />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/policies" element={<Policies />} />
      <Route path="/privacy-policy" element={<Policies />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected User Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin Authentication Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password" element={<AdminResetPassword />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard/*"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
