// File: TrackingForm.js

import React, { useEffect, useState } from 'react';
//import api from '../api';   // ✅ use centralized axios instance
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

import './TrackingForm.css';

const TrackingForm = () => {
  const [formData, setFormData] = useState({
    term: 'Term1',
    openingDate: '',
    midtermDate: '',
    closingDate: '',
    selectedClass: '',
    selectedStream: '',
  });

  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [students, setStudents] = useState([]);
  const [weekDates, setWeekDates] = useState([]);
  const [todayIndex, setTodayIndex] = useState(-1);

  useEffect(() => {
    fetchClasses();
    generateWeekDates();
    generatePlaceholderRows();
  }, []);

  // ✅ now uses api.js
  const fetchClasses = async () => {
    try {
      const res = await apiGet('/students');
      const all = res.data;
      const uniqueClasses = [...new Set(all.map((s) => s.classEnrolled || s.class_enrolled).filter(Boolean))];
      setClasses(uniqueClasses);
    } catch (error) {
      console.error('❌ Error fetching classes', error);
    }
  };

  const fetchStreams = async (classSelected) => {
    try {
      const res = await apiGet('/students');
      const filtered = res.data.filter(s =>
        (s.classEnrolled || s.class_enrolled) === classSelected
      );
      const uniqueStreams = [...new Set(filtered.map(s => s.stream || s.Stream).filter(Boolean))];
      setStreams(uniqueStreams);
    } catch (error) {
      console.error('❌ Error fetching streams', error);
    }
  };

  const generateWeekDates = () => {
    const today = new Date();
    const kenyaTime = new Date(today.toLocaleString("en-US", { timeZone: "Africa/Nairobi" }));
    const day = kenyaTime.getDay();

    const monday = new Date(kenyaTime);
    if (day === 0) {
      monday.setDate(kenyaTime.getDate() + 1);
    } else {
      monday.setDate(kenyaTime.getDate() - day + 1);
    }

    const dates = [];
    let currentDayIndex = -1;

    for (let i = 0; i < 6; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const isoDate = date.toISOString().split('T')[0];

      if (isoDate === kenyaTime.toISOString().split('T')[0]) {
        currentDayIndex = i;
      }

      dates.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: isoDate,
      });
    }

    setWeekDates(dates);
    setTodayIndex(currentDayIndex);
  };

  const generatePlaceholderRows = () => {
    const placeholders = Array.from({ length: 5 }, () => ({
      studentId: '',
      fullName: '',
      monStatus: 'A',
      tueStatus: 'A',
      wedStatus: 'A',
      thursStatus: 'A',
      friStatus: 'A',
      satStatus: 'A',
    }));
    setStudents(placeholders);
  };

  // ✅ now uses api.js
  const fetchStudents = async () => {
    try {
      const res = await apiGet('/students');
      const filtered = res.data.filter(s =>
        (s.classEnrolled || s.class_enrolled) === formData.selectedClass &&
        (s.stream || s.Stream) === formData.selectedStream
      );

      if (filtered.length === 0) {
        alert('❌ No records found for the selected class and stream.');
        generatePlaceholderRows();
        return;
      }

      const fromDate = weekDates[0].date;
      const toDate = weekDates[5].date;

      const attendanceRes = await apiGet(`/api/tracking/filter`, {
        params: {
          class: formData.selectedClass,
          stream: formData.selectedStream,
          from: fromDate,
          to: toDate
        }
      });

      const attendance = attendanceRes.data;

      const updated = filtered.map(s => {
        const record = attendance.find(a => a.studentId === (s.admissionNumber || s.admission_number));
        return {
          studentId: s.admissionNumber || s.admission_number,
          fullName: `${s.firstName || s.first_name || ''} ${s.lastName || s.last_name || ''}`.trim(),
          monStatus: record?.monStatus || 'A',
          tueStatus: record?.tueStatus || 'A',
          wedStatus: record?.wedStatus || 'A',
          thursStatus: record?.thursStatus || 'A',
          friStatus: record?.friStatus || 'A',
          satStatus: record?.satStatus || 'A',
          recordExists: !!record
        };
      });

      setStudents(updated);
    } catch (error) {
      console.error('❌ Error fetching students or attendance:', error);
      alert('❌ Failed to load student data');
    }
  };

  const handleSelectChange = (e, studentIndex, dayKey) => {
    const updated = [...students];
    updated[studentIndex][dayKey] = e.target.value;
    setStudents(updated);
  };

  // ✅ now uses api.js
  const handleSubmit = async () => {
    try {
      for (let s of students) {
        if (!s.studentId || !s.fullName) continue;

        const payload = {
          studentId: s.studentId,
          student: s.fullName,
          percentPresent: calculatePercentage(s),
          studentClass: formData.selectedClass,
          stream: formData.selectedStream,
          monDate: weekDates[0].date,
          tueDate: weekDates[1].date,
          wedDate: weekDates[2].date,
          thursDate: weekDates[3].date,
          friDate: weekDates[4].date,
          satDate: weekDates[5].date,
          monStatus: s.monStatus || 'A',
          tueStatus: s.tueStatus || 'A',
          wedStatus: s.wedStatus || 'A',
          thursStatus: s.thursStatus || 'A',
          friStatus: s.friStatus || 'A',
          satStatus: s.satStatus || 'A',
        };

        if (s.recordExists) {
          await apiPut(`/api/tracking/${s.studentId}`, payload);
        } else {
          await apiPost('/api/tracking', payload);
        }
      }
      alert('✅ Attendance submitted successfully!');
    } catch (err) {
      console.error('❌ Error saving attendance:', err);
      alert('❌ Failed to submit attendance.');
    }
  };

  const calculatePercentage = (s) => {
    const days = ['monStatus', 'tueStatus', 'wedStatus', 'thursStatus', 'friStatus', 'satStatus'];
    const presentCount = days.filter(day => s[day] === 'P').length;
    return Math.round((presentCount / days.length) * 100);
  };

  const dayKeyList = ['monStatus', 'tueStatus', 'wedStatus', 'thursStatus', 'friStatus', 'satStatus'];

  return (
    <div className="tracking-container">
      <div className="form-row">
        {/* form fields remain same */}
        ...
      </div>

      {/* table and submit button remain same */}
      ...
    </div>
  );
};

export default TrackingForm;
