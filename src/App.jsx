// import React from "react";
// import Header from "./components/Header";
// import Sidebar from "./components/Sidebar";
// import IranMap from "./components/IranMap";
// import Charts from "./components/Charts";
// import DataTable from "./components/DataTable";

// import "./styles/header.css";
// import "./styles/sidebar.css";
// import "./styles/map.css";
// import "./styles/charts.css";
// import "./styles/table.css";
// import "./styles/App.css";

// function App() {
//   return (
//     <div className="dashboard-container">
//       <Header />

//       <div className="middle-section">
//         <Sidebar />
//         <div className="map-wrapper">
//           <IranMap />
//         </div>
//       </div>
//       {/* <div className="bottom-section">
//         <Charts />
//         <DataTable />
//       </div> */}
//     </div>
//   );
// }

// export default App;

import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import IranMap from "./components/IranMap";
import Charts from "./components/Charts";
import DataTable from "./components/DataTable";

import "./styles/header.css";
import "./styles/sidebar.css";
import "./styles/map.css";
import "./styles/charts.css";
import "./styles/table.css";
import "./styles/App.css";

function App() {
  // State to manage polygons data that will be shared with Sidebar
  const [savedPolygons, setSavedPolygons] = useState(null);

  // Function to update polygons data from IranMap
  const handlePolygonsUpdate = (polygonsData) => {
    setSavedPolygons(polygonsData);
  };

  return (
    <div className="dashboard-container">
      <Header />

      <div className="middle-section">
        {/* Pass polygons data to Sidebar for searching */}
        <Sidebar
          polygons={savedPolygons}
          // No onPolygonSelect needed since we're not highlighting
        />

        <div className="map-wrapper">
          {/* IranMap will update polygons data when they change */}
          <IranMap onPolygonsUpdate={handlePolygonsUpdate} />
        </div>
      </div>
      {/* <div className="bottom-section">
        <Charts />
        <DataTable />
      </div> */}
    </div>
  );
}

export default App;
