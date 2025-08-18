// File: BalancesForm.js
import React, { useState } from "react";
//import api from "../api"; // ✅ use centralized API
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

import "./BalancesForm.css";

const BalancesForm = () => {
  const [studyYear, setStudyYear] = useState("-- Year --");
  const [studyTerm, setStudyTerm] = useState("-- Term --");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [balances, setBalances] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loadingSMS, setLoadingSMS] = useState(false);

  const fetchBalances = () => {
    if (!studyYear || !studyTerm || studyYear.includes("--") || studyTerm.includes("--")) {
      alert("Please select both Study Year and Study Term");
      return;
    }

    let url = `/api/balances/${studyYear}/${studyTerm}`;
    if (admissionNumber.trim()) {
      url += `?admissionNumber=${admissionNumber.trim()}`;
    }

    apiGet(url)
      .then((res) => {
        let data = res.data || [];
        let grouped = [];

        if (admissionNumber.trim()) {
          // Detailed statement view
          grouped = data.sort((a, b) => new Date(b.paydate) - new Date(a.paydate));
        } else {
          // Summary view with total amounts
          const map = new Map();
          data.forEach((row) => {
            if (!map.has(row.studentid)) {
              map.set(row.studentid, {
                ...row,
                amount: parseFloat(row.amount) || 0,
              });
            } else {
              const existing = map.get(row.studentid);
              existing.amount += parseFloat(row.amount) || 0;

              // Keep latest details
              if (new Date(row.paydate) > new Date(existing.paydate)) {
                existing.paydate = row.paydate;
                existing.balance = row.balance;
                existing.paymentReference = row.paymentReference;
                existing.paymentid = row.paymentid;
              }
            }
          });
          grouped = Array.from(map.values()).sort((a, b) => a.stream.localeCompare(b.stream));
        }

        const totalAmt = grouped.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
        const totalBal = grouped.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);

        setTotalPaid(totalAmt);
        setTotalBalance(totalBal);
        setBalances(grouped);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch balances:", err);
        alert("Could not fetch balances");
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchBalances();
    }
  };

  const sendSmsToParents = () => {
    if (!studyYear || !studyTerm || studyYear.includes("--") || studyTerm.includes("--")) {
      alert("Please select both Study Year and Study Term before sending SMS.");
      return;
    }

    if (balances.length === 0) {
      alert("No balances to send SMS for.");
      return;
    }

    const confirmSend = window.confirm("Send SMS to all parents with balances?");
    if (!confirmSend) return;

    setLoadingSMS(true);

    apiPost(`/api/balances/send-sms/${studyYear}/${studyTerm}`)
      .then((res) => {
        alert(res.data || "SMS sent successfully.");
      })
      .catch((err) => {
        console.error("❌ SMS Error:", err);
        alert("Failed to send SMS.");
      })
      .finally(() => setLoadingSMS(false));
  };

  const getPieChart = () => {
    const total = totalPaid + totalBalance;
    const paidPercent = total ? (totalPaid / total) * 100 : 0;

    return (
      <div className="pie-container">
        <svg viewBox="0 0 32 32" className="pie-chart">
          <circle r="16" cx="16" cy="16" fill="red" />
          <circle
            r="16"
            cx="16"
            cy="16"
            fill="transparent"
            stroke="blue"
            strokeWidth="32"
            strokeDasharray={`${paidPercent} ${100 - paidPercent}`}
            transform="rotate(-90) translate(-32)" />
        </svg>
        <div className="chart-labels">
          <div><span className="square yellow" /> Total Expected: {(totalPaid + totalBalance).toFixed(2)}</div>
          <div><span className="square red" /> Total Balance: {totalBalance.toFixed(2)}</div>
          <div><span className="square blue" /> Total Paid: {totalPaid.toFixed(2)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="balances-container">
      <h2 className="report-title">School Fee Balances</h2>

      <div className="filters-row">
        <label>Study Year:</label>
        <select value={studyYear} onChange={(e) => setStudyYear(e.target.value)}>
          <option>-- Year --</option>
          {[2025, 2026, 2027, 2028, 2029].map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>

        <label>Study Term:</label>
        <select value={studyTerm} onChange={(e) => setStudyTerm(e.target.value)}>
          <option>-- Term --</option>
          <option value="Term1">Term1</option>
          <option value="Term2">Term2</option>
          <option value="Term3">Term3</option>
        </select>

        <label>Adm No:</label>
        <input
          type="text"
          value={admissionNumber}
          onChange={(e) => setAdmissionNumber(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter admission number"
        />

        <button className="fetch-btn" onClick={fetchBalances}>🔍 Fetch</button>

        {balances.length > 0 && admissionNumber.trim() === "" && (
          <button
            className="fetch-btn"
            style={{ backgroundColor: "#007bff" }}
            onClick={sendSmsToParents}
            disabled={loadingSMS}
          >
            {loadingSMS ? "📤 Sending SMS..." : "📲 Send SMS to Parents"}
          </button>
        )}
      </div>

      <div className="table-chart-container">
        <table className="balances-table">
          <thead>
            <tr>
              <th>Payid</th>
              <th>Adm.No</th>
              <th>Stream</th>
              <th>Student</th>
              <th>Amount</th>
              <th>P.Date</th>
              <th>Balance</th>
              <th>P.Ref</th>
            </tr>
          </thead>
          <tbody>
            {balances.length === 0 ? (
              <tr><td colSpan="8">No records found</td></tr>
            ) : (
              <>
                {balances.map((row, idx) => (
                  <React.Fragment key={idx}>
                    <tr className={(idx % 2 === 0 ? "even" : "odd")}>
                      <td>{row.paymentid}</td>
                      <td>{row.studentid}</td>
                      <td>{row.stream}</td>
                      <td>{row.studentname}</td>
                      <td>{parseFloat(row.amount).toFixed(2)}</td>
                      <td>{row.paydate}</td>
                      <td>{parseFloat(row.balance).toFixed(2)}</td>
                      <td>{row.paymentReference}</td>
                    </tr>
                    {(idx + 1) % 2 === 0 && <tr className="row-separator"><td colSpan="8"></td></tr>}
                  </React.Fragment>
                ))}
                <tr className="summary-row">
                  <td colSpan="4" style={{ fontWeight: "bold", textAlign: "right" }}>TOTAL:</td>
                  <td style={{ fontWeight: "bold" }}>{totalPaid.toFixed(2)}</td>
                  <td></td>
                  <td style={{ fontWeight: "bold" }}>{totalBalance.toFixed(2)}</td>
                  <td></td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {getPieChart()}
      </div>
    </div>
  );
};

export default BalancesForm;
