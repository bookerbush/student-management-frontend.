// components/AssignmentsList.js
import React, { useEffect, useState } from "react";
//import api from "../api";  // ✅ use central api.js
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

import "./AssignmentsList.css";

export const AssignmentsList = () => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [showMissing, setShowMissing] = useState(false);

  useEffect(() => {
    apiGet("/api/assignments")
      .then((res) => {
        const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAssignments(sorted);
        setFilteredAssignments(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching assignments:", err);
        setLoading(false);
      });
  }, []);

  // Auto filter when dropdown/date changes
  useEffect(() => {
    let filtered = assignments;

    if (selectedClass) {
      filtered = filtered.filter((a) => a.className === selectedClass);
    }
    if (selectedStream) {
      filtered = filtered.filter((a) => a.stream === selectedStream);
    }
    if (selectedDate) {
      filtered = filtered.filter(
        (a) =>
          new Date(a.date).toLocaleDateString() ===
          new Date(selectedDate).toLocaleDateString()
      );
    }

    setFilteredAssignments(filtered);
  }, [selectedClass, selectedStream, selectedDate, assignments]);

  const handleDownload = (id) => {
    apiGet(`/api/assignments/download/${id}`, { responseType: "blob" })
      .then((res) => {
        const url = window.URL.createObjectURL(res.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `assignment_${id}.doc`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => console.error("❌ Error downloading file:", err));
  };

  const checkMissingAssignments = () => {
    if (!selectedDate) {
      alert("⚠️ Please select a date to check missing assignments.");
      return;
    }

    apiGet("/api/streams")
      .then((res) => {
        const allStreams = res.data;
        const missingList = [];

        allStreams.forEach((stream) => {
          const found = assignments.find(
            (a) =>
              a.className === stream.className &&
              a.stream === stream.stream &&
              a.subject === stream.subject &&
              new Date(a.date).toLocaleDateString() ===
                new Date(selectedDate).toLocaleDateString()
          );

          if (!found) {
            missingList.push({
              className: stream.className,
              stream: stream.stream,
              subject: `${stream.subject} -`,
              teacher: `${stream.teacher || ""}`,
              date: selectedDate,
              noDownload: true,
            });
          }
        });

        setFilteredAssignments(missingList);
        setShowMissing(true);
      })
      .catch((err) => console.error("❌ Error fetching streams list:", err));
  };

  if (loading) {
    return <div className="assignments-loading">Loading assignments...</div>;
  }

  if (filteredAssignments.length === 0 && !loading) {
    return <div className="assignments-empty">No assignments found.</div>;
  }

  return (
    <div className="assignments-container">
      <h2>📚 Assignments List</h2>

      <div className="filters">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">All Classes</option>
          {[...new Set(assignments.map((a) => a.className))].map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        <select
          value={selectedStream}
          onChange={(e) => setSelectedStream(e.target.value)}
        >
          <option value="">All Streams</option>
          {[...new Set(assignments.map((a) => a.stream))].map((stream) => (
            <option key={stream} value={stream}>
              {stream}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <button onClick={checkMissingAssignments} className="missing-btn">
          Check Missing Assignments
        </button>
      </div>

      <table className="assignments-table">
        <thead>
          <tr>
            <th>Class</th>
            <th>Stream</th>
            <th>Subject</th>
            <th>Teacher</th>
            <th>Date</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssignments.map((a, idx) => (
            <tr key={idx}>
              <td>{a.className}</td>
              <td>{a.stream}</td>
              <td style={{ color: a.subject.endsWith("-") ? "red" : "inherit" }}>
                {a.subject}
              </td>
              <td>{a.teacher}</td>
              <td>{new Date(a.date).toLocaleDateString()}</td>
              <td>
                {a.noDownload ? (
                  <span className="no-download">No Download</span>
                ) : (
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(a.assigno)}
                  >
                    ⬇ Download
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
