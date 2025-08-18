// File: LoginPage.js
import React from "react";
import LoginForm from "./LoginForm";
import LoginHeader from "./LoginHeader";
import "./LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
  return (
    <div className="login-page">
      <LoginHeader />
      <div className="vision-text">
        <h2>Our Vision</h2>
        <p>
          "To nurture holistic learners for a brighter tomorrow through
          inclusive education, innovation, and excellence."
        </p>
      </div>
      <LoginForm onLoginSuccess={onLoginSuccess} />
    </div>
  );
};

export default LoginPage;
