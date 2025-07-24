"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function MonthCount() {
  const [monthCountData, setMonthCountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [collapsedTypes, setCollapsedTypes] = useState(new Set(["HSE", "IATF"]));

  const toggleType = (type) => {
    setCollapsedTypes((prev) => {
      const updated = new Set(prev);
      if (updated.has(type)) {
        updated.delete(type);
      } else {
        updated.add(type);
      }
      return updated;
    });
  };

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

      const grouped = {};
      data.forEach(({ Month, Training_name, Train_Mode, HSE_Count, IATF_Count }) => {
        if (!grouped[Month]) {
          grouped[Month] = {
            Month,
            HSE: { Internal: 0, External: 0, Overseas: 0 },
            IATF: { Internal: 0, External: 0, Overseas: 0 },
          };
        }

        if (Training_name?.includes("HSE")) {
          grouped[Month].HSE[Train_Mode] += HSE_Count;
        } else if (Training_name?.includes("IATF")) {
          grouped[Month].IATF[Train_Mode] += IATF_Count;
        }
      });

      const allMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      const finalData = allMonths.map((month) =>
        grouped[month] || {
          Month: month,
          HSE: { Internal: 0, External: 0, Overseas: 0 },
          IATF: { Internal: 0, External: 0, Overseas: 0 },
        }
      );

      setMonthCountData(finalData);
    } catch (err) {
      console.error("Error fetching month count:", err);
      setError("Error fetching data");
      setMonthCountData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const year = selectedDate.getFullYear();
    fetchMonthCount(year);

    const intervalId = setInterval(() => {
      fetchMonthCount(year);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [selectedDate]);

  const getTotalCountByTypeAndMonth = (month, type) =>
    Object.values(month[type]).reduce((a, b) => a + b, 0);

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

      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg overflow-x-auto">
        <table className="border-collapse table-fixed text-center min-w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-neutral-800">
              <th className="border border-gray-200 dark:border-neutral-700 font-semibold text-left text-base p-2">
                Months
              </th>
              {displayData.map((item, index) => (
                <th
                  key={index}
                  className="border border-gray-200 dark:border-neutral-700 font-semibold text-base p-2"
                >
                  {item.Month}
                </th>
              ))}
              <th className="border border-gray-200 dark:border-neutral-700 font-semibold text-base p-2">
                Total/Yr.
              </th>
            </tr>
          </thead>
          <tbody>
            {["HSE", "IATF"].map((type) => {
              const totalYearly = displayData.reduce(
                (sum, month) => sum + getTotalCountByTypeAndMonth(month, type),
                0
              );

              return (
                <React.Fragment key={type}>
                  <tr className="bg-gray-100 dark:bg-neutral-800">
                    <td
                      className="border border-gray-200 dark:border-neutral-700 font-bold text-left text-base p-2 cursor-pointer select-none"
                      onClick={() => toggleType(type)}
                    >
                      <span className="mr-2 text-xl">
                        {collapsedTypes.has(type) ? "+" : "−"}
                      </span>
                      {type}
                    </td>
                    {displayData.map((month, index) => (
                      <td
                        key={`${type}-summary-${index}`}
                        className="border border-gray-200 dark:border-neutral-700 text-base p-2"
                      >
                        <span className="inline-block px-2 py-1 rounded-full bg-blue-200 text-blue-900 font-semibold">
                          {getTotalCountByTypeAndMonth(month, type)}
                        </span>
                      </td>
                    ))}
                    <td className="border border-gray-200 dark:border-neutral-700 font-semibold text-base p-2">
                      <span className="inline-block px-2 py-1 rounded-full bg-blue-200 text-blue-900 font-semibold">
                        {totalYearly}
                      </span>
                    </td>
                  </tr>

                  {!collapsedTypes.has(type) &&
                    ["Internal", "External", "Overseas"].map((mode) => (
                      <tr key={`${type}-${mode}`}>
                        <td className="border border-gray-200 dark:border-neutral-700 font-medium text-left text-sm p-2">
                           {mode}
                        </td>
                        {displayData.map((month, index) => (
                          <td
                            key={`${type}-${mode}-${index}`}
                            className="border border-gray-200 dark:border-neutral-700 text-sm p-2"
                          >
                            <span
                              className={`inline-block px-2 py-1 rounded-full ${
                                month[type][mode] > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-600"
                              }`}
                            >
                              {month[type][mode]}
                            </span>
                          </td>
                        ))}
                        <td className="border border-gray-200 dark:border-neutral-700 font-semibold text-sm p-2">
                          {displayData.reduce((sum, m) => sum + m[type][mode], 0)}
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}

            <tr className="bg-gray-100 dark:bg-neutral-800">
              <td className="border border-gray-200 dark:border-neutral-700 font-semibold text-left text-base p-2">
                Total / Mon
              </td>
              {displayData.map((month, index) => {
                const total =
                  getTotalCountByTypeAndMonth(month, "HSE") +
                  getTotalCountByTypeAndMonth(month, "IATF");
                return (
                  <td
                    key={`total-${index}`}
                    className="border border-gray-200 dark:border-neutral-700 font-semibold text-base p-2"
                  >
                    {total}
                  </td>
                );
              })}
              <td className="border border-gray-200 dark:border-neutral-700 font-semibold text-base p-2">
                {displayData.reduce(
                  (sum, month) =>
                    sum +
                    getTotalCountByTypeAndMonth(month, "HSE") +
                    getTotalCountByTypeAndMonth(month, "IATF"),
                  0
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
