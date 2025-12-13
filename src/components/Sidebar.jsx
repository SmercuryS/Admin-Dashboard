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
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <div className="sidebar-brand-wrapper d-none d-lg-flex align-items-center justify-content-center fixed-top">
        <a className="sidebar-brand brand-logo">
          <span>نقشه پولیگان</span>
        </a>
        <a className="sidebar-brand brand-logo-mini" href="index.html">
          <span>نقشه</span>
        </a>
      </div>
      <ul className="nav">
        {/* SEARCH SECTION */}
        <li className="nav-item menu-items">
          <div className="search-section">
            <div className="search-input-group">
              <div className="input-with-icon">
                <i className="mdi mdi-magnify"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی برچسب پولیگان ..."
                  className="search-input"
                  dir="auto"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="search-buttons">
                <button
                  onClick={handleSearch}
                  className="search-btn"
                  disabled={!searchQuery.trim()}
                >
                  <i className="mdi mdi-magnify"></i>
                  جستجو
                </button>
                {searchQuery && (
                  <button onClick={clearSearch} className="clear-btn">
                    <i className="mdi mdi-close"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="search-results">
                <div className="results-header">
                  <span>{searchResults.length} نتیجه یافت شد:</span>
                  <button onClick={clearSearch} className="small-clear-btn">
                    <i className="mdi mdi-close"></i>
                  </button>
                </div>
                <div className="results-list">
                  {searchResults.map((polygon) => (
                    <div
                      key={polygon.id || polygon.properties?.id}
                      className={`result-item ${
                        selectedResult?.id === polygon.id ? "active" : ""
                      }`}
                      onClick={() => handleResultClick(polygon)}
                    >
                      <div className="menu-icon">
                        <i className="mdi mdi-map-marker"></i>
                      </div>
                      <div className="result-content">
                        <span className="menu-title">
                          {polygon.properties?.label || "بدون نام"}
                        </span>
                        <span className="result-code">
                          {polygon.properties?.code || "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {polygons && polygons.features.length === 0 && (
              <div className="no-data-message">
                <i className="mdi mdi-map-outline"></i>
                هنوز پولیگانی وجود ندارد.
              </div>
            )}
          </div>
        </li>

        {/* ALL POLYGONS LIST SECTION */}
        <li className="nav-item menu-items">
          <div
            className={`nav-link ${showAllPolygons ? "menu-expanded" : ""}`}
            onClick={toggleAllPolygons}
            style={{ cursor: "pointer" }}
          >
            <span className="menu-icon">
              <i className="mdi mdi-format-list-bulleted"></i>
            </span>
            <span className="menu-title">لیست پولیگان‌ها</span>
            <i className="menu-arrow"></i>
          </div>

          {showAllPolygons && polygons && polygons.features.length > 0 && (
            <ul className="nav flex-column sub-menu">
              <div className="results-header">
                <span>کل پولیگان‌ها: {polygons.features.length}</span>
              </div>
              {polygons.features.map((polygon) => (
                <li
                  key={polygon.id || polygon.properties?.id}
                  className="nav-item"
                >
                  <div
                    className={`nav-link ${
                      selectedResult?.id === polygon.id ? "active" : ""
                    }`}
                    onClick={() => handleAllPolygonClick(polygon)}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="menu-icon">
                      <i className="mdi mdi-map-marker"></i>
                    </span>
                    <span className="menu-title">
                      {polygon.properties?.label || "بدون نام"}
                    </span>
                    <span className="result-code">
                      ({polygon.properties?.code || "N/A"})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {showAllPolygons && polygons && polygons.features.length === 0 && (
            <div className="no-data-message">
              <i className="mdi mdi-map-outline"></i>
              هنوز پولیگانی وجود ندارد.
            </div>
          )}
        </li>

        <li className="nav-item nav-category">
          <span className="nav-link">برچسب‌گذاری</span>
        </li>

        {/* TAGS SECTION */}
        <li className="nav-item menu-items">
          {/* <div className="nav-link">
            <span className="menu-icon">
              <i className="mdi mdi-tag-multiple"></i>
            </span>
            <span className="menu-title">برچسب‌ها</span>
          </div> */}
          <div className="tags-section">
            <select className="form-control droppers">
              {options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>

            <select className="form-control droppers">
              {options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>

            <select className="form-control droppers">
              {options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>

            <select className="form-control droppers">
              {options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </li>

        {/* PROVINCES SECTION */}
        <li className="nav-item menu-items">
          <div className="nav-link">
            <span className="menu-icon">
              <i className="mdi mdi-map"></i>
            </span>
            <span className="menu-title">استان‌ها</span>
          </div>
          <div className="provinces-section">
            {/* STATIC FIRST DROPPER */}
            <select className="form-control droppers">
              {provinceOptions.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>

            {provinceSelects.map((item) => (
              <div key={item.id} className="dynamic-row">
                <select className="form-control droppers">
                  {provinceOptions.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>

                <button
                  className="trash-btn"
                  onClick={() => removeProvinceSelect(item.id)}
                >
                  <i className="mdi mdi-delete"></i>
                </button>
              </div>
            ))}

            {/* + BUTTON ONLY FOR PROVINCE SECTION */}
            <button className="add-btn" onClick={addProvinceSelect}>
              <i className="mdi mdi-plus"></i>
              افزودن استان
            </button>

            <button className="apply-btn">
              <i className="mdi mdi-check"></i>
              اعمال فیلترها
            </button>
          </div>
        </li>
      </ul>
    </nav>
  );
}
