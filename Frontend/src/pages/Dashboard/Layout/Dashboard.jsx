import React, { useEffect, useState } from "react";
import { useNavigate, Link, Routes, Route, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import img from "../../../assets/RTHSRT.png";
import "../../../Styles/dashboard/Dashboard.css";
import { HiOutlineHome, HiOutlineUsers, HiOutlineCog, HiOutlineLockClosed, HiOutlineChevronLeft, HiOutlineArrowRightOnRectangle, HiOutlineBell } from "react-icons/hi2";
import { IoGridOutline, IoCartOutline } from "react-icons/io5";
import Slider from "../Pages/Slider";
import Products from "../Pages/Products";

// Import dashboard components
import DashboardOverview from "../Pages/DashboardOverview";
import Customers from "../Pages/Customers";
import Category from "../Pages/Category";
import Settings from "../../../components/common/Settings";

const Dashboard = () => {
  const { user, loading, logout } = useAuth(); // Add logout to destructuring
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Make sure this line is present

  // Add handleLogout function
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Add this function to handle dropdown toggle
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Update the profile trigger onClick handler
  return (
    <div className="dashboard-layout">
      <div className={`sidebar ${!isSidebarOpen ? "collapsed" : ""}`}>
        {/* <div className="sidebar-header">
                    <h2>{isSidebarOpen ? 'Admin Panel' : 'AP'}</h2>
                    <button className="toggle-btn" onClick={toggleSidebar}>
                        <HiOutlineChevronLeft size={20} />
                    </button>
                </div> */}
        <div className="sidebar-header">
          <div className="logo-container">
            {isSidebarOpen ? (
              <img
                src={img}
                width={200}
                alt="Admin Panel"
                className="logo-full"
              />
            ) : (
              <img src={img} width={70} alt="AP" className="logo-small" />
            )}
            <button className="toggle-btn" onClick={toggleSidebar}>
              <HiOutlineChevronLeft size={20} />
            </button>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-item ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
          >
            <HiOutlineHome className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>Dashboard</span>
          </Link>
          <Link
            to="/dashboard/customers"
            className={`nav-item ${
              location.pathname === "/dashboard/customers" ? "active" : ""
            }`}
          >
            <HiOutlineUsers className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>Customers</span>
          </Link>
          <Link
            to="/dashboard/category"
            className={`nav-item ${
              location.pathname === "/dashboard/category" ? "active" : ""
            }`}
          >
            <IoGridOutline className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>Category</span>
          </Link>
          <Link
            to="/dashboard/slider"
            className={`nav-item ${
              location.pathname === "/dashboard/slider" ? "active" : ""
            }`}
          >
            <IoGridOutline className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>Slider</span>
          </Link>
          <Link
            to="/dashboard/products"
            className={`nav-item ${
              location.pathname === "/dashboard/products" ? "active" : ""
            }`}
          >
            <IoCartOutline className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>Products</span>
          </Link>
        </nav>
      </div>
      <div className="main-content">
        <header className="dashboard-header">
          <h2 className="text-xs">Welcome, {user?.displayName || "Admin"}</h2>
          <div className="header-actions">
            <button className="notification-btn">
              <span className="notification-count">3</span>
              <HiOutlineBell size={20} />
            </button>
            <div className="user-profile-dropdown">
              <div className="profile-trigger" onClick={toggleDropdown}>
                <img
                  src={user?.photoURL || "default-avatar.png"}
                  alt="Profile"
                  className="img-fluid"
                />
              </div>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span>{user?.displayName || "Admin"}</span>
                    <small>{user?.email}</small>
                  </div>
                  <div className="dropdown-divider" />
                  <Link
                    to="/dashboard/settings/profile"
                    className="dropdown-item"
                  >
                    <HiOutlineCog className="item-icon" size={20} />
                    Profile Settings
                  </Link>
                  <Link
                    to="/dashboard/settings/security"
                    className="dropdown-item"
                  >
                    <HiOutlineLockClosed className="item-icon" size={20} />
                    Security
                  </Link>
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item">
                    <HiOutlineArrowRightOnRectangle className="item-icon" size={20} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="content-area">
          <div className="customers-page">
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="customers" element={<Customers />} />
              <Route path="category" element={<Category />} />
              <Route path="slider" element={<Slider />} />
              <Route path="products" element={<Products />} />
            </Routes>
          </div>
        </div>
        <div className="dashboard-footer">
          <div className="footer-content">
            <p>© 2024 Admin Panel</p>
          </div>
          <div className="footer-actions">
            <button className="support-btn">
              <span className="support-icon">💬</span>
              Support
            </button>
            <div className="version-info">
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
