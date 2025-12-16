import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/rightsidebar.css";

export default function RightSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  // Toggle sidebar minimized state
  const toggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  // Navigation functions
  const navigateToEditor = () => {
    navigate("/editor");
  };

  const navigateToMain = () => {
    navigate("/");
  };

  return (
    <nav className={`right-sidebar ${isSidebarMinimized ? "minimized" : ""}`}>
      {/* TOGGLE BUTTON */}
      <div className="sidebar-toggle-container">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {isSidebarMinimized ? (
            <>
              <i className="mdi mdi-chevron-left"></i>
              <span className="toggle-text">باز کردن</span>
            </>
          ) : (
            <>
              <i className="mdi mdi-chevron-right"></i>
              <span className="toggle-text">کوچک کردن</span>
            </>
          )}
        </button>
      </div>

      <ul className="nav">
        {/* PAGE NAVIGATION SECTION */}
        <li className="nav-item menu-items">
          <div className="navigation-section">
            {!isSidebarMinimized && (
              <div className="page-navigation">
                {/* Show "Open Editor" button only on main page */}
                {location.pathname === "/" && (
                  <button
                    onClick={navigateToEditor}
                    className="nav-action-btn editor-nav-btn"
                  >
                    <div className="nav-btn-icon">
                      <i className="mdi mdi-pencil"></i>
                    </div>
                    <div className="nav-btn-content">
                      <span className="nav-btn-title">بازکردن ادیتور</span>
                      <span className="nav-btn-description">
                        ویرایش و مدیریت پولیگان‌ها
                      </span>
                    </div>
                  </button>
                )}

                {/* Show "Back to Main Map" button only on editor page */}
                {location.pathname === "/editor" && (
                  <button
                    onClick={navigateToMain}
                    className="nav-action-btn main-nav-btn"
                  >
                    <div className="nav-btn-icon">
                      <i className="mdi mdi-map"></i>
                    </div>
                    <div className="nav-btn-content">
                      <span className="nav-btn-title">بازگشت به نقشه اصلی</span>
                      <span className="nav-btn-description">
                        مشاهده نقشه اصلی
                      </span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </li>

        {/* STATUS SECTION */}
        <li className="nav-item menu-items">
          <div
            className={`nav-link ${isSidebarMinimized ? "minimized-icon" : ""}`}
            title="وضعیت سیستم"
          >
            <span className="menu-icon">
              <i className="mdi mdi-information"></i>
            </span>
            {!isSidebarMinimized && (
              <span className="menu-title">نمای کلی سیستم</span>
            )}
          </div>

          {!isSidebarMinimized && (
            <div className="status-section">
              <div className="status-item">
                <div className="status-icon">
                  <i className="mdi mdi-map-marker"></i>
                </div>
                <div className="status-content">
                  <span className="status-title">تعداد کل پولیگان ها</span>
                  <span className="status-value">n مورد</span>
                  <span className="status-value">سطح زیر کشت: فلان</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-icon apple">
                  <i className="mdi mdi-map-marker"></i>
                </div>
                <div className="status-content">
                  <span className="status-title">تعداد پولیگان های سیب</span>
                  <span className="status-value">n مورد</span>
                  <span className="status-value">سطح زیر کشت: فلان</span>
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon wallnut">
                  <i className="mdi mdi-map-marker"></i>
                </div>
                <div className="status-content">
                  <span className="status-title">تعداد پولیگان های گردو</span>
                  <span className="status-value">n مورد</span>
                  <span className="status-value">سطح زیر کشت: فلان</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-icon palm">
                  <i className="mdi mdi-map-marker"></i>
                </div>
                <div className="status-content">
                  <span className="status-title">تعداد پولیگان های نخل</span>
                  <span className="status-value">n مورد</span>
                  <span className="status-value">سطح زیر کشت: فلان</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-icon citrus">
                  <i className="mdi mdi-map-marker"></i>
                </div>
                <div className="status-content">
                  <span className="status-title">تعداد پولیگان های مرکبات</span>
                  <span className="status-value">n مورد</span>
                  <span className="status-value">سطح زیر کشت: فلان</span>
                </div>
              </div>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
