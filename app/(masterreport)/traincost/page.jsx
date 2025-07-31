"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch, FaPrint } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";

const TrainingBudget = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("actual");

  // Common states
  const [selectedDate, setSelectedDate] = useState(() => {
    // Initialize selectedDate from localStorage if available
    const storedYear = localStorage.getItem("selectedYear");
    return storedYear ? new Date(parseInt(storedYear), 0, 1) : null;
  });
  const [trainingData, setTrainingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const rowsPerPage = "All";
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);

  // New state for additional training programs text field
  const [additionalTrainingProgramsText, setAdditionalTrainingProgramsText] =
    useState("");

  // New state for notes keyed by program_id
  const [notes, setNotes] = useState({});

  // New state for second tab data and search
  const [budgetVsActualData, setBudgetVsActualData] = useState([]);
  const [budgetVsActualSearchTerm, setBudgetVsActualSearchTerm] = useState("");
  const [budgetVsActualFilteredData, setBudgetVsActualFilteredData] = useState(
    []
  );
  const [budgetVsActualLoading, setBudgetVsActualLoading] = useState(false);
  const [budgetVsActualError, setBudgetVsActualError] = useState(null);
  const [budgetVsActualSelectedDate, setBudgetVsActualSelectedDate] = useState(null);


  // Add this helper function to separate total rows from regular rows
const separateTotalRows = (data) => {
  const totalRows = [];
  const regularRows = [];
  
  data.forEach((item) => {
    const isTotalRow = 
      item.Program_Name?.toString().toLowerCase().includes("total") ||
      item.Training_Name?.toString().toLowerCase().includes("total");
    
    if (isTotalRow) {
      totalRows.push(item);
    } else {
      regularRows.push(item);
    }
  });
  
  return { totalRows, regularRows };
};

// Modified sorting logic to keep total rows at bottom
const getSortedData = (data, sortConfig) => {
  const { totalRows, regularRows } = separateTotalRows(data);
  
  // Sort only the regular rows
  const sortedRegularRows = [...regularRows].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
  
  // Return regular rows first, then total rows
  return [...sortedRegularRows, ...totalRows];
};


 const checkFinalizationStatus = async (year) => {
  try {
    console.log("🔍 Checking finalization status for year:", year);
    
    // Reset finalization status first
    setIsFinalized(false);
    
    const response = await fetch(`/api/check_finalisation_status?year=${year}`);

    if (response.ok) {
      const data = await response.json();
      console.log("📋 Full API response:", JSON.stringify(data, null, 2));

      // Handle your specific API response format
      const finalizedStatus = data.isFinalized === true || data.is_finalized === true;
      console.log(" Extracted finalization status:", finalizedStatus);
      console.log("Record found:", data.recordFound);

      // Additional debugging
      if (data.recordFound && !finalizedStatus) {
        console.log(" Record found but not finalized - this might indicate the finalization didn't save properly");
      }

      setIsFinalized(finalizedStatus);
      
    } else {
      console.error(" API response not ok:", response.status, response.statusText);
      const errorData = await response.text();
      console.error(" Error response:", errorData);
      setIsFinalized(false);
    }
  } catch (error) {
    console.error(" Error checking finalization:", error);
    setIsFinalized(false);
  }
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
          if (
            data.Access_Role === "Res_Person" ||
            data.Access_Role === "HOS" ||
            data.Access_Role === "HOD"
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

  const fetchData = async (date) => {
    if (!date) {
      alert("Please select a year.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const year = date.getFullYear();
      const response = await fetch(`/api/get_training_budget_first?year=${year}`);

      if (!response.ok) {
        throw new Error("No data available.");
      }

      const data = await response.json();

      if (data && data.length === 0) {
        setError("No data available for the selected Year.");
        setFilteredData([]);
      } else {
        setTrainingData(data);
        setFilteredData(data);

        // Initialize notes state
        const initialNotes = {};
        data.forEach((item) => {
          if (item.Program_Id && item.Note) {
            initialNotes[item.Program_Id] = item.Note;
          }
        });
        setNotes(initialNotes);

        const additionalRow = data.find((item) =>
          item.Program_Name?.toLowerCase().includes("additional")
        );
        if (additionalRow) {
          setAdditionalTrainingProgramsText(
            additionalRow.Training_Budget?.toString() || ""
          );
        } else {
          setAdditionalTrainingProgramsText("");
        }
      }

      // IMPORTANT: Check finalization status after data is loaded
      await checkFinalizationStatus(year);

    } catch (err) {
      setError(err.message || "An error occurred while fetching data.");
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchBudgetVsActualData = async (date) => {
    if (!date) {
      alert("Please select a year.");
      return;
    }
    setBudgetVsActualLoading(true);
    setBudgetVsActualError(null);
    try {
      const year = date.getFullYear();
      const response = await fetch(`/api/get_training_budget?year=${year}`);
      if (!response.ok) {
        throw new Error("No data available.");
      }
      const data = await response.json();
      console.log(
        "BudgetVsActual first data item keys:",
        data.length > 0 ? Object.keys(data[0]) : "No data"
      );
      if (data && data.length === 0) {
        setBudgetVsActualError("No data available for the selected Year.");
        setBudgetVsActualFilteredData([]);
      } else {
        setBudgetVsActualData(data);
        setBudgetVsActualFilteredData(data);
      }
    } catch (err) {
      setBudgetVsActualError(
        err.message || "An error occurred while fetching data."
      );
      setBudgetVsActualFilteredData([]);
    } finally {
      setBudgetVsActualLoading(false);
    }
  };



  useEffect(() => {
    if (selectedDate && activeTab === "actual") {
      fetchData(selectedDate);
      // Removed redundant checkFinalizationStatus call here because fetchData calls it
    }
  }, [selectedDate, activeTab]);

  // Persist selectedDate year in localStorage when it changes
  useEffect(() => {
  if (selectedDate) {
    localStorage.setItem("selectedYear", selectedDate.getFullYear().toString());
  } else {
    localStorage.removeItem("selectedYear");
    setIsFinalized(false); // Reset finalized state when year is cleared
  }
}, [selectedDate]);

  useEffect(() => {
    if (budgetVsActualSelectedDate && activeTab === "budgetVsActual")
      fetchBudgetVsActualData(budgetVsActualSelectedDate);
  }, [budgetVsActualSelectedDate, activeTab]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // const sortedData = [...filteredData].sort((a, b) => {
  //   if (!sortConfig.key) return 0;
  //   const aVal = a[sortConfig.key];
  //   const bVal = b[sortConfig.key];
  //   if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
  //   if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
  //   return 0;
  // });

  // const sortedBudgetVsActualData = [...budgetVsActualFilteredData].sort(
  //   (a, b) => {
  //     if (!sortConfig.key) return 0;
  //     const aVal = a[sortConfig.key];
  //     const bVal = b[sortConfig.key];
  //     if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
  //     if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
  //     return 0;
  //   }
  // );
const sortedData = getSortedData(filteredData, sortConfig);
const sortedBudgetVsActualData = getSortedData(budgetVsActualFilteredData, sortConfig);
  const paginatedData = sortedData;
  const paginatedBudgetVsActualData = sortedBudgetVsActualData;

  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value;
    setTableSearchTerm(searchQuery);
    if (!searchQuery) {
      setFilteredData(trainingData);
    } else {
      const lowerSearchQuery = searchQuery.toLowerCase();
      const filtered = trainingData.filter((trainer) => {
        const isTotalRow =
          trainer.Program_Name?.toString().toLowerCase().includes("total") ||
          trainer.Training_Name?.toString().toLowerCase().includes("total");
        return (
          !isTotalRow &&
          [
            "Program_Name",
            "Req_Months",
            "Department",
            "Training_Date",
            "Training_Name",
            "Train_Mode",
            "Schedule_Type",
            "Training_Status",
            "Training_Budget",
            "Note"
          ].some((field) =>
            trainer[field]?.toString().toLowerCase().includes(lowerSearchQuery)
          )
        );
      });
      setFilteredData(filtered);
    }
  };

  const handleBudgetVsActualSearchChange = (e) => {
    const searchQuery = e.target.value;
    setBudgetVsActualSearchTerm(searchQuery);
    if (!searchQuery) {
      setBudgetVsActualFilteredData(budgetVsActualData);
    } else {
      const lowerSearchQuery = searchQuery.toLowerCase();
      const filtered = budgetVsActualData.filter((trainer) => {
        const isTotalRow =
          trainer.Program_Name?.toString().toLowerCase().includes("total") ||
          trainer.Training_Name?.toString().toLowerCase().includes("total");
        return (
          !isTotalRow &&
          [
            "Program_Name",
            "Department",
            "Schedule_Month",
            "Req_Months",
            "Training_Date",
            "Training_Name",
            "Train_Mode",
            "Schedule_Type",
            "Training_Status",
            "Training_Budget",
            "Actual_Budget",
            
          ].some((field) =>
            trainer[field]?.toString().toLowerCase().includes(lowerSearchQuery)
          )
        );
      });
      setBudgetVsActualFilteredData(filtered);
    }
  };

  const handleClearTableSearch = () => {
    setTableSearchTerm("");
    setFilteredData(trainingData);
  };

  const handleClearBudgetVsActualSearch = () => {
    setBudgetVsActualSearchTerm("");
    setBudgetVsActualFilteredData(budgetVsActualData);
  };

  // Render table rows with conditional text field for additional training programs in actual tab
  const renderActualBudgetTableRows = (data, isActualTab = true, isFinalized = false) => {
    return data.map((item, index) => {
      const isTotalRow =
        item.Program_Name?.toString().toLowerCase().includes("total") ||
        item.Training_Name?.toString().toLowerCase().includes("total");

      return (
        <tr
          key={index}
          className={`border ${isTotalRow ? "bg-gray-200" : "hover:bg-gray-100"}`}
        >
          <td className="px-4 py-2 border">{item.Program_Name}</td>
          <td className="px-4 py-2 border">{item.Department}</td>
          <td className="px-4 py-2 border">{item.Req_Months}</td>
          <td className="px-4 py-2 border">{item.Training_Name}</td>

          <td className="px-4 py-2 border text-right">
            {isActualTab && item.Program_Name?.toLowerCase().includes("additional") ? (
              <input
                type="number"
                value={additionalTrainingProgramsText}
                onChange={(e) => setAdditionalTrainingProgramsText(e.target.value)}
                className={`w-full p-1 border border-gray-300 rounded ${isFinalized ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                placeholder="Enter Training Budget"
                disabled={isFinalized}
                readOnly={isFinalized}
              />
            ) : (
              item.Training_Budget
            )}
          </td>

          <td className="px-4 py-2 border">
            {item.Program_Id && !item.Program_Name?.toLowerCase().includes("total") ? (
              <input
                type="text"
                value={
                  notes[item.Program_Id] !== undefined
                    ? notes[item.Program_Id]
                    : item.Note || ""
                }
                onChange={(e) =>
                  setNotes((prev) => ({
                    ...prev,
                    [item.Program_Id]: e.target.value,
                  }))
                }
                className={`w-full p-1 border border-gray-300 rounded ${isFinalized ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                placeholder="Enter note"
                disabled={isFinalized}
                readOnly={isFinalized}
              />
            ) : (
              ""
            )}
          </td>
        </tr>
      );
    });
  };


  const renderActualVSEstimatedTableRows = (data, isActualTab = true) => {
    return data.map((item, index) => {
      const isTotalRow =
        item.Program_Name?.toString().toLowerCase().includes("total") ||
        item.Training_Name?.toString().toLowerCase().includes("total");
      return (
        <tr
          key={index}
          className={`border ${isTotalRow ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
        >
          <td className="px-4 py-2 border">{item.Program_Name}</td>
          <td className="px-4 py-2 border">{item.Department}</td>
          <td className="px-4 py-2 border">{item.Req_Months}</td>
          <td className="px-4 py-2 border">{item.Training_Date ?? ""}</td>
          <td className="px-4 py-2 border">{item.Training_Name}</td>
          <td className="px-4 py-2 border">{item.Train_Mode}</td>
          <td className="px-4 py-2 border">{item.Schedule_Type}</td>
          <td className="px-4 py-2 border text-right">
            {isActualTab &&
              item.Program_Name?.toLowerCase().includes("additional") ? (
              <input
                type="number"
                value={additionalTrainingProgramsText}
                onChange={(e) =>
                  setAdditionalTrainingProgramsText(e.target.value)
                }
                className="w-full p-1 border border-gray-300 rounded"
                placeholder="Enter Training Budget"
              />
            ) : (
              item.Training_Budget
            )}
          </td>
          <td className="px-4 py-2 border text-right">{item.Actual_Budget}</td>
          <td className="px-4 py-2 border">{item.Training_Status}</td>
        </tr>
      );
    });
  };

  if (isAuthorized === null) {
    return <div>Loading...</div>;
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
  const generateBudgetPDF = (type) => {
    const isActual = type === "actual";
    const orientation = isActual ? "portrait" : "landscape";
    const doc = new jsPDF(orientation, "mm", "a4");
    const year = isActual
      ? selectedDate?.getFullYear()
      : budgetVsActualSelectedDate?.getFullYear();
    const dateStr = new Date().toLocaleDateString("en-GB");

    const data = isActual ? filteredData : budgetVsActualFilteredData;

    if (!year || !data || data.length === 0) {
      alert("Please select a valid year and ensure data is available.");
      return;
    }

    const title = isActual
      ? "External Trainings Estimated Budget"
      : "External Trainings Estimated Budget Vs. Actual Cost";

    // Header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TRAINING AND DEVELOPMENT", 15, 15);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${title} - ${year}`, 15, 23);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      'We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit to improve our GTI"',
      15,
      28
    );

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Approved By", 15, 50);
    doc.text("Checked By", 80, 50);

    let headers, tableData, columnStyles;

    if (isActual) {
      headers = [
        [
          "S.No",
          "Training Topic",
          "Req. Dep.",
          "Scheduled Month",
          "Type",
          "Estimated Cost in Rs./-",
        ],
      ];

      tableData = data.map((item, index) => [
        index + 1,
        item.Program_Name,
        item.Department || "",
        item.Req_Months || "",
        item.Training_Name || "",
        item.Training_Budget != null && !isNaN(item.Training_Budget)
          ? parseFloat(item.Training_Budget).toLocaleString()
          : " ",
      ]);

      columnStyles = {
        0: { halign: "center", cellWidth: 12 }, // S.No
        5: { halign: "right" }, // Estimated Cost
      };
    } else {
      headers = [
        [
          "S.No",
          "Training Topic",
          "Req. Dep.",
          "Scheduled Month",
          "Conducted Date",
          "Type",
          // "Mode",
          // "Schedule Type",
          "Est. Cost in Rs./-",
          "Act. Cost in Rs./-",
          "Remarks",
        ],
      ];

      tableData = data.map((item, index) => [
        index + 1,
        item.Program_Name,
        item.Department || "",
        item.Req_Months || "",
        item.Training_Date || "",
        item.Training_Name || "",
        // item.Train_Mode || "",
        // item.Schedule_Type || "",
        item.Training_Budget != null && !isNaN(item.Training_Budget)
          ? parseFloat(item.Training_Budget).toLocaleString()
          : " ",
        item.Actual_Budget != null && !isNaN(item.Actual_Budget)
          ? parseFloat(item.Actual_Budget).toLocaleString()
          : " ",
        item.Training_Status || "",
      ]);

      columnStyles = {
        0: { halign: "center", cellWidth: 12 }, // S.No
        6: { halign: "right" }, // Estimated
        7: { halign: "right" }, // Actual
      };
    }

    const table = autoTable(doc, {
      startY: 60,
      head: headers,
      body: tableData,
      theme: "grid",
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || pageSize.getHeight();
        const pageWidth = pageSize.width || pageSize.getWidth();
        const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(`Page: ${pageCurrent} of ${pageCount}`, pageWidth - 40, 15);
        doc.text(`Date: ${dateStr}`, pageWidth - 40, 20);

        const footerText = `Greentech Industries (India) Pvt. Ltd @ HR By Syam Prasad`;
        const textWidth = doc.getTextWidth(footerText);
        const centerX = (pageWidth - textWidth) / 2;

        doc.text(footerText, centerX, pageHeight - 10);
      },
      styles: {
        fontSize: 9,
        halign: "left",
        valign: "middle",
        lineWidth: 0.2,
        lineColor: [150, 150, 150],
      },
      headStyles: {
        fillColor: [230, 230, 250],
        textColor: [60, 60, 60],
      },
      columnStyles: columnStyles,
    });

    const notes = data
      .map((item) => item.Note?.trim())
      .filter((note, index, self) => note && self.indexOf(note) === index);

    if (notes.length > 0) {
      const finalY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Note:", 15, finalY);

      doc.setFont("helvetica", "normal");

      notes.forEach((note, idx) => {
        const bullet = `\u2022 ${note}`;
        doc.text(bullet, 20, finalY + (idx + 1) * 6);
      });
    }

    // Add total row if needed (optional)
    const total = data.reduce(
      (sum, item) => sum + (parseFloat(item.Training_Budget) || 0),
      0
    );

    const fileName = isActual
      ? `External_Training_Budget_${year}.pdf`
      : `Training_Budget_vs_Actual_${year}.pdf`;

    doc.save(fileName);
  };

  return (
    <div className="max-w-full mx-auto bg-white p-2 shadow-md rounded-lg w-full">
      <div className="bg-sky-400 text-white p-2 rounded-t-lg flex items-center justify-between">
        {/* Left side: Title + Tabs */}
        <div className="flex items-center space-x-4">
          <h1 className="font-semibold">Training Cost</h1>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeTab === "actual"
              ? "bg-white text-sky-600 shadow-sm"
              : "text-white hover:bg-sky-300"
              }`}
            onClick={() => setActiveTab("actual")}
          >
            Actual Training Budget
          </button>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeTab === "budgetVsActual"
              ? "bg-white text-sky-600 shadow-sm"
              : "text-white hover:bg-sky-300"
              }`}
            onClick={() => setActiveTab("budgetVsActual")}
          >
            Training Budget vs Actual Budget
          </button>
        </div>

        {/* Right side: Print Button */}
        <div>
          <button
            onClick={(e) => {
              e.preventDefault();
              generateBudgetPDF(activeTab);
            }}
            className="flex items-center cursor-pointer space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-3 rounded"
            aria-label="Export PDF"
            title="Export PDF"
          >
            <FaPrint />
          </button>
        </div>
      </div>

      {activeTab === "actual" && (
        <>


          <div className="my-4 relative z-50">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Year</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy"
                showYearPicker
                placeholderText="Select Year"
                className="p-2 border border-gray-300 rounded-lg"
                calendarClassName="z-50"
                popperPlacement="top-start"
                isClearable
                isSearchable
                required
                
                popperModifiers={{
                  preventOverflow: {
                    enabled: true,
                    boundariesElement: "viewport",
                  },
                }}
              />
            </div>
          </div>

          {loading && <p>Loading...</p>}
          {error && (
            <div className="flex justify-center items-center h-64 text-center text-red-500 mt-4">
              <p>{error}</p>
            </div>
          )}

          {selectedDate && !loading && !error && (
            <div className="card-body p-0 pb-3">
              <div className="p-4 bg-card">
                <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm"></div>
                  <div className="relative">
                    <input
                      type="text"
                      value={tableSearchTerm}
                      onChange={handleTableSearchChange} // Remove the conditional check here
                      placeholder="Search..."
                      className={`border p-1 pl-8 rounded bg-secondary 
                        }`}
                      // disabled={isFinalized}
                      // readOnly={isFinalized}
                    />
                    <FaSearch className="absolute left-2 top-2 text-gray-400" />
                  </div>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
                  <table
                    className="min-w-full border z-0 rounded-lg bg-card text-sm"
                    style={{ tableLayout: "fixed", fontSize: "13px" }}
                  >
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        {[
                          { key: "Program_Name", label: "Category" },
                          { key: "Department", label: "Department" },
                          { key: "Req_Months", label: "Scheduled Month" },
                          { key: "Training_Name", label: "Type" },
                          { key: "Training_Budget", label: "Estimated Budget" },
                          { key: "Note", label: "Note" },
                        ].map(({ key, label }, index) => (
                          <th
                            key={key}
                            className={`px-4 py-2 border text-left cursor-pointer ${index === 0 ? "sticky left-0 bg-muted z-20" : ""
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
                      {renderActualBudgetTableRows(paginatedData, true, isFinalized)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Show buttons ONLY when not finalized */}
          {console.log("Button visibility check:", {
            selectedDate: !!selectedDate,
            hasData: filteredData.length > 0,
            noError: !error,
            isFinalized: isFinalized,
            shouldShowButtons: selectedDate && filteredData.length > 0 && !error && !isFinalized
          })}

          {selectedDate && filteredData.length > 0 && !error && !isFinalized && (
            <div className="flex justify-end mt-4 space-x-3">
              <button
                className="px-6 mt-2 cursor-pointer py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
                onClick={async () => {
                  try {
                    if (!selectedDate) {
                      alert("Please select a year before saving.");
                      return;
                    }

                    const year = selectedDate.getFullYear();

                    // Save additional budget
                    const additionalResponse = await fetch("/api/insert_additional_budget", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        Year_No: year,
                        Add_Budget: Number(additionalTrainingProgramsText) || 0,
                        createdBy: employeeId || "",
                      }),
                    });

                    if (!additionalResponse.ok) {
                      throw new Error("Failed to save additional budget");
                    }

                    // Save notes
                    const notesPromises = Object.entries(notes).map(([programId, note]) => {
                      if (note && note.trim()) {
                        return fetch("/api/save_training_note", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            Program_Id: programId,
                            Note: note.trim(),
                            Year_No: year,
                            updatedBy: employeeId || "",
                          }),
                        });
                      }
                      return Promise.resolve();
                    });

                    await Promise.all(notesPromises);

                    alert("Additional budget and notes saved successfully");
                  } catch (error) {
                    console.error("Save error:", error);
                    alert("Error saving additional budget and notes: " + error.message);
                  }
                }}
              >
                Save
              </button>

              <button
                className="px-6 mt-2 cursor-pointer py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                onClick={async () => {
                  if (window.confirm("Are you sure you want to finalize? This action cannot be undone.")) {
                    try {
                      const year = selectedDate.getFullYear();

                      const response = await fetch("/api/finalise_additional_budget", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          Year_No: year,
                          UpdatedBy: employeeId || "",
                        }),
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || "Failed to finalize additional budget");
                      }

                      setIsFinalized(true);
                      alert("Form has been finalized successfully!");

                    } catch (error) {
                      console.error("Finalization error:", error);
                      alert("Error finalizing additional budget: " + error.message);
                    }
                  }
                }}
              >
                Finalize
              </button>
            </div>
          )}

          {/* Show finalized status when form is finalized */}
          {isFinalized && selectedDate && (
            <div className="flex justify-center mt-4">
              <div className="px-6 py-2 bg-green-100 text-green-800 rounded-md border border-green-300">
                <span className="font-semibold">✅ Form has been finalized </span>
              </div>
            </div>
          )}

        </>

      )}

      {activeTab === "budgetVsActual" && (
        <>
          <div className="my-4 relative z-50">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Year</label>
              <DatePicker
                selected={budgetVsActualSelectedDate}
                onChange={(date) => setBudgetVsActualSelectedDate(date)}
                dateFormat="yyyy"
                showYearPicker
                placeholderText="Select Year"
                className="p-2 border border-gray-300 rounded-lg"
                calendarClassName="z-50"
                popperPlacement="top-start"
                isClearable
                isSearchable
                required
                popperModifiers={{
                  preventOverflow: {
                    enabled: true,
                    boundariesElement: "viewport",
                  },
                }}
              />
            </div>
          </div>
          {budgetVsActualLoading && <p>Loading...</p>}
          {budgetVsActualError && (
            <div className="flex justify-center items-center h-64 text-center text-red-500 mt-4">
              <p>{budgetVsActualError}</p>
            </div>
          )}
          {budgetVsActualSelectedDate &&
            !budgetVsActualLoading &&
            !budgetVsActualError && (
              <div className="card-body p-0 pb-3">
                <div className="p-4 bg-card">
                  <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
                    <div className="flex items-center space-x-2 text-sm"></div>
                    <div className="relative">
                      <input
                        type="text"
                        value={budgetVsActualSearchTerm}
                        onChange={handleBudgetVsActualSearchChange}
                        placeholder="Search..."
                        className="border p-1 pl-8 rounded bg-secondary"
                      />
                      <FaSearch className="absolute left-2 top-2 text-gray-400" />
                    </div>
                  </div>
                  <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
                    <table
                      className="min-w-full border z-0 rounded-lg bg-card text-sm"
                      style={{ tableLayout: "fixed", fontSize: "13px" }}
                    >
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          {[
                            { key: "Program_Name", label: "Category" },
                            { key: "Department", label: "Department" },
                            { key: "Req_Months", label: "Scheduled Month" },
                            { key: "Training_Date", label: "Conducted Date" },
                            { key: "Training_Name", label: "Type" },
                            { key: "Train_Mode", label: "Mode" },
                            { key: "Schedule_Type", label: "Schedule Type" },
                            {
                              key: "Training_Budget",
                              label: "Estimated Budget",
                            },
                            { key: "Actual_Budget", label: "Actual Budget" },
                            {
                              key: "Training_Status",
                              label: "Remarks",
                            },
                          ].map(({ key, label }, index) => (
                            <th
                              key={key}
                              className={`px-4 py-2 border text-left cursor-pointer ${index === 0 ? "sticky left-0 bg-muted z-20" : ""
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
                        {renderActualVSEstimatedTableRows(
                          paginatedBudgetVsActualData,
                          false
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default TrainingBudget;
