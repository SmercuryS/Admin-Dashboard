import React from "react";
import "../styles/header.css";
import logo from "../img/logo.png";
import profile from "../img/profile.png";

export default function Header() {
  const handleProfileClick = () => {
    console.log("Profile button clicked");
  };

  return (
    <div className="header">
      <div className="logo">
        <img src={logo} alt="Logo" style={{ width: 120 }} />
      </div>
      <div className="profile-container">
        <button className="profile-btn" onClick={handleProfileClick}>
          <img src={profile} alt="Profile" className="profile-img" />
        </button>
      </div>
    </div>
  );
}
