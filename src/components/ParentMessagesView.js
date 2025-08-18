// File: ParentMessagesView.js
import React, { useEffect, useState } from "react";
//import { apiGet } from "../api";  // ✅ use centralized API utility
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

import "./ParentMessagesView.css";

function ParentMessagesView({ admissionNo }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!admissionNo) {
      setError("No admission number found.");
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        // ✅ now uses api.js, no hardcoded localhost URL
        const data = await apiGet(`/messages/parent/${admissionNo}`);
        setMessages(data);
      } catch (err) {
        setError(err.message || "Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [admissionNo]);

  if (loading) {
    return <div className="pmv-loading">Loading messages...</div>;
  }

  if (error) {
    return <div className="pmv-error">Error: {error}</div>;
  }

  return (
    <div className="pmv-container">
      {messages.length === 0 ? (
        <p className="pmv-empty">No messages from school yet.</p>
      ) : (
        <ul className="pmv-list">
          {messages.map((msg, index) => (
            <li key={index} className="pmv-message">
              <div className="pmv-message-date">
                {new Date(msg.dateSent).toLocaleDateString()}
              </div>
              <div className="pmv-message-text">{msg.content}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ParentMessagesView;
