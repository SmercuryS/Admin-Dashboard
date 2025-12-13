// src/pages/EditorPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import IranMap from "../components/IranMap";
import "../styles/header.css";
import "../styles/sidebar.css";
import "../styles/map.css";
import "../styles/App.css";

function EditorPage() {
  const navigate = useNavigate();
  const [savedPolygons, setSavedPolygons] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);

  const handlePolygonsUpdate = (polygonsData) => {
    setSavedPolygons(polygonsData);
  };

  const handlePolygonSelect = (polygon) => {
    console.log("Polygon selected from sidebar:", polygon);
    setSelectedPolygon(polygon);
  };

  return (
    <div className="app-container">
      <Header />

      {/* <button
        onClick={() => navigate("/")}
        className="back-btn"
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        ← Back to Main Page
      </button> */}

      <div className="middle-section">
        <Sidebar
          polygons={savedPolygons}
          onPolygonSelect={handlePolygonSelect}
        />

        <div className="map-wrapper">
          <IranMap
            onPolygonsUpdate={handlePolygonsUpdate}
            selectedPolygon={selectedPolygon}
          />
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
