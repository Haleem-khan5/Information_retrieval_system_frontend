// SearchByClickingFilename.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SearchPage.css";        // reuse existing styles
import { renderDynamicTable } from "./renderDynamicTable";

// Make sure your .env has REACT_APP_API_BASE_URL set, e.g.
// REACT_APP_API_BASE_URL=http://10.101.83.87:5000
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function SearchByClickingFilename() {
  const [filenames, setFilenames] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // 1) Fetch list of filenames on mount
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/search/filenames`)
      .then((res) => {
        setFilenames(res.data.filenames || []);
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage("Failed to load filenames. Please try again.");
      });
  }, []);

  // 2) When a filename is selected, fetch its metadata
  const handleSelect = async (e) => {
    const fname = e.target.value;
    setSelectedFilename(fname);
    setMetadata(null);
    setErrorMessage("");

    if (!fname) return; // nothing selected

    try {
      const res = await axios.get(
        `${API_BASE_URL}/search/metadata`,
        { params: { filename: fname } }
      );
      setMetadata(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setErrorMessage("No metadata found for that file.");
      } else {
        setErrorMessage("Error fetching metadata. Try again.");
      }
    }
  };

  return (
    <div className="container">
      <h1 className="title">Welcome to IRS</h1>

      <div className="search-section">
        <h2 className="section-title">Select a Document</h2>
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}

        <select
          value={selectedFilename}
          onChange={handleSelect}
          className="select-field"
        >
          <option value="">-- pick a filename --</option>
          {filenames.map((fname) => (
            <option key={fname} value={fname}>
              {fname}
            </option>
          ))}
        </select>
      </div>

      {metadata && (
        <div className="result-container">
          <h4>Metadata for: {selectedFilename}</h4>
          {renderDynamicTable(metadata)}
        </div>
      )}
    </div>
  );
}
