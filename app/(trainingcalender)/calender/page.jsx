"use client";
import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import {CalendarDays, CalenderDays} from "lucide-react"
const MonthlyCalendar = () => {
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }, []);

  // 🔍 Detect click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (year === null || month === null) return null;

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  };

  const generateMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    let startDay = firstDay.getDay();
    let day = 1 - startDay;

    while (day <= lastDay.getDate()) {
      const week = [];
      for (let i = 0; i < 7; i++, day++) {
        week.push(day > 0 && day <= lastDay.getDate() ? day : "");
      }
      days.push(week);
    }
    return days;
  };

  const weeks = generateMonth();
  const yearOptions = Array.from({ length: 20 }, (_, i) => {
    const value = 2010 + i;
    return { value, label: value.toString() };
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
  }));

  return (
    <div className="relative w-max">
      {/* Toggle Button */}
      <button
        onClick={() => setShowCalendar((prev) => !prev)}

      >
        <CalendarDays />
      </button>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <div
          ref={calendarRef}
          className="absolute z-50 top-0 right-full mr-2 bg-white border shadow-lg rounded-md p-2 w-80"
        >
          {/* Controls */}
          <div className="flex flex-row gap-2 mb-3">
            <div className="w-1/2">
              <Select
                options={yearOptions}
                value={yearOptions.find((option) => option.value === year)}
                onChange={(option) => setYear(option.value)}
                placeholder="Year"
                className="text-sm"
              />
            </div>
            <div className="w-1/2">
              <Select
                options={monthOptions}
                value={monthOptions.find((option) => option.value === month)}
                onChange={(option) => setMonth(option.value)}
                placeholder="Month"
                className="text-sm"
              />
            </div>
          </div>

          {/* Calendar Table */}
          <table className="w-full text-center text-xs border-collapse rounded overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-[10px]">
                <th className="border border-gray-300 p-1 font-medium">WK</th>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <th key={day} className="border border-gray-300 p-1 font-medium">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, idx) => {
                const firstValidDay = week.find((d) => d);
                const date = firstValidDay ? new Date(year, month, firstValidDay) : new Date(year, month, 1);
                const weekNum = getWeekNumber(date);

                return (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 font-semibold text-gray-600 text-xs py-2 px-1 bg-gray-100">
                      {weekNum}
                    </td>
                    {week.map((day, i) => (
                      <td
                        key={i}
                        className={`border border-gray-300 h-8 w-8 text-xs text-gray-800 hover:bg-blue-100 transition duration-200 ${
                          day === "" ? "bg-gray-100 text-gray-400" : "bg-white"
                        }`}
                      >
                        {day}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonthlyCalendar;
