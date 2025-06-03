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

  const yearOptions = Array.from({ length: 50 }, (_, i) => {
    const value = 2000 + i;
    return { value, label: value.toString() };
  });

  // Close calendar if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ISO 8601 Week Number Calculation
  const getWeekNumber = (date) => {
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    // Adjust to Thursday of this week
    target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));

    const firstThursday = new Date(target.getFullYear(), 0, 4);
    firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));

    const weekNumber = 1 + Math.round((target - firstThursday) / (7 * 24 * 60 * 60 * 1000));
    return weekNumber;
  };

  // Generate Month Grid (weeks starting Monday)
  const generateMonth = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];

    // Calculate the weekday of the first day, with Monday=0 ... Sunday=6
    let startDay = (firstDayOfMonth.getDay() + 6) % 7;

    let day = 1 - startDay; // Start from Monday of the first week grid

    while (day <= lastDayOfMonth.getDate()) {
      const week = [];
      for (let i = 0; i < 7; i++, day++) {
        week.push(day > 0 && day <= lastDayOfMonth.getDate() ? day : "");
      }
      days.push(week);
    }

    return days;
  };

  const weeks = generateMonth(year, month);

  return (
    <div>
      <button
        className="z-50 p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600"
        onClick={() => setShowCalendar((prev) => !prev)}
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
          className="fixed top-16 right-4 z-40 bg-white shadow-xl border rounded-md p-4 w-[350px]"
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
                <th className="p-1 border">WK</th>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <th key={d} className="p-1 border font-medium">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, idx) => {
                // Find the first day in the week to get the week number (skip empty)
                const dayIndex = week.findIndex((day) => day !== "");
                let currentWeekNum = "";

                if (dayIndex !== -1) {
                  const day = week[dayIndex];
                  const date = new Date(year, month, day);
                  currentWeekNum = getWeekNumber(date);
                }

                return (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border bg-gray-100 font-semibold text-gray-600 p-1">
                      {currentWeekNum}
                    </td>
                    {week.map((day, i) => (
                      <td
                        key={i}
                        className={`border h-8 w-8 text-xs text-gray-800 hover:bg-sky-200 transition duration-200 ${
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
        </motion.div>
      )}
    </div>
  );
};

export default FullYearCalendar;
