// File: ReportsPanel.js

import React from "react";
import "./ReportsPanel.css";

export const ReportsPanel = ({ onSelect }) => {
  return (
    <div className="reports-panel">
      <h3>Select Report Type:</h3>
      <div className="report-buttons">
        <button onClick={() => onSelect("balancesReport")}>📊 Fee Balances</button>
        <button onClick={() => onSelect("staffReport")}>👩‍🏫 Staff Report</button>
        <button onClick={() => onSelect("assignmentsList")}>📝 Assignments</button>
        <button onClick={() => onSelect("studentlist")}>📝 All Students</button>
        {/* Add more buttons as needed */}
      </div>
    </div>
  );
};
