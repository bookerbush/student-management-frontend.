// File: MessageForm.js
import React, { useState } from "react";
//import { apiGet, apiPost } from "../api";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

import "./MessageForm.css";

const MessageForm = () => {
  const [formData, setFormData] = useState({
    admissionNumber: "",
    name: "",
    className: "",
    stream: "",
    msg: "",
    messageType: "General",
    image: null,
  });

  const [status, setStatus] = useState("");
  const [messageCount, setMessageCount] = useState(0);

  // Fetch student details from backend
  const fetchStudentDetails = async (admissionNumber) => {
    if (!admissionNumber.trim()) return;

    try {
      const student = await apiGet(`/students/by-adm/${admissionNumber}`);
      setFormData((prev) => ({
        ...prev,
        name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        className: student.classEnrolled || "",
        stream: student.stream || "",
      }));
      setStatus(""); // clear error
    } catch (err) {
      console.error("Error fetching student:", err);
      setStatus("⚠️ No student found");
      setFormData((prev) => ({
        ...prev,
        name: "",
        className: "",
        stream: "",
      }));
    }
  };

  // Handle typing and file input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAdmissionKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchStudentDetails(formData.admissionNumber);
    }
  };

  // Submit message
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ Validation for "Particular"
    if (formData.messageType === "Particular") {
      if (
        !formData.admissionNumber.trim() ||
        !formData.name.trim() ||
        !formData.className.trim() ||
        !formData.stream.trim()
      ) {
        alert(
          "Kindly enter admission number for student you wish the parents to receive the message"
        );
        document.querySelector("input[name='admissionNumber']").focus();
        return;
      }
    }

    // 2️⃣ Validation for "General" with extra fields filled
    if (formData.messageType === "General") {
      if (
        formData.admissionNumber.trim() ||
        formData.name.trim() ||
        formData.className.trim() ||
        formData.stream.trim()
      ) {
        const proceed = window.confirm(
          "You are about to send a general message, but student details are filled. Are you sure?"
        );
        if (!proceed) {
          alert(
            "If your intention was to send a general message, then clear these fields or choose the 'Particular' option."
          );
          return;
        }
      }
    }

    setStatus("Sending...");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      await apiPost("/messages", data); // ✅ using centralized API

      setMessageCount((prev) => prev + 1);
      setStatus(
        `✅ Message sent successfully! (Total sent: ${messageCount + 1})`
      );

      // Reset form
      setFormData({
        admissionNumber: "",
        name: "",
        className: "",
        stream: "",
        msg: "",
        messageType: "General",
        image: null,
      });
      document.getElementById("image").value = null;
    } catch (err) {
      console.error("Error sending message:", err);
      setStatus("❌ Failed to send message");
    }
  };

  return (
    <div className="message-form-container">
      <h2>Send Message</h2>
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          name="admissionNumber"
          placeholder="Admission Number"
          value={formData.admissionNumber}
          onChange={handleChange}
          onKeyDown={handleAdmissionKeyDown}
        />
        <input
          type="text"
          name="name"
          placeholder="Student Name"
          value={formData.name}
          readOnly
        />
        <input
          type="text"
          name="className"
          placeholder="Class"
          value={formData.className}
          readOnly
        />
        <input
          type="text"
          name="stream"
          placeholder="Stream"
          value={formData.stream}
          readOnly
        />

        <textarea
          name="msg"
          placeholder="Type your message here..."
          value={formData.msg}
          onChange={handleChange}
        ></textarea>

        <select
          name="messageType"
          value={formData.messageType}
          onChange={handleChange}
        >
          <option value="General">General</option>
          <option value="Particular">Particular</option>
        </select>

        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />

        <button type="submit">Send</button>
      </form>

      {status && <p className="status">{status}</p>}
    </div>
  );
};

export default MessageForm;
