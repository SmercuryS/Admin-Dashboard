import React, { useState } from "react";
import "../styles/sidebar.css";

export default function Sidebar({ polygons, onPolygonSelect }) {
  const [provinceSelects, setProvinceSelects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showAllPolygons, setShowAllPolygons] = useState(false);

  const options = ["___", "سیب", "گردو", "نخل", "مرکبات"];
  const provinceOptions = [
    "___",
    "فارس",
    "کهکیلویه و بویراحمد",
    "یزد",
    "کرمان",
  ];

  function addProvinceSelect() {
    setProvinceSelects([...provinceSelects, { id: Date.now() }]);
  }

  function removeProvinceSelect(id) {
    setProvinceSelects(provinceSelects.filter((item) => item.id !== id));
  }

  // Search function
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSelectedResult(null);
      return;
    }

    if (!polygons || !polygons.features) {
      console.log("No polygons available for search");
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = polygons.features.filter((feature) => {
      const label = feature.properties?.label || "";
      return label.toLowerCase().includes(query);
    });

    setSearchResults(results);
    setSelectedResult(null); // Clear previous selection when new search
    console.log(`Found ${results.length} polygons matching "${searchQuery}"`);
  };

  // Handle polygon selection from search results
  const handleResultClick = (polygon) => {
    setSelectedResult(polygon);

    // Notify parent component (App.jsx) about the selection
    if (onPolygonSelect) {
      onPolygonSelect(polygon);
    }

    console.log("Selected polygon from sidebar:", polygon);
  };

  // Handle polygon selection from all polygons list
  const handleAllPolygonClick = (polygon) => {
    setSelectedResult(polygon);

    // Notify parent component (App.jsx) about the selection
    if (onPolygonSelect) {
      onPolygonSelect(polygon);
    }

    console.log("Selected polygon from all list:", polygon);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedResult(null);

    // Clear selection in parent component
    if (onPolygonSelect) {
      onPolygonSelect(null);
    }
  };

  // Toggle showing all polygons
  const toggleAllPolygons = () => {
    setShowAllPolygons(!showAllPolygons);
  };

  return (
    <div className="sidebar">
      {/* SEARCH SECTION */}
      <div className="search-section">
        <h3>جستجوی پولیگان</h3>
        <div className="search-input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder=". . . جستجوی برچسب پولیگان"
            className="search-input"
            dir="auto"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <div className="search-buttons">
            <button
              onClick={handleSearch}
              className="search-btn"
              disabled={!searchQuery.trim()}
            >
              جستجو
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <div className="results-header">
              <span>{searchResults.length} نتیجه یافت شد:</span>
              <button onClick={clearSearch} className="small-clear-btn">
                ×
              </button>
            </div>
            <div className="results-list">
              {searchResults.map((polygon) => (
                <div
                  key={polygon.id || polygon.properties?.id}
                  className={`result-item ${
                    selectedResult?.id === polygon.id ? "selected" : ""
                  }`}
                  onClick={() => handleResultClick(polygon)}
                  title={`کد: ${polygon.properties?.code || "بدون کد"}`}
                >
                  <span className="result-label">
                    {polygon.properties?.label || "بدون نام"}
                  </span>
                  <span className="result-code">
                    ({polygon.properties?.code || "N/A"})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display message if no polygons yet */}
        {!polygons && (
          <div className="no-data-message">منتظر بارگذاری پولیگان ها ...</div>
        )}

        {polygons && polygons.features.length === 0 && (
          <div className="no-data-message">
            هنوز پولیگانی وجود ندارد. اولین پولیگان را روی نقشه ایجاد کنید.
          </div>
        )}
      </div>

      <hr className="divider" />

      {/* ALL POLYGONS LIST SECTION */}
      <div className="all-polygons-section">
        <div className="section-header">
          <h3>لیست پولیگان‌ها</h3>
          <button
            className="toggle-btn"
            onClick={toggleAllPolygons}
            title={showAllPolygons ? "بستن لیست" : "نمایش لیست"}
          >
            {showAllPolygons ? "▲" : "▼"}
          </button>
        </div>

        {showAllPolygons && polygons && polygons.features.length > 0 && (
          <div className="all-polygons-list">
            <div className="results-header">
              <span>کل پولیگان‌ها: {polygons.features.length}</span>
            </div>
            <div className="results-list">
              {polygons.features.map((polygon) => (
                <div
                  key={polygon.id || polygon.properties?.id}
                  className={`result-item ${
                    selectedResult?.id === polygon.id ? "selected" : ""
                  }`}
                  onClick={() => handleAllPolygonClick(polygon)}
                  title={`کد: ${polygon.properties?.code || "بدون کد"}`}
                >
                  <span className="result-label">
                    {polygon.properties?.label || "بدون نام"}
                  </span>
                  <span className="result-code">
                    ({polygon.properties?.code || "N/A"})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showAllPolygons && polygons && polygons.features.length === 0 && (
          <div className="no-data-message">
            هنوز پولیگانی وجود ندارد. اولین پولیگان را روی نقشه ایجاد کنید.
          </div>
        )}
      </div>

      <hr className="divider" />

      {/* Existing dropdowns section */}
      <h3>برچسب ها</h3>

      {/* FIXED TOP DROPDOWNS */}
      <select className="droppers">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>

      <select className="droppers">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>

      <select className="droppers">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>

      <select className="droppers">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>

      {/* ------- ONLY THIS SECTION IS DYNAMIC ------- */}
      <h3>استان ها</h3>

      {/* STATIC FIRST DROPPER */}
      <select className="droppers">
        {provinceOptions.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>

      {provinceSelects.map((item) => (
        <div key={item.id} className="dynamic-row">
          <select className="droppers">
            {provinceOptions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>

          <button
            className="trash-btn"
            onClick={() => removeProvinceSelect(item.id)}
          >
            ❌
          </button>
        </div>
      ))}

      {/* + BUTTON ONLY FOR PROVINCE SECTION */}
      <button className="add-btn" onClick={addProvinceSelect}>
        +
      </button>

      <button className="apply-btn">اعمال</button>
    </div>
  );
}
