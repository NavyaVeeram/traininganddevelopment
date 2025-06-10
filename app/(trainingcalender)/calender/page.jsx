"use client";
import React, { useState, useEffect, useRef } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FullYearCalendar = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMonthList, setShowMonthList] = useState(false);
  const [showYearList, setShowYearList] = useState(false);
  const calendarRef = useRef(null);

  // For year selector decades navigation
  const [yearPageStart, setYearPageStart] = useState(year - 10);

  // Generate months
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
  }));

  // Generate 20 years per "page" centered around yearPageStart
  const yearOptions = Array.from({ length: 20 }, (_, i) => {
    const val = yearPageStart + i;
    return { value: val, label: val.toString() };
  });

  // Close calendar on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
        setShowMonthList(false);
        setShowYearList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Week number calculation (ISO-like)
  const getCustomWeekNumber = (date) => {
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const dayOfWeek = yearStart.getDay();
    const firstSunday = new Date(yearStart);
    const daysToAdd = (7 - dayOfWeek) % 7;
    firstSunday.setDate(firstSunday.getDate() + daysToAdd);

    if (date <= firstSunday) return 1;

    const firstMonday = new Date(firstSunday);
    firstMonday.setDate(firstSunday.getDate() + 1);

    const diffDays = Math.floor((date - firstMonday) / (1000 * 60 * 60 * 24));
    return Math.min(2 + Math.floor(diffDays / 7), 53);
  };

  // Generate calendar weeks
  const generateMonth = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];

    let startDay = (firstDayOfMonth.getDay() + 6) % 7; // Monday=0
    let day = 1 - startDay;

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

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  // Handlers
  const handleMonthClick = (val) => {
    setMonth(val);
    setShowMonthList(false);
  };

  const handleYearClick = (val) => {
    setYear(val);
    setShowYearList(false);
  };

  // Decade navigation
  const prevYearPage = () => setYearPageStart((s) => s - 20);
  const nextYearPage = () => setYearPageStart((s) => s + 20);

  const toggleCalendar = () => {
    setShowCalendar((p) => {
      if (!p) {
        setShowMonthList(false);
        setShowYearList(false);
      }
      return !p;
    });
  };

  return (
    <div className="relative inline-block">
      {/* Trigger button */}
      <button
        onClick={toggleCalendar}
        className="z-50 p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition"
        aria-label="Toggle Calendar"
      >
        <CalendarDays size={20} />
      </button>

      <AnimatePresence>
        {showCalendar && (
          <motion.div
            ref={calendarRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 mt-2 w-[360px] bg-white rounded-md shadow-lg border p-4 text-gray-700 z-40 select-none"
          >
            {/* Header: Month and Year side by side */}
            <div className="flex justify-center space-x-6 mb-4 text-lg font-semibold">
              <span
                onClick={() => {
                  setShowMonthList(true);
                  setShowYearList(false);
                }}
                className="cursor-pointer hover:text-sky-600 select-none"
              >
                {monthOptions[month].label}
              </span>
              <span
                onClick={() => {
                  setShowYearList(true);
                  setShowMonthList(false);
                }}
                className="cursor-pointer hover:text-sky-600 select-none"
              >
                {year}
              </span>
            </div>

            {/* Month selector popup */}
            <AnimatePresence>
              {showMonthList && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="grid grid-cols-3 gap-2 mb-4 max-h-48 overflow-auto"
                >
                  {monthOptions.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => handleMonthClick(m.value)}
                      className={`py-2 rounded text-center transition ${
                        m.value === month
                          ? "bg-sky-500 text-white"
                          : "hover:bg-sky-100"
                      }`}
                    >
                      {m.label.slice(0, 3)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Year selector popup */}
            <AnimatePresence>
              {showYearList && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mb-4"
                >
                  <div className="flex justify-between items-center mb-2 px-2">
                    <button
                      onClick={prevYearPage}
                      className="p-1 rounded hover:bg-gray-200"
                      aria-label="Previous Years"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold">
                      {yearPageStart} - {yearPageStart + 19}
                    </span>
                    <button
                      onClick={nextYearPage}
                      className="p-1 rounded hover:bg-gray-200"
                      aria-label="Next Years"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-auto px-2">
                    {yearOptions.map((y) => (
                      <button
                        key={y.value}
                        onClick={() => handleYearClick(y.value)}
                        className={`py-2 rounded text-center transition ${
                          y.value === year
                            ? "bg-sky-500 text-white"
                            : "hover:bg-sky-100"
                        }`}
                      >
                        {y.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Calendar table */}
            {!showMonthList && !showYearList && (
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-1 border">WK</th>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (d) => (
                        <th key={d} className="p-1 border font-medium">
                          {d}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, idx) => {
                    const dayIndex = week.findIndex((day) => day !== "");
                    let currentWeekNum = "";

                    if (dayIndex !== -1) {
                      const day = week[dayIndex];
                      const date = new Date(year, month, day);
                      currentWeekNum = getCustomWeekNumber(date);
                    }

                    return (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border bg-gray-100 font-semibold text-gray-600 p-1">
                          {currentWeekNum}
                        </td>
                        {week.map((day, i) => (
                          <td
                            key={i}
                            className={`border h-8 w-8 text-xs text-gray-800 hover:bg-sky-200 transition duration-200 ${
                              day === ""
                                ? "bg-gray-100 text-gray-400"
                                : isToday(day)
                                ? "bg-sky-400 text-white font-bold"
                                : "bg-white"
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FullYearCalendar;
