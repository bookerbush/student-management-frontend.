// File: DashboardAttendance.js
import React, { useEffect, useState } from 'react';
import './DashboardAttendance.css';
import axios from 'axios';
import { API_BASE_URL } from "../config"; // ✅ correct

const DashboardAttendance = ({ selectedDate }) => {
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState('');

  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    const kenyaTime = new Date(
      dateObj.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })
    );
    const yyyy = kenyaTime.getFullYear();
    const mm = String(kenyaTime.getMonth() + 1).padStart(2, '0');
    const dd = String(kenyaTime.getDate()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;
    console.log('📅 Formatted date (Kenya time):', formatted);
    return formatted;
  };

  const fetchAttendance = async (targetDate) => {
    const formattedDate = formatDate(targetDate);
    console.log('📡 Fetching attendance for date:', formattedDate);

    try {
      const res = await axios.get(`${API_BASE_URL}/tracking/dashboard/attendance`, {
        params: { date: formattedDate }
      });
      console.log('✅ API response:', res.data);
      setRecords(res.data || []);
      setCurrentDate(formattedDate);
    } catch (err) {
      console.error('❌ Failed to load attendance data', err);
      setRecords([]);
    }
  };

  const getStatusForDate = (record) => {
    const dateMap = {
      monDate: 'monStatus',
      tueDate: 'tueStatus',
      wedDate: 'wedStatus',
      thursDate: 'thursStatus',
      friDate: 'friStatus',
      satDate: 'satStatus',
    };

    for (let dateKey in dateMap) {
      const rawDate = record[dateKey];
      const formattedRecordDate = formatDate(rawDate);
      if (formattedRecordDate === currentDate) {
        return record[dateMap[dateKey]] || 'A';
      }
    }
    return 'A';
  };

  useEffect(() => {
    const dateToUse = selectedDate || new Date();
    fetchAttendance(dateToUse);

    const interval = setInterval(() => {
      fetchAttendance(dateToUse);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  return (
    <div className="daily-attendance-table">
      <h4>🕒 Daily Attendance - {currentDate}</h4>
      <div className="table-wrapper">
        <table>
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
            {records.length === 0 ? (
              <tr><td colSpan="5">No attendance records</td></tr>
            ) : (
              records.map((r, idx) => {
                const status = getStatusForDate(r);
                return (
                  <tr key={idx}>
                    <td>{r.studentClass}</td>
                    <td>{r.stream}</td>
                    <td>{r.studentId}</td>
                    <td>{r.student}</td>
                    <td className={status === 'P' ? 'yellow-bg' : 'red-bg'}>
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

export default DashboardAttendance;
