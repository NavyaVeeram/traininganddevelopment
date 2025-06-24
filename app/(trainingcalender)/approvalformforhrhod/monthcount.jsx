"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function MonthCount() {
  const [monthCountData, setMonthCountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchMonthCount = async (year) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/approval_form_month_count?year=${year}`);
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch data");
        setMonthCountData([]);
        return;
      }

      const data = await res.json();
      console.log("Raw API data:", data);

      // Merge HSE + IATF counts per month
      const dataMap = new Map();
      data.forEach((item) => {
        const existing = dataMap.get(item.Month) || {
          Month: item.Month,
          HSE_Count: 0,
          IATF_Count: 0,
        };
        existing.HSE_Count += item.HSE_Count;
        existing.IATF_Count += item.IATF_Count;
        dataMap.set(item.Month, existing);
      });

      const allMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      const mergedData = allMonths.map((month) =>
        dataMap.get(month) || {
          Month: month,
          HSE_Count: 0,
          IATF_Count: 0,
        }
      );

      setMonthCountData(mergedData);
    } catch (err) {
      console.error("Error fetching month count:", err);
      setError("Error fetching data");
      setMonthCountData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedDate) return;
    const year = selectedDate.getFullYear();
    fetchMonthCount(year);

    const intervalId = setInterval(() => {
      fetchMonthCount(year);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Data</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const displayData = monthCountData;

  return (
    <div className="max-w-full mx-auto p-8">
      <div className="mb-6">
        <label htmlFor="year-select" className="mr-2 font-semibold">
          Select Year:
        </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy"
          showYearPicker
          placeholderText="Select Year"
          className="p-2 border border-gray-300 rounded-lg"
          calendarClassName="z-50"
          popperPlacement="top-start"
          minDate={new Date(new Date().getFullYear() - 2, 0, 1)}
          maxDate={new Date(new Date().getFullYear() + 2, 11, 31)}
          id="year-select"
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 overflow-x-auto">
          <table className="border-collapse table-fixed text-center" style={{ width: "auto" }}>
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 font-semibold text-left text-base" style={{ width: "100px", padding: "12px 8px" }}>
                  Months
                </th>
                {displayData.map((item, index) => (
                  <th key={index} className="border border-gray-200 font-semibold text-gray-700 text-base" style={{ width: "80px", padding: "12px 6px" }}>
                    {item.Month}
                  </th>
                ))}
                <th className="border border-gray-200 font-semibold text-base" style={{ width: "90px", padding: "12px 8px" }}>
                  Total/Yr.
                </th>
              </tr>
            </thead>
            <tbody>
              {/* HSE */}
              <tr>
                <td className="border border-gray-200 font-semibold text-left text-base" style={{ padding: "12px 8px" }}>
                  HSE
                </td>
                {displayData.map((item, index) => (
                  <td key={"hse-" + index} className="border border-gray-200" style={{ padding: "12px 6px" }}>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-base font-medium ${item.HSE_Count > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {item.HSE_Count}
                    </span>
                  </td>
                ))}
                <td className="border border-gray-200 font-semibold text-base" style={{ padding: "12px 8px" }}>
                  {displayData.reduce((sum, item) => sum + item.HSE_Count, 0)}
                </td>
              </tr>

              {/* IATF */}
              <tr>
                <td className="border border-gray-200 font-semibold text-left text-base" style={{ padding: "12px 8px" }}>
                  IATF
                </td>
                {displayData.map((item, index) => (
                  <td key={"iatf-" + index} className="border border-gray-200" style={{ padding: "12px 6px" }}>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-base font-medium ${item.IATF_Count > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
                      {item.IATF_Count}
                    </span>
                  </td>
                ))}
                <td className="border border-gray-200 font-semibold text-base" style={{ padding: "12px 8px" }}>
                  {displayData.reduce((sum, item) => sum + item.IATF_Count, 0)}
                </td>
              </tr>

              {/* Total/Month */}
              <tr>
                <td className="border border-gray-200 font-semibold text-left text-base" style={{ padding: "12px 8px" }}>
                  Total/Mon
                </td>
                {displayData.map((item, index) => (
                  <td key={"total-month-" + index} className="border border-gray-200 font-semibold text-base" style={{ padding: "12px 6px" }}>
                    {item.HSE_Count + item.IATF_Count}
                  </td>
                ))}
                <td className="border border-gray-200 font-semibold text-base" style={{ padding: "12px 8px" }}>
                  {displayData.reduce((sum, item) => sum + item.HSE_Count + item.IATF_Count, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
