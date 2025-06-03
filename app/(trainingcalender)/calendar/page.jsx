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

  const getWeekNumber = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date - startOfYear) / 86400000);
    const janFirstDay = (startOfYear.getDay() + 6) % 7; // Monday = 0
    return 1 + Math.floor((dayOfYear + janFirstDay) / 7);
  };

  const generateMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    let startDay = (firstDay.getDay() + 6) % 7; // Monday = 0
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
        className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600"
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
          className=" z-40 bg-white shadow-xl border rounded-md p-4 "
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
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <th key={d} className="p-1 border font-medium">
                    {d}
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
                    <td className="border bg-gray-100 font-semibold text-gray-600 p-1">{weekNum}</td>
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
