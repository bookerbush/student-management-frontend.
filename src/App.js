// File: App.js
import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import Dashboard from "./Dashboard";
import ParentReportsUI from "./components/ParentReportsUI";
import StudentReportsUI from "./components/StudentReportsUI";
import "./dashboard.css";

function App() {
  const [loginData, setLoginData] = useState(null);

  const renderPortal = () => {
    if (!loginData) {
      return <LoginForm onLoginSuccess={setLoginData} />;
    }

    const { role, employeeId, admissionNo } = loginData;

    switch (role) {
      case "ADMIN":
      case "TEACHER":
      case "SECRETARY":
        return (
          <Dashboard
            userRole={role}
            employeeId={employeeId}
            admissionNo={admissionNo}
          />
        );

      case "PARENT":
        return <ParentReportsUI admissionNo={admissionNo} />;

      case "STUDENT":
        return <StudentReportsUI admissionNo={admissionNo} />;

      default:
        return (
          <div style={{ margin: "auto", textAlign: "center" }}>
            <h2>Welcome {role}</h2>
            <p>Portal access for your role is coming soon.</p>
          </div>
        );
    }
  };

  return <div className="flex h-screen">{renderPortal()}</div>;
}

export default App;
