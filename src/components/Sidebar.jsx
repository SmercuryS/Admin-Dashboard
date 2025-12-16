import React, { useState, useMemo } from "react";
import "../styles/sidebar.css";

export default function Sidebar({ polygons, onPolygonSelect }) {
  const [provinceSelects, setProvinceSelects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showAllPolygons, setShowAllPolygons] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const options = ["___", "سیب", "گردو", "نخل", "مرکبات"];

  // Base province options
  const baseProvinceOptions = [
    "___",
    "فارس",
    "کهکیلویه و بویراحمد",
    "یزد",
    "کرمان",
  ];

  // Get all unique code IDs from polygons
  const polygonCodes = useMemo(() => {
    if (!polygons || !polygons.features) return [];

    const codes = polygons.features
      .map((feature) => feature.properties?.code)
      .filter((code) => code && code.trim() !== "") // Filter out empty/null codes
      .filter((code, index, self) => self.indexOf(code) === index); // Get unique values

    return codes;
  }, [polygons]);

  // Combine base province options with polygon code IDs
  const provinceOptions = useMemo(() => {
    return [...baseProvinceOptions, ...polygonCodes];
  }, [baseProvinceOptions, polygonCodes]);

  // Toggle sidebar minimized state
  const toggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

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
      const code = feature.properties?.code || "";
      return (
        label.toLowerCase().includes(query) ||
        code.toLowerCase().includes(query)
      );
    });

    setSearchResults(results);
    setSelectedResult(null);
    console.log(`Found ${results.length} polygons matching "${searchQuery}"`);
  };

  // Handle polygon selection from search results
  const handleResultClick = (polygon) => {
    setSelectedResult(polygon);

    if (onPolygonSelect) {
      onPolygonSelect(polygon);
    }

    console.log("Selected polygon from sidebar:", polygon);
  };

  // Handle polygon selection from all polygons list
  const handleAllPolygonClick = (polygon) => {
    setSelectedResult(polygon);

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

    if (onPolygonSelect) {
      onPolygonSelect(null);
    }
  };

  // Toggle showing all polygons
  const toggleAllPolygons = () => {
    setShowAllPolygons(!showAllPolygons);
  };

  return (
    <nav
      className={`sidebar sidebar-offcanvas ${
        isSidebarMinimized ? "minimized" : ""
      }`}
      id="sidebar"
    >
      {/* TOGGLE BUTTON */}
      <div className="sidebar-toggle-container">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {isSidebarMinimized ? (
            <>
              <i className="mdi mdi-chevron-right"></i>
              <span className="toggle-text">باز کردن</span>
            </>
          ) : (
            <>
              <i className="mdi mdi-chevron-left"></i>
              <span className="toggle-text">کوچک کردن</span>
            </>
          )}
        </button>
      </div>

      <ul className="nav">
        {/* SEARCH SECTION */}
        <li className="nav-item menu-items">
          <div
            className={`nav-link ${isSidebarMinimized ? "minimized-icon" : ""}`}
            title="جستجو"
          >
            <span className="menu-icon">
              <i className="mdi mdi-magnify"></i>
            </span>
            {!isSidebarMinimized && <span className="menu-title">جستجو</span>}
          </div>
          <div className="search-section">
            {!isSidebarMinimized && (
              <>
                <div className="search-input-group">
                  <div className="input-with-icon">
                    <i className="mdi mdi-magnify"></i>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="جستجوی کد یا برچسب پولیگان ..."
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
                              {polygon.properties?.code || "N/A"}
                            </span>
                            <span className="result-code">
                              {polygon.properties?.label || "بدون نام"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!isSidebarMinimized &&
              polygons &&
              polygons.features.length === 0 && (
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
            className={`nav-link ${showAllPolygons ? "menu-expanded" : ""} ${
              isSidebarMinimized ? "minimized-icon" : ""
            }`}
            onClick={toggleAllPolygons}
            style={{ cursor: "pointer" }}
            title="لیست پولیگان‌ها"
          >
            <span className="menu-icon">
              <i className="mdi mdi-format-list-bulleted"></i>
            </span>
            {!isSidebarMinimized && (
              <>
                <span className="menu-title">لیست پولیگان‌ها</span>
                <i className="menu-arrow"></i>
              </>
            )}
          </div>

          {!isSidebarMinimized && showAllPolygons && (
            <div className="all-polygons-container">
              <div className="polygons-list-header">
                <span className="polygons-count">
                  کل پولیگان‌ها: {polygons?.features?.length || 0}
                </span>
                <button
                  onClick={() => setShowAllPolygons(false)}
                  className="small-clear-btn"
                >
                  <i className="mdi mdi-close"></i>
                </button>
              </div>

              {polygons && polygons.features && polygons.features.length > 0 ? (
                <div className="polygons-scroll-container">
                  <div className="polygons-list">
                    {polygons.features.map((polygon) => (
                      <div
                        key={polygon.id || polygon.properties?.id}
                        className={`polygon-item ${
                          selectedResult?.id === polygon.id ? "active" : ""
                        }`}
                        onClick={() => handleAllPolygonClick(polygon)}
                      >
                        <div className="polygon-icon">
                          <i className="mdi mdi-map-marker"></i>
                        </div>
                        <div className="polygon-info">
                          <span className="polygon-label">
                            {polygon.properties?.code || "N/A"}
                          </span>
                          <span className="polygon-code">
                            {polygon.properties?.label || "بدون نام"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-data-message">
                  <i className="mdi mdi-map-outline"></i>
                  هنوز پولیگانی وجود ندارد.
                </div>
              )}
            </div>
          )}
        </li>

        {/* TAGS SECTION */}
        <li className="nav-item menu-items">
          <div
            className={`nav-link ${isSidebarMinimized ? "minimized-icon" : ""}`}
            title="برچسب‌گذاری"
          >
            <span className="menu-icon">
              <i className="mdi mdi-tag-multiple"></i>
            </span>
            {!isSidebarMinimized && (
              <span className="menu-title">برچسب‌گذاری</span>
            )}
          </div>

          {!isSidebarMinimized && (
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
          )}
        </li>

        {/* PROVINCES SECTION */}
        <li className="nav-item menu-items">
          <div
            className={`nav-link ${isSidebarMinimized ? "minimized-icon" : ""}`}
            title="انتخاب مناطق"
          >
            <span className="menu-icon">
              <i className="mdi mdi-map"></i>
            </span>
            {!isSidebarMinimized && (
              <span className="menu-title">منطقه ها</span>
            )}
          </div>

          {!isSidebarMinimized && (
            <div className="provinces-section">
              {provinceSelects.map((item) => (
                <div key={item.id} className="dynamic-row">
                  <select className="form-control droppers">
                    {/* Now includes both provinces and polygon codes */}
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
                افزودن منطقه
              </button>

              <button className="apply-btn">
                <i className="mdi mdi-check"></i>
                اعمال فیلترها
              </button>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
