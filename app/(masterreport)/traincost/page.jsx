"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch } from "react-icons/fa";

const TrainingBudget = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('actual');

  // Common states
  const [selectedDate, setSelectedDate] = useState(null);
  const [trainingData, setTrainingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const rowsPerPage = "All";
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [employeeId,setEmployeeId] = useState(null);

  // New state for additional training programs text field
  const [additionalTrainingProgramsText, setAdditionalTrainingProgramsText] = useState("");
  
  // New state for second tab data and search
  const [budgetVsActualData, setBudgetVsActualData] = useState([]);
  const [budgetVsActualSearchTerm, setBudgetVsActualSearchTerm] = useState("");
  const [budgetVsActualFilteredData, setBudgetVsActualFilteredData] = useState([]);
  const [budgetVsActualLoading, setBudgetVsActualLoading] = useState(false);
  const [budgetVsActualError, setBudgetVsActualError] = useState(null);
  const [budgetVsActualSelectedDate, setBudgetVsActualSelectedDate] = useState(null);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    }
    const fetchAccessRole = async () => {
      try {
        const res = await fetch(`/api/get_access_role?employeeId=${storedEmployeeId}`);
        const data = await res.json();
        if (res.ok && data.Access_Role) {
          if (data.Access_Role === "Res_Person" || data.Access_Role === "HOS" || data.Access_Role === "HOD") {
            setIsAuthorized(false);
            return;
          }
          setAccessRole(data.Access_Role);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error fetching access role:', error);
        setIsAuthorized(false);
      }
    };
    fetchAccessRole();
  }, []);

  const fetchData = async (date) => {
    if (!date) {
      alert('Please select a year.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const year = date.getFullYear();
      const response = await fetch(`/api/get_training_budget_first?year=${year}`);
      if (!response.ok) {
        throw new Error('No data available.');
      }
      const data = await response.json();
      if (data && data.length === 0) {
        setError("No data available for the selected Year.");
        setFilteredData([]);
      } else {
        setTrainingData(data);
        setFilteredData(data);
        // Set additionalTrainingProgramsText from "additional" row if exists
        const additionalRow = data.find(item => item.Program_Name?.toLowerCase().includes("additional"));
        if (additionalRow) {
          setAdditionalTrainingProgramsText(additionalRow.Training_Budget != null ? additionalRow.Training_Budget.toString() : "");
        } else {
          setAdditionalTrainingProgramsText("");
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching data.");
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetVsActualData = async (date) => {
    if (!date) {
      alert('Please select a year.');
      return;
    }
    setBudgetVsActualLoading(true);
    setBudgetVsActualError(null);
    try {
      const year = date.getFullYear();
      const response = await fetch(`/api/get_training_budget?year=${year}`);
      if (!response.ok) {
        throw new Error('No data available.');
      }
      const data = await response.json();
      if (data && data.length === 0) {
        setBudgetVsActualError("No data available for the selected Year.");
        setBudgetVsActualFilteredData([]);
      } else {
        setBudgetVsActualData(data);
        setBudgetVsActualFilteredData(data);
      }
    } catch (err) {
      setBudgetVsActualError(err.message || "An error occurred while fetching data.");
      setBudgetVsActualFilteredData([]);
    } finally {
      setBudgetVsActualLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && activeTab === 'actual') fetchData(selectedDate);
  }, [selectedDate, activeTab]);

  useEffect(() => {
    if (budgetVsActualSelectedDate && activeTab === 'budgetVsActual') fetchBudgetVsActualData(budgetVsActualSelectedDate);
  }, [budgetVsActualSelectedDate, activeTab]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const sortedBudgetVsActualData = [...budgetVsActualFilteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

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
        const isTotalRow = (trainer.Program_Name?.toString().toLowerCase().includes("total") || trainer.Training_Name?.toString().toLowerCase().includes("total"));
        return !isTotalRow && ["Program_Name", "Req_Months", "Training_Date", "Training_Name", "Train_Mode", "Schedule_Type", "Training_Status", "Training_Budget"]
          .some((field) => trainer[field]?.toString().toLowerCase().includes(lowerSearchQuery));
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
        const isTotalRow = (trainer.Program_Name?.toString().toLowerCase().includes("total") || trainer.Training_Name?.toString().toLowerCase().includes("total"));
        return !isTotalRow && ["Program_Name", "Req_Months", "Training_Date", "Training_Name", "Train_Mode", "Schedule_Type", "Training_Status", "Training_Budget"]
          .some((field) => trainer[field]?.toString().toLowerCase().includes(lowerSearchQuery));
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
  const renderTableRows = (data, isActualTab = true) => {
    return data.map((item, index) => {
      const isTotalRow = (item.Program_Name?.toString().toLowerCase().includes("total") || item.Training_Name?.toString().toLowerCase().includes("total"));
      return (
        <tr key={index} className={`border ${isTotalRow ? "bg-gray-200" : "hover:bg-gray-100"}`}>
          <td className="px-4 py-2 border">{item.Program_Name}</td>
          <td className="px-4 py-2 border">{item.Department}</td>
          <td className="px-4 py-2 border">{item.Req_Months}</td>
          <td className="px-4 py-2 border">{item.Training_Date ?? ""}</td>
          <td className="px-4 py-2 border">{item.Training_Name}</td>
          <td className="px-4 py-2 border">{item.Train_Mode}</td>
          <td className="px-4 py-2 border">{item.Schedule_Type}</td>
          <td className="px-4 py-2 border">{item.Training_Status}</td>
          <td className="px-4 py-2 border text-right">
            {isActualTab && item.Program_Name?.toLowerCase().includes("additional") ? (
              <input
                type="number"
                value={additionalTrainingProgramsText}
                onChange={(e) => setAdditionalTrainingProgramsText(e.target.value)}
                className="w-full p-1 border border-gray-300 rounded"
                placeholder="Enter Training Budget"
              />
            ) : (
              item.Training_Budget
            )}
          </td>
          <td className="px-4 py-2 border text-right">{item.Actual_Budget}</td>
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

  return (
    <div className="max-w-full mx-auto bg-white p-2 shadow-md rounded-lg w-full">
      <div className="bg-sky-400 text-white p-2 rounded-t-lg flex items-center space-x-4">
        <h1 className="font-semibold">Training Cost</h1>
        <button
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'actual' ? 'bg-white text-sky-600 shadow-sm' : 'text-white hover:bg-sky-300'
          }`}
          onClick={() => setActiveTab('actual')}
        >
          Actual Training Budget
        </button>
        <button
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'budgetVsActual' ? 'bg-white text-sky-600 shadow-sm' : 'text-white hover:bg-sky-300'
          }`}
          onClick={() => setActiveTab('budgetVsActual')}
        >
          Training Budget vs Actual Budget
        </button>
      </div>

      {activeTab === 'actual' && (
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
                      onChange={handleTableSearchChange}
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
                          { key: "Program_Name", label: "Training Name" },
                          { key: "Department", label: "Department" },
                          { key: "Req_Months", label: "Scheduled Month" },
                          { key: "Training_Date", label: "Conducted Date" },
                          { key: "Training_Name", label: "Type" },
                          { key: "Train_Mode", label: "Mode" },
                          { key: "Schedule_Type", label: "Schedule Type" },
                          { key: "Training_Status", label: "Training Status" },
                          { key: "Training_Budget", label: "Estimated Budget" },
                          { key: "Actual_Budget", label: "Actual Budget" },
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
                    <tbody>{renderTableRows(paginatedData, true)}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button
              className="px-6 mt-2 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
              onClick={async () => {
                try {
                  if (!selectedDate) {
                    alert('Please select a year before saving.');
                    return;
                  }
                  const response = await fetch('/api/insert_additional_budget', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                      Year_No: selectedDate.getFullYear(),
                      Add_Budget: Number(additionalTrainingProgramsText) || 0,
                      createdBy: employeeId || ''
                    }),
                  });
                  if (!response.ok) {
                    throw new Error('Failed to save additional budget');
                  }
                  alert('Additional budget saved successfully');
                  // Do not clear the text field after successful save as per user request
                  // Update trainingData and filteredData state directly to avoid full re-render
                  setTrainingData((prevData) => {
                    return prevData.map(item => {
                      if (item.Program_Name?.toLowerCase().includes("additional")) {
                        return { ...item, Training_Budget: Number(additionalTrainingProgramsText) || 0 };
                      }
                      return item;
                    });
                  });
                  setFilteredData((prevData) => {
                    return prevData.map(item => {
                      if (item.Program_Name?.toLowerCase().includes("additional")) {
                        return { ...item, Training_Budget: Number(additionalTrainingProgramsText) || 0 };
                      }
                      return item;
                    });
                  });
                } catch (error) {
                  alert('Error saving additional budget: ' + error.message);
                }
              }}
            >
              Save
            </button>
          </div>
        </>
      )}

      {activeTab === 'budgetVsActual' && (
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
          {budgetVsActualSelectedDate && !budgetVsActualLoading && !budgetVsActualError && (
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
                          { key: "Program_Name", label: "Training Name" },
                          { key: "Department", label: "Department" },
                          { key: "Req_Months", label: "Scheduled Month" },
                          { key: "Training_Date", label: "Conducted Date" },
                          { key: "Training_Name", label: "Type" },
                          { key: "Train_Mode", label: "Mode" },
                          { key: "Schedule_Type", label: "Schedule Type" },
                          { key: "Training_Status", label: "Training Status" },
                          { key: "Training_Budget", label: "Estimated Budget" },
                          { key: "Actual_Budget", label: "Actual Budget" },
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
                    <tbody>{renderTableRows(paginatedBudgetVsActualData, false)}</tbody>
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
