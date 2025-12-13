import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "../styles/map.css";

// Global variable to track IDs consistently
let nextId = 1000000;

// Helper function to check if label is unique
const isLabelUnique = (label, polygonsRef, excludeId = null) => {
  if (!label || !label.trim()) return true;
  return !polygonsRef.current.some(
    (polygon) =>
      polygon.label &&
      polygon.label.trim().toLowerCase() === label.trim().toLowerCase() &&
      polygon.id !== excludeId
  );
};

// Helper function to check if code/ID is unique
const isCodeUnique = (code, polygonsRef, excludeId = null) => {
  if (!code || !code.trim()) return true;
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

// Function to check if polygon bounds intersect with rectangle bounds
const polygonIntersectsRectangle = (polygonBounds, rectangleBounds) => {
  return polygonBounds.intersects(rectangleBounds);
};

function attachPolygonMenu(
  layer,
  polygonsRef,
  updateSavedPolygons,
  onPolygonSelect,
  selectedPolygonId,
  onMultiSelect
) {
  if (!layer._leaflet_id) {
    layer._leaflet_id = Math.floor(Math.random() * 9999999);
  }

  const polygonId = layer.polygonId || layer._leaflet_id;

  // Apply style based on selection
  const updatePolygonStyle = () => {
    if (selectedPolygonId === polygonId) {
      // Selected style - red
      layer.setStyle({
        color: "#FF0000",
        weight: 4,
        fillColor: "#FF0000",
        fillOpacity: 0.3,
      });
    } else {
      // Normal style - pink
      layer.setStyle({
        color: "#FF4081",
        weight: 3,
        fillColor: "#FF4081",
        fillOpacity: 0.3,
      });
    }
  };

  // Apply initial style
  updatePolygonStyle();

  // Function to save the current geometry
  const saveCurrentGeometry = () => {
    try {
      const index = polygonsRef.current.findIndex((p) => p.id === polygonId);
      if (index !== -1) {
        const updatedGeoJSON = layer.toGeoJSON();
        if (updatedGeoJSON && updatedGeoJSON.geometry) {
          const newGeometry = JSON.parse(
            JSON.stringify(updatedGeoJSON.geometry)
          );
          polygonsRef.current[index].geometry = newGeometry;
          updateSavedPolygons();
          console.log("💾 Polygon geometry saved:", polygonId);
          return true;
        }
      }
    } catch (error) {
      console.error("Error saving geometry:", error);
    }
    return false;
  };

  // Create popup content
  const updatePopupContent = () => {
    const polygon = polygonsRef.current.find((p) => p.id === polygonId);
    const code = polygon?.code || "";
    const label = polygon?.label || "";

    const popupContent = `
      <div class="polygon-popup">
        <div class="popup-header">
          <strong>Label:</strong> ${label}<br>
          <strong>Code:</strong> ${code}<br>
          <small>ID: ${polygonId}</small>
        </div>
        <button id="edit-btn-${polygonId}" class="popup-btn edit-btn">Edit Shape</button>
        <button id="save-btn-${polygonId}" class="popup-btn save-btn" style="display:none;">Save Changes</button>
        <button id="properties-btn-${polygonId}" class="popup-btn properties-btn">Edit Properties</button>
        <button id="delete-btn-${polygonId}" class="popup-btn delete-btn">Delete</button>
      </div>
    `;

    layer.bindPopup(popupContent);
  };

  // Initial popup setup
  updatePopupContent();

  // Handle polygon click
  layer.on("click", (e) => {
    // If multi-select mode is active, add to selection
    if (onMultiSelect && e.originalEvent.ctrlKey) {
      e.originalEvent.stopPropagation();
      onMultiSelect(polygonId);
      return;
    }

    // Otherwise, normal single selection
    e.originalEvent.stopPropagation();

    const polygon = polygonsRef.current.find((p) => p.id === polygonId);
    if (polygon && onPolygonSelect) {
      const feature = {
        type: "Feature",
        geometry: polygon.geometry,
        properties: {
          code: polygon.code,
          label: polygon.label,
          id: polygon.id,
        },
        id: polygon.id,
      };
      onPolygonSelect(feature);
    }

    layer.openPopup();
  });

  // Update style when selection changes
  layer.on("popupopen", () => {
    setTimeout(() => {
      // Edit Shape button
      const editBtn = document.getElementById(`edit-btn-${polygonId}`);
      if (editBtn) {
        editBtn.onclick = (e) => {
          e.stopPropagation();
          layer.editing.enable();

          const saveBtn = document.getElementById(`save-btn-${polygonId}`);
          if (saveBtn) {
            saveBtn.style.display = "block";
            editBtn.style.display = "none";

            saveBtn.onclick = (e) => {
              e.stopPropagation();
              if (saveCurrentGeometry()) {
                layer.editing.disable();
                saveBtn.style.display = "none";
                editBtn.style.display = "block";
                alert("✅ Polygon shape saved!");
              }
            };
          }

          const map = layer._map;
          const mapClickHandler = () => {
            if (saveCurrentGeometry()) {
              console.log("💾 Saved via map click");
            }
          };

          map.on("click", mapClickHandler);

          layer.once("editable:disable", () => {
            map.off("click", mapClickHandler);
            saveCurrentGeometry();
            console.log("💾 Saved via editable:disable");

            const saveBtn = document.getElementById(`save-btn-${polygonId}`);
            const editBtn = document.getElementById(`edit-btn-${polygonId}`);
            if (saveBtn && editBtn) {
              saveBtn.style.display = "none";
              editBtn.style.display = "block";
            }
          });
        };
      }

      // Edit Properties button
      const propertiesBtn = document.getElementById(
        `properties-btn-${polygonId}`
      );
      if (propertiesBtn) {
        propertiesBtn.onclick = (e) => {
          e.stopPropagation();
          const polygon = polygonsRef.current.find((p) => p.id === polygonId);
          const currentCode = polygon?.code || "";
          const currentLabel = polygon?.label || "";

          const getNewValues = () => {
            let newCode, newLabel;
            let valid = false;

            while (!valid) {
              newCode = prompt(
                "Enter new code ID (must be unique):",
                currentCode
              );
              if (newCode === null) return null;

              newLabel = prompt(
                "Enter new label (must be unique):",
                currentLabel
              );
              if (newLabel === null) return null;

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

              updatePopupContent();
              updateSavedPolygons();
              console.log("📝 Polygon properties updated:", polygonId);
            }
          }
        };
      }

      // Delete button
      const deleteBtn = document.getElementById(`delete-btn-${polygonId}`);
      if (deleteBtn) {
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
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

            if (onPolygonSelect) {
              onPolygonSelect(null);
            }
          }
        };
      }
    }, 50);
  });

  // Return a function to update style when selection changes
  return updatePolygonStyle;
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
function DrawTools({ polygonsRef, updateSavedPolygons, onPolygonSelect }) {
  const map = useMap();

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControlOptions = {
      edit: {
        featureGroup: drawnItems,
        edit: {
          selectedPathOptions: {
            maintainColor: true,
          },
        },
      },
      draw: {
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
        polygon: {
          allowIntersection: false,
          showArea: false,
          metric: false,
          shapeOptions: {
            color: "#FF4081",
            weight: 3,
            fillColor: "#FF4081",
            fillOpacity: 0.3,
          },
        },
      },
    };

    let drawControl;
    try {
      drawControl = new L.Control.Draw(drawControlOptions);
      map.addControl(drawControl);
    } catch (error) {
      console.error("Error creating draw control:", error);
      drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: {
          polygon: { allowIntersection: false },
        },
      });
      map.addControl(drawControl);
    }

    map.on("draw:created", (e) => {
      const layer = e.layer;

      const getUniqueValues = () => {
        let codeId, label;
        let valid = false;

        while (!valid) {
          codeId = prompt("Enter code ID (must be unique):");
          if (codeId === null) return null;

          label = prompt("Enter label (must be unique):");
          if (label === null) return null;

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
      if (!values) {
        map.removeLayer(layer);
        return;
      }

      const { codeId, label } = values;
      const newId = generateUniqueId(polygonsRef);
      layer.polygonId = newId;

      drawnItems.addLayer(layer);

      polygonsRef.current.push({
        id: newId,
        geometry: JSON.parse(JSON.stringify(layer.toGeoJSON().geometry)),
        code: codeId,
        label: label,
      });

      updateSavedPolygons();

      // Select the newly created polygon
      if (onPolygonSelect) {
        const polygon = {
          type: "Feature",
          geometry: layer.toGeoJSON().geometry,
          properties: {
            code: codeId,
            label: label,
            id: newId,
          },
          id: newId,
        };
        onPolygonSelect(polygon);
      }
    });

    map.on("draw:edited", (e) => {
      console.log("🔄 Draw:edited event triggered");

      e.layers.eachLayer((layer) => {
        const polygonId = layer.polygonId || layer._leaflet_id;
        const index = polygonsRef.current.findIndex((p) => p.id === polygonId);
        if (index !== -1) {
          try {
            const updatedGeoJSON = layer.toGeoJSON();
            if (updatedGeoJSON && updatedGeoJSON.geometry) {
              polygonsRef.current[index].geometry = JSON.parse(
                JSON.stringify(updatedGeoJSON.geometry)
              );
              console.log(
                "📝 Polygon geometry updated via draw:edited:",
                polygonId
              );
            }
          } catch (error) {
            console.error("Error updating polygon geometry:", error);
          }
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

      if (onPolygonSelect) {
        onPolygonSelect(null);
      }
    });

    return () => {
      try {
        map.removeControl(drawControl);
        map.removeLayer(drawnItems);
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    };
  }, [map]);

  return null;
}

/* ============= RECTANGLE SELECTION HANDLER ================== */
/* ============= RECTANGLE SELECTION HANDLER ================== */
function RectangleSelectionTool({ polygonsRef, onMultiSelect, isActive }) {
  const map = useMap();
  const rectangleLayerRef = useRef(null);
  const startPointRef = useRef(null);
  const rectangleRef = useRef(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      // Clean up if rectangle is drawn
      if (rectangleLayerRef.current) {
        rectangleLayerRef.current.remove();
        rectangleLayerRef.current = null;
      }
      return;
    }

    // Prevent context menu (right-click menu) when in selection mode
    const preventContextMenu = (e) => {
      e.preventDefault();
    };

    // Add context menu prevention to the map container
    const mapContainer = map.getContainer();
    mapContainer.addEventListener("contextmenu", preventContextMenu);

    const handleMouseDown = (e) => {
      // Only handle RIGHT mouse button (button === 2)
      if (e.originalEvent.button !== 2) return;

      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();

      startPointRef.current = e.latlng;
      isDrawingRef.current = true;

      // Remove any existing rectangle
      if (rectangleLayerRef.current) {
        rectangleLayerRef.current.remove();
      }

      // Create a new rectangle layer
      rectangleRef.current = L.rectangle(
        [startPointRef.current, startPointRef.current],
        {
          color: "#3388ff",
          weight: 2,
          fillColor: "#3388ff",
          fillOpacity: 0.1,
          interactive: false,
        }
      ).addTo(map);
      rectangleLayerRef.current = rectangleRef.current;
    };

    const handleMouseMove = (e) => {
      if (!isDrawingRef.current || !startPointRef.current) return;

      const bounds = L.latLngBounds(startPointRef.current, e.latlng);
      rectangleRef.current.setBounds(bounds);
    };

    const handleMouseUp = (e) => {
      // Only handle RIGHT mouse button (button === 2)
      if (e.originalEvent.button !== 2) return;

      if (!isDrawingRef.current || !startPointRef.current) return;

      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();

      isDrawingRef.current = false;
      const endPoint = e.latlng;
      const selectionBounds = L.latLngBounds(startPointRef.current, endPoint);

      // Find polygons that intersect with the selection rectangle
      const selectedPolygonIds = [];

      // We need to get all polygon layers from the map
      map.eachLayer((layer) => {
        if (layer.polygonId && layer.getBounds) {
          const polygonBounds = layer.getBounds();
          if (polygonIntersectsRectangle(polygonBounds, selectionBounds)) {
            selectedPolygonIds.push(layer.polygonId);
          }
        }
      });

      // Call the multi-select callback with selected polygon IDs
      if (selectedPolygonIds.length > 0 && onMultiSelect) {
        onMultiSelect(selectedPolygonIds);
      }

      // Remove the rectangle after a short delay
      setTimeout(() => {
        if (rectangleLayerRef.current) {
          rectangleLayerRef.current.remove();
          rectangleLayerRef.current = null;
        }
      }, 300);

      startPointRef.current = null;
    };

    // Add event listeners for RIGHT CLICK
    map.on("mousedown", handleMouseDown);
    map.on("mousemove", handleMouseMove);
    map.on("mouseup", handleMouseUp);

    // Clean up
    return () => {
      mapContainer.removeEventListener("contextmenu", preventContextMenu);
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseup", handleMouseUp);

      if (rectangleLayerRef.current) {
        rectangleLayerRef.current.remove();
        rectangleLayerRef.current = null;
      }
    };
  }, [map, isActive, onMultiSelect]);

  return null;
}

/* ============= MAIN COMPONENT ===================== */
export default function IranMap({ onPolygonsUpdate, selectedPolygon }) {
  const [layers, setLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState(0);
  const [savedPolygons, setSavedPolygons] = useState(null);
  const polygonsRef = useRef([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [internalSelectedPolygon, setInternalSelectedPolygon] = useState(null);
  const [multiSelectedPolygonIds, setMultiSelectedPolygonIds] = useState([]);
  const [isRectangleSelectMode, setIsRectangleSelectMode] = useState(false);
  const [showMultiDeletePopup, setShowMultiDeletePopup] = useState(false);
  const mapRef = useRef(null);
  const layerRefs = useRef({});
  const updateStyleFunctions = useRef({});

  const mapKey = `iran-map-${activeLayer}-${forceUpdate}`;

  // Function to handle polygon selection
  const handlePolygonSelect = useCallback((polygon) => {
    console.log(
      "🔘 Polygon selection:",
      polygon ? `ID: ${polygon.id}` : "Cleared"
    );

    // Store the selected polygon
    setInternalSelectedPolygon(polygon);

    // Clear multi-selection when single selecting
    setMultiSelectedPolygonIds([]);

    // Zoom to the polygon if it exists
    if (polygon && polygon.geometry) {
      const map = mapRef.current;
      if (map) {
        try {
          const layer = L.geoJSON(polygon.geometry);
          const bounds = layer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
          }
        } catch (error) {
          console.error("Error zooming to polygon:", error);
        }
      }
    }

    // Update all polygon styles
    Object.values(updateStyleFunctions.current).forEach((updateFn) => {
      if (updateFn) updateFn();
    });
  }, []);

  // Function to handle multi-selection
  const handleMultiSelect = useCallback((polygonIds) => {
    console.log("🔘 Multi-selection:", polygonIds);

    if (Array.isArray(polygonIds)) {
      // Rectangle selection
      setMultiSelectedPolygonIds(polygonIds);
      setInternalSelectedPolygon(null);

      // Show multi-delete popup if we have selected polygons
      if (polygonIds.length > 0) {
        setShowMultiDeletePopup(true);
      }
    } else {
      // Single polygon toggle (for Ctrl+click)
      const polygonId = polygonIds;
      setMultiSelectedPolygonIds((prev) => {
        if (prev.includes(polygonId)) {
          return prev.filter((id) => id !== polygonId);
        } else {
          return [...prev, polygonId];
        }
      });
      setInternalSelectedPolygon(null);
    }

    // Update all polygon styles
    Object.values(updateStyleFunctions.current).forEach((updateFn) => {
      if (updateFn) updateFn();
    });
  }, []);

  // Function to update polygon style based on selection
  const getPolygonStyle = useCallback(
    (polygonId) => {
      if (internalSelectedPolygon?.id === polygonId) {
        return {
          color: "#FF0000",
          weight: 4,
          fillColor: "#FF0000",
          fillOpacity: 0.3,
        };
      } else if (multiSelectedPolygonIds.includes(polygonId)) {
        return {
          color: "#FFA500", // Orange for multi-selected
          weight: 4,
          fillColor: "#FFA500",
          fillOpacity: 0.3,
        };
      } else {
        return {
          color: "#FF4081",
          weight: 3,
          fillColor: "#FF4081",
          fillOpacity: 0.3,
        };
      }
    },
    [internalSelectedPolygon, multiSelectedPolygonIds]
  );

  // Handle external polygon selection from parent
  useEffect(() => {
    if (selectedPolygon) {
      handlePolygonSelect(selectedPolygon);
    }
  }, [selectedPolygon, handlePolygonSelect]);

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

    if (onPolygonsUpdate) {
      onPolygonsUpdate(updatedPolygons);
    }

    setForceUpdate((prev) => prev + 1);
    console.log(
      "💾 Updated polygons state. Count:",
      polygonsRef.current.length
    );
  };

  // Set up map click handler to clear selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Simple map click handler - clears selection when clicking anywhere on map
    const handleMapClick = () => {
      console.log("🗺️ Map clicked, clearing selection");
      setInternalSelectedPolygon(null);
      setMultiSelectedPolygonIds([]);
      setShowMultiDeletePopup(false);
      Object.values(updateStyleFunctions.current).forEach((updateFn) => {
        if (updateFn) updateFn();
      });
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, []);

  // Function to delete multiple polygons
  const deleteSelectedPolygons = () => {
    if (multiSelectedPolygonIds.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${multiSelectedPolygonIds.length} selected polygon(s)?`
    );

    if (!confirmDelete) return;

    const beforeCount = polygonsRef.current.length;

    // Remove selected polygons from the array
    polygonsRef.current = polygonsRef.current.filter(
      (polygon) => !multiSelectedPolygonIds.includes(polygon.id)
    );

    // Remove the layers from the map
    multiSelectedPolygonIds.forEach((polygonId) => {
      const layer = layerRefs.current[polygonId];
      if (layer) {
        layer.remove();
        delete layerRefs.current[polygonId];
        delete updateStyleFunctions.current[polygonId];
      }
    });

    const afterCount = polygonsRef.current.length;

    console.log(
      `🗑️ Deleted ${multiSelectedPolygonIds.length} polygons. Before: ${beforeCount}, After: ${afterCount}`
    );

    // Clear selection and hide popup
    setMultiSelectedPolygonIds([]);
    setShowMultiDeletePopup(false);

    // Update saved polygons
    updateSavedPolygons();
  };

  // Clean up refs on unmount
  useEffect(() => {
    return () => {
      layerRefs.current = {};
      updateStyleFunctions.current = {};
    };
  }, []);

  /* ---------- SAVE TO SERVER ---------- */
  const savePolygonsToServer = async () => {
    try {
      console.log("🔄 Attempting to save polygons...");
      console.log("📊 Current polygons in memory:", polygonsRef.current.length);

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

      handlePolygonSelect(null);
      setMultiSelectedPolygonIds([]);

      setTimeout(() => {
        window.location.reload();
      }, 1500);
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
          if (onPolygonsUpdate) {
            onPolygonsUpdate(formatted);
          }
          polygonsRef.current = apiData.polygons.map((p) => ({
            ...p,
            id: p.id || generateUniqueId(polygonsRef),
          }));

          console.log(
            "✅ Polygons loaded into ref:",
            polygonsRef.current.length
          );
          return;
        }
      } catch (apiError) {
        console.log(
          "API endpoint not available, trying direct file...",
          apiError
        );
      }

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

        <button onClick={downloadPolygons} className="map-btn download-btn">
          Download Polygons (JSON)
        </button>

        <button onClick={refreshData} className="map-btn refresh-btn">
          Refresh Data
        </button>

        {/* Rectangle Selection Button */}
        <button
          onClick={() => {
            setIsRectangleSelectMode(!isRectangleSelectMode);
            setShowMultiDeletePopup(false);
            if (!isRectangleSelectMode) {
              setMultiSelectedPolygonIds([]);
            }
          }}
          className={`map-btn rectangle-select-btn ${
            isRectangleSelectMode ? "active" : ""
          }`}
          // style={{
          //   backgroundColor: isRectangleSelectMode
          //     ? "rgba(255, 45, 80, 1)ff"
          //     : "#2d2d38",
          //   color: "white",
          // }}
        >
          {isRectangleSelectMode
            ? "✋ Cancel Selection"
            : "⬛ Rectangle Select (Right-Click)"}
        </button>

        {/* Delete Selected Button */}
        {multiSelectedPolygonIds.length > 0 && (
          <button
            onClick={deleteSelectedPolygons}
            className="map-btn delete-selected-btn"
            style={{
              backgroundColor: "#f44336",
              color: "white",
            }}
          >
            🗑️ Delete Selected ({multiSelectedPolygonIds.length})
          </button>
        )}
        <button onClick={savePolygonsToServer} className="map-btn save-btn">
          Save to Server
        </button>
      </div>

      {/* Multi-Delete Popup */}
      {showMultiDeletePopup && multiSelectedPolygonIds.length > 0 && (
        <div className="multi-delete-popup">
          <div className="popup-content">
            <h3>Delete Selected Polygons?</h3>
            <p>
              You have selected {multiSelectedPolygonIds.length} polygon(s).
            </p>
            <div className="popup-actions">
              <button
                onClick={deleteSelectedPolygons}
                className="popup-btn delete-btn"
              >
                🗑️ Delete All
              </button>
              <button
                onClick={() => setShowMultiDeletePopup(false)}
                className="popup-btn cancel-btn"
              >
                ✋ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="map-container">
        <MapContainer
          ref={mapRef}
          key={mapKey}
          center={[32, 53]}
          zoom={5}
          className="leaflet-map"
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
              <GeoJSON
                data={layers[activeLayer]}
                style={layerStyles[activeLayer]}
              />
              <FitBoundsWhenReady geojson={layers[activeLayer]} />
            </>
          )}

          {savedPolygons && (
            <GeoJSON
              key={`polygons-${savedPolygons.features.length}-${forceUpdate}`}
              data={savedPolygons}
              onEachFeature={(feature, layer) => {
                const polygonId = feature.id || feature.properties.id;
                layer.polygonId = polygonId;
                layer._leaflet_id = polygonId;

                // Store layer reference
                layerRefs.current[polygonId] = layer;

                // Apply initial style
                layer.setStyle(getPolygonStyle(polygonId));

                // Get update function and store it
                const updateFn = () => {
                  layer.setStyle(getPolygonStyle(polygonId));
                };
                updateStyleFunctions.current[polygonId] = updateFn;

                // Attach menu (without passing selectedPolygonId since we handle styling separately)
                const attachMenuFn = () => {
                  // Create popup content
                  const polygon = polygonsRef.current.find(
                    (p) => p.id === polygonId
                  );
                  const code = polygon?.code || "";
                  const label = polygon?.label || "";

                  const popupContent = `
                    <div class="polygon-popup">
                      <div class="popup-header">
                        <strong>Label:</strong> ${label}<br>
                        <strong>Code:</strong> ${code}<br>
                        <small>ID: ${polygonId}</small>
                      </div>
                      <button id="edit-btn-${polygonId}" class="popup-btn edit-btn">Edit Shape</button>
                      <button id="save-btn-${polygonId}" class="popup-btn save-btn" style="display:none;">Save Changes</button>
                      <button id="properties-btn-${polygonId}" class="popup-btn properties-btn">Edit Properties</button>
                      <button id="delete-btn-${polygonId}" class="popup-btn delete-btn">Delete</button>
                    </div>
                  `;

                  layer.bindPopup(popupContent);

                  // Handle polygon click
                  layer.off("click"); // Remove previous handlers
                  layer.on("click", (e) => {
                    // If rectangle select mode is active, add to multi-selection
                    if (isRectangleSelectMode) {
                      e.originalEvent.stopPropagation();
                      handleMultiSelect(polygonId);
                      return;
                    }

                    // If Ctrl key is pressed, add to multi-selection
                    if (e.originalEvent.ctrlKey) {
                      e.originalEvent.stopPropagation();
                      handleMultiSelect(polygonId);
                      return;
                    }

                    // Otherwise, normal single selection
                    e.originalEvent.stopPropagation();

                    const polygon = polygonsRef.current.find(
                      (p) => p.id === polygonId
                    );
                    if (polygon) {
                      const feature = {
                        type: "Feature",
                        geometry: polygon.geometry,
                        properties: {
                          code: polygon.code,
                          label: polygon.label,
                          id: polygon.id,
                        },
                        id: polygon.id,
                      };
                      handlePolygonSelect(feature);
                    }

                    layer.openPopup();
                  });

                  // Handle popup buttons
                  layer.on("popupopen", () => {
                    setTimeout(() => {
                      // Edit Shape button
                      const editBtn = document.getElementById(
                        `edit-btn-${polygonId}`
                      );
                      if (editBtn) {
                        editBtn.onclick = (e) => {
                          e.stopPropagation();
                          layer.editing.enable();

                          const saveBtn = document.getElementById(
                            `save-btn-${polygonId}`
                          );
                          if (saveBtn) {
                            saveBtn.style.display = "block";
                            editBtn.style.display = "none";

                            saveBtn.onclick = (e) => {
                              e.stopPropagation();
                              const index = polygonsRef.current.findIndex(
                                (p) => p.id === polygonId
                              );
                              if (index !== -1) {
                                const updatedGeoJSON = layer.toGeoJSON();
                                if (updatedGeoJSON && updatedGeoJSON.geometry) {
                                  const newGeometry = JSON.parse(
                                    JSON.stringify(updatedGeoJSON.geometry)
                                  );
                                  polygonsRef.current[index].geometry =
                                    newGeometry;
                                  updateSavedPolygons();
                                  console.log(
                                    "💾 Polygon geometry saved:",
                                    polygonId
                                  );

                                  layer.editing.disable();
                                  saveBtn.style.display = "none";
                                  editBtn.style.display = "block";
                                  alert("✅ Polygon shape saved!");
                                }
                              }
                            };
                          }

                          const map = layer._map;
                          const mapClickHandler = () => {
                            const index = polygonsRef.current.findIndex(
                              (p) => p.id === polygonId
                            );
                            if (index !== -1) {
                              const updatedGeoJSON = layer.toGeoJSON();
                              if (updatedGeoJSON && updatedGeoJSON.geometry) {
                                polygonsRef.current[index].geometry =
                                  JSON.parse(
                                    JSON.stringify(updatedGeoJSON.geometry)
                                  );
                                updateSavedPolygons();
                                console.log("💾 Saved via map click");
                              }
                            }
                          };

                          map.on("click", mapClickHandler);

                          layer.once("editable:disable", () => {
                            map.off("click", mapClickHandler);
                            const index = polygonsRef.current.findIndex(
                              (p) => p.id === polygonId
                            );
                            if (index !== -1) {
                              const updatedGeoJSON = layer.toGeoJSON();
                              if (updatedGeoJSON && updatedGeoJSON.geometry) {
                                polygonsRef.current[index].geometry =
                                  JSON.parse(
                                    JSON.stringify(updatedGeoJSON.geometry)
                                  );
                                updateSavedPolygons();
                                console.log("💾 Saved via editable:disable");
                              }
                            }

                            const saveBtn = document.getElementById(
                              `save-btn-${polygonId}`
                            );
                            const editBtn = document.getElementById(
                              `edit-btn-${polygonId}`
                            );
                            if (saveBtn && editBtn) {
                              saveBtn.style.display = "none";
                              editBtn.style.display = "block";
                            }
                          });
                        };
                      }

                      // Edit Properties button
                      const propertiesBtn = document.getElementById(
                        `properties-btn-${polygonId}`
                      );
                      if (propertiesBtn) {
                        propertiesBtn.onclick = (e) => {
                          e.stopPropagation();
                          const polygon = polygonsRef.current.find(
                            (p) => p.id === polygonId
                          );
                          const currentCode = polygon?.code || "";
                          const currentLabel = polygon?.label || "";

                          const getNewValues = () => {
                            let newCode, newLabel;
                            let valid = false;

                            while (!valid) {
                              newCode = prompt(
                                "Enter new code ID (must be unique):",
                                currentCode
                              );
                              if (newCode === null) return null;

                              newLabel = prompt(
                                "Enter new label (must be unique):",
                                currentLabel
                              );
                              if (newLabel === null) return null;

                              const isCodeValid = isCodeUnique(
                                newCode,
                                polygonsRef,
                                polygonId
                              );
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

                              // Update popup
                              attachMenuFn();
                              updateSavedPolygons();
                              console.log(
                                "📝 Polygon properties updated:",
                                polygonId
                              );
                            }
                          }
                        };
                      }

                      // Delete button
                      const deleteBtn = document.getElementById(
                        `delete-btn-${polygonId}`
                      );
                      if (deleteBtn) {
                        deleteBtn.onclick = (e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              "Are you sure you want to delete this polygon?"
                            )
                          ) {
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

                            // Remove from multi-selection if it was there
                            setMultiSelectedPolygonIds((prev) =>
                              prev.filter((id) => id !== polygonId)
                            );
                            handlePolygonSelect(null);
                          }
                        };
                      }
                    }, 50);
                  });
                };

                // Attach menu
                attachMenuFn();
              }}
            />
          )}

          <DrawTools
            polygonsRef={polygonsRef}
            updateSavedPolygons={updateSavedPolygons}
            onPolygonSelect={handlePolygonSelect}
          />

          {/* Rectangle Selection Tool */}
          <RectangleSelectionTool
            polygonsRef={polygonsRef}
            onMultiSelect={handleMultiSelect}
            isActive={isRectangleSelectMode}
          />
        </MapContainer>
      </div>
    </div>
  );
}
