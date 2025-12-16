import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/header.css";
import logo from "../img/logo.png";
import profile from "../img/profile.png";

export default function Header({ onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Get username from localStorage or use default
  const username = localStorage.getItem("username") || "کاربر سیستم";
  const userRole = localStorage.getItem("userRole") || "مدیر نقشه";

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    setShowDropdown(false);

    // Call the onLogout prop if provided (for App.jsx authentication)
    if (onLogout) {
      onLogout();
    } else {
      // Fallback: Clear localStorage and redirect to login
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");
      navigate("/login");
    }
  };

  const handleSettings = () => {
    console.log("Settings clicked");
    setShowDropdown(false);
    // You can add settings navigation here
  };

  const handleProfile = () => {
    console.log("Profile clicked");
    setShowDropdown(false);
    // You can add profile navigation here
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo-img" />
          </div>
          <span className="logo-text">نقشه پولیگان</span>
        </div>
      </div>

      <div className="header-center">
        <h1 className="page-title">سیستم مدیریت نقشه</h1>
      </div>

      <div className="header-right">
        <div className="profile-container" ref={dropdownRef}>
          <button
            className="profile-btn"
            onClick={handleProfileClick}
            aria-expanded={showDropdown}
          >
            <div className="profile-info">
              <span className="profile-name">{username}</span>
              <span className="profile-role">{userRole}</span>
            </div>
            <div className="profile-avatar">
              <img src={profile} alt="Profile" className="profile-img" />
              <i className="mdi mdi-chevron-down profile-arrow"></i>
            </div>
          </button>

          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <img src={profile} alt="Profile" className="dropdown-img" />
                <div className="dropdown-user-info">
                  <h5>{username}</h5>
                  <span>{userRole}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleProfile}>
                <i className="mdi mdi-account-circle"></i>
                پروفایل
              </button>
              <button className="dropdown-item" onClick={handleSettings}>
                <i className="mdi mdi-cog"></i>
                تنظیمات
              </button>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item logout-item"
                onClick={handleLogout}
              >
                <i className="mdi mdi-logout"></i>
                خروج از سیستم
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
