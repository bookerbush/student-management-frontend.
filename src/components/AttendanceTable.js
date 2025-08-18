// File: AttendanceTable.js
import React, { useEffect, useState } from "react";
//import api from "../api";  // ✅ use shared API instance
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

import './AttendanceTable.css';

export const AttendanceTable = ({ selectedDate }) => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    if (!selectedDate) return;

    const dateStr = selectedDate.toISOString().split("T")[0];
    apiGet(`/api/attendance/by-date/${dateStr}`)
      .then(res => {
        setAttendanceData(res.data || []);
      })
      .catch(err => {
        console.error("❌ Failed to fetch attendance for", dateStr, err);
        setAttendanceData([]);
      });
  }, [selectedDate]);

  const getStatusForDate = (record) => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    if (dateStr === record.monDate) return record.monStatus;
    if (dateStr === record.tueDate) return record.tueStatus;
    if (dateStr === record.wedDate) return record.wedStatus;
    if (dateStr === record.thursDate) return record.thursStatus;
    if (dateStr === record.friDate) return record.friStatus;
    if (dateStr === record.satDate) return record.satStatus;
    return "-";
  };

  return (
    <div>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Daily Attendance</h3>
      <div className="attendance-scroll-wrapper">
        <table className="attendance-table-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Stream</th>
              <th>Adno</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.length === 0 ? (
              <tr><td colSpan="5">No records found</td></tr>
            ) : (
              attendanceData.map((row, index) => {
                const status = getStatusForDate(row);
                return (
                  <tr key={index}>
                    <td>{row.studentClass}</td>
                    <td>{row.stream}</td>
                    <td>{row.studentId}</td>
                    <td>{row.student}</td>
                    <td
                      className={
                        status === 'P'
                          ? 'status-present'
                          : status === 'A'
                          ? 'status-absent'
                          : ''
                      }
                    >
                      {status}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
