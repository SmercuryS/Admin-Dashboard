import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/header.css";
import logo from "../img/logo.png";
import profile from "../img/profile.png";

export default function Header({ onEditorClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    setShowDropdown(false);
  };

  const handleSettings = () => {
    console.log("Settings clicked");
    setShowDropdown(false);
  };

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
        <div className="header-buttons">
          {/* Show "Open Editor" button only on main page */}
          {location.pathname === "/" && (
            <button
              onClick={() => navigate("/editor")}
              className="header-action-btn editor-btn"
            >
              <i className="mdi mdi-pencil"></i>
              بازکردن ادیتور
            </button>
          )}

          {/* Show "Back to Main Map" button only on editor page */}
          {location.pathname === "/editor" && (
            <button onClick={() => navigate("/")} className="header-back-btn">
              <i className="mdi mdi-arrow-left"></i>
              بازگشت به نقشه اصلی
            </button>
          )}
        </div>

        <div className="profile-container">
          <button
            className="profile-btn"
            onClick={handleProfileClick}
            aria-expanded={showDropdown}
          >
            <div className="profile-info">
              <span className="profile-name">کاربر سیستم</span>
              <span className="profile-role">مدیر نقشه</span>
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
                  <h5>کاربر سیستم</h5>
                  <span>مدیر نقشه</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleSettings}>
                <i className="mdi mdi-cog"></i>
                تنظیمات
              </button>
              <button className="dropdown-item" onClick={handleLogout}>
                <i className="mdi mdi-logout"></i>
                خروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
