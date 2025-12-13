import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import "../styles/map.css";

export default function MainMap() {
  const navigate = useNavigate();
  const [layers, setLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState(0);

  /* ---------- LOAD GEOJSON MAP LAYERS ---------- */
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

  /* ---------- MAP LAYER STYLES ---------- */
  const layerStyles = [
    { color: "#3699FF", weight: 5, fillOpacity: 0 },
    { color: "#4CAF50", weight: 4, fillOpacity: 0 },
    { color: "#FF4081", weight: 2, fillOpacity: 0 },
  ];

  const labels = ["ایران", "استان‌ها", "شهرستان‌ها"];

  return (
    <div className="map-card">
      <div className="map-header">
        <h1>
          <i className="mdi mdi-map"></i> نقشه ایران
        </h1>
        <button onClick={() => navigate("/edit")} className="edit-mode-btn">
          <i className="mdi mdi-pencil"></i>
          ورود به حالت ویرایش
        </button>
      </div>

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
            <GeoJSON
              data={layers[activeLayer]}
              style={layerStyles[activeLayer]}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
