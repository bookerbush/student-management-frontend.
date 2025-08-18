// File: components/PortalUI.js

import React from "react";
import { AssignmentsUI } from "./AssignmentsUI";
import { BalancesUI } from "./BalancesUI";

import "./portalui.css"; // Optional custom styles for this section only

function PortalUI({ admissionNo }) {
  return (
    <div className="portal-container">
      <header className="portal-header">
        <h2>Welcome to Kelvin's Primary Portal</h2>
        <p>Admission No: {admissionNo}</p>
      </header>

      <div className="portal-content">
        <div className="portal-section">
          <h3>📚 Your Assignments</h3>
          <AssignmentsUI admissionNo={admissionNo} />
        </div>

        <div className="portal-section">
          <h3>💰 Your Fee Balances</h3>
          <BalancesUI admissionNo={admissionNo} />
        </div>

        <div className="portal-footer">
          <button onClick={() => window.location.reload()}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default PortalUI;
