// File: EmployeeForm.js
import React, { useState } from "react";
import "./EmployeeForm.css";
import { apiPost } from "../api";   // ✅ use wrapper instead of raw fetch

function EmployeeForm() {
  const [formData, setFormData] = useState({
    fullname: "",
    nationalid: "",
    role: "",
    telephone: "",
    nextofkin: "",
    nextofkinno: "",
    salary: "",
    krapin: "",
    sha: "",
    nssfno: "",
    photo: null,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, photo: file }));

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build FormData for employee
    const empForm = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        empForm.append(key, formData[key]);
      }
    });

    try {
      // ✅ Step 1: Save employee using apiPost (multipart)
      const { data: savedEmp } = await apiPost("/api/employees", empForm);

      // ✅ Step 2: Save user (JSON)
      const userPayload = {
        username: formData.nationalid,
        password: formData.nationalid,
        role: formData.role,
        employee_id: savedEmp.employeeId,
        admission_no: "",
        status: "ACTIVE",
      };

      await apiPost("/users/create", userPayload);

      alert("✔ Employee and User registered!");
      setFormData({
        fullname: "",
        nationalid: "",
        role: "",
        telephone: "",
        nextofkin: "",
        nextofkinno: "",
        salary: "",
        krapin: "",
        sha: "",
        nssfno: "",
        photo: null,
      });
      setPreview(null);
    } catch (err) {
      console.error("Error saving employee:", err);
      alert("❌ Failed to save employee.");
    }
  };

  return (
    <div className="employee-form-container">
      <h2 className="form-title">Employees Registration Form</h2>
      <form onSubmit={handleSubmit} className="employee-form">
        <label>Full Name:</label>
        <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} required />

        <label>National ID:</label>
        <input type="text" name="nationalid" value={formData.nationalid} onChange={handleChange} required />

        <label>Telephone:</label>
        <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} />

        <label>Role:</label>
        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="">-- Select Role --</option>
          <option value="ADMIN">ADMIN</option>
          <option value="TEACHER">TEACHER</option>
          <option value="SECRETARY">SECRETARY</option>
        </select>

        <label>Next of Kin:</label>
        <input type="text" name="nextofkin" value={formData.nextofkin} onChange={handleChange} />

        <label>Next of Kin Phone:</label>
        <input type="text" name="nextofkinno" value={formData.nextofkinno} onChange={handleChange} />

        <label>Salary:</label>
        <input type="number" name="salary" value={formData.salary} onChange={handleChange} />

        <label>KRA PIN:</label>
        <input type="text" name="krapin" value={formData.krapin} onChange={handleChange} />

        <label>SHA:</label>
        <input type="text" name="sha" value={formData.sha} onChange={handleChange} />

        <label>Upload Photo:</label>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />

        {preview && <img src={preview} alt="Preview" className="image-preview" />}

        <button type="submit">💾 Save</button>
      </form>
    </div>
  );
}

export default EmployeeForm;
