import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import SimpleIranMap from "../components/SimpleIranMap";
import "../styles/header.css";
import "../styles/sidebar.css";
import "../styles/rightsidebar.css";
import "../styles/map.css";
import "../styles/App.css";

function MainPage({ onLogout }) {
  const [savedPolygons, setSavedPolygons] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [isLeftSidebarMinimized, setIsLeftSidebarMinimized] = useState(false);
  const [isRightSidebarMinimized, setIsRightSidebarMinimized] = useState(false);

  // Load custom polygons separately for sidebar (not for map)
  useEffect(() => {
    async function loadCustomPolygons() {
      try {
        console.log("📥 Loading custom polygons for sidebar...");

        // Try API first
        try {
          const timestamp = Date.now();
          const apiRes = await fetch(
            `http://localhost:3001/api/get-polygons?t=${timestamp}`
          );

          if (apiRes.ok) {
            const apiData = await apiRes.json();
            console.log("📥 Loaded from API:", apiData.count, "polygons");

            const formatted = {
              type: "FeatureCollection",
              features: apiData.polygons.map((p) => ({
                type: "Feature",
                geometry: p.geometry,
                properties: {
                  code: p.code,
                  label: p.label,
                  id: p.id,
                },
                id: p.id,
              })),
            };

            setSavedPolygons(formatted);
            return;
          }
        } catch (apiError) {
          console.log(
            "API endpoint not available, trying direct file...",
            apiError
          );
        }

        // Fallback to direct file
        try {
          const timestamp = Date.now();
          const res = await fetch(`/polygons.json?t=${timestamp}`);

          if (res.ok) {
            const data = await res.json();
            console.log("📥 Loaded from file:", data.length, "polygons");

            const formatted = {
              type: "FeatureCollection",
              features: data.map((p) => ({
                type: "Feature",
                geometry: p.geometry,
                properties: {
                  code: p.code,
                  label: p.label,
                  id: p.id,
                },
                id: p.id,
              })),
            };

            setSavedPolygons(formatted);
          } else {
            console.log("No polygons.json found or empty file");
            setSavedPolygons(null);
          }
        } catch (err) {
          console.log("No polygons.json found or error loading:", err.message);
          setSavedPolygons(null);
        }
      } catch (error) {
        console.error("Error loading custom polygons:", error);
        setSavedPolygons(null);
      }
    }

    loadCustomPolygons();
  }, []);

  // Function to refresh custom polygons (for future use)
  const refreshCustomPolygons = async () => {
    try {
      console.log("🔄 Refreshing custom polygons for sidebar...");

      const timestamp = Date.now();
      const apiRes = await fetch(
        `http://localhost:3001/api/get-polygons?t=${timestamp}`
      );

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        console.log("📥 Refreshed from API:", apiData.count, "polygons");

        const formatted = {
          type: "FeatureCollection",
          features: apiData.polygons.map((p) => ({
            type: "Feature",
            geometry: p.geometry,
            properties: {
              code: p.code,
              label: p.label,
              id: p.id,
            },
            id: p.id,
          })),
        };

        setSavedPolygons(formatted);
        alert(`✅ Refreshed ${apiData.count} custom polygons`);
      }
    } catch (error) {
      console.error("Error refreshing custom polygons:", error);
      alert("❌ Failed to refresh custom polygons");
    }
  };

  const handlePolygonsUpdate = (polygonsData) => {
    // This function is called when SimpleIranMap loads polygons
    // We don't need it for the main page since we load separately
    console.log("Map polygons updated:", polygonsData);
  };

  const handlePolygonSelect = (polygon) => {
    console.log("Polygon selected from sidebar:", polygon);
    setSelectedPolygon(polygon);
  };

  const handleLeftSidebarToggle = (isMinimized) => {
    setIsLeftSidebarMinimized(isMinimized);
  };

  const handleRightSidebarToggle = (isMinimized) => {
    setIsRightSidebarMinimized(isMinimized);
  };

  // Calculate content class based on sidebar states
  const getContentWrapperClass = () => {
    const classes = [];

    if (!isLeftSidebarMinimized && !isRightSidebarMinimized) {
      classes.push("with-both-sidebars");
    } else if (isLeftSidebarMinimized && isRightSidebarMinimized) {
      classes.push("with-both-sidebars", "both-minimized");
    } else if (isLeftSidebarMinimized) {
      classes.push("with-both-sidebars", "left-minimized");
    } else if (isRightSidebarMinimized) {
      classes.push("with-both-sidebars", "right-minimized");
    }

    return classes.join(" ");
  };

  return (
    <div className="app-container">
      <Header onLogout={onLogout} />

      <div className="app-main-wrapper">
        <div className="left-sidebar-wrapper">
          <Sidebar
            polygons={savedPolygons}
            onPolygonSelect={handlePolygonSelect}
            onToggle={handleLeftSidebarToggle}
          />
        </div>

        <div className={`map-content-wrapper ${getContentWrapperClass()}`}>
          <div className="map-wrapper">
            <SimpleIranMap
              onPolygonsUpdate={handlePolygonsUpdate}
              selectedPolygon={selectedPolygon}
              showCustomPolygons={false} // This ensures custom polygons don't show on map
            />
          </div>
        </div>

        <div className="right-sidebar-wrapper">
          <RightSidebar onToggle={handleRightSidebarToggle} />
        </div>
      </div>
    </div>
  );
}

export default MainPage;
