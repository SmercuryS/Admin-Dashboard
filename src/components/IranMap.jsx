import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/map.css";

/* Helper component to fit map to GeoJSON bounds */
function FitBoundsWhenReady({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson) return;
    try {
      const layer = new window.L.GeoJSON(geojson);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (e) {
      console.warn("Fit bounds failed:", e);
    }
  }, [geojson, map]);
  return null;
}

export default function IranMap() {
  const [layers, setLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState(0); // 0=country,1=provinces,2=counties
  const mapKey = `iran-map-${activeLayer}`; // force recreation when activeLayer changes

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
        console.log(
          "Loaded layers:",
          loaded.map((l) => (l ? l.type || "geojson" : l))
        );
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
      }
    }

    loadLayers();
  }, []);

  const styles = [
    // country
    {
      color: "#000000",
      weight: 2,
      fillColor: "#000000",
      fillOpacity: 0.02,
    },
    // provinces
    {
      color: "#0b5", // border color
      weight: 1.2,
      fillColor: "#0b5",
      fillOpacity: 0.0, // transparent fill so you see province borders only
    },
    // counties
    {
      color: "#06f",
      weight: 0.8,
      fillColor: "#06f",
      fillOpacity: 0.0,
    },
  ];

  const labels = ["ایران", "استان‌ها", "شهرستان‌ها"];

  // onEachFeature: add hover highlight
  const onEach = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ weight: 3, fillOpacity: 0.15 });
        if (
          !window.L.Browser.ie &&
          !window.L.Browser.opera &&
          !window.L.Browser.edge
        ) {
          l.bringToFront();
        }
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle({
          weight: styles[activeLayer].weight,
          fillOpacity: styles[activeLayer].fillOpacity,
        });
      },
      click: (e) => {
        // optional: zoom to clicked polygon
        // e.target._map.fitBounds(e.target.getBounds());
      },
    });
  };

  return (
    <div className="map-card" style={{ flex: 1 }}>
      <div
        className="layer-buttons"
        style={{ marginBottom: 10, display: "flex", gap: "10px" }}
      >
        {labels.map((t, idx) => (
          <button
            key={t}
            onClick={() => setActiveLayer(idx)}
            className={activeLayer === idx ? "active-btn" : ""}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="map-style" style={{ height: 600 }}>
        {/* key forces the map (and its vector layers) to be recreated when switching */}
        <MapContainer
          key={mapKey}
          center={[32, 53]}
          zoom={5}
          style={{ height: "80%", width: "160%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {layers[activeLayer] && (
            <>
              <GeoJSON
                data={layers[activeLayer]}
                style={styles[activeLayer]}
                onEachFeature={onEach}
              />
              <FitBoundsWhenReady geojson={layers[activeLayer]} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
