"use client";
import React, { useState, useEffect } from "react";
import "./styles.css";
import CalendarMonthYearSelector from "../components/CalendarMonthYearSelector";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const monthAbbrToNumber = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

function getISOWeek(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
  return weekNumber;
}

function getWeeksInMonthISO(year, monthIndex) {
  // Calculate weeks in the month, but only include weeks where majority of days belong to the month
  const weekDayCount = {};
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const week = getISOWeek(date);
    weekDayCount[week] = (weekDayCount[week] || 0) + 1;
  }

  // Filter weeks where majority of days are in the month (at least 4 days)
  const weeks = Object.entries(weekDayCount)
    .filter(([week, count]) => count >= 4)
    .map(([week]) => parseInt(week));

  return weeks.sort((a, b) => a - b);
}

export default function AnnualCalendar() {
  const [year, setYear] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trainingName, setTrainingName] = useState("");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/annual_calendar?year=${year.getFullYear()}&trainingName=${encodeURIComponent(trainingName)}`);
        const result = await res.json();
        const calendar = {};
        result.forEach(({ Req_Months, Week, Program_Name }) => {
          const monthNum = monthAbbrToNumber[Req_Months];
          if (!monthNum) return;
          if (!calendar[monthNum]) calendar[monthNum] = {};
          if (!calendar[monthNum][`Week${Week}`]) {
            calendar[monthNum][`Week${Week}`] = [];
          }
          calendar[monthNum][`Week${Week}`].push(Program_Name);
        });
        setData(calendar);
      } catch (error) {
        console.error("Fetch error:", error);
        setData({});
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [year, trainingName]);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      window.location.href = '/';
    }
  }, []);

  function isYearEnabled(date) {
    // Allow all years for now, can customize if needed
    return true;
  }

  const monthWeekMap = (() => {
    const map = {};
    const maxWeeks = 53;
    for (let i = 0; i < 12; i++) {
      let isoWeeks = getWeeksInMonthISO(year.getFullYear(), i);
      // Ensure exactly 5 weeks per month except December (month 11)
      if (i !== 11) {
        if (isoWeeks.length > 5) {
          isoWeeks = isoWeeks.slice(0, 5);
        } else if (isoWeeks.length < 5) {
          // Add weeks from next month to make total 5 weeks
          let nextMonth = i + 1;
          while (isoWeeks.length < 5 && nextMonth < 12) {
            const nextMonthWeeks = getWeeksInMonthISO(year.getFullYear(), nextMonth);
            for (let w of nextMonthWeeks) {
              if (isoWeeks.length >= 5) break;
              if (!isoWeeks.includes(w)) {
                isoWeeks.push(w);
              }
            }
            nextMonth++;
          }
          // If still less than 5, try previous month
          let prevMonth = i - 1;
          while (isoWeeks.length < 5 && prevMonth >= 0) {
            const prevMonthWeeks = getWeeksInMonthISO(year.getFullYear(), prevMonth);
            for (let w of prevMonthWeeks) {
              if (isoWeeks.length >= 5) break;
              if (!isoWeeks.includes(w)) {
                isoWeeks.push(w);
              }
            }
            prevMonth--;
          }
          isoWeeks.sort((a, b) => a - b);
        }
      }
      const weeks = [];
      for (let w of isoWeeks) {
        if (w > maxWeeks) break;
        weeks.push(`Week${w}`);
      }
      map[i + 1] = weeks;
    }
    return map;
  })();

  const totalWeeks = Object.values(monthWeekMap).reduce(
    (acc, wks) => acc + wks.length,
    0
  );

  return (
    <div className="max-w-full mx-auto bg-white p-2 w-full">
      <style>
        {`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        `}
      </style>

      <div className="bg-sky-400 text-white p-2 flex justify-between rounded-t-lg">
        <p className="font-semibold">Annual Training Calendar</p>
        <div className="flex justify-end mx-3">
          {username ? (
            <p className="font-bold">{username}</p>
          ) : (
            <p>Loading the Username</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center ml-5 mt-4">
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2">
            <span>Year:</span>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                if (date) {
                  setYear(new Date(date.getFullYear(), 0, 1));
                }
              }}
              dateFormat="yyyy"
              showYearPicker
              className="p-2 border border-gray-300 rounded-lg"
              calendarClassName="z-50"
              popperPlacement="top-start"
              isClearable
              isSearchable
              required
              popperModifiers={{
                preventOverflow: {
                  enabled: true,
                  boundariesElement: "viewport",
                },
              }}
              filterDate={isYearEnabled}
            />
          </label>

          <label className="flex items-center space-x-2">
            <span>Training Name:</span>
            <select
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="">Select training</option>
              <option value="IATF">IATF</option>
              <option value="HSE">HSE</option>
            </select>
          </label>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 7H5c-1.1 0-2 .9-2 2v6h4v4h10v-4h4v-6c0-1.1-.9-2-2-2zM17 17H7v-5h10v5zm-5-9c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2z" />
          </svg>
          <span>Print</span>
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div id="print-section"> {/* ✅ Only this will print */}
          <table
            className="annual-training-table"
            border="1"
            cellPadding="8"
            cellSpacing="0"
            style={{
              borderCollapse: "collapse",
              width: "100%",
              marginTop: 20,
              textAlign: "center",
              fontSize: "0.9rem",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              border: "1px solid #ccc"
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f4a261", borderBottom: "2px solid #e76f51" }}>
                <th rowSpan={2} style={{ backgroundColor: "#2a9d8f", color: "white", width: "50px", borderRight: "2px solid #e76f51" }}>
                  Months
                </th>
                <th colSpan={5} style={{ backgroundColor: "#e9c46a", padding: "10px", borderRight: "2px solid #e76f51", fontWeight: "bold", fontSize: "1rem" }}>
                   {trainingName} Annual Training Plan - {year.getFullYear()}
                </th>
              </tr>
              {/* Removed the empty week header row to avoid extra line */}
              {/* <tr style={{ backgroundColor: "#f4a261", borderBottom: "2px solid #e76f51" }}>
                {[...Array(5)].map((_, i) => (
                  <th key={`week-header-${i}`} style={{ backgroundColor: "#e9c46a", padding: "10px", borderRight: i < 4 ? "1px solid #ddd" : "none" }}>
                  </th>
                ))} 
              </tr> */}
            </thead>
            <tbody>
              {months.map((month, idx) => {
                const monthIndex = idx + 1;
                const weeks = monthWeekMap[monthIndex] || [];
                const monthData = data[monthIndex] || {};
                return (
                  <tr key={month} style={{ height: "80px", borderBottom: "1px solid #ddd" }}>
                    <td style={{
                      backgroundColor: "#2a9d8f",
                      color: "white",
                      fontWeight: "bold",
                      textAlign: "center",
                      padding: "10px",
                      borderRight: "2px solid #e76f51"
                    }}>
                      {month}
                    </td>
                    {[0,1,2,3,4].map((weekIdx) => {
                      const weekKey = weeks[weekIdx];
                      const programs = weekKey && Array.isArray(monthData[weekKey]) ? monthData[weekKey] : [];
                      return (
                        <td key={`${month}-week${weekIdx+1}`} style={{
                          fontWeight: "normal",
                          padding: "8px",
                          fontSize: "0.8rem",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          verticalAlign: "top",
                          minWidth: "140px",
                          maxWidth: "160px",
                          backgroundColor: weekIdx % 2 === 0 ? "#f9f5f0" : "#ffffff",
                          borderRight: weekIdx < 4 ? "1px solid #ddd" : "none"
                        }}>
                          {weekKey && <div style={{ fontWeight: "bold", marginBottom: "6px", color: "#264653" }}>{weekKey}</div>}
                          {programs.length > 0 ? (
                            programs.map((program, idx) => (
                              <div key={idx} style={{ marginBottom: "4px", lineHeight: "1.2" }}>{program}</div>
                            ))
                          ) : (
                            <div style={{ color: "#999", fontStyle: "italic" }}> </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="print-footer">
  Greentech Industries(India) Pvt. Ltd.
</div>

        </div>
      )}
    </div>
  );
}
