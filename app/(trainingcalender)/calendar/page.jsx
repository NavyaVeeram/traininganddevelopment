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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fixed Week Number Calculation (starts Sunday, Week 1 begins at Jan 1)
  const getWeekNumber = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diffInDays = Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24));
    const weekNo = Math.floor((diffInDays + startOfYear.getDay()) / 7) + 1;
    return weekNo;
  };

  const generateMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    let startDay = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
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
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <th key={d} className="p-1 border font-medium">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, idx) => {
                // Find first valid day of the week to get accurate week number
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