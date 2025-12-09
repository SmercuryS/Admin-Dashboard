// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const cors = require("cors");

// const app = express();
// const PORT = 3001;

// // CORS configuration
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "http://localhost:3000"],
//     credentials: true,
//   })
// );

// app.use(express.json());

// // Handle pre-flight requests
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "http://localhost:3000"],
//     credentials: true,
//   })
// );

// app.use(express.json());

// // Test endpoint
// app.get("/api/test", (req, res) => {
//   console.log("✅ /api/test endpoint hit");
//   res.json({
//     message: "Server is running!",
//     timestamp: new Date().toISOString(),
//     status: "OK",
//   });
// });

// // API endpoint to save polygons
// app.post("/api/save-polygons", (req, res) => {
//   try {
//     console.log("📨 Received save-polygons request");

//     const polygons = req.body;

//     if (!polygons) {
//       return res.status(400).json({ error: "No polygons data provided" });
//     }

//     if (!Array.isArray(polygons)) {
//       return res.status(400).json({ error: "Polygons data must be an array" });
//     }

//     console.log(`📊 Saving ${polygons.length} polygons...`);

//     // Path to polygons.json file
//     const filePath = path.join(__dirname, "public", "polygons.json");

//     // Ensure the public directory exists
//     const publicDir = path.join(__dirname, "public");
//     if (!fs.existsSync(publicDir)) {
//       console.log(`📁 Creating public directory: ${publicDir}`);
//       fs.mkdirSync(publicDir, { recursive: true });
//     }

//     // Clean up polygons data - ensure each has an ID
//     const cleanedPolygons = polygons.map((polygon) => ({
//       id: polygon.id || Math.floor(Math.random() * 9999999),
//       geometry: polygon.geometry,
//       code: polygon.code || "",
//       label: polygon.label || "",
//     }));

//     // Write to the file
//     fs.writeFileSync(filePath, JSON.stringify(cleanedPolygons, null, 2));

//     console.log(`✅ Polygons saved to: ${filePath}`);
//     console.log(`📄 File written successfully`);

//     // Read back to verify
//     const verifyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
//     console.log(`✅ Verified: ${verifyData.length} polygons saved`);

//     res.json({
//       message: "Polygons saved successfully",
//       count: cleanedPolygons.length,
//       savedAt: new Date().toISOString(),
//       filePath: filePath,
//     });
//   } catch (error) {
//     console.error("❌ Error saving polygons:", error);
//     res.status(500).json({
//       error: "Failed to save polygons",
//       details: error.message,
//     });
//   }
// });

// // Get polygons endpoint
// app.get("/api/get-polygons", (req, res) => {
//   try {
//     const filePath = path.join(__dirname, "public", "polygons.json");

//     if (!fs.existsSync(filePath)) {
//       console.log("📭 polygons.json does not exist, returning empty array");
//       return res.json({
//         count: 0,
//         polygons: [],
//         exists: false,
//         message: "File does not exist",
//       });
//     }

//     const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
//     console.log(`📥 Sending ${data.length} polygons`);

//     // Ensure each polygon has an ID
//     const polygonsWithIds = data.map((polygon) => ({
//       ...polygon,
//       id: polygon.id || Math.floor(Math.random() * 9999999),
//     }));

//     res.json({
//       count: polygonsWithIds.length,
//       polygons: polygonsWithIds,
//       exists: true,
//       lastModified: fs.statSync(filePath).mtime,
//     });
//   } catch (error) {
//     console.error("Error reading polygons:", error);
//     res.status(500).json({
//       error: "Failed to read polygons",
//       details: error.message,
//     });
//   }
// });

// // Serve polygons.json directly
// app.get("/polygons.json", (req, res) => {
//   try {
//     const filePath = path.join(__dirname, "public", "polygons.json");

//     if (!fs.existsSync(filePath)) {
//       return res.json([]);
//     }

//     // Disable caching
//     res.setHeader(
//       "Cache-Control",
//       "no-store, no-cache, must-revalidate, proxy-revalidate"
//     );
//     res.setHeader("Pragma", "no-cache");
//     res.setHeader("Expires", "0");

//     res.sendFile(filePath);
//   } catch (error) {
//     console.error("Error serving polygons.json:", error);
//     res.status(500).json({ error: "Failed to serve polygons.json" });
//   }
// });

// // Serve static files from public directory
// app.use(
//   express.static(path.join(__dirname, "public"), {
//     setHeaders: (res, filePath) => {
//       if (filePath.endsWith(".json")) {
//         // Disable caching for JSON files
//         res.setHeader(
//           "Cache-Control",
//           "no-store, no-cache, must-revalidate, proxy-revalidate"
//         );
//         res.setHeader("Pragma", "no-cache");
//         res.setHeader("Expires", "0");
//       }
//     },
//   })
// );

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     error: "Endpoint not found",
//     path: req.originalUrl,
//   });
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log(`🔗 Test endpoint: GET http://localhost:${PORT}/api/test`);
//   console.log(
//     `💾 Save endpoint: POST http://localhost:${PORT}/api/save-polygons`
//   );
//   console.log(`📥 Get polygons: GET http://localhost:3001/api/get-polygons`);
//   console.log(`📁 Serving from: ${__dirname}`);

//   // Check if public folder exists
//   const publicDir = path.join(__dirname, "public");
//   if (!fs.existsSync(publicDir)) {
//     console.log(`📁 Creating public folder: ${publicDir}`);
//     fs.mkdirSync(publicDir, { recursive: true });
//   }

//   // Check if polygons.json exists
//   const polygonsFile = path.join(publicDir, "polygons.json");
//   if (fs.existsSync(polygonsFile)) {
//     try {
//       const data = JSON.parse(fs.readFileSync(polygonsFile, "utf8"));
//       console.log(`📄 Existing polygons.json has ${data.length} polygons`);
//     } catch (err) {
//       console.log("⚠️ Could not read existing polygons.json");
//     }
//   } else {
//     console.log(
//       "📄 No polygons.json file found (will be created on first save)"
//     );
//   }
// });

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3001;

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());

// Test endpoint
app.get("/api/test", (req, res) => {
  console.log("✅ /api/test endpoint hit");
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    status: "OK",
  });
});

// API endpoint to save polygons
app.post("/api/save-polygons", (req, res) => {
  try {
    console.log("📨 Received save-polygons request");

    const polygons = req.body;

    if (!polygons) {
      return res.status(400).json({ error: "No polygons data provided" });
    }

    if (!Array.isArray(polygons)) {
      return res.status(400).json({ error: "Polygons data must be an array" });
    }

    console.log(`📊 Saving ${polygons.length} polygons...`);

    // Check for valid geometry data
    polygons.forEach((polygon, index) => {
      if (!polygon.geometry || !polygon.geometry.coordinates) {
        console.warn(
          `⚠️ Polygon at index ${index} has invalid geometry:`,
          polygon
        );
      }
    });

    // Path to polygons.json file
    const filePath = path.join(__dirname, "public", "polygons.json");

    // Ensure the public directory exists
    const publicDir = path.join(__dirname, "public");
    if (!fs.existsSync(publicDir)) {
      console.log(`📁 Creating public directory: ${publicDir}`);
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Clean up polygons data - ensure each has an ID
    const cleanedPolygons = polygons.map((polygon) => ({
      id: polygon.id || Math.floor(Math.random() * 9999999),
      geometry: polygon.geometry,
      code: polygon.code || "",
      label: polygon.label || "",
    }));

    // Write to the file
    fs.writeFileSync(filePath, JSON.stringify(cleanedPolygons, null, 2));

    console.log(`✅ Polygons saved to: ${filePath}`);
    console.log(`📄 File written successfully`);

    // Read back to verify
    const verifyData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`✅ Verified: ${verifyData.length} polygons saved`);

    // Log first polygon's geometry to verify it was saved correctly
    if (verifyData.length > 0) {
      console.log(
        "📐 First polygon geometry type:",
        verifyData[0].geometry?.type
      );
      console.log(
        "📐 First polygon coordinates length:",
        verifyData[0].geometry?.coordinates?.[0]?.length
      );
    }

    res.json({
      message: "Polygons saved successfully",
      count: cleanedPolygons.length,
      savedAt: new Date().toISOString(),
      filePath: filePath,
    });
  } catch (error) {
    console.error("❌ Error saving polygons:", error);
    res.status(500).json({
      error: "Failed to save polygons",
      details: error.message,
    });
  }
});

// Get polygons endpoint
app.get("/api/get-polygons", (req, res) => {
  try {
    const filePath = path.join(__dirname, "public", "polygons.json");

    if (!fs.existsSync(filePath)) {
      console.log("📭 polygons.json does not exist, returning empty array");
      return res.json({
        count: 0,
        polygons: [],
        exists: false,
        message: "File does not exist",
      });
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`📥 Sending ${data.length} polygons from server`);

    // Ensure each polygon has an ID
    const polygonsWithIds = data.map((polygon) => ({
      ...polygon,
      id: polygon.id || Math.floor(Math.random() * 9999999),
    }));

    // Log first polygon's geometry to verify it's being read correctly
    if (polygonsWithIds.length > 0) {
      console.log(
        "📐 First polygon from file - geometry type:",
        polygonsWithIds[0].geometry?.type
      );
    }

    res.json({
      count: polygonsWithIds.length,
      polygons: polygonsWithIds,
      exists: true,
      lastModified: fs.statSync(filePath).mtime,
    });
  } catch (error) {
    console.error("Error reading polygons:", error);
    res.status(500).json({
      error: "Failed to read polygons",
      details: error.message,
    });
  }
});

// Serve polygons.json directly
app.get("/polygons.json", (req, res) => {
  try {
    const filePath = path.join(__dirname, "public", "polygons.json");

    if (!fs.existsSync(filePath)) {
      return res.json([]);
    }

    // Disable caching
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.sendFile(filePath);
  } catch (error) {
    console.error("Error serving polygons.json:", error);
    res.status(500).json({ error: "Failed to serve polygons.json" });
  }
});

// Serve static files from public directory
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".json")) {
        // Disable caching for JSON files
        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }
    },
  })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 Test endpoint: GET http://localhost:${PORT}/api/test`);
  console.log(
    `💾 Save endpoint: POST http://localhost:${PORT}/api/save-polygons`
  );
  console.log(`📥 Get polygons: GET http://localhost:3001/api/get-polygons`);
  console.log(`📁 Serving from: ${__dirname}`);

  // Check if public folder exists
  const publicDir = path.join(__dirname, "public");
  if (!fs.existsSync(publicDir)) {
    console.log(`📁 Creating public folder: ${publicDir}`);
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Check if polygons.json exists
  const polygonsFile = path.join(publicDir, "polygons.json");
  if (fs.existsSync(polygonsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(polygonsFile, "utf8"));
      console.log(`📄 Existing polygons.json has ${data.length} polygons`);
    } catch (err) {
      console.log("⚠️ Could not read existing polygons.json");
    }
  } else {
    console.log(
      "📄 No polygons.json file found (will be created on first save)"
    );
  }
});
