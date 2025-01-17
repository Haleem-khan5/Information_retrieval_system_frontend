// file: client/src/App.js

import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import UploadPage from "./pages/UploadPage";

function App() {
  return (
    <div>
      <nav style={{ margin: "10px" }}>
        <Link to="/search" style={{ marginRight: "10px" }}>
          Search
        </Link>
        <Link to="/upload">Upload</Link>
      </nav>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/" element={<SearchPage />} />
      </Routes>
    </div>
  );
}

export default App;
