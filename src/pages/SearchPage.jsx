import React, { useState } from "react";
import axios from "axios";
import "./SearchPage.css";
import { renderDynamicTable } from "./renderDynamicTable";
import { SERVER_LINK } from "../config";

// Use the server link from config
const API_BASE_URL = SERVER_LINK;

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

  // State for error messages (real-time error handling)
  const [errorMessage, setErrorMessage] = useState("");

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
    // Validate common fields
    if (!componentType.trim()) {
      setErrorMessage("Please enter a component type.");
      return;
    }
    if (!searchType) {
      setErrorMessage("Please select a search type.");
      return;
    }
    // Validate search-type specific fields
    switch (searchType) {
      case "dimensionRange":
        if (!selectedDimension || !minDim || !maxDim) {
          setErrorMessage("Please select a dimension and fill in min and max values.");
          return;
        }
        break;
      case "material":
        if (!materialType.trim()) {
          setErrorMessage("Please enter a material type.");
          return;
        }
        break;
      case "completeMetadata":
        if (!cmBaseComponent.trim()) {
          setErrorMessage("Please enter a base component.");
          return;
        }
        break;
      case "relatedComponents":
        if (!relBaseComponent.trim()) {
          setErrorMessage("Please enter a base component.");
          return;
        }
        break;
      case "notes":
        if (!notesKeyword.trim()) {
          setErrorMessage("Please enter a keyword.");
          return;
        }
        break;
      case "drawingDetails":
        if (!drawingAuthor.trim()) {
          setErrorMessage("Please enter a drawing author.");
          return;
        }
        break;
      default:
        setErrorMessage("Unknown search type!");
        return;
    }

    // Clear previous error and results
    setErrorMessage("");
    setResults([]);
    setSingleResult(null);
    setResultsTitle("");

    try {
      let res;
      // Build the endpoint based on which search type the user selected
      if (searchType === "dimensionRange") {
        const params = {
          component_type: componentType,
          dimension: selectedDimension,
          minDim,
          maxDim,
        };
        res = await axios.get(`${API_BASE_URL}/search/byDimension`, { params });
        setResults(res.data.results || []);
        setResultsTitle("Dimension Range Search Results");
      } else if (searchType === "material") {
        const params = { component_type: componentType, material_type: materialType };
        res = await axios.get(`${API_BASE_URL}/search/byMaterial`, { params });
        setResults(res.data.results || []);
        setResultsTitle("Material Search Results");
      } else if (searchType === "completeMetadata") {
        const params = { component_type: componentType, baseComponent: cmBaseComponent };
        res = await axios.get(`${API_BASE_URL}/search/completeMetadata`, { params });
        setSingleResult(res.data);
        setResultsTitle("Complete Metadata Result");
      } else if (searchType === "relatedComponents") {
        const params = { component_type: componentType, baseComponent: relBaseComponent };
        res = await axios.get(`${API_BASE_URL}/search/byComponentDetails`, { params });
        setResults(res.data.results || []);
        setResultsTitle("Related Components Search Results");
      } else if (searchType === "notes") {
        const params = { component_type: componentType, keyword: notesKeyword };
        res = await axios.get(`${API_BASE_URL}/search/byNotes`, { params });
        setResults(res.data.results || []);
        setResultsTitle("Notes Search Results");
      } else if (searchType === "drawingDetails") {
        const params = { component_type: componentType, author: drawingAuthor };
        res = await axios.get(`${API_BASE_URL}/search/byDrawingDetails`, { params });
        setResults(res.data.results || []);
        setResultsTitle("Drawing Details Search Results");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Error occurred during search. Please try again later.");
    }
  };

  // Render sub-fields depending on the search type with real-time error clearing
  const renderSearchFields = () => {
    switch (searchType) {
      case "dimensionRange":
        return (
          <>
            <select
              value={selectedDimension}
              onChange={(e) => {
                setSelectedDimension(e.target.value);
                setErrorMessage("");
              }}
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
              onChange={(e) => {
                setMinDim(e.target.value);
                setErrorMessage("");
              }}
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
              onChange={(e) => {
                setMaxDim(e.target.value);
                setErrorMessage("");
              }}
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
            onChange={(e) => {
              setMaterialType(e.target.value);
              setErrorMessage("");
            }}
            className="input-field"
          />
        );

      case "completeMetadata":
        return (
          <input
            type="text"
            placeholder="Base Component (e.g., AP11309)"
            value={cmBaseComponent}
            onChange={(e) => {
              setCmBaseComponent(e.target.value);
              setErrorMessage("");
            }}
            className="input-field"
          />
        );

      case "relatedComponents":
        return (
          <input
            type="text"
            placeholder="Base Component (e.g., AP6240)"
            value={relBaseComponent}
            onChange={(e) => {
              setRelBaseComponent(e.target.value);
              setErrorMessage("");
            }}
            className="input-field"
          />
        );

      case "notes":
        return (
          <input
            type="text"
            placeholder="Keyword (e.g., approval)"
            value={notesKeyword}
            onChange={(e) => {
              setNotesKeyword(e.target.value);
              setErrorMessage("");
            }}
            className="input-field"
          />
        );

      case "drawingDetails":
        return (
          <input
            type="text"
            placeholder="Drawing Author (e.g., RHJS)"
            value={drawingAuthor}
            onChange={(e) => {
              setDrawingAuthor(e.target.value);
              setErrorMessage("");
            }}
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

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Common Fields */}
        <div className="search-controls">
          <input
            type="text"
            placeholder="Component Type (e.g., anode)"
            value={componentType}
            onChange={(e) => {
              setComponentType(e.target.value);
              setErrorMessage("");
            }}
            className="input-field"
          />

          <select
            value={searchType}
            onChange={(e) => {
              setSearchType(e.target.value);
              setErrorMessage("");
            }}
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
