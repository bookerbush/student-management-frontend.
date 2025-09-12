// File: ParentReportsUI.js
import React, { useState, useEffect } from "react";
import ParentMessagesView from "./ParentMessagesView";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";
import "./ParentReportsUI.css";

export default function ParentReportsUI({ admissionNo }) {
  const [activeTab, setActiveTab] = useState("balance");
  const [balanceData, setBalanceData] = useState(null);
  const [statementData, setStatementData] = useState([]);
  const [assessmentData, setAssessmentData] = useState([]);
  const [feeStructureData, setFeeStructureData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedClassGroup, setSelectedClassGroup] = useState("grade13");

  // ✅ Fee Balance
  useEffect(() => {
    if (admissionNo) {
      apiGet(`/payments/balance?studentid=${admissionNo}&studyyear=2025`)
        .then((res) => setBalanceData(res.data))
        .catch((err) => console.error("Error fetching balance:", err));
    }
  }, [admissionNo]);

  // ✅ Fee Statement
  useEffect(() => {
    if (admissionNo) {
      apiGet(`/payments/statement?studentid=${admissionNo}&studyyear=2025`)
        .then((res) => setStatementData(res.data))
        .catch((err) => console.error("Error fetching statement:", err));
    }
  }, [admissionNo]);

  // ✅ Assessments
  useEffect(() => {
    if (admissionNo) {
      apiGet(`/parent/assessments/list?studentid=${admissionNo}`)
        .then((res) => setAssessmentData(res.data))
        .catch((err) => console.error("Error fetching assessments:", err));
    }
  }, [admissionNo]);

  // ✅ Fee Structure
  useEffect(() => {
    apiGet(`/parentdata/feestructure`)
      .then((res) => setFeeStructureData(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Error fetching fee structure:", err));
  }, []);

  // ✅ Attendance
  useEffect(() => {
    if (admissionNo) {
      apiGet(`/parentdata/attendance/list?studentid=${admissionNo}`)
        .then((res) => setAttendanceData(Array.isArray(res.data) ? res.data : []))
        .catch((err) => console.error("Error fetching attendance:", err));
    }
  }, [admissionNo]);

  return (
    <div className="parent-reports-container">
      <div className="parent-reports-header">
        <h2>Parent Portal</h2>
      </div>

      <div className="parent-reports-tabs">
        {["balance", "statement", "results", "structure", "attendance", "messages"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "active" : ""}
          >
            {tab === "balance" && "Fee Balance"}
            {tab === "statement" && "Fee Statement"}
            {tab === "results" && "Assessment Results"}
            {tab === "structure" && "Fee Structure"}
            {tab === "attendance" && "Attendance"}
            {tab === "messages" && "Messages"}
          </button>
        ))}
      </div>

      <div className="parent-reports-content">
        {/* ✅ Balance */}
        {activeTab === "balance" && balanceData && (
          <div className="fee-balance-card">
            <p><strong>Student Name:</strong> {balanceData.studentname}</p>
            <p><strong>Admission No:</strong> {balanceData.studentid}</p>
            <p><strong>Study Year:</strong> {balanceData.studyyear}</p>
            <p><strong>Current Balance:</strong> KES {balanceData.balance?.toFixed(2)}</p>
          </div>
        )}

        {/* ✅ Statement */}
        {activeTab === "statement" && (
          <div className="fee-statement-table">
            {statementData.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Pay Date</th>
                    <th>Amount Paid</th>
                    <th>Old Balance</th>
                    <th>New Balance</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {statementData.map((row) => (
                    <tr key={row.paymentid}>
                      <td>{row.paydate || "--"}</td>
                      <td>KES {row.amount?.toFixed(2)}</td>
                      <td>KES {row.oldbalance?.toFixed(2)}</td>
                      <td>KES {row.balance?.toFixed(2)}</td>
                      <td>{row.paymentReference || "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No payment records found for this student.</p>
            )}
          </div>
        )}

        {/* ✅ Results */}
        {activeTab === "results" && (
          <div className="assessment-results-table">
            {assessmentData.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Assessment</th>
                    <th>Strand</th>
                    <th>Sub Strand</th>
                    <th>Indicator</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Term</th>
                    <th>Date Recorded</th>
                    <th>Teacher ID</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentData.map((row) => (
                    <tr key={row.id}>
                      <td>{row.subject}</td>
                      <td>{row.assess}</td>
                      <td>{row.strand}</td>
                      <td>{row.subStrand}</td>
                      <td>{row.performanceIndicator}</td>
                      <td>{row.rating}</td>
                      <td>{row.comment}</td>
                      <td>{row.term}</td>
                      <td>{row.dateRecorded}</td>
                      <td>{row.teacherId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No assessment records found for this student.</p>
            )}
          </div>
        )}

        {/* ✅ Fee Structure */}
        {activeTab === "structure" && (
          <div className="fee-structure-container">
            <div className="fee-structure-filters">
              <select value={selectedClassGroup} onChange={(e) => setSelectedClassGroup(e.target.value)}>
                <option value="pp0">PP0</option>
                <option value="pp12">PP1-PP2</option>
                <option value="grade13">Grade 1-3</option>
                <option value="grade46">Grade 4-6</option>
              </select>
            </div>

            <div className="fee-structure-table-wrapper">
              <table className="fee-structure-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Fee Amount (KES)</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const groupedItems = {};
                    feeStructureData.forEach((item) => {
                      let feeAmount = 0;
                      if (selectedClassGroup === "pp0") feeAmount = item.pp0Fee ?? 0;
                      if (selectedClassGroup === "pp12") feeAmount = item.pp12Fee ?? 0;
                      if (selectedClassGroup === "grade13") feeAmount = item.grade13Fee ?? 0;
                      if (selectedClassGroup === "grade46") feeAmount = item.grade46Fee ?? 0;

                      if (!groupedItems[item.remarks]) groupedItems[item.remarks] = [];
                      groupedItems[item.remarks].push({ ...item, feeAmount });
                    });

                    const rows = [];
                    Object.keys(groupedItems).forEach((remark) => {
                      let subtotal = 0;
                      groupedItems[remark].forEach((row) => {
                        rows.push(
                          <tr key={`${row.id}-${remark}`}>
                            <td>{row.itemDescription}</td>
                            <td>{row.feeAmount.toFixed(2)}</td>
                            <td>{row.remarks}</td>
                          </tr>
                        );
                        subtotal += row.feeAmount;
                      });

                      rows.push(
                        <tr key={`subtotal-${remark}`} className="subtotal-row">
                          <td>{remark} Total</td>
                          <td>{subtotal.toFixed(2)}</td>
                          <td></td>
                        </tr>
                      );
                    });

                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ✅ Attendance */}
        {activeTab === "attendance" && (
          <div className="attendance-table-wrapper">
            {attendanceData.length > 0 ? (
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Stream</th>
                    <th>Percent Present</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData
                    .sort((a, b) => new Date(b.monDate) - new Date(a.monDate))
                    .map((row) => (
                      <tr key={row.trackId}>
                        <td>{row.student}</td>
                        <td>{row.studentClass}</td>
                        <td>{row.stream}</td>
                        <td>{row.percentPresent}%</td>
                        {["mon", "tue", "wed", "thurs", "fri", "sat"].map((day) => {
                          const date = row[`${day}Date`] || "--";
                          const status = row[`${day}Status`] || "-";
                          return (
                            <td key={day}>
                              {date} -{" "}
                              <span
                                className={
                                  status === "P"
                                    ? "status-present"
                                    : status === "A"
                                    ? "status-absent"
                                    : ""
                                }
                              >
                                {status}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p>No attendance records found for this student.</p>
            )}
          </div>
        )}

        {/* ✅ Messages Section */}
        {activeTab === "messages" && <ParentMessages admissionNo={admissionNo} />}
      </div>

      <footer className="parent-reports-footer">
        <p>KELVIN'S PRIMARY SCHOOL © 2025</p>
      </footer>
    </div>
  );
}

/* ✅ ParentMessages wrapper */
function ParentMessages({ admissionNo }) {
  const [subTab, setSubTab] = useState("view");

  return (
    <div className="parent-messages-container">
      <div className="parent-messages-tabs">
        <button
          onClick={() => setSubTab("view")}
          className={subTab === "view" ? "active" : ""}
        >
          View Messages
        </button>
        <button
          onClick={() => setSubTab("send")}
          className={subTab === "send" ? "active" : ""}
        >
          Send Message
        </button>
      </div>

      <div className="parent-messages-content">
        {subTab === "view" && <ParentMessagesView admissionNo={admissionNo} />}
        {subTab === "send" && (
          <div>
            <textarea placeholder="Write your message here..." rows="4"></textarea>
            <button>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}
