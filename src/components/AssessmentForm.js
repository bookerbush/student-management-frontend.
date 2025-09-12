// File: AssessmentForm.js
import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from "../api";   // ✅ use helpers from api.js
import './AssessmentForm.css';

const AssessmentForm = () => {
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    selectedClass: '',
    selectedStream: '',
    term: 'Term1',
  });

  const subjects = [
    "English", "Kiswahili", "Mathematics", "Science and Technology",
    "Social Studies", "Religious Education", "Creative Arts",
    "Physical and Health Education", "Home Science", "Agriculture"
  ];

  const assessmentTypes = ["CAT1", "CAT2", "Project Work"];
  const ratings = [1, 2, 3, 4];

  useEffect(() => {
    fetchClasses();
    setStudents(createEmptyRows(4));
  }, []);

  useEffect(() => {
    if (formData.selectedClass && formData.selectedStream) {
      fetchStudents();
    }
  }, [formData.selectedClass, formData.selectedStream]);

  // ✅ now uses apiGet
  const fetchClasses = async () => {
    try {
      const data = await apiGet('/students');
      const uniqueClasses = [...new Set(data.map(s => s.classEnrolled || s.class_enrolled).filter(Boolean))];
      setClasses(uniqueClasses);
    } catch (error) {
      console.error('❌ Error loading classes:', error);
    }
  };

  const fetchStreams = async (classEnrolled) => {
    try {
      const data = await apiGet('/students');
      const filtered = data.filter(s =>
        (s.classEnrolled || s.class_enrolled)?.toLowerCase() === classEnrolled.toLowerCase()
      );
      const uniqueStreams = [...new Set(filtered.map(s => s.stream || s.Stream).filter(Boolean))];
      setStreams(uniqueStreams);
    } catch (error) {
      console.error('❌ Error loading streams:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await apiGet('/students');
      const filtered = data.filter(s => {
        const classEnrolled = s.classEnrolled || s.class_enrolled || '';
        const stream = s.stream || s.Stream || '';
        const status = s.studentStatus || s.student_status || '';
        if (!classEnrolled || !stream || !status) return false;
        return (
          classEnrolled.toLowerCase() === formData.selectedClass.toLowerCase() &&
          stream.toLowerCase() === formData.selectedStream.toLowerCase() &&
          status.toLowerCase() === 'active'
        );
      });

      const prepared = filtered.map(s => ({
        studentId: s.admissionNumber || s.admission_number || '',
        studentName: `${s.firstName || s.first_name || ''} ${s.lastName || s.last_name || ''}`.trim(),
        subject: '',
        assessment: '',
        strand: '',
        subStrand: '',
        performanceIndicator: '',
        rating: '',
        comment: ''
      }));

      setStudents(prepared.length > 0 ? prepared : createEmptyRows(4));
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      setStudents(createEmptyRows(4));
    }
  };

  const createEmptyRows = (count) => {
    return Array.from({ length: count }, () => ({
      studentId: '',
      studentName: '',
      subject: '',
      assessment: '',
      strand: '',
      subStrand: '',
      performanceIndicator: '',
      rating: '',
      comment: ''
    }));
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const getNairobiDate = () => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const parts = formatter.formatToParts(new Date());
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;

    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    const teacherId = 'T001';
    const dateRecorded = getNairobiDate();

    try {
      for (let s of students) {
        if (!s.studentId || !s.subject || !s.assessment || !s.performanceIndicator) continue;

        const payload = {
          studentId: s.studentId,
          studentName: s.studentName,
          subject: s.subject,
          assess: s.assessment,
          //assessment: s.assessment,
          strand: s.strand,
          subStrand: s.subStrand,
          performanceIndicator: s.performanceIndicator,
          rating: s.rating,
          comment: s.comment,
          term: formData.term,
          dateRecorded,
          teacherId
        };

        // ✅ now uses apiPost
        const res = await apiPost('/api/assessments', payload);
        if (res && res.error === 'duplicate') {
          alert(`❌ Duplicate for ${s.studentId} - ${s.performanceIndicator}`);
          return;
        }
      }

      alert('✅ Assessments saved successfully');
      setStudents(createEmptyRows(4));
    } catch (error) {
      console.error('❌ Error saving assessment:', error);
      alert('❌ Failed to save assessment');
    }
  };

  return (
    <div className="assessment-container">
      <h2>Student Assessment Entry</h2>

      {/* form UI remains same */}
      ...
    </div>
  );
};

export default AssessmentForm;
