"use client";
import React, { useState, useEffect, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FullYearCalendar = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMonthList, setShowMonthList] = useState(false);
  const [showYearList, setShowYearList] = useState(false);
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
      setTimeout(() => {
        if (calendarRef.current && !calendarRef.current.contains(event.target)) {
          setShowCalendar(false);
          setShowMonthList(false);
          setShowYearList(false);
        }
      }, 0);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Remove getCustomWeekNumber and replace with ISO week calculation
  // const getCustomWeekNumber = (date) => {
  //   const yearStart = new Date(date.getFullYear(), 0, 1);
  //   const dayOfWeek = yearStart.getDay();
  //   const firstSunday = new Date(yearStart);
  //   const daysToAdd = (7 - dayOfWeek) % 7;
  //   firstSunday.setDate(firstSunday.getDate() + daysToAdd);

  //   if (date <= firstSunday) return 1;

  //   const firstMonday = new Date(firstSunday);
  //   firstMonday.setDate(firstSunday.getDate() + 1);

  //   const diffDays = Math.floor((date - firstMonday) / (1000 * 60 * 60 * 24));
  //   return Math.min(2 + Math.floor(diffDays / 7), 53);
  // };

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

  const generateMonth = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];

    let startDay = (firstDayOfMonth.getDay() + 6) % 7;
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
  const today = new Date();
  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const handleMonthClick = (value) => {
    setMonth(value);
    setShowMonthList(false);
    // Do not close calendar after selection to keep popup open
  };

  const handleYearClick = (value) => {
    setYear(value);
    setShowYearList(false);
    // Do not close calendar after selection to keep popup open
  };

  const handleToggleCalendar = () => {
    setShowCalendar((prev) => {
      if (!prev) {
        // Reset selectors when opening
        setShowMonthList(false);
        setShowYearList(false);
      }
      return !prev;
    });
  };

  return (
    <div>
      <button
        className="z-50 p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600"
        onClick={handleToggleCalendar}
      >
        <CalendarDays />
      </button>

      <AnimatePresence>
        {showCalendar && (
          <motion.div
            ref={calendarRef}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-16 right-4 z-40 bg-white shadow-xl border rounded-md p-4 w-[350px]"
          >
            {/* Month & Year Selector Header */}
            <div className="flex justify-between items-center mb-4">
              <button
                className="text-sm font-semibold px-3 py-1 border rounded hover:bg-gray-100"
                onClick={() => {
                  setShowMonthList(true);
                  setShowYearList(false);
                }}
              >
                {monthOptions[month].label}
              </button>

              <button
                className="text-sm font-semibold px-3 py-1 border rounded hover:bg-gray-100"
                onClick={() => {
                  setShowYearList(true);
                  setShowMonthList(false);
                }}
              >
                {year}
              </button>
            </div>

            {/* Popup Month Selector */}
            <AnimatePresence>
              {showMonthList && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-3 gap-2 mb-4"
                >
                  {monthOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleMonthClick(option.value)}
                      className={`px-3 py-2 text-sm border rounded hover:bg-sky-200 ${
                        option.value === month ? "bg-sky-500 text-white" : ""
                      }`}
                    >
                      {option.label.slice(0, 3)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Popup Year Selector */}
            <AnimatePresence>
              {showYearList && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto mb-4"
                >
                  {yearOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleYearClick(option.value)}
                      className={`px-3 py-2 text-sm border rounded hover:bg-sky-200 ${
                        option.value === year ? "bg-sky-500 text-white" : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Calendar Table (hidden while month/year selectors open) */}
            {!showMonthList && !showYearList && (
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
                    const dayIndex = week.findIndex((day) => day !== "");
                    let currentWeekNum = "";

                      if (dayIndex !== -1) {
                        const day = week[dayIndex];
                        const date = new Date(year, month, day);
                        currentWeekNum = getISOWeek(date);
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
