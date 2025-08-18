// Dashboard.js
import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { SummaryCards } from "./components/SummaryCards";
import { StudentsChart } from "./components/StudentsChart";
import { AttendanceTable } from "./components/AttendanceTable";
import { CalendarWidget } from "./components/CalendarWidget";
import { LeaveSection } from "./components/LeaveSection";
import { PaymentsUI } from "./components/PaymentsUI";
import { StudentUI } from "./components/StudentUI";
import { TrackingUI } from "./components/TrackingUI";
import { SchoolFeeUI } from "./components/SchoolFeeUI";
import { AssessmentUI } from "./components/AssessmentUI";
import { EmployeeUI } from "./components/EmployeeUI";
import { AssignmentsUI } from "./components/AssignmentsUI";
import { BalancesUI } from "./components/BalancesUI";
import { ReportsPanel } from "./components/ReportsPanel";
import DashboardAttendance from './components/DashboardAttendance';
import PortalUI from "./components/PortalUI";
import { AssignmentsList } from "./components/AssignmentsList";
import { EmployeeList } from "./components/EmployeeList"; // ✅ NEW import
import { MessageFormUI } from "./components/MessageFormUI";
import { StudentListUI } from "./components/StudentListUI";
import "./dashboard.css";

function Dashboard({ userRole, employeeId, admissionNo }) {
  const [activeSection, setActiveSection] = useState("dashboard");

  if (userRole === "PARENT" || userRole === "STUDENT") {
    return <PortalUI admissionNo={admissionNo} />;
  }

  const isTeacher = userRole === "TEACHER";
  const isSecretary = userRole === "SECRETARY";
  const isAdmin = userRole === "ADMIN";

  const renderMainContent = () => {
    switch (activeSection) {
      case "feePayment":
        if (isAdmin || isSecretary) return <PaymentsUI />;
        break;
      case "students":
        return <StudentUI />;
      case "attendance":
        if (isAdmin || isTeacher) return <TrackingUI />;
        break;
      case "staff":
        if (isAdmin || isSecretary) return <EmployeeUI />;
        break;
       
      case "fee":
        if (isAdmin || isSecretary) return <SchoolFeeUI />;
        break;
      case "marksEntry":
        if (isAdmin || isTeacher) return <AssessmentUI />;
        break;
      case "assignments":
        if (isAdmin || isTeacher) return <AssignmentsUI />;
        break;
      case "assignmentsList":
        if (isAdmin || isTeacher) return <AssignmentsList />;
        break;
      case "balancesReport":
        if (isAdmin || isSecretary) return <BalancesUI />;
        break;

         case "subjects":
        if (isAdmin || isSecretary) return <MessageFormUI />;
        break;

      case "staffReport": // ✅ NEW case for Staff Report
        if (isAdmin || isSecretary) return <EmployeeList />;
        break;
       case "studentlist": // ✅ NEW case for Students Report
        if (isAdmin || isSecretary) return <StudentListUI />;
        break;

      case "reports":
        if (isAdmin) return <ReportsPanel onSelect={setActiveSection} />;
        break;
      default:
        return (
          <div className="content-section">
            <div className="students-chart"><StudentsChart /></div>
            <div className="attendance-table"><DashboardAttendance /></div>
            <div className="calendar-widget"><CalendarWidget /></div>
          </div>
        );
    }

    return <div className="unauthorized">Access Restricted</div>;
  };

  return (
    <div className="app-container">
      <Sidebar onMenuSelect={setActiveSection} userRole={userRole} />
      <div className="main-content">
        <Header onReportsClick={() => setActiveSection("reports")} />
        <div className="summary-section"><SummaryCards /></div>

        <div className="scrollable-content">
          <div className="ui-wrapper">
            {renderMainContent()}
          </div>
        </div>

        <div className="fixed-footer">New Leave Requests | On Leave Employees</div>
      </div>
    </div>
  );
}

export default Dashboard;
