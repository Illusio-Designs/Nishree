import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineBell,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineCog,
} from "react-icons/hi2";
import { FaUserCircle } from "react-icons/fa";
import "../../styles/components/Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowNotifications(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowProfileDropdown(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">CRM Dashboard</h1>

        <div className="header-actions">
          {/* Notifications */}
          <div className="notification-container" ref={notificationRef}>
            <button
              className="notification-button"
              onClick={handleNotificationClick}
            >
              <HiOutlineBell size={24} />
              <span className="notification-badge">3</span>
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button className="mark-all-read">Mark all as read</button>
                </div>
                <div className="notification-list">
                  <div className="notification-item unread">
                    <div className="notification-content">
                      <p>New order received</p>
                      <span className="notification-time">2 minutes ago</span>
                    </div>
                  </div>
                  <div className="notification-item unread">
                    <div className="notification-content">
                      <p>Payment received</p>
                      <span className="notification-time">1 hour ago</span>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-content">
                      <p>New review submitted</p>
                      <span className="notification-time">3 hours ago</span>
                    </div>
                  </div>
                </div>
                <div className="notification-footer">
                  <button className="view-all">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="profile-container" ref={profileRef}>
            <button className="profile-button" onClick={handleProfileClick}>
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="profile-image"
                />
              ) : (
                <FaUserCircle size={32} className="profile-placeholder" />
              )}
              <span className="user-name">{user?.name || user?.email}</span>
            </button>

            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="profile-header">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="profile-image-large"
                      />
                    ) : (
                      <FaUserCircle
                        size={64}
                        className="profile-placeholder-large"
                      />
                    )}
                    <div className="profile-details">
                      <h3>{user?.name || "User"}</h3>
                      <p>{user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-menu">
                  <button className="dropdown-item">
                    <HiOutlineUser size={20} />
                    <span>My Profile</span>
                  </button>
                  <button className="dropdown-item">
                    <HiOutlineCog size={20} />
                    <span>Settings</span>
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <HiOutlineLogout size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
