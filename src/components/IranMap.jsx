import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "../styles/map.css";

// Global variable to track IDs consistently
let nextId = 1000000;

// Helper function to check if label is unique
const isLabelUnique = (label, polygonsRef, excludeId = null) => {
  if (!label || !label.trim()) return true; // Empty label is not considered
  return !polygonsRef.current.some(
    (polygon) =>
      polygon.label &&
      polygon.label.trim().toLowerCase() === label.trim().toLowerCase() &&
      polygon.id !== excludeId
  );
};

// Helper function to check if code/ID is unique
const isCodeUnique = (code, polygonsRef, excludeId = null) => {
  if (!code || !code.trim()) return true; // Empty code is not considered
  return !polygonsRef.current.some(
    (polygon) =>
      polygon.code &&
      polygon.code.trim().toLowerCase() === code.trim().toLowerCase() &&
      polygon.id !== excludeId
  );
};

// Function to generate a unique ID
const generateUniqueId = (polygonsRef) => {
  let newId;
  do {
    newId = Math.floor(Math.random() * 9999999);
  } while (polygonsRef.current.some((p) => p.id === newId));
  return newId;
};

function attachPolygonMenu(layer, polygonsRef, updateSavedPolygons) {
  // Ensure layer has an ID
  if (!layer._leaflet_id) {
    layer._leaflet_id = Math.floor(Math.random() * 9999999);
  }

  // Get the polygon ID from the layer or generate one
  const polygonId = layer.polygonId || layer._leaflet_id;

  // Find the polygon in the ref
  const polygon = polygonsRef.current.find((p) => p.id === polygonId);
  const code = polygon?.code || "";
  const label = polygon?.label || "";

  const popupContent = `
    <div style="display:flex; flex-direction:column; gap:6px;">
      <div style="margin-bottom: 8px;">
        <strong>Code:</strong> ${code}<br>
        <strong>Label:</strong> ${label}<br>
        <small>ID: ${polygonId}</small>
      </div>
      <button id="edit-btn-${polygonId}" style="padding:6px;">Edit Shape</button>
      <button id="properties-btn-${polygonId}" style="padding:6px; background:#ff9800;">Edit Properties</button>
      <button id="delete-btn-${polygonId}" style="padding:6px; background:#e53935; color:white;">Delete</button>
    </div>
  `;

  layer.bindPopup(popupContent);

  layer.on("click", () => {
    layer.openPopup();

    setTimeout(() => {
      // Edit Shape button
      const editBtn = document.getElementById(`edit-btn-${polygonId}`);
      if (editBtn) {
        editBtn.onclick = () => {
          layer.editing.enable();

          // When editing completes, save the new geometry
          layer.on("editable:editing", () => {
            const index = polygonsRef.current.findIndex(
              (p) => p.id === polygonId
            );
            if (index !== -1) {
              polygonsRef.current[index].geometry = layer.toGeoJSON().geometry;
              updateSavedPolygons();
              console.log("📝 Polygon geometry updated:", polygonId);
            }
          });
        };
      }

      // Edit Properties button
      const propertiesBtn = document.getElementById(
        `properties-btn-${polygonId}`
      );
      if (propertiesBtn) {
        propertiesBtn.onclick = () => {
          const polygon = polygonsRef.current.find((p) => p.id === polygonId);
          const currentCode = polygon?.code || "";
          const currentLabel = polygon?.label || "";

          // Function to validate and get new values
          const getNewValues = () => {
            let newCode, newLabel;
            let valid = false;

            while (!valid) {
              newCode = prompt(
                "Enter new code ID (must be unique):",
                currentCode
              );
              if (newCode === null) return null; // User cancelled

              newLabel = prompt(
                "Enter new label (must be unique):",
                currentLabel
              );
              if (newLabel === null) return null; // User cancelled

              // Check uniqueness
              const isCodeValid = isCodeUnique(newCode, polygonsRef, polygonId);
              const isLabelValid = isLabelUnique(
                newLabel,
                polygonsRef,
                polygonId
              );

              if (!isCodeValid && !isLabelValid) {
                alert(
                  "❌ Error: Both Code ID and Label already exist. Please use unique values."
                );
              } else if (!isCodeValid) {
                alert(
                  "❌ Error: Code ID already exists. Please use a unique Code ID."
                );
              } else if (!isLabelValid) {
                alert(
                  "❌ Error: Label already exists. Please use a unique Label."
                );
              } else {
                valid = true;
              }
            }

            return { newCode, newLabel };
          };

          const newValues = getNewValues();
          if (newValues) {
            const { newCode, newLabel } = newValues;
            const index = polygonsRef.current.findIndex(
              (p) => p.id === polygonId
            );
            if (index !== -1) {
              polygonsRef.current[index].code = newCode;
              polygonsRef.current[index].label = newLabel;

              // Update popup content
              const updatedPopup = `
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div style="margin-bottom: 8px;">
                    <strong>Code:</strong> ${newCode}<br>
                    <strong>Label:</strong> ${newLabel}<br>
                    <small>ID: ${polygonId}</small>
                  </div>
                  <button id="edit-btn-${polygonId}" style="padding:6px;">Edit Shape</button>
                  <button id="properties-btn-${polygonId}" style="padding:6px; background:#ff9800;">Edit Properties</button>
                  <button id="delete-btn-${polygonId}" style="padding:6px; background:#e53935; color:white;">Delete</button>
                </div>
              `;
              layer.bindPopup(updatedPopup);

              updateSavedPolygons();
              console.log("📝 Polygon properties updated:", polygonId);
            }
          }
        };
      }

      // Delete button
      const deleteBtn = document.getElementById(`delete-btn-${polygonId}`);
      if (deleteBtn) {
        deleteBtn.onclick = () => {
          if (confirm("Are you sure you want to delete this polygon?")) {
            const beforeCount = polygonsRef.current.length;
            polygonsRef.current = polygonsRef.current.filter(
              (p) => p.id !== polygonId
            );
            const afterCount = polygonsRef.current.length;

            layer.remove();
            updateSavedPolygons();

            console.log(
              `🗑️ Polygon ${polygonId} deleted. Before: ${beforeCount}, After: ${afterCount}`
            );
          }
        };
      }
    }, 50);
  });
}

/* ============= FIT BOUNDS HELPER ================== */
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

/* ============= DRAW TOOL HANDLER ================== */
function DrawTools({ polygonsRef, updateSavedPolygons }) {
  const map = useMap();

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
        polygon: { allowIntersection: false },
      },
    });

    map.addControl(drawControl);

    map.on("draw:created", (e) => {
      const layer = e.layer;

      // Function to get valid unique values from user
      const getUniqueValues = () => {
        let codeId, label;
        let valid = false;

        while (!valid) {
          codeId = prompt("Enter code ID (must be unique):");
          if (codeId === null) return null; // User cancelled

          label = prompt("Enter label (must be unique):");
          if (label === null) return null; // User cancelled

          // Check uniqueness
          const isCodeValid = isCodeUnique(codeId, polygonsRef);
          const isLabelValid = isLabelUnique(label, polygonsRef);

          if (!isCodeValid && !isLabelValid) {
            alert(
              "❌ Error: Both Code ID and Label already exist. Please use unique values."
            );
          } else if (!isCodeValid) {
            alert(
              "❌ Error: Code ID already exists. Please use a unique Code ID."
            );
          } else if (!isLabelValid) {
            alert("❌ Error: Label already exists. Please use a unique Label.");
          } else {
            valid = true;
          }
        }

        return { codeId, label };
      };

      const values = getUniqueValues();
      if (!values) return; // User cancelled

      const { codeId, label } = values;

      // Generate a unique ID
      const newId = generateUniqueId(polygonsRef);
      layer.polygonId = newId;

      drawnItems.addLayer(layer);

      polygonsRef.current.push({
        id: newId,
        geometry: layer.toGeoJSON().geometry,
        code: codeId,
        label: label,
      });

      attachPolygonMenu(layer, polygonsRef, updateSavedPolygons);
      updateSavedPolygons();
    });

    map.on("draw:edited", (e) => {
      e.layers.eachLayer((layer) => {
        const polygonId = layer.polygonId || layer._leaflet_id;
        const index = polygonsRef.current.findIndex((p) => p.id === polygonId);
        if (index !== -1) {
          polygonsRef.current[index].geometry = layer.toGeoJSON().geometry;
        }
      });

      updateSavedPolygons();
    });

    map.on("draw:deleted", (e) => {
      e.layers.eachLayer((layer) => {
        const polygonId = layer.polygonId || layer._leaflet_id;
        polygonsRef.current = polygonsRef.current.filter(
          (p) => p.id !== polygonId
        );
      });

      updateSavedPolygons();
    });
  }, [map]);

  return null;
}

/* ========================================================= */
/* ===================== MAIN COMPONENT ===================== */
/* ========================================================= */
export default function IranMap({ onPolygonsUpdate, selectedPolygon }) {
  const [layers, setLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState(0);
  const [savedPolygons, setSavedPolygons] = useState(null);
  const polygonsRef = useRef([]);
  const [forceUpdate, setForceUpdate] = useState(0); // For forcing re-renders
  const [highlightedLayer, setHighlightedLayer] = useState(null);
  const mapRef = useRef(null);

  const mapKey = `iran-map-${activeLayer}-${forceUpdate}`;

  const updateSavedPolygons = () => {
    const updatedPolygons = {
      type: "FeatureCollection",
      features: polygonsRef.current.map((p) => ({
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

    setSavedPolygons(updatedPolygons);

    // Pass data to App.jsx:
    if (onPolygonsUpdate) {
      onPolygonsUpdate(updatedPolygons);
    }

    setForceUpdate((prev) => prev + 1);
  };

  // Handle polygon highlighting when selectedPolygon changes
  useEffect(() => {
    if (!selectedPolygon || !selectedPolygon.geometry) {
      // Remove highlight if no polygon is selected
      if (highlightedLayer) {
        highlightedLayer.remove();
        setHighlightedLayer(null);
      }
      return;
    }

    console.log("Highlighting polygon:", selectedPolygon.id);

    // Get the map instance
    const map = mapRef.current;
    if (!map) {
      console.warn("Map instance not available");
      return;
    }

    // Remove previous highlight
    if (highlightedLayer) {
      highlightedLayer.remove();
    }

    // Create highlight style
    const highlightStyle = {
      color: "#FF0000", // Red border
      weight: 4,
      fillColor: "#FF0000",
      fillOpacity: 0.3,
      opacity: 1,
      dashArray: null,
    };

    // Create highlight layer
    const layer = L.geoJSON(selectedPolygon.geometry, {
      style: highlightStyle,
    }).addTo(map);

    // Zoom to the highlighted polygon
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }

    // Store the layer for later removal
    setHighlightedLayer(layer);

    // Cleanup function
    return () => {
      if (layer) {
        layer.remove();
      }
    };
  }, [selectedPolygon]);

  /* ---------- SAVE TO SERVER ---------- */
  const savePolygonsToServer = async () => {
    try {
      console.log("🔄 Attempting to save polygons...");

      // Validate uniqueness before saving
      const codeMap = new Map();
      const labelMap = new Map();
      const duplicates = [];

      for (const polygon of polygonsRef.current) {
        if (polygon.code) {
          const codeKey = polygon.code.trim().toLowerCase();
          if (codeMap.has(codeKey)) {
            duplicates.push(
              `Code: "${polygon.code}" (used by polygons: ${codeMap.get(
                codeKey
              )} and ${polygon.id})`
            );
          } else {
            codeMap.set(codeKey, polygon.id);
          }
        }

        if (polygon.label) {
          const labelKey = polygon.label.trim().toLowerCase();
          if (labelMap.has(labelKey)) {
            duplicates.push(
              `Label: "${polygon.label}" (used by polygons: ${labelMap.get(
                labelKey
              )} and ${polygon.id})`
            );
          } else {
            labelMap.set(labelKey, polygon.id);
          }
        }
      }

      if (duplicates.length > 0) {
        const errorMessage =
          "Cannot save: Duplicate values found:\n\n" + duplicates.join("\n");
        alert("❌ " + errorMessage);
        return;
      }

      console.log("✅ All polygons have unique codes and labels");

      // Test server connection
      try {
        const testResponse = await fetch("http://localhost:3001/api/test");
        if (!testResponse.ok) {
          throw new Error(`Server test failed: ${testResponse.status}`);
        }
        console.log("✅ Server is reachable");
      } catch (testError) {
        console.error("❌ Server is not reachable:", testError);
        alert(
          "Cannot connect to server. Make sure the Express server is running on port 3001."
        );
        return;
      }

      // Prepare data for saving
      const dataToSave = polygonsRef.current.map((polygon) => ({
        id: polygon.id,
        geometry: polygon.geometry,
        code: polygon.code || "",
        label: polygon.label || "",
      }));

      console.log("📤 Sending to server:", dataToSave.length, "polygons");

      const response = await fetch("http://localhost:3001/api/save-polygons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "❌ Server responded with error:",
          response.status,
          errorText
        );
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Save successful:", result);

      alert(`✅ ${result.message}\nSaved ${result.count} polygons`);

      // Force reload data from server
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("💥 Error in savePolygonsToServer:", error);
      alert(`❌ Failed to save polygons:\n${error.message}`);
    }
  };

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

  /* ---------- LOAD SAVED polygons.json ---------- */
  useEffect(() => {
    async function loadSavedPolygons() {
      try {
        console.log("📥 Loading polygons from server...");

        // Try to load from API endpoint first
        const timestamp = Date.now();
        const apiRes = await fetch(
          `http://localhost:3001/api/get-polygons?t=${timestamp}`
        );

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          console.log("📥 Loaded from API:", apiData.count, "polygons");

          // Check for duplicates in loaded data
          const codeSet = new Set();
          const labelSet = new Set();
          const duplicates = [];

          apiData.polygons.forEach((polygon) => {
            if (polygon.code) {
              const codeKey = polygon.code.trim().toLowerCase();
              if (codeSet.has(codeKey)) {
                console.warn(`⚠️ Duplicate code detected: "${polygon.code}"`);
                duplicates.push(`Code: "${polygon.code}"`);
              }
              codeSet.add(codeKey);
            }

            if (polygon.label) {
              const labelKey = polygon.label.trim().toLowerCase();
              if (labelSet.has(labelKey)) {
                console.warn(`⚠️ Duplicate label detected: "${polygon.label}"`);
                duplicates.push(`Label: "${polygon.label}"`);
              }
              labelSet.add(labelKey);
            }
          });

          if (duplicates.length > 0) {
            console.warn("⚠️ Duplicates found in loaded data:", duplicates);
          }

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
          polygonsRef.current = apiData.polygons.map((p) => ({
            ...p,
            id: p.id || generateUniqueId(polygonsRef),
          }));
          return;
        }
      } catch (apiError) {
        console.log("API endpoint not available, trying direct file...");
      }

      // Fallback to direct file
      try {
        const timestamp = Date.now();
        const res = await fetch(`/polygons.json?t=${timestamp}`);

        if (!res.ok) {
          console.log("No polygons.json found or empty file");
          polygonsRef.current = [];
          const emptyFormatted = {
            type: "FeatureCollection",
            features: [],
          };
          setSavedPolygons(emptyFormatted);
          if (onPolygonsUpdate) {
            onPolygonsUpdate(emptyFormatted);
          }
          return;
        }

        const data = await res.json();
        console.log("📥 Loaded polygons.json:", data.length, "polygons");

        // Check for duplicates
        const codeSet = new Set();
        const labelSet = new Set();
        const duplicates = [];

        data.forEach((polygon) => {
          if (polygon.code) {
            const codeKey = polygon.code.trim().toLowerCase();
            if (codeSet.has(codeKey)) {
              console.warn(
                `⚠️ Duplicate code in loaded data: "${polygon.code}"`
              );
              duplicates.push(`Code: "${polygon.code}"`);
            }
            codeSet.add(codeKey);
          }

          if (polygon.label) {
            const labelKey = polygon.label.trim().toLowerCase();
            if (labelSet.has(labelKey)) {
              console.warn(
                `⚠️ Duplicate label in loaded data: "${polygon.label}"`
              );
              duplicates.push(`Label: "${polygon.label}"`);
            }
            labelSet.add(labelKey);
          }
        });

        if (duplicates.length > 0) {
          console.warn(
            "⚠️ Duplicates found in loaded polygons.json:",
            duplicates
          );
        }

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
        polygonsRef.current = data.map((p) => ({
          ...p,
          id: p.id || generateUniqueId(polygonsRef),
        }));

        if (onPolygonsUpdate) {
          onPolygonsUpdate(formatted);
        }

        console.log("✅ Polygons loaded into state");
      } catch (err) {
        console.log("No polygons.json found or error loading:", err.message);
        polygonsRef.current = [];
        const emptyFormatted = {
          type: "FeatureCollection",
          features: [],
        };
        setSavedPolygons(emptyFormatted);
        if (onPolygonsUpdate) {
          onPolygonsUpdate(emptyFormatted);
        }
      }
    }

    loadSavedPolygons();
  }, []);

  /* ---------- DOWNLOAD polygons.json ---------- */
  const downloadPolygons = () => {
    // Validate before downloading
    const codeMap = new Map();
    const labelMap = new Map();
    const duplicates = [];

    for (const polygon of polygonsRef.current) {
      if (polygon.code) {
        const codeKey = polygon.code.trim().toLowerCase();
        if (codeMap.has(codeKey)) {
          duplicates.push(`Code: "${polygon.code}"`);
        } else {
          codeMap.set(codeKey, polygon.id);
        }
      }

      if (polygon.label) {
        const labelKey = polygon.label.trim().toLowerCase();
        if (labelMap.has(labelKey)) {
          duplicates.push(`Label: "${polygon.label}"`);
        } else {
          labelMap.set(labelKey, polygon.id);
        }
      }
    }

    if (duplicates.length > 0) {
      const errorMessage =
        "Cannot download: Duplicate values found:\n\n" + duplicates.join("\n");
      alert("❌ " + errorMessage);
      return;
    }

    const data = polygonsRef.current.map((p) => ({
      id: p.id,
      geometry: p.geometry,
      code: p.code,
      label: p.label,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "polygons.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- REFRESH DATA ---------- */
  const refreshData = async () => {
    console.log("🔄 Refreshing data from server...");
    try {
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
        polygonsRef.current = apiData.polygons.map((p) => ({
          ...p,
          id: p.id || generateUniqueId(polygonsRef),
        }));

        if (onPolygonsUpdate) {
          onPolygonsUpdate(formatted);
        }

        alert(`✅ Refreshed ${apiData.count} polygons from server`);
        setForceUpdate((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error refreshing:", error);
      alert("❌ Failed to refresh data");
    }
  };

  /* ---------- MAP LAYER STYLES ---------- */
  const styles = [
    { color: "#000", weight: 5, fillOpacity: 0 },
    { color: "#0b5", weight: 5, fillOpacity: 0 },
    { color: "#06f", weight: 2, fillOpacity: 0 },
  ];

  const labels = ["ایران", "استان‌ها", "شهرستان‌ها"];

  return (
    <div className="map-card" style={{ flex: 1 }}>
      <div
        style={{
          marginBottom: 10,
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
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

        <button
          onClick={downloadPolygons}
          style={{ padding: "6px 12px", background: "#2196f3", color: "white" }}
        >
          Download Polygons (JSON)
        </button>

        <button
          onClick={savePolygonsToServer}
          style={{ padding: "6px 12px", background: "#4CAF50", color: "white" }}
        >
          Save to Server
        </button>

        <button
          onClick={refreshData}
          style={{ padding: "6px 12px", background: "#9C27B0", color: "white" }}
        >
          Refresh Data
        </button>
      </div>

      {/* Debug info */}
      <div
        style={{
          marginBottom: "10px",
          padding: "5px",
          background: "#f5f5f5",
          fontSize: "12px",
          borderRadius: "3px",
        }}
      >
        <span>Polygons in memory: {polygonsRef.current.length}</span>
        <span style={{ marginLeft: "10px" }}>|</span>
        <span style={{ marginLeft: "10px" }}>
          Polygons displayed: {savedPolygons?.features?.length || 0}
        </span>
        {selectedPolygon && (
          <span
            style={{ marginLeft: "10px", color: "#FF0000", fontWeight: "bold" }}
          >
            | Selected:{" "}
            {selectedPolygon.properties?.label || selectedPolygon.id}
          </span>
        )}
      </div>

      {/* MAP */}
      <div className="map-style" style={{ height: 600 }}>
        <MapContainer
          ref={mapRef}
          key={mapKey}
          center={[32, 53]}
          zoom={5}
          style={{ height: "80%", width: "160%" }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />

          {layers[activeLayer] && (
            <>
              <GeoJSON data={layers[activeLayer]} style={styles[activeLayer]} />
              <FitBoundsWhenReady geojson={layers[activeLayer]} />
            </>
          )}

          {savedPolygons && (
            <GeoJSON
              key={`polygons-${savedPolygons.features.length}-${forceUpdate}`}
              data={savedPolygons}
              onEachFeature={(feature, layer) => {
                // Set polygon ID from feature
                const polygonId = feature.id || feature.properties.id;
                layer.polygonId = polygonId;
                layer._leaflet_id = polygonId; // Also set leaflet ID for consistency

                attachPolygonMenu(layer, polygonsRef, updateSavedPolygons);
              }}
              style={{
                color: "#FF4081",
                weight: 3,
                fillColor: "#FF4081",
                fillOpacity: 0.3,
              }}
            />
          )}

          <DrawTools
            polygonsRef={polygonsRef}
            updateSavedPolygons={updateSavedPolygons}
          />
        </MapContainer>
      </div>
    </div>
  );
}
