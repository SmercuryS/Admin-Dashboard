// src/components/SimpleIranMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";

// Helper component to fit bounds
function FitBoundsWhenReady({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson) return;
    try {
      const layer = new L.GeoJSON(geojson);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (err) {
      console.warn("FitBounds error:", err);
    }
  }, [geojson, map]);
  return null;
}

export default function SimpleIranMap({
  onPolygonsUpdate,
  selectedPolygon,
  showCustomPolygons = false,
}) {
  const [layers, setLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState(0);
  const [savedPolygons, setSavedPolygons] = useState(null);

  // Load GeoJSON layers (iran_country.json, iran_provinces.json, iran_counties.json)
  useEffect(() => {
    async function loadLayers() {
      try {
        const files = [
          "/map/iran_country.json",
          "/map/iran_provinces.json",
          "/map/iran_counties.json",
        ];
        const loaded = await Promise.all(
          files.map((file) => fetch(file).then((res) => res.json()))
        );
        setLayers(loaded);
      } catch (err) {
        console.error("Error loading GeoJSON:", err);
      }
    }
    loadLayers();
  }, []);

  // Load saved polygons only if showCustomPolygons is true
  useEffect(() => {
    if (!showCustomPolygons) {
      setSavedPolygons(null);
      return;
    }

    async function loadSavedPolygons() {
      try {
        const timestamp = Date.now();
        const apiRes = await fetch(
          `http://localhost:3001/api/get-polygons?t=${timestamp}`
        );

        if (apiRes.ok) {
          const apiData = await apiRes.json();
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
          if (onPolygonsUpdate) {
            onPolygonsUpdate(formatted);
          }
        }
      } catch (apiError) {
        console.log("API endpoint not available");
        setSavedPolygons(null);
      }
    }

    loadSavedPolygons();
  }, [showCustomPolygons, onPolygonsUpdate]);

  // Layer styles (same as before)
  const layerStyles = [
    { color: "#000", weight: 5, fillOpacity: 0 },
    { color: "#0b5", weight: 5, fillOpacity: 0 },
    { color: "#06f", weight: 2, fillOpacity: 0 },
  ];

  const labels = ["ایران", "استان‌ها", "شهرستان‌ها"];

  return (
    <div className="map-card">
      <div className="map-controls">
        {labels.map((t, idx) => (
          <button
            key={t}
            onClick={() => setActiveLayer(idx)}
            className={`layer-btn ${activeLayer === idx ? "active-btn" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="map-container">
        <MapContainer center={[32, 53]} zoom={5} className="leaflet-map">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />

          {layers[activeLayer] && (
            <>
              <GeoJSON
                data={layers[activeLayer]}
                style={layerStyles[activeLayer]}
              />
              <FitBoundsWhenReady geojson={layers[activeLayer]} />
            </>
          )}

          {/* Only show custom polygons if showCustomPolygons is true */}
          {showCustomPolygons && savedPolygons && (
            <GeoJSON
              data={savedPolygons}
              onEachFeature={(feature, layer) => {
                const polygonId = feature.id || feature.properties.id;
                layer.polygonId = polygonId;
                layer._leaflet_id = polygonId;

                // Apply pink style for custom polygons
                layer.setStyle({
                  color: "#FF4081",
                  weight: 3,
                  fillColor: "#FF4081",
                  fillOpacity: 0.3,
                });
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
