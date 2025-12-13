import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import EditorPage from "./pages/EditorPage";
import "./styles/App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
