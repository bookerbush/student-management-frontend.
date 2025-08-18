// Sidebar.js
import React from "react";
import { 
  FaTachometerAlt, FaUsers, FaMoneyBillAlt, FaChartBar, 
  FaBook, FaClipboardList, FaUserTie, FaChalkboardTeacher, 
  FaSignOutAlt 
} from "react-icons/fa";

export const Sidebar = ({ onMenuSelect, userRole }) => {
  return (
    <div className="sidebar">
      <h3>KELVIN'S PRIMARY</h3>
      <ul>
        {(userRole === "ADMIN" || userRole === "TEACHER" || userRole === "SECRETARY") && (
          <li onClick={() => onMenuSelect("dashboard")}><FaTachometerAlt /> Dashboard</li>
        )}

        <li onClick={() => onMenuSelect("students")}><FaUsers /> Students</li>

        {(userRole === "ADMIN" || userRole === "SECRETARY") && (
          <>
            <li onClick={() => onMenuSelect("feePayment")}><FaMoneyBillAlt /> Fee Payment</li>
            <li onClick={() => onMenuSelect("fee")}><FaMoneyBillAlt /> Fee Structure</li>
            <li onClick={() => onMenuSelect("balancesReport")}><FaMoneyBillAlt /> Balances</li>
            <li onClick={() => onMenuSelect("staff")}><FaUserTie /> Staff</li>
          </>
        )}

        {(userRole === "ADMIN" || userRole === "TEACHER") && (
          <>
            <li onClick={() => onMenuSelect("marksEntry")}><FaChartBar /> Marks Entry</li>
            <li onClick={() => onMenuSelect("assignments")}><FaBook /> Assignments</li>
            <li onClick={() => onMenuSelect("attendance")}><FaClipboardList /> Attendance</li>
          </>
        )}

        {userRole === "ADMIN" && (
          <>
            <li onClick={() => onMenuSelect("subjects")}><FaChalkboardTeacher /> SMS</li>
            <li onClick={() => onMenuSelect("expenses")}><FaMoneyBillAlt /> Expenses</li>
            <li onClick={() => onMenuSelect("reports")}><FaChartBar /> Reports</li>
          </>
        )}

        <li><FaSignOutAlt /> Logout</li>
      </ul>
    </div>
  );
};
