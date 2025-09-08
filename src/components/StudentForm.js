// File: StudentForm.js
import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api";
import "./StudentForm.css";

const StudentForm = () => {
  const [formData, setFormData] = useState({
    // Basic Info
    studentId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "Male", // ✅ default
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "Kenyan", // ✅ default

    // Parent/Guardian
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
    guardianName: "",
    guardianPhone: "",
    relationshipToStudent: "",
    parentEmail: "",
    parentAddress: "",

    // Enrollment
    admissionNumber: "",
    dateOfAdmission: "",
    classEnrolled: "",
    stream: "",
    admissionType: "",
    studentType: "",

    // Boarding
    boardingStatus: false,
    dormitory: "",
    houseParent: "",

    // Health
    medicalConditions: "",
    bloodGroup: "A+", // ✅ default
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Other
    religion: "Christian", // ✅ default
    disabilityStatus: false,
    disabilityDescription: "",
    passportPhoto: "",
    remarks: "",
    studentStatus: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");

  // ✅ Auto-generate Student ID and Admission Number
  useEffect(() => {
    const getNextStudentId = async () => {
      try {
        const res = await apiGet("/students/latest-id");
        const latestId = res.data;
        const nextId = latestId ? latestId + 1 : 1;
        const formatted = String(nextId).padStart(4, "0");
        setFormData((prev) => ({
          ...prev,
          studentId: formatted,
          admissionNumber: formatted,
        }));
      } catch (error) {
        console.error("Failed to fetch latest ID", error);
      }
    };
    getNextStudentId();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, passportPhoto: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleReset = () => {
    window.location.reload();
  };

  // ✅ Validation step
  const validateForm = () => {
    const requiredDropdowns = ["gender", "bloodGroup", "religion"];
    for (let field of requiredDropdowns) {
      if (!formData[field] || formData[field].trim() === "") {
        setMessage(`❌ Please select a valid value for ${field}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // stop submission if validation fails
    }

    const dataToSend = { ...formData };
    delete dataToSend.passportPhoto;

    const formDataToSend = new FormData();
    formDataToSend.append("studentData", JSON.stringify(dataToSend));
    if (formData.passportPhoto) {
      formDataToSend.append("passportPhoto", formData.passportPhoto);
    }

    try {
      await apiPost("/students/upload", formDataToSend);

      setMessage("✅ Student saved successfully!");

      // Fetch next auto-generated ID
      const res = await apiGet("/students/latest-id");
      const latest = res.data;
      const nextNumber = String((latest ?? 0) + 1).padStart(4, "0");

      setFormData((prev) => ({
        ...prev,
        studentId: nextNumber,
        admissionNumber: nextNumber,
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "Male", // reset with default
        dateOfBirth: "",
        placeOfBirth: "",
        nationality: "Kenyan", // reset with default
        fatherName: "",
        fatherPhone: "",
        motherName: "",
        motherPhone: "",
        guardianName: "",
        guardianPhone: "",
        relationshipToStudent: "",
        parentEmail: "",
        parentAddress: "",
        dateOfAdmission: "",
        classEnrolled: "",
        stream: "",
        admissionType: "",
        studentType: "",
        boardingStatus: false,
        dormitory: "",
        houseParent: "",
        medicalConditions: "",
        bloodGroup: "A+", // reset with default
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
        religion: "Christian", // reset with default
        disabilityStatus: false,
        disabilityDescription: "",
        passportPhoto: "",
        remarks: "",
        studentStatus: "",
      }));
      setImagePreview(null);
    } catch (error) {
      console.error("❌ Submission error:", error);
      setMessage("❌ An error occurred while saving the student.");
    }
  };

  const renderInput = (label, name, type = "text", options = []) => (
    <div className="form-group" key={name}>
      <label>{label}</label>
      {type === "select" ? (
        <select name={name} value={formData[name]} onChange={handleChange}>
          {/* ✅ Add placeholder only for optional fields */}
          {name === "relationshipToStudent" && (
            <option value="">-- Select --</option>
          )}
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : type === "checkbox" ? (
        <input
          type="checkbox"
          name={name}
          checked={formData[name]}
          onChange={handleChange}
        />
      ) : type === "file" ? (
        <input type="file" name={name} onChange={handleChange} />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
        />
      )}
    </div>
  );

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="section">
            <h3>Basic Information</h3>
            {renderInput("Student ID", "studentId")}
            {renderInput("First Name", "firstName")}
            {renderInput("Middle Name", "middleName")}
            {renderInput("Last Name", "lastName")}
            {renderInput("Gender", "gender", "select", ["Male", "Female"])}
            {renderInput("Date of Birth", "dateOfBirth", "date")}
            {renderInput("Place of Birth", "placeOfBirth")}
            {renderInput("Nationality", "nationality", "select", [
              "Kenyan",
              "Ugandan",
              "Tanzanian",
              "Rwandese",
              "Burundian",
              "South Sudanese",
              "Somali",
              "Congolese",
              "Ethiopian",
              "Eritrean",
              "Other",
            ])}
          </div>

          <div className="section">
            <h3>Parent / Guardian Info</h3>
            {renderInput("Father Name", "fatherName")}
            {renderInput("Father Phone", "fatherPhone")}
            {renderInput("Mother Name", "motherName")}
            {renderInput("Mother Phone", "motherPhone")}
            {renderInput("Guardian Name", "guardianName")}
            {renderInput("Guardian Phone", "guardianPhone")}
            {renderInput(
              "Relationship to Student",
              "relationshipToStudent",
              "select",
              ["Brother", "Sister", "Uncle", "Grandpa", "Grandmum", "Aunty"]
            )}
            {renderInput("Parent Email", "parentEmail", "email")}
            {renderInput("Parent Address", "parentAddress")}
          </div>

          <div className="section">
            <h3>Enrollment Info</h3>
            {renderInput("Admission Number", "admissionNumber")}
            {renderInput("Date of Admission", "dateOfAdmission", "date")}
            {renderInput("Class Enrolled", "classEnrolled")}
            {renderInput("Stream", "stream")}
            {renderInput("Admission Type", "admissionType")}
            {renderInput("Student Type", "studentType")}
            <div className="passport-preview">
              {imagePreview && <img src={imagePreview} alt="Preview" />}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="section">
            <h3>Boarding Info</h3>
            {renderInput("Boarding Status", "boardingStatus", "checkbox")}
            {renderInput("Dormitory", "dormitory")}
            {renderInput("House Parent", "houseParent")}
          </div>

          <div className="section">
            <h3>Health Info</h3>
            {renderInput("Medical Conditions", "medicalConditions")}
            {renderInput("Blood Group", "bloodGroup", "select", [
              "A+",
              "A-",
              "B+",
              "B-",
              "AB+",
              "AB-",
              "O+",
              "O-",
            ])}
            {renderInput("Emergency Contact Name", "emergencyContactName")}
            {renderInput("Emergency Phone", "emergencyContactPhone")}
            {renderInput("Emergency Relation", "emergencyContactRelation")}
          </div>

          <div className="section">
            <h3>Other Info</h3>
            {renderInput("Religion", "religion", "select", [
              "Christian",
              "Muslim",
              "Hindu",
              "Other",
            ])}
            {renderInput("Disability Status", "disabilityStatus", "checkbox")}
            {renderInput("Disability Description", "disabilityDescription")}
            {renderInput("Passport Photo", "passportPhoto", "file")}
            {renderInput("Remarks", "remarks")}
            {renderInput("Student Status", "studentStatus")}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="button" onClick={handleReset}>
            Reset
          </button>
        </div>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default StudentForm;
