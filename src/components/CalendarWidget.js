// File: CalendarWidget.js

import React, { useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export const CalendarWidget = ({ selectedDate, setSelectedDate }) => {
  useEffect(() => {
    if (setSelectedDate) {
      setSelectedDate(selectedDate);
    }
  }, [selectedDate, setSelectedDate]);

  const handleDateChange = (newDate) => {
    console.log("📅 Calendar selected:", newDate);
    setSelectedDate(newDate); // 🔥 This triggers the fetch
  };

  return (
    <div className="calendar-container">
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        Monthly Calendar
      </h3>
      <div className="calendar-wrapper">
        <Calendar onChange={handleDateChange} value={selectedDate} />
      </div>
    </div>
  );
};
