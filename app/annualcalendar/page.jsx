"use client"
import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaPrint } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const monthsOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const AnnualTraining = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trainingName, setTrainingName] = useState("IATF");
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId");
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    }

    const fetchAccessRole = async () => {
      try {
        const res = await fetch(
          "/api/get_access_role?employeeId=" + storedEmployeeId
        );
        const data = await res.json();

        if (res.ok && data.Access_Role) {
          if (
            data.Access_Role === "Res_Person" ||
            data.Access_Role === "HOS" ||
            data.Access_Role === "HOD" ||
            data.Access_Role === "HR_Hod"
          ) {
            setIsAuthorized(false);
            return;
          }
          setAccessRole(data.Access_Role);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error fetching access role:", error);
        setIsAuthorized(false);
      }
    };

    fetchAccessRole();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      setLoading(true);
      setError(null);
      fetch(
        `/api/get_annual_training_calendar?year=${selectedDate.getFullYear()}&trainingName=${trainingName}`
      )
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch training calendar");
          return res.json();
        })
        .then((data) => {
          setTrainingData(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [selectedDate, trainingName, isAuthorized]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
        <div className="bg-white p-10 rounded shadow text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
        <div className="bg-white p-10 rounded shadow text-center">
          <h2 className="text-2xl font-bold">Unauthorized</h2>
          <p className="mt-2">You do not have access to view this page.</p>
        </div>
      </div>
    );
  }

  const groupedData = {};
  trainingData.forEach((item) => {
    const month = item.Req_Months.toLowerCase();
    const week = item.Week;
    const program = item.Program_Name;

    if (!groupedData[month]) {
      groupedData[month] = {};
    }
    if (!groupedData[month][week]) {
      groupedData[month][week] = [];
    }
    groupedData[month][week].push(program);
  });

  const monthsInData = monthsOrder;

  const monthAbbrMap = {
    January: "jan",
    February: "feb",
    March: "mar",
    April: "apr",
    May: "may",
    June: "jun",
    July: "jul",
    August: "aug",
    September: "sep",
    October: "oct",
    November: "nov",
    December: "dec",
  };

  function getISOWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const firstDayNr = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3);
    const weekNumber =
      1 + Math.floor((target - firstThursday) / (7 * 24 * 60 * 60 * 1000));
    return weekNumber;
  }

  const dynamicWeeksByMonth = {};
  monthsInData.forEach((month, index) => {
    const monthNum = index;
    const weeks = new Set();
    const daysInMonth = new Date(
      selectedDate.getFullYear(),
      monthNum + 1,
      0
    ).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), monthNum, day);
      let weekNum = getISOWeekNumber(date);
      if (weekNum > 52) {
        weekNum = 52;
      }
      weeks.add(weekNum);
    }
    dynamicWeeksByMonth[month] = Array.from(weeks).sort((a, b) => {
      if (a < 10 && b > 40) {
        return 1;
      }
      if (a > 40 && b < 10) {
        return -1;
      }
      return a - b;
    });
  });

  const generatePDF = async () => {
    const input = tableRef.current;
    if (!input) {
      alert("No content to print");
      return;
    }

    // Clone the node to avoid modifying the original DOM
    const clonedNode = input.cloneNode(true);

    // Remove all class attributes and apply inline styles for PDF
    const elementsWithClasses = clonedNode.querySelectorAll("[class]");
    elementsWithClasses.forEach((el) => {
      el.removeAttribute("class");
      el.style.backgroundColor = "white";
      el.style.color = "black";
      if (el.tagName.toLowerCase() === "td") {
        el.style.border = "1px solid #000";
        el.style.padding = "6px";
        el.style.fontSize = "12px";
        el.style.textAlign = "center";
      } else if (
        el.tagName.toLowerCase() === "th"
      ) {
        el.style.border = "1px solid #000";
        el.style.padding = "8px";
        el.style.fontSize = "13px";
        el.style.fontWeight = "bold";
        el.style.textAlign = "center";
        el.style.backgroundColor = "#f0f0f0";
      } else {
        el.style.border = "1px solid #000";
        el.style.padding = "6px";
        el.style.fontSize = "12px";
        el.style.textAlign = "center";
      }
      el.style.boxSizing = "border-box";
    });

    // Style the cloned root element
    clonedNode.style.backgroundColor = "white";
    clonedNode.style.color = "black";
    clonedNode.style.borderCollapse = "collapse";
    clonedNode.style.border = "1px solid #000";
    clonedNode.style.width = "100%";

    // Create a wrapper div offscreen to hold the cloned node
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.top = "-10000px";
    wrapper.style.left = "0";
    wrapper.style.width = "1122px"; // A4 landscape width at 96 DPI
    wrapper.style.padding = "20px";
    wrapper.style.backgroundColor = "white";
    wrapper.appendChild(clonedNode);
    document.body.appendChild(wrapper);

    // Adjust clonedNode width for padding
    clonedNode.style.width = "1082px";

    try {
      const canvas = await html2canvas(clonedNode, {
        backgroundColor: "#fff",
        scale: 3,
        useCORS: true,
        width: 1082,
        height: clonedNode.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate image height to maintain aspect ratio
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
      pdf.save("annual_training_calendar.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF due to unexpected error.");
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  return (
    <div className="max-w-full mx-auto bg-white p-2 w-full">
      <div className="bg-sky-400 text-white p-2 flex justify-between rounded-t-lg">
        <p className="font-semibold">Annual Training Calendar</p>
      </div>
      <div className="mb-4 mt-2 flex justify-between items-center space-x-4">
        <div className="flex">
          <div>
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
              popperModifiers={{
                preventOverflow: {
                  enabled: true,
                  boundariesElement: "viewport",
                },
              }}
            />
          </div>
          <div className="mx-2">
            <label htmlFor="training-select" className="mr-2 font-semibold">
              Select Training:
            </label>
            <select
              id="training-select"
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="IATF">
                IATF (International Automotive Task Force)
              </option>
              <option value="HSE">HSE (Health, Safety, and Environment)</option>
            </select>
          </div>
        </div>

        <div>
          <button
            onClick={(e) => {
              e.preventDefault();
              generatePDF();
            }}
            className="ml-2 flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-3 rounded"
            aria-label="Download Annual Calendar"
            title="Download Annual Calendar"
          >
            <FaPrint />
            <span className="ml-1">Print</span>
          </button>
        </div>
      </div>
      {loading && <p>Loading training calendar...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && trainingData.length === 0 && (
        <p>No training data available for the selected year.</p>
      )}

      {!loading && !error && trainingData.length > 0 && (
        <>
          <table
            ref={tableRef}
            id="annual-training-table"
            className="min-w-full border border-gray-300 table-fixed"
          >
            <tbody>
              <tr>
                <td
                  className="border border-gray-300 px-2 py-1 font-semibold w-12  bg-blue-100 text-center align-middle whitespace-nowrap"
                  colSpan={6}
                >
                  Annual Training Calendar for {trainingName}
                </td>
              </tr>
              <tr>
                <td
                  className="border border-gray-300 px-2 py-1 font-semibold w-12  bg-blue-200 text-center align-middle whitespace-nowrap"
                >
                  Months
                </td>
                <td
                  className="border border-gray-300 px-1 py-1 w-24 text-center font-semibold bg-orange-200"
                  colSpan={5}
                >
                  Weeks
                </td>
              </tr>
              {monthsInData.map((month) => {
                const monthKey = monthAbbrMap[month].toLowerCase();
                const weeks = dynamicWeeksByMonth[month] || [];
                const weeksToShow = weeks.slice(0, 5);
                return (
                  <React.Fragment key={month}>
                    <tr>
                      <td
                        className="border border-gray-300 px-2 py-1 font-semibold w-12 h-12 bg-blue-100 text-center align-middle whitespace-nowrap"
                        rowSpan={2}
                      >
                        {month}
                      </td>
                      {weeksToShow.map((week) => (
                        <td
                          key={`${month}-week-header-${week}`}
                          className="border border-gray-300 px-1 py-1 w-24  text-center font-semibold bg-orange-100"
                        >
                          Week {week}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      {weeksToShow.map((week) => {
                        let bgColor = "bg-white";
                        return (
                          <td
                            key={`${month}-week-data-${week}`}
                            className={`border border-gray-300 px-4 py-3 w-24 break-words whitespace-normal max-w-24 ${bgColor}`}
                          >
                            {groupedData[monthKey] &&
                            groupedData[monthKey][week]
                              ? groupedData[monthKey][week].map(
                                  (program, idx) => (
                                    <div
                                      key={idx}
                                      className="mb-1 break-words whitespace-normal max-w-full inline-block"
                                    >
                                      {program}
                                    </div>
                                  )
                                )
                              : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AnnualTraining;
