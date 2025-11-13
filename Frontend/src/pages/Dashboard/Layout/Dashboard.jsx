import React, { useEffect, useState, useRef } from "react";
import {
  useNavigate,
  useLocation,
  Link,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import img from "../../../assets/RTHSRT.webp";
import "../../../Styles/dashboard/Dashboard.css";
import {
  HiOutlineHome,
  HiOutlineChevronLeft,
  HiOutlineArrowRightOnRectangle,
  HiOutlinePhoto,
  HiOutlineClipboardDocumentList,
  HiOutlineTicket,
  HiOutlineStar,
  HiOutlineTruck,
  HiOutlineGlobeAlt,
  HiOutlineUserCircle,
  HiOutlineDocumentText,
  HiOutlineShoppingBag,
} from "react-icons/hi2";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import {
  IoGridOutline,
  IoCartOutline,
  IoHeartOutline,
  IoLayersOutline,
  IoPricetagOutline,
  IoCardOutline,
} from "react-icons/io5";
import Slider from "../Pages/Slider";
import Products from "../Pages/Products";
import Coupons from "../Pages/Coupons";
import Policies from "../Pages/Policies";
import Orders from "../Pages/Orders";
import Reviews from "../Pages/Reviews";
import OrderStatusHistory from "../Pages/OrderStatusHistory";
import ShippingFees from "../Pages/ShippingFees";
import ShippingAddresses from "../Pages/ShippingAddresses";
import Payments from "../Pages/Payments";
import Users from "../Pages/Users";
import SEO from "../Pages/SEO";
import DashboardOverview from "../Pages/DashboardOverview";
import Category from "../Pages/Category";
import ProfileSettings from "../../../components/common/Settings";

const Dashboard = () => {
  const { user, loading, logout } = useAuth(); // Add logout to destructuring
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login", { replace: true });
    }
  }, [user, loading, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
              <HiOutlineChevronLeft
                size={20}
                className={`${!isSidebarOpen ? "rotate-180" : ""}`}
              />
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
            <HiOutlinePhoto className="nav-icon" size={24} />
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
          <Link
            to="/dashboard/orders"
            className={`nav-item ${
              location.pathname === "/dashboard/orders" ? "active" : ""
            }`}
            title={!isSidebarOpen ? "Orders" : ""}
          >
            <HiOutlineShoppingBag className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>Orders</span>
          </Link>
          <Link
            to="/dashboard/order-status-history"
            className={`nav-item ${
              location.pathname === "/dashboard/order-status-history"
                ? "active"
                : ""
            }`}
          >
            <HiOutlineClipboardDocumentList className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>Order Status</span>
          </Link>
          <Link
            to="/dashboard/coupons"
            className={`nav-item ${
              location.pathname === "/dashboard/coupons" ? "active" : ""
            }`}
          >
            <HiOutlineTicket className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>Coupons</span>
          </Link>
          <Link
            to="/dashboard/policies"
            className={`nav-item ${location.pathname === "/dashboard/policies" ? "active" : ""}`}
          >
            <HiOutlineDocumentText className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>Policies</span>
          </Link>
          <Link
            to="/dashboard/reviews"
            className={`nav-item ${
              location.pathname === "/dashboard/reviews" ? "active" : ""
            }`}
          >
            <HiOutlineStar className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>Reviews</span>
          </Link>
          <Link
            to="/dashboard/shipping-fees"
            className={`nav-item ${
              location.pathname === "/dashboard/shipping-fees" ? "active" : ""
            }`}
          >
            <IoPricetagOutline className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>
              Shipping Fees
            </span>
          </Link>
          <Link
            to="/dashboard/shipping-addresses"
            className={`nav-item ${
              location.pathname === "/dashboard/shipping-addresses"
                ? "active"
                : ""
            }`}
          >
            <HiOutlineTruck className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>
              Shipping Addresses
            </span>
          </Link>
          <Link
            to="/dashboard/payments"
            className={`nav-item ${
              location.pathname === "/dashboard/payments" ? "active" : ""
            }`}
          >
            <IoCardOutline className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>Payments</span>
          </Link>
          <Link
            to="/dashboard/seo"
            className={`nav-item ${
              location.pathname === "/dashboard/seo" ? "active" : ""
            }`}
          >
            <HiOutlineGlobeAlt className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>SEO</span>
          </Link>
          <Link
            to="/dashboard/users"
            className={`nav-item ${
              location.pathname === "/dashboard/users" ? "active" : ""
            }`}
          >
            <HiOutlineUserCircle className="nav-icon" size={24} />
            <span className={!isSidebarOpen ? "hidden" : ""}>Users</span>
          </Link>
        </nav>
      </div>
      <div className="main-content">
        <header className="dashboard-header">
          <h2 className="header-welcome">Welcome, {user?.displayName || "Admin"}</h2>
          <div className="header-actions">
            <button className="fullscreen-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
              {isFullscreen ? <MdFullscreenExit size={24} /> : <MdFullscreen size={24} />}
            </button>
            <div className="user-profile-dropdown" ref={dropdownRef}>
              <div
                className="profile-trigger"
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {user?.photoURL || user?.profileImage ? (
                  <img
                    src={user.photoURL || (user.profileImage?.startsWith('/uploads/') 
                      ? `${import.meta.env.VITE_API_URL}${user.profileImage}` 
                      : `${import.meta.env.VITE_API_URL}/uploads/users/${user.profileImage}`)}
                    alt="Profile"
                    className="profile-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="profile-avatar-initials" style={{ display: (user?.photoURL || user?.profileImage) ? 'none' : 'flex' }}>
                  {(user?.username || user?.displayName || user?.email || 'A').charAt(0).toUpperCase()}
                </div>
              </div>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    {user?.photoURL || user?.profileImage ? (
                      <img
                        src={user.photoURL || (user.profileImage?.startsWith('/uploads/') 
                          ? `${import.meta.env.VITE_API_URL}${user.profileImage}` 
                          : `${import.meta.env.VITE_API_URL}/uploads/users/${user.profileImage}`)}
                        alt="Profile"
                        className="dropdown-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="dropdown-avatar-initials" style={{ display: (user?.photoURL || user?.profileImage) ? 'none' : 'flex' }}>
                      {(user?.username || user?.displayName || user?.email || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <span className="user-name">
                        {user?.displayName || user?.username || "Admin"}
                      </span>
                      <small className="user-email">{user?.email}</small>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link
                    to="/dashboard/profile"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <HiOutlineUserCircle className="item-icon" size={20} />
                    My Profile
                  </Link>
                  <div className="dropdown-divider" />
                  <button
                    onClick={handleLogout}
                    className="dropdown-item modal-submit-button"
                  >
                    <HiOutlineArrowRightOnRectangle
                      className="item-icon"
                      size={20}
                    />
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
              <Route path="category" element={<Category />} />
              <Route path="slider" element={<Slider />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="order-status-history" element={<OrderStatusHistory />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="policies" element={<Policies />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="shipping-fees" element={<ShippingFees />} />
              <Route path="shipping-addresses" element={<ShippingAddresses />} />
              <Route path="payments" element={<Payments />} />
              <Route path="users" element={<Users />} />
              <Route path="seo" element={<SEO />} />
              <Route path="profile" element={<ProfileSettings type="profile" />} />
            </Routes>
          </div>
        </div>
        <footer className="dashboard-footer">
          <p>© 2024 Admin Panel. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
