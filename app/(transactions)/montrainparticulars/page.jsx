"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch, FaPrint } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BackButton from "@/components/BackButton";

const MonthlyTrainingParticulars = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [trainingData, setTrainingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [employeeId, setEmployeeId] = useState(null);
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const getMonthNumber = (date) => (date ? date.getMonth() + 1 : null);

  const fetchData = async (date) => {
    if (!date) return;

    setLoading(true);
    setError(null);
    setFilteredData([]);

    try {
      const response = await fetch(
        `/api/get_monthly_particulars?month=${getMonthNumber(
          date
        )}&year=${date.getFullYear()}`
      );

      if (!response.ok) {
        throw new Error("No training data available for the selected month.");
      }

      const data = await response.json();

      if (data && data.length === 0) {
        setError("No training data available for the selected month.");
        setFilteredData([]);
      } else {
        setTrainingData(data);
        setFilteredData(data);
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching data.");
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) fetchData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, filteredData]);

  useEffect(() => {
    if (selectedDate) {
      fetchData(selectedDate);
      setRowsPerPage(10);
      setCurrentPage(1);
    }
  }, [selectedDate]);
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId");

    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
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
            data.Access_Role === "HOS" ||
            data.Access_Role === "HOD" ||
            data.Access_Role === "Res_Person"
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
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedData =
    rowsPerPage === "All"
      ? sortedData
      : sortedData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value;
    setTableSearchTerm(searchQuery);

    if (!searchQuery) {
      setFilteredData(trainingData);
    } else {
      const filtered = trainingData.filter((trainer) =>
        [
          "Program_Name",
          "Req_Months",
          "Training_Date",
          "Training_Name",
          "Train_Mode",
          "Schedule_Type",
          "Training_Status",
        ].some((field) =>
          trainer[field]
            ?.toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  };

  const handleClearTableSearch = () => {
    setTableSearchTerm("");
    setFilteredData(trainingData);
  };
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

const handleDownloadPDF = () => {
    if (!selectedDate) {
      alert("please select the month and year");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    // Header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TRAINING AND DEVELOPMENT", 14, 15);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Training Particulars - ${
        selectedDate
          ? selectedDate.toLocaleString("default", { month: "short" }) +
            `'${selectedDate.getFullYear().toString().slice(-2)}`
          : ""
      }`,
      14,
      20
    );

    doc.setFontSize(7);
    doc.text(
      `We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit to improve our GTI"`,
      14,
      24
    );

    // Table headers and rows
    const headers = [
      [
        "S.No",
        "Program Name",
        "Scheduled Month",
        "Conducted on",
        "Category",
        "Mode",
        "*P vs. *A",
        "Status",
      ],
    ];

    const dataRows = trainingData.map((item, index) => [
      index + 1,
      item.Program_Name || "",
      item.Req_Months || "",
      item.Training_Date || "",
      item.Training_Name || "",
      item.Train_Mode || "",
      item.Schedule_Type || "",
      item.Training_Status || "",
    ]);

    autoTable(doc, {
      startY: 32,
      head: headers,
      body: dataRows,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 1.8,
        valign: "middle",
        halign: "center",
      },
      styles: {
        fontSize: 8,
        cellPadding: 1.8,
        valign: "middle",
        halign: "left",
        lineWidth: 0.1,
        lineColor: "#5f5e5e",
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 0,
        fontStyle: "bold",
        halign: "center",
        lineWidth: 0.1,
        lineColor: "#5f5e5e",
      },
      didDrawPage: function (data) {
        // Page number and current date
        const pageSize = doc.internal.pageSize;
        const pageWidth = pageSize.getWidth();
        const pageHeight = pageSize.getHeight();
        const currentDate = new Date().toLocaleDateString("en-GB");
        const pageCount = doc.internal.getNumberOfPages();
        const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8);
        doc.text(
          `Page: ${String(pageCurrent).padStart(2, "0")} of ${String(
            pageCount
          ).padStart(2, "0")}`,
          pageWidth - 40,
          20
        );
        doc.text(`Date: ${currentDate}`, pageWidth - 40, 24);
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text("Prepared By", 25, pageHeight - 30);
        doc.text("Checked By", pageWidth / 2 - 15, pageHeight - 30);
        doc.text("Approved By", pageWidth - 50, pageHeight - 30);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          "Greentech Industries (India) Pvt. Ltd @ HR By Syam Prasad",
          pageWidth / 2,
          pageHeight - 5,
          {
            align: "center",
          }
        );
      },
      margin: { top: 32, bottom: 30 },
    });

    const filename = `Monthly_Training_${selectedDate?.toLocaleString(
      "default",
      { month: "short" }
    )}_${selectedDate?.getFullYear()}.pdf`;

    doc.save(filename);
  };

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
  return (
    <div className="max-w-full mx-auto bg-white p-2 shadow-md rounded-lg w-full">
      <div className="bg-sky-400 text-white p-2 rounded-t-lg">
        <h1 className="font-semibold">Monthly Training Particulars</h1>
      </div>
<BackButton/>
      {/* Display only month dropdown initially */}
      <div className="my-4 flex justify-between items-center">
        {/* Left: Month Picker */}
        <div className="relative z-30 flex items-center space-x-2">
          <label className="text-sm font-medium">Month</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            placeholderText="Select Month and Year"
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

        {/* Right: Download Button */}
       { selectedDate && filteredData.length > 0  && (
        <div>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center cursor-pointer mr-2 space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-3 rounded"
            aria-label="Download PDF"
            title="Download PDF"
          >
            <FaPrint />
          </button>
        </div>
       )}
      </div>

      {/* Display loading and error messages */}
      {loading && <p>Loading...</p>}

      {error && (
        <div className="flex justify-center items-center h-64 text-center text-red-500 mt-4">
          <p>{error}</p>
        </div>
      )}

      {/* Display the data once the month is selected */}
      {selectedDate && !loading && !error && (
        <div className="card-body p-0 pb-3">
          <div className="p-4 bg-card">
            <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <span>Show</span>
                <select
                  className="border p-1 rounded bg-secondary"
                  value={rowsPerPage}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRowsPerPage(val === "All" ? "All" : parseInt(val));
                    setCurrentPage(1);
                  }}
                >
                  {[10, 15, 25, 50, 100, "All"].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <span>entries</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={tableSearchTerm}
                  onChange={handleTableSearchChange}
                  placeholder="Search..."
                  className="border p-1 pl-8 rounded bg-secondary"
                />
                <FaSearch className="absolute left-2 top-2 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto ">
              <table
                className="min-w-full border relative z-0 bg-card text-sm "
                style={{
                  tableLayout: "fixed",
                  fontSize: "13px",
                  padding: "1px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <thead className="bg-muted top-0 z-0">
                  <tr>
                    {[
                      { key: "Program_Name", label: "Program_Name" },
                      { key: "Req_Months", label: "Scheduled Month" },
                      { key: "Training_Date", label: "Conducted Date" },
                      { key: "Training_Name", label: "Category" },
                      { key: "Train_Mode", label: "Mode" },
                      { key: "Schedule_Type", label: "Schedule Type" },
                      { key: "Training_Status", label: "Training Status" },
                    ].map(({ key, label }, index) => (
                      <th
                        key={key}
                        className={`px-4 py-2 border text-left cursor-pointer ${
                          index === 0 ? "sticky left-0 bg-muted z-20" : ""
                        }`}
                        onClick={() => handleSort(key)}
                      >
                        {label}{" "}
                        {sortConfig.key === key
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-100 border">
                        <td className="px-4 py-2 border">
                          {item.Program_Name}
                        </td>
                        <td className="px-4 py-2 border">{item.Req_Months}</td>
                        <td className="px-4 py-2 border">
                          {item.Training_Date
                            ? new Date(item.Training_Date).toLocaleDateString()
                            : ""}
                        </td>
                        <td className="px-4 py-2 border">
                          {item.Training_Name}
                        </td>
                        <td className="px-4 py-2 border">{item.Train_Mode}</td>
                        <td className="px-4 py-2 border">
                          {item.Schedule_Type}
                        </td>
                        <td className="px-4 py-2 border">
                          {item.Training_Status}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-4 text-center text-gray-500"
                      >
                        No matching training data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {
              <div className="flex flex-wrap justify-between items-center mt-4 text-sm">
                <div>
                  Showing{" "}
                  {filteredData.length > 0
                    ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                        currentPage * rowsPerPage,
                        filteredData.length
                      )} of ${filteredData.length} entries`
                    : "0 entries"}
                </div>

                <div className="flex space-x-1">
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    {"<<"}
                  </button>
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    {"<"}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 border rounded ${
                        currentPage === i + 1 ? "bg-black text-white" : ""
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    {">"}
                  </button>
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    {">>"}
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyTrainingParticulars;

