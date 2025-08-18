// File: Header.js

import React from "react";
//import "./Header.css";

export const Header = ({ onReportsClick }) => {
  return (
    <div className="header">
      <div>KELVIN'S PRIMARY SCHOOL</div>
      <div className="header-right">
        <span>
          Advanced Features |{" "}
          <span
            className="reports-link"
            onClick={onReportsClick}
            style={{ textDecoration: "underline", cursor: "pointer", color: "#006747" }}
          >
            System Reports
          </span>{" "}
          | Logged in: <b>bedmark</b>
        </span>
      </div>
    </div>
  );
};
