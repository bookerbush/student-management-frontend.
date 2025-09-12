// File: AssessmentForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AssessmentForm.css";

const AssessmentForm = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Fetch students from backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/students");
        console.log("📌 /students API response:", res.data); // 🔎 Debug log

        if (!Array.isArray(res.data)) {
          setError("❌ /students did not return an array");
          setLoading(false);
          return;
        }

        const prepared = res.data.map((s) => ({
          studentId: s.id,
          studentName: s.name,
          subject: "",
          assess: "", // ✅ fixed
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
        assess: "", // ✅ fixed
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
      await axios.post("/assessments/save", formData.map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        subject: s.subject,
        assess: s.assess, // ✅ fixed
        strand: s.strand,
        subStrand: s.subStrand,
        performanceIndicator: s.performanceIndicator,
        rating: parseInt(s.rating || "0", 10),
        comment: s.comment,
      })));

      alert("✅ Assessments saved successfully!");
    } catch (err) {
      console.error("❌ Error saving assessments:", err);
      alert("Failed to save assessments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assessment-form">
      <h2>Assessment Form</h2>
      {loading && <p>⏳ Loading...</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <table>
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
                      handleChange(index, "performanceIndicator", e.target.value)
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
        <button type="submit">💾 Save</button>
      </form>
    </div>
  );
};

export default AssessmentForm;
