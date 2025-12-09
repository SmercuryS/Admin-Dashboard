import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import IranMap from "./components/IranMap";
import Charts from "./components/Charts";
import DataTable from "./components/DataTable";

import "./styles/header.css";
import "./styles/sidebar.css";
import "./styles/map.css";
import "./styles/charts.css";
import "./styles/table.css";
import "./styles/App.css";

function App() {
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
    <div
      className="app-container"
      style={{
        margin: 0,
        padding: 0,
        width: "100vw",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Header />

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

export default App;
