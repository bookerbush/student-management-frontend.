import React, { useState } from 'react';
//import api from '../api';  // ✅ centralized axios instance
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

import './SchoolFeeForm.css';

const initialRow = {
  itemDescription: '',
  pp0Fee: '',
  pp12Fee: '',
  grade13Fee: '',
  grade46Fee: '',
  remarks: '',
};

const remarkOptions = [
  'Paid once on admission',
  'Paid Annually',
  'Paid Every Term'
];

const SchoolFeeForm = () => {
  const [rows, setRows] = useState([{ ...initialRow }]);
  const [message, setMessage] = useState('');

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleKeyDown = (e, rowIndex, fieldName) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const fieldOrder = [
        'itemDescription',
        'pp0Fee',
        'pp12Fee',
        'grade13Fee',
        'grade46Fee',
        'remarks'
      ];

      const currentIndex = fieldOrder.indexOf(fieldName);
      const nextField = fieldOrder[currentIndex + 1];

      if (nextField) {
        const nextInput = document.querySelector(
          `#input-${rowIndex}-${nextField}`
        );
        nextInput && nextInput.focus();
      } else {
        // Move to next row
        if (rowIndex === rows.length - 1) {
          setRows([...rows, { ...initialRow }]);
        }
        const nextRowInput = document.querySelector(`#input-${rowIndex + 1}-itemDescription`);
        nextRowInput && nextRowInput.focus();
      }
    }
  };

const handleSubmit = async () => {
  const filteredRows = rows.filter(row => row.itemDescription.trim() !== '');

  try {
    const res = await apiPost('/fees/save', filteredRows);

    if (res && res.data) {
      setMessage('✅ Fee items saved successfully.');
      setRows([{ ...initialRow }]);
    } else {
      setMessage('⚠️ No data returned, but items may have been saved.');
    }
  } catch (err) {
    console.error('❌ Failed to save fee items:', err);
    setMessage('❌ Failed to save fee items: ' + (err.response?.data || err.message));
  }
};



  return (
    <div className="fee-form-container">
      <h2>School Fee Structure</h2>
      <table className="fee-table">
        <thead>
          <tr>
            <th>Item Description</th>
            <th>PP0</th>
            <th>PP1-PP2</th>
            <th>Grade 1-3</th>
            <th>Grade 4-6</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td><input
                id={`input-${rowIndex}-itemDescription`}
                value={row.itemDescription}
                onChange={e => handleChange(rowIndex, 'itemDescription', e.target.value)}
                onKeyDown={e => handleKeyDown(e, rowIndex, 'itemDescription')}
              /></td>
              <td><input
                id={`input-${rowIndex}-pp0Fee`}
                type="number"
                value={row.pp0Fee}
                onChange={e => handleChange(rowIndex, 'pp0Fee', e.target.value)}
                onKeyDown={e => handleKeyDown(e, rowIndex, 'pp0Fee')}
              /></td>
              <td><input
                id={`input-${rowIndex}-pp12Fee`}
                type="number"
                value={row.pp12Fee}
                onChange={e => handleChange(rowIndex, 'pp12Fee', e.target.value)}
                onKeyDown={e => handleKeyDown(e, rowIndex, 'pp12Fee')}
              /></td>
              <td><input
                id={`input-${rowIndex}-grade13Fee`}
                type="number"
                value={row.grade13Fee}
                onChange={e => handleChange(rowIndex, 'grade13Fee', e.target.value)}
                onKeyDown={e => handleKeyDown(e, rowIndex, 'grade13Fee')}
              /></td>
              <td><input
                id={`input-${rowIndex}-grade46Fee`}
                type="number"
                value={row.grade46Fee}
                onChange={e => handleChange(rowIndex, 'grade46Fee', e.target.value)}
                onKeyDown={e => handleKeyDown(e, rowIndex, 'grade46Fee')}
              /></td>
              <td>
                <select
                  id={`input-${rowIndex}-remarks`}
                  value={row.remarks}
                  onChange={e => handleChange(rowIndex, 'remarks', e.target.value)}
                  onKeyDown={e => handleKeyDown(e, rowIndex, 'remarks')}
                >
                  <option value="">-- Select --</option>
                  {remarkOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="save-btn" onClick={handleSubmit}>Save</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default SchoolFeeForm;
