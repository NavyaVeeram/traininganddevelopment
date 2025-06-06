"use client";
import React, { useState, useEffect, useRef } from "react";
import { CalendarDays } from "lucide-react";
import Select from "react-select";
import { motion } from "framer-motion";

const FullYearCalendar = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
  }));

  const yearOptions = Array.from({ length: 100 }, (_, i) => {
    const value = 2000 + i;
    return { value, label: value.toString() };
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate week number of the year for a date (Monday as first day of week)
  const getWeekNumber = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    // Adjust so Monday=0, Sunday=6
    const startDay = (startOfYear.getDay() + 6) % 7;
    // Days since start of year
    const diffDays = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    // Calculate week number
    return Math.floor((diffDays + startDay) / 7) + 1;
  };

  // Generate weeks for the selected month
  const generateMonthWeeks = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    // Number of empty cells before first day (Monday as first day of week)
    const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < leadingEmptyDays; i++) days.push(null);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    // Fill trailing empty cells so total cells divisible by 7
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    // Chunk into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const weeks = generateMonthWeeks(year, month);

  return (
    <div className="relative z-50">
      <button
        className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600"
        onClick={() => setShowCalendar((prev) => !prev)}
        aria-label="Toggle calendar"
      >
        <CalendarDays />
      </button>

      {showCalendar && (
        <motion.div
          ref={calendarRef}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-16 right-4 z-40 bg-white shadow-2xl border rounded-lg p-4 w-[360px]"
        >
          <div className="flex justify-between gap-2 mb-4">
            <Select
              options={yearOptions}
              value={yearOptions.find((option) => option.value === year)}
              onChange={(option) => setYear(option.value)}
              className="w-1/2 text-sm"
            />
            <Select
              options={monthOptions}
              value={monthOptions.find((option) => option.value === month)}
              onChange={(option) => setMonth(option.value)}
              className="w-1/2 text-sm"
            />
          </div>

          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-1 border">Week</th>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <th key={d} className="p-1 border font-medium">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, idx) => {
                // Find first non-null day in this week to get date for week number
                const firstDayInWeek = week.find((day) => day !== null);
                const weekDate = firstDayInWeek || new Date(year, month, 1);
                const weekNumber = getWeekNumber(weekDate);

                return (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border bg-gray-100 font-semibold text-gray-600 p-1">
                      {weekNumber}
                    </td>
                    {week.map((day, i) => (
                      <td
                        key={i}
                        className={`border h-8 w-8 text-xs transition duration-200 ${
                          !day
                            ? "bg-white"
                            : "text-gray-800 hover:bg-sky-200 bg-white"
                        }`}
                      >
                        {day ? day.getDate() : ""}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default FullYearCalendar;