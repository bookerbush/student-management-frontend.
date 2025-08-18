// File: LoginHeader.js

import React from "react";
import "./LoginHeader.css";
//mport logo from './school-logo.png';
import logo from "./school-logo.png"; // ✅ make sure file name matches
const LoginHeader = () => {
  return (
    <div className="login-header">
      <div className="header-left">
        <img src={logo} alt="School Logo" className="logo" />
      </div>
      <div className="header-center">
        <h1>KELVIN'S PRIMARY SCHOOL</h1>
        <p className="contact-info">
          Call Us: <span>+254740312156</span>
        </p>
        <p className="contact-info">
          Email: <span>boxingbooker5@gmail.com</span>
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;
