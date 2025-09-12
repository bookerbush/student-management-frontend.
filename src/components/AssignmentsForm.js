// File: AssignmentsForm.js

import React, { useState, useEffect } from "react";
import "./AssignmentsForm.css";
import { apiGet } from "../api";
import { API_BASE_URL } from "../config"; // For direct file upload (POST with FormData)

const AssignmentsForm = () => {
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [formData, setFormData] = useState({
    selectedClass: "",
    selectedStream: "",
    subject: "",
    teacher: "T001",
    file: null,
    previewUrl: null,
  });

  const subjects = [
    "English",
    "Kiswahili",
    "Mathematics",
    "Science and Technology",
    "Social Studies",
    "Religious Education",
    "Creative Arts",
    "Physical and Health Education",
    "Home Science",
    "Agriculture",
  ];

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await apiGet("/students");
      console.log("✅ Students API Response:", res.data); // debug log
      const uniqueClasses = [
        ...new Set(
          res.data
            .map((s) => s.classEnrolled || s.class_enrolled)
            .filter(Boolean)
        ),
      ];
      setClasses(uniqueClasses);
    } catch (err) {
      console.error("❌ Failed to load classes", err);
    }
  };

  const fetchStreams = async (selectedClass) => {
    try {
      const res = await apiGet("/students");
      const filtered = res.data.filter(
        (s) =>
          (s.classEnrolled || s.class_enrolled)
            ?.toLowerCase()
            .trim() === selectedClass.toLowerCase().trim()
      );
      const uniqueStreams = [
        ...new Set(filtered.map((s) => s.stream || s.Stream).filter(Boolean)),
      ];
      setStreams(uniqueStreams);
    } catch (err) {
      console.error("❌ Failed to load streams", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      file,
      previewUrl: file ? URL.createObjectURL(file) : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.selectedClass ||
      !formData.selectedStream ||
      !formData.subject ||
      !formData.file
    ) {
      alert("⚠️ All fields are required including the file");
      return;
    }

    const nairobiTime = new Date().toLocaleDateString("en-CA", {
      timeZone: "Africa/Nairobi",
    });

    const payload = new FormData();
    payload.append("className", formData.selectedClass);
    payload.append("stream", formData.selectedStream);
    payload.append("subject", formData.subject);
    payload.append("teacher", formData.teacher);
    payload.append("date", nairobiTime);
    payload.append("worktodo", formData.file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/assignments`, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      alert("✅ Assignment uploaded successfully!");
      setFormData({
        selectedClass: "",
        selectedStream: "",
        subject: "",
        teacher: "T001",
        file: null,
        previewUrl: null,
      });
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("❌ Failed to upload assignment.");
    }
  };

  return (
    <div className="assignment-form-container">
      <h2>Upload Assignment</h2>
      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-group">
          <label>Class:</label>
          <select
            value={formData.selectedClass}
            onChange={(e) => {
              const selected = e.target.value;
              setFormData({ ...formData, selectedClass: selected, selectedStream: "" });
              fetchStreams(selected);
            }}
          >
            <option value="">Select Class</option>
            {classes.map((cls, i) => (
              <option key={i}>{cls}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Stream:</label>
          <select
            value={formData.selectedStream}
            onChange={(e) =>
              setFormData({ ...formData, selectedStream: e.target.value })
            }
          >
            <option value="">Select Stream</option>
            {streams.map((str, i) => (
              <option key={i}>{str}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Subject:</label>
          <input
            list="subjects"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
          />
          <datalist id="subjects">
            {subjects.map((subj, i) => (
              <option key={i} value={subj} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label>Assignment File:</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
        </div>

        {formData.previewUrl && (
          <div className="preview">
            <p>📎 Preview:</p>
            {formData.file?.type === "application/pdf" ? (
              <iframe src={formData.previewUrl} title="PDF Preview" />
            ) : (
              <div>
                <p>
                  <strong>File:</strong> {formData.file.name}
                </p>
                <a
                  href={formData.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  ⬇️ Download Preview
                </a>
              </div>
            )}
          </div>
        )}

        <button type="submit">Upload Assignment</button>
      </form>
    </div>
  );
};

export default AssignmentsForm;
