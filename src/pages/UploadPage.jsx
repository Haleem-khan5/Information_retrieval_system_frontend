import React, { useState } from "react";
import AWS from "aws-sdk";
import axios from "axios";
export default function UploadPDFPage() {
  // State to hold the file input
  const [file, setFile] = useState(null);
  const [componentType, setComponentType] = useState("");
  const [componentName, setComponentName] = useState("");
  const [message, setMessage] = useState("");

  // AWS S3 configuration
  const s3 = new AWS.S3({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_S3_REGION,
  });

  // 1) Capture the chosen file in state
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 2) Upload PDF directly to S3
  const handleUpload = async () => {
    setMessage(""); // Clear any prior message

    // Simple validations
    if (!file || !componentType || !componentName) {
      alert("Please select a PDF file and provide component info");
      return;
    }

    try {
        // Construct the S3 upload parameters
        // Key: "{componentType}_{componentName}/file.pdf"
        const uploadParams = {
          Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
          Key: `${componentType}_${componentName}/file.pdf`,
          Body: file,
          ContentType: file.type || "application/pdf",
        };

      // Start the S3 upload
      const uploadResult = await s3.upload(uploadParams).promise();

      /*
       * The `uploadResult` will contain metadata about the uploaded file,
       * such as ETag, Location (public URL), key, etc.
       */
      console.log("uploadResult:", uploadResult);

      // Optionally, you might still want to notify your backend 
      // that a new PDF has been uploaded, so it can be processed.
      // For example:
      await axios.post("http://localhost:5000/process_pdf", {
        s3Filename: uploadResult.Key
      });

      setMessage(`Success! PDF uploaded to: ${uploadResult.Location}`);
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload PDF (Direct to S3)</h2>
      <div style={{ margin: "10px 0" }}>
        <label>Choose PDF: </label>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </div>

      <div style={{ margin: "10px 0" }}>
        <input
          type="text"
          placeholder="Component Type (e.g. 'anode')"
          value={componentType}
          onChange={(e) => setComponentType(e.target.value)}
        />
      </div>

      <div style={{ margin: "10px 0" }}>
        <input
          type="text"
          placeholder="Component Name (e.g. 'AP11345V')"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
        />
      </div>

      <button onClick={handleUpload}>Upload & Process</button>

      {message && (
        <div style={{ marginTop: 20 }}>
          <strong>Result:</strong> {message}
        </div>
      )}
    </div>
  );
}
