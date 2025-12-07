import React from "react";
import "../styles/header.css";
import logo from "../img/logo.png";

export default function Header() {
  return (
    <div className="header">
      <div className="logo">
        <img src={logo} alt="Logo" style={{ width: 120 }} />
      </div>

      {/* <div className="tabs">
        <button>Tab 1</button>
        <button>Tab 2</button>
        <button>Tab 3</button>
        <button>Tab 4</button>
      </div> */}
    </div>
  );
}
