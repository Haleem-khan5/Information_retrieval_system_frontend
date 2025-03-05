import React, { useState, useEffect } from "react";
import AWS from "aws-sdk";
import axios from "axios";
import "./UploadPDFPage.css";

// Loader component that shows progress messages one after another
function Loader({ messages, interval = 3000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < messages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, interval);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, messages, interval]);

  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="loader-message animated-text">{messages[currentIndex]}</p>
    </div>
  );
}

export default function UploadPDFPage() {
  // States for form data and messages
  const [file, setFile] = useState(null);
  const [componentType, setComponentType] = useState("");
  const [componentName, setComponentName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Loader messages for each step of the process
  const loaderMessages = [
    "Converting PDF to images...",
    "Performing OCR using Gemni model...",
    "Transforming OCR content with LLM model...",
    "Saving data to database for optimized retrieval..."
  ];

  // AWS S3 configuration
  const s3 = new AWS.S3({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_S3_REGION,
  });

  // Capture file selection and clear any messages
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setMessage("");
  };

  // Upload PDF to S3 and notify backend
  const handleUpload = async () => {
    setMessage("");
    setError("");

    if (!file || !componentType.trim() || !componentName.trim()) {
      setError("Please select a PDF file and provide component info.");
      return;
    }

    try {
      setLoading(true);
      // Build S3 upload parameters (Key: "componentType_componentName/file.pdf")
      const uploadParams = {
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
        Key: `${componentType.trim()}_${componentName.trim()}/file.pdf`,
        Body: file,
        ContentType: file.type || "application/pdf",
      };

      // Upload file to S3
      const uploadResult = await s3.upload(uploadParams).promise();
      console.log("uploadResult:", uploadResult);

      // Notify backend that a new PDF has been uploaded
      await axios.post("http://localhost:5000/process_pdf", {
        s3Filename: uploadResult.Key,
      });

      setMessage(`Success! PDF uploaded to: ${uploadResult.Location}`);
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Error uploading file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Document Processing Portal</h1>
      </header>
      <div className="upload-card">
        <h2 className="upload-title">Upload PDF (Direct to S3)</h2>
        {loading ? (
          <Loader messages={loaderMessages} interval={3000} />
        ) : (
          <>
            <div className="upload-form">
              <div className="form-group">
                <label htmlFor="pdfFile">Choose PDF:</label>
                <input
                  type="file"
                  id="pdfFile"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Component Type (e.g. 'anode')"
                  value={componentType}
                  onChange={(e) => {
                    setComponentType(e.target.value);
                    setError("");
                    setMessage("");
                  }}
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Component Name (e.g. 'AP11345V')"
                  value={componentName}
                  onChange={(e) => {
                    setComponentName(e.target.value);
                    setError("");
                    setMessage("");
                  }}
                />
              </div>

              <button className="upload-button" onClick={handleUpload}>
                Upload & Process
              </button>
            </div>

            {error && <div className="message error-message">{error}</div>}
            {message && <div className="message success-message">{message}</div>}
          </>
        )}
      </div>
      <footer className="page-footer">
        <p>&copy; 2025 Document Processing Portal</p>
      </footer>
    </div>
  );
}
