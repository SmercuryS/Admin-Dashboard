// import React, { useState } from "react";
// import Header from "../components/Header";
// import Sidebar from "../components/Sidebar";
// import RightSidebar from "../components/RightSidebar";
// import IranMap from "../components/IranMap";
// import "../styles/header.css";
// import "../styles/sidebar.css";
// import "../styles/rightsidebar.css";
// import "../styles/map.css";
// import "../styles/App.css";

// function EditorPage() {
//   const [savedPolygons, setSavedPolygons] = useState(null);
//   const [selectedPolygon, setSelectedPolygon] = useState(null);
//   const [isLeftSidebarMinimized, setIsLeftSidebarMinimized] = useState(false);
//   const [isRightSidebarMinimized, setIsRightSidebarMinimized] = useState(false);

//   const handlePolygonsUpdate = (polygonsData) => {
//     setSavedPolygons(polygonsData);
//   };

//   const handlePolygonSelect = (polygon) => {
//     console.log("Polygon selected from sidebar:", polygon);
//     setSelectedPolygon(polygon);
//   };

//   const handleLeftSidebarToggle = (isMinimized) => {
//     setIsLeftSidebarMinimized(isMinimized);
//   };

//   const handleRightSidebarToggle = (isMinimized) => {
//     setIsRightSidebarMinimized(isMinimized);
//   };

//   // Calculate content class based on sidebar states
//   const getContentWrapperClass = () => {
//     const classes = [];

//     if (!isLeftSidebarMinimized && !isRightSidebarMinimized) {
//       classes.push("with-both-sidebars");
//     } else if (isLeftSidebarMinimized && isRightSidebarMinimized) {
//       classes.push("with-both-sidebars", "both-minimized");
//     } else if (isLeftSidebarMinimized) {
//       classes.push("with-both-sidebars", "left-minimized");
//     } else if (isRightSidebarMinimized) {
//       classes.push("with-both-sidebars", "right-minimized");
//     }

//     return classes.join(" ");
//   };

//   return (
//     <div className="app-container">
//       <Header />

//       <div className="app-main-wrapper">
//         <div className="left-sidebar-wrapper">
//           <Sidebar
//             polygons={savedPolygons}
//             onPolygonSelect={handlePolygonSelect}
//             onToggle={handleLeftSidebarToggle}
//           />
//         </div>

//         <div className={`map-content-wrapper ${getContentWrapperClass()}`}>
//           <div className="map-wrapper">
//             <IranMap
//               onPolygonsUpdate={handlePolygonsUpdate}
//               selectedPolygon={selectedPolygon}
//             />
//           </div>
//         </div>

//         <div className="right-sidebar-wrapper">
//           <RightSidebar onToggle={handleRightSidebarToggle} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default EditorPage;

import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import IranMap from "../components/IranMap";
import "../styles/header.css";
import "../styles/sidebar.css";
import "../styles/rightsidebar.css";
import "../styles/map.css";
import "../styles/App.css";

function EditorPage({ onLogout }) {
  const [savedPolygons, setSavedPolygons] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [isLeftSidebarMinimized, setIsLeftSidebarMinimized] = useState(false);
  const [isRightSidebarMinimized, setIsRightSidebarMinimized] = useState(false);

  const handlePolygonsUpdate = (polygonsData) => {
    setSavedPolygons(polygonsData);
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
            <IranMap
              onPolygonsUpdate={handlePolygonsUpdate}
              selectedPolygon={selectedPolygon}
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

export default EditorPage;
