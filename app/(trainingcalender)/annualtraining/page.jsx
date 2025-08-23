
"use client";
import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { FaPrint } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import BackButton from "@/components/BackButton";

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
    } else {
      window.location.href = "/";
      return;
    }

    const fetchAccessRole = async () => {
      try {
        const res = await fetch(
          `/api/get_access_role?employeeId=${storedEmployeeId}`
        );
        const data = await res.json();

        if (res.ok && data.Access_Role) {
          // Restrict access for HR_Res and HR_HOD roles
          if (
            data.Access_Role === "Res_Person" ||
            data.Access_Role === "HOS" ||
            data.Access_Role === "HOD"
          ) {
            setIsAuthorized(true);
            return;
          }
          if (
            data.Access_Role === "HR_Res" ||
            data.Access_Role === "HR_Hod"
          ) {
            setAccessRole(data.Access_Role);
            setIsAuthorized(true);
            return;
          }
          setAccessRole(data.Access_Role);
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Error fetching access role:", error);
        setIsAuthorized(true);
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
      <div>Loading...</div>
      // <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
      //   <div className="bg-white p-10 rounded shadow text-center">
      //     <h2 className="text-2xl font-bold">Loading...</h2>
      //   </div>
      // </div>
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
    groupedData[month][week].push({
      Program_Name: item.Program_Name,
      Is_External: item.Is_External === 1,
      Special_Position: item.Special_Position === 1,
      Is_Planned: item.Is_Planned === 1,
      Is_Additional: item.Is_Additional === 1,
    });
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
    const doc = new jsPDF("landscape", "mm", "a4");
    const year = selectedDate.getFullYear();
    const trainingType = trainingName;
    const monthsPerPage = trainingType === "HSE" ? 6 : 3;

    for (
      let pageIndex = 0;
      pageIndex < monthsInData.length;
      pageIndex += monthsPerPage
    ) {
      const chunk = monthsInData.slice(pageIndex, pageIndex + monthsPerPage);

      // Create hidden wrapper
      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.top = "-10000px";
      wrapper.style.left = "0";
      wrapper.style.padding = "0px";
      wrapper.style.width = "1222px";
      wrapper.style.backgroundColor = "white";

      // Create table
      const table = document.createElement("table");
      table.style.borderCollapse = "collapse";
      table.style.borderSpacing = "0";
      table.style.width = "100%";
      table.style.fontSize = "12px";
      table.style.tableLayout = "fixed";
      table.style.border = "0.5px solid #999";
      table.style.color = "black";
      table.style.margin = "0";
      table.style.padding = "0";

      // Header row
      const headerRow = document.createElement("tr");

      // "Months" header
      const monthHeader = document.createElement("th");
      monthHeader.textContent = "Months";
      monthHeader.style.border = "0.5px solid #999";
      monthHeader.style.verticalAlign = "middle";
      monthHeader.style.textAlign = "center";
      monthHeader.style.width = "80px";
      monthHeader.style.height = "40px";
      monthHeader.style.verticalAlign = "middle";
      monthHeader.style.lineHeight = "40px";
      monthHeader.style.padding = "0";
      monthHeader.style.fontSize = "14px";
      headerRow.appendChild(monthHeader);

      // "Weeks" header
      const weekHeader = document.createElement("th");
      weekHeader.textContent = "Weeks";
      weekHeader.colSpan = 5;
      weekHeader.style.border = "0.5px solid #999";
      weekHeader.style.textAlign = "center";
      weekHeader.style.backgroundColor = "#ffffff";
      weekHeader.style.colSpan = 5;
      weekHeader.style.height = "40px";
      weekHeader.style.verticalAlign = "middle";
      weekHeader.style.lineHeight = "40px";
      weekHeader.style.padding = "0";
      weekHeader.style.fontSize = "14px";
      headerRow.appendChild(weekHeader);

      table.appendChild(headerRow);

      // Data Rows (Each Month)
      chunk.forEach((month) => {
        const weeks = dynamicWeeksByMonth[month]?.slice(0, 5) || [];
        const monthKey = month.toLowerCase().slice(0, 3);

        // Week numbers row (directly under the month label)
        const weekNumberRow = document.createElement("tr");

        const monthCell = document.createElement("td");
        monthCell.textContent = month;
        monthCell.rowSpan =
          weeks.reduce((max, week) => {
            const len = groupedData[monthKey][week]?.length || 0;
            return Math.max(max, len);
          }, 1) + 1;

        monthCell.style.border = "0.5px solid #999";
        monthCell.style.textAlign = "center";
        monthCell.style.fontWeight = "bold";
        monthCell.style.backgroundColor = "#d0f1e8";
        monthCell.style.verticalAlign = "middle";
        monthCell.style.width = "80px";
        monthCell.style.fontSize = "14px";
        weekNumberRow.appendChild(monthCell);

        weeks.forEach((week) => {
          const weekCell = document.createElement("td");
          weekCell.textContent = `Week ${week}`;
          weekCell.style.border = "0.5px solid #999";
          weekCell.style.textAlign = "center";
          weekCell.style.verticalAlign = "middle";
          weekCell.style.height = "25px";
          weekCell.style.lineHeight = "40px";
          weekCell.style.padding = "0";
          weekCell.style.backgroundColor = "#fde0b8";
          weekCell.style.fontWeight = "bold";
          weekCell.style.fontSize = "14px";
          weekNumberRow.appendChild(weekCell);
        });

        table.appendChild(weekNumberRow);

        // Collect week-wise items
        const weekItems = weeks.map((week) => {
          return groupedData[monthKey]?.[week] || [];
        });

        const maxRows = Math.max(...weekItems.map((items) => items.length));

        // Add data rows under week numbers
        for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
          const row = document.createElement("tr");

          weeks.forEach((_, weekIndex) => {
            const cell = document.createElement("td");
            cell.style.border = "0.5px solid #999";
            cell.style.padding = "6px 6px";
            cell.style.verticalAlign = "top";
            cell.style.textAlign = "left";
            cell.style.lineHeight = "1.4";
            cell.style.height = "100%";
            cell.style.fontSize = "14px";

            const item = weekItems[weekIndex][rowIndex];
            if (item) {
              const div = document.createElement("div");
              div.style.marginBottom = "6px";
              div.style.padding = "2px 4px";
              div.style.borderRadius = "2px";
              div.style.display = "block";
              div.style.backgroundColor = "transparent";

              if (item.Is_External) {
                cell.style.backgroundColor = "#f0dff8";
                cell.style.color = "black";
              }
              if (item.Special_Position) {
                cell.style.backgroundColor = "#e6f7df";
                cell.style.color = "black";
              }

              div.textContent = `• ${item.Program_Name || item}`;
              div.innerHTML = `&#8226; ${item.Program_Name || item}`;
              div.style.paddingLeft = "15px";
              div.style.textIndent = "-10px";
              cell.appendChild(div);
            } else {
              const dash = document.createElement("div");
              dash.textContent = "-";
              dash.style.textAlign = "center";
              dash.style.color = "3px solid black";
              dash.style.padding = "4px";
              dash.style.fontStyle = "Times New Roman";
              cell.appendChild(dash);
            }

            row.appendChild(cell);
          });

          table.appendChild(row);
        }
      });

      wrapper.appendChild(table);
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");

      if (pageIndex > 0) doc.addPage();

      // Header
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      let title = "";

      if (trainingType === "HSE") {
        title = `${trainingType} Annual Training Plan - ${year}`;
      } else {
        title = `${trainingType} 16949 Annual Training Plan - ${year}`;
      }

      doc.text(title, 10, 10);
      const footerText =
        trainingType === "HSE"
          ? 'We are following "[S014001] & [S045001] CAPD Method 10.3 Continuous Improvement Spirit to improve our GTI"'
          : 'We are following "IATF16949 CAPD method 10.3 Continuous Improvement Spirit to improve our GTI"';

      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.text(footerText, 10, 16);

      // Table Image
      doc.addImage(imgData, "PNG", 10, 22, 277, 150); // x = 10

      //Add Page Number at Top Right
      const currentPage = pageIndex / monthsPerPage + 1;
      const totalPages = Math.ceil(monthsInData.length / monthsPerPage);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${currentPage} of ${totalPages}`,
        doc.internal.pageSize.getWidth() - 10,
        20,
        { align: "right" }
      );

      // Footer box dimensions
      const boxX = 10;
      const boxY = 172;
      const boxWidth = doc.internal.pageSize.getWidth() - 20;
      const boxHeight = 23;
      const boxRight = boxX + boxWidth;
      const boxBottom = boxY + boxHeight;

      // Draw footer rectangle border
      doc.setDrawColor("#999");
      doc.setLineWidth(0.3);
      doc.line(boxX, boxY, boxX, boxBottom); // Left border
      doc.line(boxRight, boxY, boxRight, boxBottom); // Right border
      doc.line(boxX, boxBottom, boxRight, boxBottom);
      doc.rect(boxX, boxY, boxWidth, boxHeight);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const signatureY = boxY + 20;
      doc.text("Prepared By", 30, signatureY);
      doc.text("Checked By", 130, signatureY);
      doc.text("Approved By", 230, signatureY);

      const footerInfoY = signatureY + 10;
      doc.setFontSize(8);

      doc.text("EDI 1.0", boxX + 2, footerInfoY);

      doc.text(
        "Greentech Industries (India) Pvt. Ltd.",
        doc.internal.pageSize.getWidth() / 2,
        footerInfoY,
        { align: "center" }
      );

      doc.text("HR-021-1", doc.internal.pageSize.getWidth() - 10, footerInfoY, {
        align: "right",
      });

      document.body.removeChild(wrapper);
    }

    doc.save(`${trainingType}_Annual_Training_${year}.pdf`);
  };

  return (
    <div className="max-w-full mx-auto bg-white p-2 w-full">
      <div className="bg-sky-400 text-white p-2 flex justify-between rounded-t-lg">
        <p className="font-semibold">Annual Training Calendar</p>
      </div>
<BackButton/>
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
          <div className="mx-2 flex items-center" style={{ minWidth: "250px" }}>
            <label htmlFor="training-select" className="mr-2 font-semibold ">
              Select Training:
            </label>
            <Select
              inputId="training-select"
              value={{
                value: trainingName,
                label:
                  trainingName === "IATF"
                    ? "IATF (International Automotive Task Force)"
                    : "HSE (Health, Safety, and Environment)",
              }}
              onChange={(selectedOption) =>
                setTrainingName(selectedOption.value)
              }
              options={[
                {
                  value: "IATF",
                  label: "IATF (International Automotive Task Force)",
                },
                {
                  value: "HSE",
                  label: "HSE (Health, Safety, and Environment)",
                },
              ]}
              isSearchable={false}
              classNamePrefix="react-select"
              styles={{
                control: (provided) => ({
                  ...provided,
                  padding: "2px",
                  borderColor: "#D1D5DB", // Tailwind sky-500
                  borderRadius: "0.5rem", // rounded-lg
                  cursor: "pointer",
                  minHeight: "38px",
                }),
                option: (provided, state) => ({
                  ...provided,
                  cursor: "pointer",
                  backgroundColor: state.isFocused ? "#E0F2FE" : "white", // Tailwind sky-100
                  color: "black",
                }),
              }}
            />
          </div>
        </div>
        <div className="hidden">text-green-600 text-blue-600 text-gray-800</div>

        {(accessRole === "HR_Res" || accessRole === "HR_Hod") && (
          <div>
            <button
              onClick={(e) => {
                e.preventDefault();
                generatePDF();
              }}
              className="ml-2 flex cursor-pointer items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-3 rounded"
              aria-label="Download Annual Calendar"
              title="Download Annual Calendar"
            >
              <FaPrint />
            </button>
          </div>
        )}

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
                  className="border border-gray-300 px-2 py-1 font-semibold  bg-blue-100 text-center align-middle whitespace-nowrap"
                  colSpan={6}
                >
                  <div className="text-center">
                    Annual Training Calendar for {trainingName}
                  </div>
                  <div className="mr-2 absolute right-2 transform -translate-y-5 flex space-x-4 text-sm">
                    <span className="text-green-600 font-semibold">
                      ● Special Position
                    </span>
                    <span className="text-blue-600 font-semibold">
                      ● Additional
                    </span>
                    <span className="text-purple-600 font-semibold">
                      ● External
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <th
                  className="border border-gray-300 px-2 py-1 font-semibold w-[60px] special-width bg-blue-200 text-center align-middle"
                  style={{ width: "60px", minWidth: "60px", maxWidth: "60px" }}
                >
                  Months
                </th>
                <td
                  className="border border-gray-300 px-1 py-1 w-24 text-center font-semibold bg-orange-200"
                  colSpan={6}
                >
                  Weeks
                </td>
              </tr>
              {monthsInData.map((month, index) => {
                const monthKey = monthAbbrMap[month].toLowerCase();
                const weeks = dynamicWeeksByMonth[month] || [];
                const weeksToShow = weeks.slice(0, 5);
                return (
                  <React.Fragment key={month}>
                    <tr>
                      <td
                        className="border border-gray-300 px-2 py-1 font-semibold w-[60px] bg-blue-100 text-center align-middle whitespace-nowrap"
                        rowSpan={2}
                        style={{
                          width: "60px",
                          minWidth: "60px",
                          maxWidth: "60px",
                        }}
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
                            className={`border border-gray-300 px-4 py-3 w-12 break-words whitespace-normal max-w-12 ${bgColor}`}
                          >
                            {groupedData[monthKey] &&
                              groupedData[monthKey][week] ? (
                              <ul className="list-disc list-outside pl-5 m-0 p-0">
                                {groupedData[monthKey][week].map(
                                  (item, idx) => {
                                    // Use Tailwind classes conditionally
                                    let textClass = "";

                                    if (item.Special_Position) {
                                      textClass = "text-green-600 font-semibold";
                                    } else if (item.Is_Additional) {
                                      textClass = "text-blue-600 font-semibold";
                                    } else if (item.Is_External) {
                                      textClass = "text-purple-600 font-semibold";
                                    }
                                    return (
                                      <li
                                        key={idx}
                                        className={`mb-1 break-words whitespace-normal max-w-full ${textClass}`}
                                      >
                                        {item.Program_Name}
                                      </li>
                                    );
                                  }
                                )}
                              </ul>
                            ) : (
                              "-"
                            )}
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
