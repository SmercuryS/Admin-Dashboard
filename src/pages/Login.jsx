import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import keshavarziLogo from "../img/keshavarzi_logo.png";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [test];

  // Hardcoded credentials
  const HARDCODED_USERNAME = "admin";
  const HARDCODED_PASSWORD = "admin123";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simple validation
    if (!username.trim() || !password.trim()) {
      setError("لطفاً نام کاربری و رمز عبور را وارد کنید");
      setIsLoading(false);
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      // Check against hardcoded credentials
      if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
        // Store login state
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        localStorage.setItem("userRole", "مدیر نقشه");

        // Call onLogin prop if provided
        if (onLogin) {
          onLogin();
        }

        // Redirect to main page
        navigate("/");
      } else {
        setError("نام کاربری یا رمز عبور نامعتبر است");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleGuestLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", "مهمان");
    localStorage.setItem("userRole", "مهمان");

    // Call onLogin prop if provided
    if (onLogin) {
      onLogin();
    }

    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            {/* Replace text with logo image */}
            <img
              src={keshavarziLogo}
              alt="Keshavarzi Logo"
              className="logo-image"
              style={{
                maxWidth: "150px", // Adjust as needed
                height: "auto",
                marginBottom: "10px",
              }}
            />
          </div>
          {/* <h2>ورود به سیستم</h2>
          <p>لطفاً اطلاعات حساب کاربری خود را وارد کنید</p> */}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <i className="mdi mdi-alert-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              <i className="mdi mdi-account"></i>
              نام کاربری
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="نام کاربری خود را وارد کنید"
              dir="auto"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="mdi mdi-lock"></i>
              رمز عبور
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور خود را وارد کنید"
              dir="auto"
              disabled={isLoading}
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>مرا به خاطر بسپار</span>
            </label>
            <a href="#" className="forgot-password">
              رمز عبور را فراموش کرده‌اید؟
            </a>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="mdi mdi-loading mdi-spin"></i>
                در حال ورود...
              </>
            ) : (
              <>
                <i className="mdi mdi-login"></i>
                ورود
              </>
            )}
          </button>

          <div className="guest-login">
            <p>یا</p>
            <button
              type="button"
              className="guest-btn"
              onClick={handleGuestLogin}
              disabled={isLoading}
            >
              <i className="mdi mdi-account-outline"></i>
              ورود به عنوان مهمان
            </button>
          </div>

          {/* Add a note about the test credentials */}
          <div className="test-credentials">
            <p
              style={{
                fontSize: "12px",
                color: "#666",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              <strong>Test Credentials:</strong> username: <code>admin</code>,
              password: <code>admin123</code>
            </p>
          </div>
        </form>

        <div className="login-footer">
          <p>
            حساب کاربری ندارید؟{" "}
            <a href="#" className="register-link">
              ثبت‌نام کنید
            </a>
          </p>
          {/* <div className="copyright">
            <i className="mdi mdi-copyright"></i>
            ۱۴۰۳ - سیستم نقشه‌برداری کشاورزی
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Login;
