// src/pages/MainPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import SimpleIranMap from "../components/SimpleIranMap";
import "../styles/header.css";
import "../styles/sidebar.css";
import "../styles/map.css";
import "../styles/App.css";

function MainPage() {
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
      <Header onEditorClick={() => navigate("/editor")} />

      <div className="middle-section">
        <Sidebar
          polygons={savedPolygons}
          onPolygonSelect={handlePolygonSelect}
          viewOnly={true} // Added prop to indicate view-only mode
        />

        <div className="map-wrapper">
          <SimpleIranMap
            onPolygonsUpdate={handlePolygonsUpdate}
            selectedPolygon={selectedPolygon}
            showCustomPolygons={false} // Hide custom polygons
          />
        </div>
      </div>
    </div>
  );
}

export default MainPage;
