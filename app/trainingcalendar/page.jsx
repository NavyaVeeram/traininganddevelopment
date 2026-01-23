"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const months = [
  { label: "January", value: "Jan" },
  { label: "February", value: "Feb" },
  { label: "March", value: "Mar" },
  { label: "April", value: "Apr" },
  { label: "May", value: "May" },
  { label: "June", value: "Jun" },
  { label: "July", value: "Jul" },
  { label: "August", value: "Aug" },
  { label: "September", value: "Sep" },
  { label: "October", value: "Oct" },
  { label: "November", value: "Nov" },
  { label: "December", value: "Dec" },
];

// Function to calculate ISO week number
const getISOWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
};

// Function to parse date string (assuming format like "DD-MMM-YYYY" or similar)
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Try to create a date object from the string
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    // Try alternative parsing if needed
    return null;
  }
  
  return date;
};

const TrainingCalendar = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchCalendar();
  }, [year, month]);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/training_calendar_details", {
        params: {
          Year_No: year,
          Month: month || null,
        },
      });
      setData(res.data || []);
    } catch (error) {
      console.error("Error fetching calendar", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white">
      <h2 className="text-xl font-semibold text-center mb-4">
        Training Calendar
      </h2>

      {/* Filters */}
      <div className="flex gap-4 mb-6 justify-center">
        <select
          className="border px-3 py-2 rounded"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">All Months</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-cyan-300 text-black">
              <th className="border px-2 py-1">Week</th>
              <th className="border px-2 py-1">Day</th>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Programme Name</th>
              <th className="border px-2 py-1">Duration</th>
              <th className="border px-2 py-1">Trainer Name</th>
              <th className="border px-2 py-1">Department</th>
              <th className="border px-2 py-1">Venue</th>
              <th className="border px-2 py-1">No. of Participants</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  No data found
                </td>
              </tr>
            )}

            {data.map((row, idx) => {
              const date = parseDate(row.Date);
              const weekNumber = date ? getISOWeek(date) : row.Week_No;
              
              return (
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-2 py-1 text-center">W{weekNumber}</td>
                  <td className="border px-2 py-1 text-center">{row.Week_Day}</td>
                  <td className="border px-2 py-1 text-center">{row.Date}</td>
                  <td className="border px-2 py-1">{row.Programme_Name}</td>
                  <td className="border px-2 py-1 text-center">{row.Duration}</td>
                  <td className="border px-2 py-1">{row.Trainer_Name}</td>
                  <td className="border px-2 py-1">{row.Department}</td>
                  <td className="border px-2 py-1">{row.Venue}</td>
                  <td className="border px-2 py-1 text-center">
                    {row.No_of_Participants}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainingCalendar;