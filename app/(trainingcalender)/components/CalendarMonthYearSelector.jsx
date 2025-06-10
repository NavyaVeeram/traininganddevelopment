import React, { useState } from 'react';

const CalendarMonthYearSelector = ({ selectedMonth, selectedYear, onMonthChange, onYearChange, monthOptions, yearOptions }) => {
  const [showMonthList, setShowMonthList] = useState(false);
  const [showYearList, setShowYearList] = useState(false);

  return (
    <div className="flex gap-2">
      <div className="relative w-1/2">
        <button
          className="w-full border rounded px-2 py-1 text-left"
          onClick={() => {
            setShowMonthList(prev => !prev);
            setShowYearList(false);
          }}
        >
          {monthOptions.find(option => option.value === selectedMonth)?.label || 'Select Month'}
        </button>
        {showMonthList && (
          <ul className="absolute z-50 bg-white border rounded shadow max-h-48 overflow-auto w-full mt-1">
            {monthOptions.map(option => (
              <li
                key={option.value}
                className={`cursor-pointer px-2 py-1 hover:bg-sky-200 ${option.value === selectedMonth ? 'bg-sky-300 font-semibold' : ''}`}
                onClick={() => {
                  onMonthChange(option.value);
                  setShowMonthList(false);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative w-1/2">
        <button
          className="w-full border rounded px-2 py-1 text-left"
          onClick={() => {
            setShowYearList(prev => !prev);
            setShowMonthList(false);
          }}
        >
          {selectedYear || 'Select Year'}
        </button>
        {showYearList && (
          <ul className="absolute z-50 bg-white border rounded shadow max-h-48 overflow-auto w-full mt-1">
            {yearOptions.map(option => (
              <li
                key={option.value}
                className={`cursor-pointer px-2 py-1 hover:bg-sky-200 ${option.value === selectedYear ? 'bg-sky-300 font-semibold' : ''}`}
                onClick={() => {
                  onYearChange(option.value);
                  setShowYearList(false);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CalendarMonthYearSelector;
