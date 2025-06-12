// SearchByClickingFilename.js – expects &file=<S3 key>
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import "./SearchPage.css";
import { renderDynamicTable } from "./renderDynamicTable";
import { SERVER_LINK } from "../config";

const API_BASE_URL = SERVER_LINK;

export default function SearchByClickingFilename() {
  /* ─────────── state ─────────── */
  const [filenames, setFilenames] = useState([]);
  const [selected, setSelected] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  /* ─────────── query param ─────────── */
  const [searchParams] = useSearchParams();
  const initialFile = decodeURIComponent(searchParams.get("file") || "");

  /* ─────────── helpers ─────────── */
  const fetchMetadata = useCallback(async (fname) => {
    if (!fname) return;
    setMetadata(null);
    setErrorMessage("");
    try {
      const res = await axios.get(`${API_BASE_URL}/search/metadata`, {
        params: { filename: fname },
      });
      setMetadata(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setErrorMessage("No metadata found for that file.");
      } else {
        setErrorMessage("Error fetching metadata – try again later.");
      }
    }
  }, []);

  /* ─────────── fetch list on mount ─────────── */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/search/filenames`)
      .then((res) => {
        const list = res.data.filenames || [];
        setFilenames(list);
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage("Failed to load filenames. Please try again.");
      });
  }, []);

  /* ─────────── auto-select initialFile ─────────── */
  useEffect(() => {
    if (!initialFile || filenames.length === 0) return;

    // Ensure the initial file is present in the dropdown
    setFilenames((prev) =>
      prev.includes(initialFile) ? prev : [initialFile, ...prev]
    );
    setSelected(initialFile);
    fetchMetadata(initialFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile, filenames.length]);

  /* ─────────── dropdown handler ─────────── */
  const onChange = (e) => {
    const fname = e.target.value;
    setSelected(fname);
    fetchMetadata(fname);
  };

  /* ─────────── UI ─────────── */
  return (
    <div className="container">
      <h1 className="title">INFORMATION RETRIEVAL SYSTEM</h1>

      <div className="search-section">
        <h2 className="section-title">Select a Document</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <select value={selected} onChange={onChange} className="select-field">
          <option value="">-- pick a filename --</option>
          {filenames.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {metadata && (
        <div className="result-container">
          <h4>Metadata for: {selected}</h4>
          {renderDynamicTable(metadata)}
        </div>
      )}
    </div>
  );
}
