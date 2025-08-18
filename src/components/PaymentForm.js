import React, { useState } from "react";
//import api from "../api"; // ✅ use centralized axios instance
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

import "./PaymentForm.css";

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
};

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    studyYear: "",
    studyTerm: "",
    admissionNumber: "",
    feePaid: "",
    referenceNumber: "",
    paymentDate: "",
    netBalance: "",
  });

  const [classEnrolled, setClassEnrolled] = useState("--");
  const [stream, setStream] = useState("--");
  const [feeItems, setFeeItems] = useState([]);
  const [payments, setPayments] = useState([]);

  const [feeTotals, setFeeTotals] = useState({
    once: 0,
    annually: 0,
    everyTerm: 0,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "feePaid") {
      calculateNetBalance(value);
    }
  };

  const fetchStudentData = async () => {
    const { admissionNumber, studyYear, studyTerm } = formData;

    if (admissionNumber.length >= 3 && studyYear && studyTerm) {
      try {
        const { data } = await apiGet(
          `/api/payments/load/${admissionNumber}/${studyYear}/${studyTerm}`
        );

        setClassEnrolled(data?.classEnrolled ?? "--");
        setStream(data?.stream ?? "--");

        const fees = Array.isArray(data?.feeItems) ? data.feeItems : [];
        const pays = Array.isArray(data?.payments) ? data.payments : [];
        setFeeItems(fees);
        setPayments(pays);

        let once = 0,
          annually = 0,
          everyTerm = 0;
        for (const item of fees) {
          const amt = item.amount ?? 0;
          const remark = item.remarks?.toLowerCase() ?? "";

          if (remark.includes("once")) once += amt;
          else if (remark.includes("annually")) annually += amt;
          else if (remark.includes("every term")) everyTerm += amt;
        }
        setFeeTotals({ once, annually, everyTerm });

        setFormData((prev) => ({
          ...prev,
          feePaid: "",
          netBalance: "",
        }));
      } catch (err) {
        alert(
          "Could not fetch student data. Please check the admission number and try again."
        );
        console.error("❌ Failed to fetch:", err);
        setClassEnrolled("--");
        setStream("--");
        setFeeItems([]);
        setPayments([]);
      }
    }
  };

  const calculateNetBalance = (enteredAmount) => {
    const paid = parseFloat(enteredAmount);
    if (isNaN(paid)) {
      setFormData((prev) => ({ ...prev, netBalance: "" }));
      return;
    }

    const { once, annually, everyTerm } = feeTotals;
    const { studyYear, studyTerm } = formData;
    const isFirstPayment = payments.length === 0;

    let oldBal = 0;

    if (isFirstPayment) {
      oldBal = once + annually + everyTerm;
    } else {
      const latestPayment = payments.reduce((a, b) =>
        (a.paymentid ?? 0) > (b.paymentid ?? 0) ? a : b
      );

      const lastBal = latestPayment?.balance ?? 0;
      const lastYear = latestPayment?.studyyear;
      const lastTerm = latestPayment?.term;

      if (lastYear !== studyYear) {
        oldBal = lastBal + annually + everyTerm;
      } else if (lastTerm !== studyTerm) {
        oldBal = lastBal + everyTerm;
      } else {
        oldBal = lastBal;
      }
    }

    const net = oldBal - paid;
    setFormData((prev) => ({ ...prev, netBalance: net.toFixed(2) }));
  };

  const handleKeyDown = (e, fieldName) => {
    if (e.key === "Enter") {
      const form = e.target.form;
      if (!form || !form.elements) return;

      const elements = Array.from(form.elements).filter(
        (el) => el.tagName === "INPUT" || el.tagName === "SELECT"
      );
      const index = elements.indexOf(e.target);
      if (index >= 0 && index + 1 < elements.length) {
        elements[index + 1].focus();
        e.preventDefault();
      }

      if (fieldName === "admissionNumber") {
        fetchStudentData();
      }
    }
  };

  const handleSavePayment = async () => {
    if (
      !formData.admissionNumber ||
      !formData.feePaid ||
      !formData.paymentDate
    ) {
      alert("Please fill in admission number, amount paid and payment date.");
      return;
    }

    const payload = {
      studentid: formData.admissionNumber,
      studentname: "Unknown",
      term: formData.studyTerm,
      studyyear: formData.studyYear,
      amount: parseFloat(formData.feePaid),
      paydate: formData.paymentDate,
      references: formData.referenceNumber,
    };

    try {
      await apiPost("/payments/save", payload);
      alert("✅ Payment saved!");
      setFormData((prev) => ({
        ...prev,
        feePaid: "",
        referenceNumber: "",
        paymentDate: "",
        netBalance: "",
      }));
      fetchStudentData();
    } catch (err) {
      console.error("❌ Failed to save payment:", err);
      alert("Failed to save payment. " + (err.response?.data?.error || err.message));
    }
  };

  const renderFormInputs = () => (
    <div className="payment-scope">
      <form className="form-section" onSubmit={(e) => e.preventDefault()}>
        {[
          {
            label: "Study Year",
            field: "studyYear",
            type: "select",
            options: generateYears(),
          },
          {
            label: "Study Term",
            field: "studyTerm",
            type: "select",
            options: ["Term1", "Term2", "Term3"],
          },
          { label: "Enter Adm No", field: "admissionNumber", type: "text" },
          { label: "Fee Paid", field: "feePaid", type: "number" },
          { label: "Enter Ref No", field: "referenceNumber", type: "text" },
          { label: "Payment Date", field: "paymentDate", type: "date" },
          { label: "NET Bal", field: "netBalance", type: "number", readonly: true },
        ].map(({ label, field, type, options, readonly }) => (
          <div className="form-group" key={field}>
            <label>{label}:</label>
            {type === "select" ? (
              <select
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, field)}
              >
                <option>-- {label} --</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, field)}
                readOnly={readonly}
              />
            )}
          </div>
        ))}
        <div className="form-group">
          <button type="button" onClick={handleSavePayment}>
            💾 Save Payment
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="payment-form-container">
      <h2>📋 School Fee Payments</h2>
      <table className="payment-table">
        <thead>
          <tr>
            <th>Details</th>
            <th>Class</th>
            <th>Stream</th>
            <th>Fee-Items</th>
            <th>Amount</th>
            <th>Remarks</th>
            <th colSpan="3">Payments Statement</th>
          </tr>
          <tr className="sub-header">
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th>Amount</th>
            <th>Date</th>
            <th>After-Pay Bal</th>
          </tr>
        </thead>
        <tbody>
          {feeItems.length > 0 || payments.length > 0 ? (
            feeItems.map((item, index) => {
              const isTotalRow = item.remarks?.startsWith("<TOTAL:");
              const remarkText = isTotalRow
                ? item.remarks.replace("<TOTAL:", "").replace(">", "")
                : item.remarks || "--";

              return (
                <tr
                  key={index}
                  className={`data-row ${isTotalRow ? "remarks-total" : ""}`}
                >
                  {index === 0 && (
                    <td rowSpan={feeItems.length} className="details-column">
                      {renderFormInputs()}
                    </td>
                  )}
                  <td className="dotted-right centered-cell">{classEnrolled}</td>
                  <td className="centered-cell">{stream}</td>
                  <td className="dotted-double-left centered-cell">
                    {item.itemDescription || "--"}
                  </td>
                  <td className="dotted-double-center centered-cell">
                    {item.amount ?? 0}
                  </td>
                  <td className="centered-cell">{remarkText}</td>
                  <td className="centered-cell">{payments[index]?.amount || "--"}</td>
                  <td className="centered-cell">{payments[index]?.paydate || "--"}</td>
                  <td className="centered-cell">{payments[index]?.balance || "--"}</td>
                </tr>
              );
            })
          ) : (
            <tr className="data-row">
              <td className="details-column">{renderFormInputs()}</td>
              <td className="dotted-right centered-cell">--</td>
              <td className="centered-cell">--</td>
              <td className="dotted-double-left centered-cell">--</td>
              <td className="dotted-double-center centered-cell">--</td>
              <td className="centered-cell">--</td>
              <td className="centered-cell">--</td>
              <td className="centered-cell">--</td>
              <td className="centered-cell">--</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentForm;
