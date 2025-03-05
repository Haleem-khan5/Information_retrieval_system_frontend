import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import UploadPage from "./pages/UploadPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="p-4">
        <Link to="/search" className="mr-4 text-blue-600 hover:text-blue-800">
          Search
        </Link>
        <Link to="/upload" className="text-blue-600 hover:text-blue-800">
          Upload
        </Link>
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
