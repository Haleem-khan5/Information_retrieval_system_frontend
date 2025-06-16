// UploadPDFPage.jsx – redirects after single upload
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AWS from "aws-sdk";
import axios from "axios";
import "./UploadPDFPage.css";
import { SERVER_LINK, AWS_CONFIG } from "../config";

/* ─────────────────────────────────────────────────────────────
   Loader: cycles through status messages while work is running
   ───────────────────────────────────────────────────────────── */
function Loader({ messages, interval = 3000 }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx < messages.length - 1) {
      const t = setTimeout(() => setIdx(idx + 1), interval);
      return () => clearTimeout(t);
    }
  }, [idx, messages, interval]);

  return (
    <div className="loader-container">
      <div className="spinner" />
      <p className="loader-message animated-text">{messages[idx]}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main page – always uploads as ANODE component, using the file name
   ───────────────────────────────────────────────────────────── */
export default function UploadPDFPage() {
  const navigate = useNavigate(); // 🔑 for redirect

  /*  form / selector state  */
  const [file, setFile] = useState(null); // single-file mode
  const [files, setFiles] = useState([]); // batch mode

  /*  ui state  */
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loaderMsgs = [
    "Converting PDF(s) to images …",
    "Running Tesseract OCR …",
    "Structuring OCR extracted data to structured data with LLM …",
    "Persisting metadata in the database …",
  ];

  /*  AWS S3 config  */
  const s3 = new AWS.S3({
    accessKeyId: AWS_CONFIG.accessKeyId,
    secretAccessKey: AWS_CONFIG.secretAccessKey,
    region: AWS_CONFIG.region,
    bucket: AWS_CONFIG.bucket,
  });

  /* ─────────── helpers ─────────── */
  const resetAlerts = () => {
    setError("");
    setMessage("");
  };

  const handleSingleFileChange = (e) => {
    setFile(e.target.files[0]);
    resetAlerts();
  };
  const handleFolderChange = (e) => {
    setFiles(Array.from(e.target.files));
    resetAlerts();
  };

  /*  core uploader (single OR batch)  */
  const handleUpload = async () => {
    resetAlerts();

    if (!file && files.length === 0) {
      setError("Please choose at least one PDF to upload.");
      return;
    }

    try {
      setLoading(true);

      /* =======================================================
         1) S3  UPLOAD
      ======================================================= */
      const uploadFile = async (f) => {
        const TYPE = "anode"; // fixed component type
        const NAME = f.name.replace(/\.[^/.]+$/, ""); // file name w/out ext
        const key = `${TYPE}_${NAME}/${f.name}`; // e.g. anode_myDoc/myDoc.pdf

        const params = {
          Bucket: AWS_CONFIG.bucket,
          Key: key,
          Body: f,
          ContentType: f.type || "application/pdf",
        };
        const { Key } = await s3.upload(params).promise();
        return { Key, TYPE, NAME }; // return meta for redirect
      };

      /* =======================================================
         2) SINGLE  vs  BATCH LOGIC
      ======================================================= */
      if (files.length > 0) {
        /* ── batch mode ─────────────────────────────────────── */
        const metaArr = await Promise.all(files.map(uploadFile));
        const s3Keys = metaArr.map(({ Key }) => Key);

        const res = await axios.post(
          `${SERVER_LINK}/process_pdf/batch`,
          {
            files: s3Keys.map((k) => ({ s3Filename: k })),
          }
        );

        const list = res.data?.pdf_filenames || [];
        setMessage(
          `Batch complete – ${list.length} file(s) processed successfully.`
        );

        // If at least one processed successfully, jump to search page
        if (list.length > 0) {
          navigate(
            `/search-by-filename?file=${encodeURIComponent(list[0])}`
          );
        }
      } else {
        /* ── single-file mode ──────────────────────────────── */
        const { Key } = await uploadFile(file);

        const res = await axios.post(`${SERVER_LINK}/process_pdf`, {
          s3Filename: Key,
        });

        // Prefer the value returned by the API because that's what DB stored
        const savedFilename =
          res.data?.pdf_filename?.trim() || Key;

        navigate(
          `/search-by-filename?file=${encodeURIComponent(savedFilename)}`
        );
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed – please check console / network tab.");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────── ui ─────────── */
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Document Processing Portal</h1>
      </header>

      <div className="upload-card">
        <h2 className="upload-title">Upload PDF → S3</h2>

        {loading ? (
          <Loader messages={loaderMsgs} />
        ) : (
          <>
            <div className="upload-form">
              {/* single-file selector */}
              <div className="form-group">
                <label htmlFor="singleFile">Choose single PDF:</label>
                <input
                  type="file"
                  id="singleFile"
                  accept="application/pdf"
                  onChange={handleSingleFileChange}
                />
              </div>

              {/* folder / batch selector */}
              <div className="form-group">
                <label htmlFor="folderInput">
                  Or choose a folder (batch upload):
                </label>
                <input
                  type="file"
                  id="folderInput"
                  accept="application/pdf"
                  webkitdirectory="true"
                  mozdirectory="true"
                  directory="true"
                  multiple
                  onChange={handleFolderChange}
                />
                {files.length > 0 && (
                  <small>{files.length} file(s) selected</small>
                )}
              </div>

              <button className="upload-button" onClick={handleUpload}>
                {files.length > 0
                  ? "Batch Upload & Process"
                  : "Upload & Process"}
              </button>
            </div>

            {error && <div className="message error-message">{error}</div>}
            {message && (
              <div className="message success-message">{message}</div>
            )}
          </>
        )}
      </div>

      <footer className="page-footer">
        <p>&copy; 2025 Document Processing Portal</p>
      </footer>
    </div>
  );
}
