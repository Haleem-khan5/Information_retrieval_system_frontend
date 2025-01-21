// file: client/src/components/SearchPage.jsx

import React, { useState } from "react";
import axios from "axios";
import "./SearchPage.css";
import { renderDynamicTable } from "./renderDynamicTable"; // import the helper function

// Read the base API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function SearchPage() {
  const [componentType, setComponentType] = useState("");
  const [searchType, setSearchType] = useState("");

  const [selectedDimension, setSelectedDimension] = useState("");
  const [minDim, setMinDim] = useState("");
  const [maxDim, setMaxDim] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [cmBaseComponent, setCmBaseComponent] = useState("");
  const [relBaseComponent, setRelBaseComponent] = useState("");
  const [notesKeyword, setNotesKeyword] = useState("");
  const [drawingAuthor, setDrawingAuthor] = useState("");

  const [results, setResults] = useState([]); // for arrays
  const [singleResult, setSingleResult] = useState(null); // for single object
  const [resultsTitle, setResultsTitle] = useState("");

  // Optional placeholders for dimension inputs
  const dimensionPlaceholders = {
    length: { min: "e.g., 20", max: "e.g., 30" },
    hex_width: { min: "e.g., 1.063", max: "e.g., 2" },
    thread_length: { min: "e.g., 0.1", max: "e.g., 0.5" },
    outer_diameter: { min: "e.g., 0.5", max: "e.g., 1.5" },
    core_wire_diameter: { min: "e.g., 0.05", max: "e.g., 0.2" },
    overall_length: { min: "e.g., 0.5", max: "e.g., 1.0" },
  };

  const handleSearch = async () => {
    if (!componentType) {
      alert("Please enter a component type.");
      return;
    }
    if (!searchType) {
      alert("Please select a search type.");
      return;
    }
    // Clear old data
    setResults([]);
    setSingleResult(null);
    setResultsTitle("");

    try {
      // Build the endpoint based on which search type the user selected
      switch (searchType) {
        case "dimensionRange": {
          if (!selectedDimension || !minDim || !maxDim) {
            alert("Please select a dimension and fill in min and max values.");
            return;
          }
          const params = {
            component_type: componentType,
            dimension: selectedDimension,
            minDim,
            maxDim,
          };
          const res = await axios.get(`${API_BASE_URL}/search/byDimension`, { params });
          setResults(res.data.results || []);
          setResultsTitle("Dimension Range Search Results");
          break;
        }

        case "material": {
          if (!materialType) {
            alert("Please enter a material type.");
            return;
          }
          const params = { component_type: componentType, material_type: materialType };
          const res = await axios.get(`${API_BASE_URL}/search/byMaterial`, { params });
          setResults(res.data.results || []);
          setResultsTitle("Material Search Results");
          break;
        }

        case "completeMetadata": {
          if (!cmBaseComponent) {
            alert("Please enter a base component.");
            return;
          }
          const params = { component_type: componentType, baseComponent: cmBaseComponent };
          const res = await axios.get(`${API_BASE_URL}/search/completeMetadata`, { params });
          setSingleResult(res.data); // single object
          setResultsTitle("Complete Metadata Result");
          break;
        }

        case "relatedComponents": {
          if (!relBaseComponent) {
            alert("Please enter a base component.");
            return;
          }
          const params = { component_type: componentType, baseComponent: relBaseComponent };
          const res = await axios.get(`${API_BASE_URL}/search/byComponentDetails`, { params });
          setResults(res.data.results || []);
          setResultsTitle("Related Components Search Results");
          break;
        }

        case "notes": {
          if (!notesKeyword) {
            alert("Please enter a keyword.");
            return;
          }
          const params = { component_type: componentType, keyword: notesKeyword };
          const res = await axios.get(`${API_BASE_URL}/search/byNotes`, { params });
          setResults(res.data.results || []);
          setResultsTitle("Notes Search Results");
          break;
        }

        case "drawingDetails": {
          if (!drawingAuthor) {
            alert("Please enter a drawing author.");
            return;
          }
          const params = { component_type: componentType, author: drawingAuthor };
          const res = await axios.get(`${API_BASE_URL}/search/byDrawingDetails`, { params });
          setResults(res.data.results || []);
          setResultsTitle("Drawing Details Search Results");
          break;
        }

        default:
          alert("Unknown search type!");
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred during search.");
    }
  };

  // Render sub-fields depending on the search type
  const renderSearchFields = () => {
    switch (searchType) {
      case "dimensionRange":
        return (
          <>
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
              className="select-field"
            >
              <option value="">Select Dimension</option>
              <option value="length">Length</option>
              <option value="hex_width">HEX_WIDTH</option>
              <option value="thread_length">THREAD_LENGTH</option>
              <option value="outer_diameter">OUTER_DIAMETER</option>
              <option value="core_wire_diameter">CORE_WIRE_DIAMETER</option>
              <option value="overall_length">Overall Length</option>
            </select>

            <input
              type="number"
              placeholder={
                selectedDimension
                  ? dimensionPlaceholders[selectedDimension]?.min || "Min Dimension"
                  : "Min Dimension"
              }
              value={minDim}
              onChange={(e) => setMinDim(e.target.value)}
              className="input-field"
              step="any"
            />
            <input
              type="number"
              placeholder={
                selectedDimension
                  ? dimensionPlaceholders[selectedDimension]?.max || "Max Dimension"
                  : "Max Dimension"
              }
              value={maxDim}
              onChange={(e) => setMaxDim(e.target.value)}
              className="input-field"
              step="any"
            />
          </>
        );

      case "material":
        return (
          <input
            type="text"
            placeholder="Material Type (e.g., magnesium)"
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            className="input-field"
          />
        );

      case "completeMetadata":
        return (
          <input
            type="text"
            placeholder="Base Component (e.g., AP11309)"
            value={cmBaseComponent}
            onChange={(e) => setCmBaseComponent(e.target.value)}
            className="input-field"
          />
        );

      case "relatedComponents":
        return (
          <input
            type="text"
            placeholder="Base Component (e.g., AP6240)"
            value={relBaseComponent}
            onChange={(e) => setRelBaseComponent(e.target.value)}
            className="input-field"
          />
        );

      case "notes":
        return (
          <input
            type="text"
            placeholder="Keyword (e.g., approval)"
            value={notesKeyword}
            onChange={(e) => setNotesKeyword(e.target.value)}
            className="input-field"
          />
        );

      case "drawingDetails":
        return (
          <input
            type="text"
            placeholder="Drawing Author (e.g., RHJS)"
            value={drawingAuthor}
            onChange={(e) => setDrawingAuthor(e.target.value)}
            className="input-field"
          />
        );

      default:
        return null;
    }
  };

  // Render the final results in a dynamic table
  const renderResultsTable = () => {
    if (!resultsTitle && !singleResult) return null;

    return (
      <div className="result-container">
        <h4>{resultsTitle}</h4>
        {singleResult ? (
          // Single object (completeMetadata)
          <div>
            {renderDynamicTable(singleResult.metadata || singleResult)}
          </div>
        ) : (
          // Array of results
          results.map((item, idx) => (
            <div key={idx} style={{ marginBottom: "1.5rem" }}>
              {/* If "item" is an object with "metadata", "notes", "parts", etc. */}
              {renderDynamicTable(item)}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <h1 className="title">INFORMATION RETRIEVAL SYSTEM</h1>

      <div className="search-section">
        <h2 className="section-title">Unified Search</h2>
        <p className="section-description">
          Select a component type and a search type. Enter the relevant sub-fields, then click "Search."
        </p>

        {/* Common Fields */}
        <div className="search-controls">
          <input
            type="text"
            placeholder="Component Type (e.g., anode)"
            value={componentType}
            onChange={(e) => setComponentType(e.target.value)}
            className="input-field"
          />

          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="select-field"
          >
            <option value="">Select Search Type</option>
            <option value="dimensionRange">Dimension Range</option>
            <option value="material">Material</option>
            <option value="completeMetadata">Complete Metadata</option>
            <option value="relatedComponents">Related Components</option>
            <option value="notes">Notes</option>
            <option value="drawingDetails">Drawing Details</option>
          </select>
        </div>

        {/* Sub-fields for each search */}
        <div className="search-controls">{renderSearchFields()}</div>

        {/* Search Button */}
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>

      {/* Results Table */}
      {renderResultsTable()}
    </div>
  );
}
