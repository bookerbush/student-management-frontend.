// File: AssessmentForm.js
import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api"; // ✅ use our wrapper
import "./AssessmentForm.css";

const AssessmentForm = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  // 🔹 Fetch students from backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await apiGet("/students");
        console.log("📌 /students API response:", res.data); // 🔎 Debug log

        if (!Array.isArray(res.data)) {
          console.error("❌ /students did not return an array:", res.data);
          setError("❌ /students did not return an array");
          setLoading(false);
          return;
        }

        const prepared = res.data.map((s) => ({
          studentId: s.id,
          studentName: s.name,
          subject: "",
          assess: "",
          strand: "",
          subStrand: "",
          performanceIndicator: "",
          rating: "",
          comment: "",
        }));

        setStudents(res.data);
        setFormData(prepared);
        setError("");
      } catch (err) {
        console.error("❌ Error fetching students:", err);
        setError("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // 🔹 Handle input change
  const handleChange = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  // 🔹 Add empty row
  const addRow = () => {
    setFormData([
      ...formData,
      {
        studentId: "",
        studentName: "",
        subject: "",
        assess: "",
        strand: "",
        subStrand: "",
        performanceIndicator: "",
        rating: "",
        comment: "",
      },
    ]);
  };

  // 🔹 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = formData.map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        subject: s.subject,
        assess: s.assess,
        strand: s.strand,
        subStrand: s.subStrand,
        performanceIndicator: s.performanceIndicator,
        rating: parseInt(s.rating || "0", 10),
        comment: s.comment,
        class: selectedClass,
        stream: selectedStream,
        term: selectedTerm,
      }));

      console.log("📤 Submitting payload:", payload);

      await apiPost("/assessments", payload);

      alert("✅ Assessments saved successfully!");
    } catch (err) {
      console.error("❌ Error saving assessments:", err);
      alert("Failed to save assessments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assessment-container">
      <h2>Student Assessment Entry</h2>
      {loading && <p>⏳ Loading...</p>}
      {error && <p className="error">{error}</p>}

      {/* 🔹 Filter controls */}
      <div className="filters">
        <label>
          Class:
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Select Class --</option>
            <option value="PP1">PP1</option>
            <option value="PP2">PP2</option>
            <option value="Grade1">Grade 1</option>
            <option value="Grade2">Grade 2</option>
            <option value="Grade3">Grade 3</option>
            <option value="Grade4">Grade 4</option>
            <option value="Grade5">Grade 5</option>
            <option value="Grade6">Grade 6</option>
          </select>
        </label>

        <label>
          Stream:
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
          >
            <option value="">-- Select Stream --</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </label>

        <label>
          Term:
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <option value="">-- Select Term --</option>
            <option value="Term1">Term 1</option>
            <option value="Term2">Term 2</option>
            <option value="Term3">Term 3</option>
          </select>
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        <table className="assessment-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Subject</th>
              <th>Assess</th>
              <th>Strand</th>
              <th>Sub Strand</th>
              <th>Performance Indicator</th>
              <th>Rating</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {formData.map((row, index) => (
              <tr key={index}>
                <td>{row.studentId}</td>
                <td>{row.studentName}</td>
                <td>
                  <input
                    type="text"
                    value={row.subject}
                    onChange={(e) =>
                      handleChange(index, "subject", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.assess}
                    onChange={(e) =>
                      handleChange(index, "assess", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.strand}
                    onChange={(e) =>
                      handleChange(index, "strand", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.subStrand}
                    onChange={(e) =>
                      handleChange(index, "subStrand", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.performanceIndicator}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "performanceIndicator",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.rating}
                    onChange={(e) =>
                      handleChange(index, "rating", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.comment}
                    onChange={(e) =>
                      handleChange(index, "comment", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addRow}>
          ➕ Add Row
        </button>
        <button type="submit" className="save-btn">
          💾 Save
        </button>
      </form>
    </div>
  );
};

export default AssessmentForm;
