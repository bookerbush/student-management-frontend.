// File: AssessmentForm.js
import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api"; // ✅ use wrapper
import "./AssessmentForm.css";

const AssessmentForm = () => {
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    selectedClass: "",
    selectedStream: "",
    term: "Term1",
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

  const fetchClasses = async () => {
    try {
      const res = await apiGet("/students");
      console.log("📌 /students for classes:", res.data);

      if (!Array.isArray(res.data)) {
        console.error("❌ Expected array but got:", res.data);
        setClasses([]);
        return;
      }

      const uniqueClasses = [
        ...new Set(
          res.data.map((s) => s.classEnrolled || s.class_enrolled).filter(Boolean)
        ),
      ];
      setClasses(uniqueClasses);
    } catch (error) {
      console.error("❌ Error loading classes:", error);
    }
  };

  const fetchStreams = async (classEnrolled) => {
    try {
      const res = await apiGet("/students");

      if (!Array.isArray(res.data)) {
        console.error("❌ Expected array but got:", res.data);
        setStreams([]);
        return;
      }

      const data = res.data.filter(
        (s) =>
          (s.classEnrolled || s.class_enrolled)?.toLowerCase() ===
          classEnrolled.toLowerCase()
      );

      const uniqueStreams = [
        ...new Set(data.map((s) => s.stream || s.Stream).filter(Boolean)),
      ];
      setStreams(uniqueStreams);
    } catch (error) {
      console.error("❌ Error loading streams:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await apiGet("/students");

      if (!Array.isArray(res.data)) {
        console.error("❌ Expected array but got:", res.data);
        setStudents(createEmptyRows(4));
        return;
      }

      const filtered = res.data.filter((s) => {
        const classEnrolled = s.classEnrolled || s.class_enrolled || "";
        const stream = s.stream || s.Stream || "";
        const status = s.studentStatus || s.student_status || "";
        if (!classEnrolled || !stream || !status) return false;
        return (
          classEnrolled.toLowerCase() === formData.selectedClass.toLowerCase() &&
          stream.toLowerCase() === formData.selectedStream.toLowerCase() &&
          status.toLowerCase() === "active"
        );
      });

      const prepared = filtered.map((s) => ({
        studentId: s.admissionNumber || s.admission_number || "",
        studentName: `${s.firstName || s.first_name || ""} ${
          s.lastName || s.last_name || ""
        }`.trim(),
        subject: "",
        assess: "", // ✅ keep backend happy
        strand: "",
        subStrand: "",
        performanceIndicator: "",
        rating: "",
        comment: "",
      }));

      setStudents(prepared.length > 0 ? prepared : createEmptyRows(4));
    } catch (error) {
      console.error("❌ Error fetching students:", error);
      setStudents(createEmptyRows(4));
    }
  };

  const createEmptyRows = (count) => {
    return Array.from({ length: count }, () => ({
      studentId: "",
      studentName: "",
      subject: "",
      assess: "",
      strand: "",
      subStrand: "",
      performanceIndicator: "",
      rating: "",
      comment: "",
    }));
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const getNairobiDate = () => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Nairobi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const parts = formatter.formatToParts(new Date());
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;

    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    const teacherId = "T001";
    const dateRecorded = getNairobiDate();

    try {
      for (let s of students) {
        if (!s.studentId || !s.subject || !s.assess || !s.performanceIndicator)
          continue;

        const payload = {
          studentId: s.studentId,
          studentName: s.studentName,
          subject: s.subject,
          assess: s.assess, // ✅ backend expects this
          strand: s.strand,
          subStrand: s.subStrand,
          performanceIndicator: s.performanceIndicator,
          rating: s.rating,
          comment: s.comment,
          term: formData.term,
          dateRecorded,
          teacherId,
        };

        console.log("📤 Submitting assessment:", payload);
        const res = await apiPost("/api/assessments", payload);

        if (res.data && res.data.error === "duplicate") {
          alert(`❌ Duplicate for ${s.studentId} - ${s.performanceIndicator}`);
          return;
        }
      }

      alert("✅ Assessments saved successfully");
      setStudents(createEmptyRows(4));
    } catch (error) {
      console.error("❌ Error saving assessment:", error);
      alert("❌ Failed to save assessment");
    }
  };

  return (
    <div className="assessment-container">
      <h2>Student Assessment Entry</h2>

      {/* 🔹 Filter Controls */}
      <div className="form-row">
        <label>Class</label>
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

        <label>Stream</label>
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

        <label>Term</label>
        <select
          value={formData.term}
          onChange={(e) => setFormData({ ...formData, term: e.target.value })}
        >
          <option>Term1</option>
          <option>Term2</option>
          <option>Term3</option>
        </select>
      </div>

      <table className="assessment-table">
        <thead>
          <tr>
            <th>Adm No</th>
            <th>Name</th>
            <th>Subject</th>
            <th>Assessment</th>
            <th>Strand</th>
            <th>Sub-strand</th>
            <th>P.Indicators</th>
            <th>Rating</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, index) => (
            <tr key={index}>
              <td>{s.studentId}</td>
              <td>{s.studentName}</td>
              <td>
                <input
                  list="subjects"
                  value={s.subject}
                  onChange={(e) =>
                    handleInputChange(index, "subject", e.target.value)
                  }
                />
              </td>
              <td>
                <select
                  value={s.assess}
                  onChange={(e) =>
                    handleInputChange(index, "assess", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {assessmentTypes.map((a, i) => (
                    <option key={i}>{a}</option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="text"
                  list="strandOptions"
                  value={s.strand}
                  onChange={(e) =>
                    handleInputChange(index, "strand", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  list="subStrandOptions"
                  value={s.subStrand}
                  onChange={(e) =>
                    handleInputChange(index, "subStrand", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  list="indicatorOptions"
                  value={s.performanceIndicator}
                  onChange={(e) =>
                    handleInputChange(index, "performanceIndicator", e.target.value)
                  }
                />
              </td>
              <td>
                <select
                  value={s.rating}
                  onChange={(e) =>
                    handleInputChange(index, "rating", e.target.value)
                  }
                >
                  <option value="">Rate</option>
                  {ratings.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="text"
                  list="commentOptions"
                  value={s.comment}
                  onChange={(e) =>
                    handleInputChange(index, "comment", e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dynamic Suggestion Lists */}
      <datalist id="subjects">
        {subjects.map((sub, i) => (
          <option key={i} value={sub} />
        ))}
      </datalist>
      <datalist id="strandOptions">
        {[...new Set(students.map((s) => s.strand).filter(Boolean))].map(
          (v, i) => (
            <option key={i} value={v} />
          )
        )}
      </datalist>
      <datalist id="subStrandOptions">
        {[...new Set(students.map((s) => s.subStrand).filter(Boolean))].map(
          (v, i) => (
            <option key={i} value={v} />
          )
        )}
      </datalist>
      <datalist id="indicatorOptions">
        {[...new Set(students.map((s) => s.performanceIndicator).filter(Boolean))].map(
          (v, i) => (
            <option key={i} value={v} />
          )
        )}
      </datalist>
      <datalist id="commentOptions">
        {[...new Set(students.map((s) => s.comment).filter(Boolean))].map(
          (v, i) => (
            <option key={i} value={v} />
          )
        )}
      </datalist>

      <button className="save-btn" onClick={handleSubmit}>
        Save Assessments
      </button>
    </div>
  );
};

export default AssessmentForm;
