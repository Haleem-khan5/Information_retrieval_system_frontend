// file: client/src/components/SearchPage.jsx

import React, { useState } from "react";
import axios from "axios";
import "./SearchPage.css"; // Import the CSS file for styling

// Reusable SearchSection Component
const SearchSection = ({ title, description, children }) => {
  return (
    <div className="search-section">
      <h2 className="section-title">{title}</h2>
      <p className="section-description">{description}</p>
      {children}
    </div>
  );
};

export default function SearchPage() {
  /***********************************************************
   * 1) Dimension Range Search
   ***********************************************************/
  const [dimComponentType, setDimComponentType] = useState("");
  const [selectedDimension, setSelectedDimension] = useState(""); // selected dimension from the drop-down
  const [minDim, setMinDim] = useState("");
  const [maxDim, setMaxDim] = useState("");
  const [dimensionResults, setDimensionResults] = useState([]);

  const dimensionPlaceholders = {
    length: { min: "e.g., 20", max: "e.g., 30" },
    hex_width: { min: "e.g., 1.063", max: "e.g., 2" },
    thread_length: { min: "e.g., 0.1", max: "e.g., 0.5" },
    outer_diameter: { min: "e.g., 0.5", max: "e.g., 1.5" },
    core_wire_diameter: { min: "e.g., 0.05", max: "e.g., 0.2" },
    overall_length: { min: "e.g., 0.5", max: "e.g., 1.0" },
    // Add more mappings as needed
  };

  const handleDimensionSearch = async () => {
    if (!dimComponentType) {
      alert("Please enter the component type (e.g., 'anode').");
      return;
    }
    if (!selectedDimension) {
      alert("Please select a dimension field.");
      return;
    }
    if (!minDim || !maxDim) {
      alert("Please enter both minimum and maximum dimension values.");
      return;
    }

    try {
      const params = {
        component_type: dimComponentType,
        dimension: selectedDimension, // e.g. "length" or "hex_width"
        minDim,
        maxDim,
      };

      const res = await axios.get("http://localhost:5000/search/byDimension", { params });
      setDimensionResults(res.data.results);
    } catch (err) {
      console.error(err);
      alert("Error during dimension search.");
    }
  };

  /***********************************************************
   * 2) Material Search
   ***********************************************************/
  const [matComponentType, setMatComponentType] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [materialResults, setMaterialResults] = useState([]);

  const handleMaterialSearch = async () => {
    if (!matComponentType || !materialType) {
      alert("Please enter both component type and material type.");
      return;
    }
    try {
      const params = {
        component_type: matComponentType,
        material_type: materialType,
      };
      const res = await axios.get("http://localhost:5000/search/byMaterial", { params });
      setMaterialResults(res.data.results);
    } catch (err) {
      console.error(err);
      alert("Error during material search.");
    }
  };

  /***********************************************************
   * 3) Complete Metadata
   ***********************************************************/
  const [cmComponentType, setCmComponentType] = useState("");
  const [cmBaseComponent, setCmBaseComponent] = useState("");
  const [completeMetadataResult, setCompleteMetadataResult] = useState(null);

  const handleCompleteMetadataSearch = async () => {
    if (!cmComponentType || !cmBaseComponent) {
      alert("Please enter both component type and base component.");
      return;
    }
    try {
      const params = {
        component_type: cmComponentType,
        baseComponent: cmBaseComponent,
      };
      const res = await axios.get("http://localhost:5000/search/completeMetadata", { params });
      setCompleteMetadataResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error retrieving complete metadata.");
    }
  };

  /***********************************************************
   * 4) Related Components
   ***********************************************************/
  const [relComponentType, setRelComponentType] = useState("");
  const [baseComponent, setBaseComponent] = useState("");
  const [componentDetails, setComponentDetails] = useState([]);

  const handleComponentDetailsSearch = async () => {
    if (!relComponentType || !baseComponent) {
      alert("Please enter both component type and base component.");
      return;
    }

    try {
      const params = {
        component_type: relComponentType,
        baseComponent: baseComponent,
      };

      const res = await axios.get("http://localhost:5000/search/byComponentDetails", { params });

      setComponentDetails(res.data.results);
    } catch (err) {
      console.error(err);
      alert("Error during related components search.");
    }
  };

  /***********************************************************
   * 5) Notes Search
   ***********************************************************/
  const [notesComponentType, setNotesComponentType] = useState("");
  const [notesKeyword, setNotesKeyword] = useState("");
  const [notesResults, setNotesResults] = useState([]);

  const handleNotesSearch = async () => {
    if (!notesComponentType || !notesKeyword) {
      alert("Please enter both component type and keyword.");
      return;
    }

    try {
      const params = {
        component_type: notesComponentType,
        keyword: notesKeyword,
      };

      const res = await axios.get("http://localhost:5000/search/byNotes", { params });

      setNotesResults(res.data.results);
    } catch (err) {
      console.error(err);
      alert("Error during notes search.");
    }
  };

  /***********************************************************
   * 6) Drawing Details Search
   ***********************************************************/
  const [drawingComponentType, setDrawingComponentType] = useState("");
  const [drawingAuthor, setDrawingAuthor] = useState("");
  const [drawingResults, setDrawingResults] = useState([]);

  const handleDrawingSearch = async () => {
    if (!drawingComponentType || !drawingAuthor) {
      alert("Please enter both component type and drawing author.");
      return;
    }

    try {
      const params = {
        component_type: drawingComponentType,
        author: drawingAuthor,
      };

      const res = await axios.get("http://localhost:5000/search/byDrawingDetails", { params });

      setDrawingResults(res.data.results);
    } catch (err) {
      console.error(err);
      alert("Error during drawing details search.");
    }
  };

  return (
    <div className="container">
      <h1 className="title">INFORMATION RETRIEVEL SYSTEM</h1>

      {/* 1. Dimension Range Search */}
      <SearchSection
        title="1. Dimension Range Search"
        description="Search for components based on their type and specific dimension ranges. Ideal for finding components that fit certain size criteria."
      >
        <div className="search-controls">
          {/* Component Type Input */}
          <input
            type="text"
            placeholder="Component Type (e.g., anode)"
            value={dimComponentType}
            onChange={(e) => setDimComponentType(e.target.value)}
            className="input-field"
          />

          {/* Dimension Drop-down */}
          <select
            value={selectedDimension}
            onChange={(e) => setSelectedDimension(e.target.value)}
            className="select-field"
          >
            <option value="">Select Dimension</option>
            <option value="length">Length (PARTS LENGTH)</option>
            <option value="hex_width">HEX_WIDTH (DIMENSIONS)</option>
            <option value="thread_length">THREAD_LENGTH (DIMENSIONS)</option>
            <option value="outer_diameter">OUTER_DIAMETER (DIMENSIONS)</option>
            <option value="core_wire_diameter">CORE_WIRE_DIAMETER (DIMENSIONS)</option>
            <option value="overall_length">Overall Length (OTHER_DIMENSIONS)</option>
            {/* Add more dimension fields if desired */}
          </select>

          {/* Min Dimension Input */}
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

          {/* Max Dimension Input */}
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

          <button onClick={handleDimensionSearch} className="search-button">
            Search
          </button>
        </div>

        {/* Display Results */}
        {dimensionResults.length > 0 && (
          <div className="result-container">
            <h4>Dimension Results:</h4>
            {dimensionResults.map((item, idx) => (
              <div key={idx} className="result-card">
                <strong>Key:</strong> {item.key}
                <br />
                {/* Check if 'parts' exists */}
                {item.parts ? (
                  <>
                    <strong>Matching Parts:</strong>
                    <pre className="result-pre">
                      {JSON.stringify(item.parts, null, 2)}
                    </pre>
                  </>
                ) : (
                  <>
                    <strong>Metadata:</strong>
                    <pre className="result-pre">
                      {JSON.stringify(item.metadata, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </SearchSection>

      <hr />

      {/* 2. Material Search */}
      <SearchSection
        title="2. Material Search"
        description="Find components based on their type and material composition. Useful for sourcing parts made from specific materials."
      >
        <div className="search-controls">
          <input
            type="text"
            placeholder="Component Type (e.g., anode)"
            value={matComponentType}
            onChange={(e) => setMatComponentType(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Material Type (e.g., magnesium)"
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            className="input-field"
          />
          <button onClick={handleMaterialSearch} className="search-button">
            Search
          </button>
        </div>

        {/* Display Results */}
        {materialResults.length > 0 && (
          <div className="result-container">
            <h4>Material Results:</h4>
            {materialResults.map((item, idx) => (
              <div key={idx} className="result-card">
                <strong>Key:</strong> {item.key}
                <pre className="result-pre">
                  {JSON.stringify(item.metadata, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </SearchSection>

      <hr />

      {/* 3. Complete Metadata */}
      <SearchSection
        title="3. Complete Metadata"
        description="Retrieve complete metadata for a specific component type and base component. Essential for detailed information needs."
      >
        <div className="search-controls">
          <input
            type="text"
            placeholder="Component Type (e.g., anode)"
            value={cmComponentType}
            onChange={(e) => setCmComponentType(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Base Component (e.g., AP11309)"
            value={cmBaseComponent}
            onChange={(e) => setCmBaseComponent(e.target.value)}
            className="input-field"
          />
          <button onClick={handleCompleteMetadataSearch} className="search-button">
            Retrieve
          </button>
        </div>

        {/* Display Results */}
        {completeMetadataResult && (
          <div className="result-container">
            <h4>Complete Metadata for Key: {completeMetadataResult.key}</h4>
            <pre className="result-pre">
              {JSON.stringify(completeMetadataResult.metadata, null, 2)}
            </pre>
          </div>
        )}
      </SearchSection>

      <hr />

      {/* 4. Related Components */}
      <SearchSection
        title="4. Related Components"
        description="Discover components related to a specific base component. Helps in finding compatible or similar parts."
      >
        <div className="search-controls">
          <input
            type="text"
            placeholder="Component Type (e.g., anode)"
            value={relComponentType}
            onChange={(e) => setRelComponentType(e.target.value)}
            className="input-field"
          />

          <input
            type="text"
            placeholder="Base Component (e.g., AP6240)"
            value={baseComponent}
            onChange={(e) => setBaseComponent(e.target.value)}
            className="input-field"
          />

          <button onClick={handleComponentDetailsSearch} className="search-button">
            Search Related
          </button>
        </div>

        {/* Display Results */}
        {componentDetails.length > 0 && (
          <div className="result-container">
            <h4>Related Components Found:</h4>
            {componentDetails.map((item, idx) => (
              <div key={idx} className="result-card">
                <strong>Key:</strong> {item.key}
                <br />
                <strong>Matching Parts:</strong>
                <pre className="result-pre">
                  {JSON.stringify(item.parts, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </SearchSection>

      <hr />

      {/* 5. Notes Search */}
      <SearchSection
        title="5. Notes Search"
        description="Search for components based on specific keywords found in their notes. Useful for finding components with particular annotations or instructions."
      >
        <div className="search-controls">
          <input
            type="text"
            placeholder="Component Type (e.g., anode)"
            value={notesComponentType}
            onChange={(e) => setNotesComponentType(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Keyword (e.g., approval)"
            value={notesKeyword}
            onChange={(e) => setNotesKeyword(e.target.value)}
            className="input-field"
          />
          <button onClick={handleNotesSearch} className="search-button">
            Search
          </button>
        </div>

        {/* Display Results */}
        {notesResults.length > 0 && (
          <div className="result-container">
            <h4>Notes Results:</h4>
            {notesResults.map((item, idx) => (
              <div key={idx} className="result-card">
                <strong>Key:</strong> {item.key}
                <pre className="result-pre">
                  {JSON.stringify(item.notes, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </SearchSection>

      <hr />

      {/* 6. Drawing Details Search */}
      <SearchSection
        title="6. Drawing Details Search"
        description="Search for components based on drawing details such as author or date. Useful for tracking drawings created by specific personnel or within a certain timeframe."
      >
        <div className="search-controls">
          <input
            type="text"
            placeholder="Component Type (e.g., anode)"
            value={drawingComponentType}
            onChange={(e) => setDrawingComponentType(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Drawing Author (e.g., RHJS)"
            value={drawingAuthor}
            onChange={(e) => setDrawingAuthor(e.target.value)}
            className="input-field"
          />
          <button onClick={handleDrawingSearch} className="search-button">
            Search
          </button>
        </div>

        {/* Display Results */}
        {drawingResults.length > 0 && (
          <div className="result-container">
            <h4>Drawing Details Results:</h4>
            {drawingResults.map((item, idx) => (
              <div key={idx} className="result-card">
                <strong>Key:</strong> {item.key}
                <pre className="result-pre">
                  {JSON.stringify(item.drawingDetails, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </SearchSection>
    </div>
  );
}
