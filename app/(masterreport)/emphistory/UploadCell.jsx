"use client";
import React, { useState, useEffect } from "react";

export default function UploadCell({ programId, employeeId, trainingYear }) {
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch uploaded files for this programId and employeeId
  useEffect(() => {
    if (!programId || !employeeId) return;

    const fetchUploadedFiles = async () => {
      try {
        const res = await fetch(
          `/api/view_upload_emp_certificates?ProgramId=${programId}&Employee_Id=${employeeId}`
        );
        const data = await res.json();
        if (res.ok) {
          setUploadedFiles(data);
          setErrorMessage("");
        } else {
          setErrorMessage("Failed to load uploaded files");
        }
      } catch (err) {
        setErrorMessage("Error loading uploaded files");
      }
    };

    fetchUploadedFiles();
  }, [programId, employeeId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file to upload");
      return;
    }
    if (!programId || !employeeId) {
      setErrorMessage("Missing program or employee information");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("programId", programId);
    formData.append("employeeId", employeeId);

    try {
      // Upload file
      const uploadRes = await fetch("/api/upload_emp_certificates", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        setErrorMessage(uploadData.message || "File upload failed");
        setLoading(false);
        return;
      }

      // Insert upload status
      const insertRes = await fetch("/api/insert_upload_emp_certificate_status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Program_Id: programId,
          Employee_Id: employeeId,
          IsUpload: 1,
          CreatedBy: "system",
        }),
      });
      const insertData = await insertRes.json();

      if (!insertRes.ok) {
        setErrorMessage(insertData.message || "Failed to update upload status");
        setLoading(false);
        return;
      }

      // Refresh uploaded files list
      const res = await fetch(
        `/api/view_upload_emp_certificates?ProgramId=${programId}&Employee_Id=${employeeId}`
      );
      const data = await res.json();
      if (res.ok) {
        setUploadedFiles(data);
        setErrorMessage("");
      } else {
        setErrorMessage("Failed to refresh uploaded files");
      }

      setFile(null);
      setLoading(false);
    } catch (err) {
      setErrorMessage("Upload failed: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      <ul>
        {uploadedFiles.map((file) => (
          <li key={file.Cert_Id}>
            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
              View Certificate {file.Cert_Id}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
