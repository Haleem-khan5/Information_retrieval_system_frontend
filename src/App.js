// src/App.js
import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import SearchByClickingFilename from "./pages/SearchByClickingFilename";

export default function App() {
  const location = useLocation();
  const path = location.pathname;

  // Determine the “other” route & label
  let otherPath, otherLabel;
  if (path === "/search-by-filename" || path === "/") {
    otherPath = "/upload";
    otherLabel = "Go to Upload";
  } else if (path === "/upload") {
    otherPath = "/search-by-filename";
    otherLabel = "Go to Search";
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="p-4 flex space-x-4">
        {/* Only show the “other” page link as a button */}
         {otherPath && (
          <Link
            to={otherPath}
            className="
              px-4 py-2 
              bg-blue-600 text-white 
              rounded-lg 
              shadow hover:bg-blue-700 
              transition
            "
          >
            {otherLabel}
          </Link>
        )}
      </nav>

      <Routes>
        <Route
          path="/search-by-filename"
          element={<SearchByClickingFilename />}
        />
        <Route path="/upload" element={<UploadPage />} />
        {/* default to search-by-filename */}
        <Route
          path="*"
          element={<SearchByClickingFilename />}
        />
      </Routes>
    </div>
  );
}
