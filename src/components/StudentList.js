// File: StudentList.js

import React, { useEffect, useState } from "react";
import "./StudentList.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { apiGet } from "../api"; // ✅ centralized API

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filters, setFilters] = useState({
    gender: "",
    boardingStatus: "",
    classEnrolled: "",
  });

  // ✅ fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await apiGet("/students");

        // Ensure we always have an array
        const rawStudents = Array.isArray(data)
          ? data
          : data?.students || [];

        // Normalize values for cross-DB consistency
        const normalized = rawStudents.map((s) => ({
          ...s,
          gender: s.gender?.trim() || "",
          classEnrolled: s.classEnrolled?.trim() || "",
          boardingStatus:
            s.boardingStatus === true ||
            s.boardingStatus === "true" ||
            s.boardingStatus === 1,
        }));

        setStudents(normalized);
        setFilteredStudents(normalized);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
        setStudents([]);
        setFilteredStudents([]);
      }
    };
    fetchStudents();
  }, []);

  // ✅ apply filters locally
  useEffect(() => {
    let result = students;

    if (filters.gender) {
      result = result.filter(
        (s) => s.gender?.toLowerCase() === filters.gender.toLowerCase()
      );
    }

    if (filters.boardingStatus) {
      const filterVal = filters.boardingStatus === "true";
      result = result.filter((s) => s.boardingStatus === filterVal);
    }

    if (filters.classEnrolled) {
      result = result.filter(
        (s) =>
          s.classEnrolled?.toLowerCase() ===
          filters.classEnrolled.toLowerCase()
      );
    }

    setFilteredStudents(result);
  }, [filters, students]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Export CSV
  const exportToExcel = () => {
    const headers = [
      "Admission No",
      "Name",
      "Gender",
      "Class",
      "Stream",
      "Boarding Status",
    ];

    const rows = filteredStudents.map((s) => [
      s.admissionNumber || "",
      `${s.firstName || ""} ${s.lastName || ""}`.trim(),
      s.gender || "",
      s.classEnrolled || "",
      s.stream || "",
      s.boardingStatus ? "Boarding" : "Day",
    ]);

    let csvContent =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "students.csv";
    link.click();
  };

  // ✅ Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Student List Report", 14, 10);
    autoTable(doc, {
      head: [
        [
          "Admission No",
          "Name",
          "Gender",
          "Class",
          "Stream",
          "Boarding Status",
        ],
      ],
      body: filteredStudents.map((s) => [
        s.admissionNumber || "",
        `${s.firstName || ""} ${s.lastName || ""}`.trim(),
        s.gender || "",
        s.classEnrolled || "",
        s.stream || "",
        s.boardingStatus ? "Boarding" : "Day",
      ]),
    });
    doc.save("students.pdf");
  };

  return (
    <div className="student-list-container">
      <h2>Student List Report ({filteredStudents.length})</h2>

      {/* Filters + Export buttons */}
      <div className="filter-export-bar">
        <select
          name="gender"
          value={filters.gender}
          onChange={handleFilterChange}
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select
          name="boardingStatus"
          value={filters.boardingStatus}
          onChange={handleFilterChange}
        >
          <option value="">All Boarding Status</option>
          <option value="true">Boarding</option>
          <option value="false">Day</option>
        </select>

        <select
          name="classEnrolled"
          value={filters.classEnrolled}
          onChange={handleFilterChange}
        >
          <option value="">All Classes</option>
          {[...new Set(students.map((s) => s.classEnrolled).filter(Boolean))].map(
            (cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            )
          )}
        </select>

        <button onClick={exportToExcel} className="export-btn">
          Export to Excel
        </button>
        <button onClick={exportToPDF} className="export-btn">
          Export to PDF
        </button>
      </div>

      {/* Table */}
      <table id="studentTable" className="student-table">
        <thead>
          <tr>
            <th>Admission No</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Class</th>
            <th>Stream</th>
            <th>Boarding Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((s, index) => (
              <tr
                key={s.id || s.admissionNumber}
                className={index % 2 === 0 ? "even-row" : "odd-row"}
              >
                <td>{s.admissionNumber}</td>
                <td>{`${s.firstName || ""} ${s.lastName || ""}`.trim()}</td>
                <td>{s.gender}</td>
                <td>{s.classEnrolled}</td>
                <td>{s.stream}</td>
                <td>{s.boardingStatus ? "Boarding" : "Day"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">
                No students match the filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
