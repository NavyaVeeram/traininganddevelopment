"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch } from "react-icons/fa";

const TrainingBudget = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [trainingData, setTrainingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Removed pagination state as pagination is not needed
  // const [rowsPerPage, setRowsPerPage] = useState("All");
  // const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = "All";
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  const fetchData = async (date) => {
    if (!date) {
      alert('Please select a year.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const year = date.getFullYear();
      const response = await fetch(`/api/get_training_budget?year=${year}`);
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
    if (selectedDate) {
      fetchData(selectedDate);
      // setRowsPerPage(10);
      // setCurrentPage(1);
    }
  }, [selectedDate]);
  
  // Removed pagination effect
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [rowsPerPage, filteredData]);
  
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

  const paginatedData = sortedData;

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

  const handleClearTableSearch = () => {
    setTableSearchTerm("");
    setFilteredData(trainingData);
  };

  const columns = [
    {
      name: 'Training Name',
      selector: row => row.Program_Name,
      sortable: true,
      searchable: true,
      width: '35%', 
    },
    {
      name: 'Scheduled Month',
      selector: row => row.Req_Months,
      sortable: true,
      searchable: true,
      width: '10%',
    },
    {
      name: 'Conducted Date',
      selector: row => row.Training_Date ? new Date(row.Training_Date).toLocaleDateString() : '',
      sortable: true,
      searchable: true,
      width: '10%', 
    },
    {
      name: 'Type',
      selector: row => row.Training_Name,
      sortable: true,
      searchable: true,
      width: '5%',
    },
    {
      name: 'Mode',
      selector: row => row.Train_Mode,
      sortable: true,
      searchable: true,
      width: '10%',
    },
    {
      name: 'Schedule Type',
      selector: row => row.Schedule_Type,
      sortable: true,
      searchable: true,
      width: '10%',
    },
    {
      name: 'Training Status',
      selector: row => row.Training_Status,
      sortable: true,
      searchable: true,
      width: '10%',
    },
    {
      name: 'Training Budget',
      selector: row => row.Training_Budget,
      sortable: true,
      searchable: true,
      width: '10%',
    },
  ];
  const isYearEnabled = (date) => {
    const year = date.getFullYear();
    return [ 2025, 2026].includes(year);
  }; 
  return (
    <div className="max-w-full mx-auto bg-white p-2 shadow-md rounded-lg w-full">
      <div className="bg-sky-400 text-white p-2 rounded-t-lg">
        <h1 className="font-semibold">Actual Training Budget</h1>
      </div>

        {/* <div className="controls flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="block font-medium text-sm">Year</label>
            <div className="date-picker">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy"
                showYearPicker
                placeholderText="Select Year"
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div> */}
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
              filterDate={isYearEnabled}
            />
          </div>
        </div>
        {loading && <p>Loading...</p>}

      {error && (
        <div className="flex justify-center items-center h-64 text-center text-red-500 mt-4">
          <p>{error}</p>
        </div>
      )}

        {/* {selectedDate && !loading && !error && (
          <div className="flex items-center justify-end mb-4 relative w-auto">
            <label className="mr-2 text-sm font-medium text-gray-900">Search:</label>
            <div className="relative w-1/11">
              <input
                type="text"
                value={tableSearchTerm}
                onChange={handleTableSearchChange}
                placeholder="Search"
                className="w-full p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {tableSearchTerm && (
                <button
                  onClick={handleClearTableSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black-400 hover:text-black-600"
                >
                  X
                </button>
              )}
            </div>
          </div>
        )} */}
      {selectedDate && !loading && !error && (
        <div className="card-body p-0 pb-3">
          <div className="p-4 bg-card">
            <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                {/* <span>Show</span>
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
                <span>entries</span> */}
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

            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
              <div>
                <table className="min-w-full border z-0 rounded-lg bg-card text-sm " style={{ tableLayout: "fixed", fontSize: "13px" }} >
                  <thead className="bg-muted sticky top-0" >
                    <tr>
                      {[{ key: "Program_Name", label: "Training Name" },
                        { key: "Req_Months", label: "Scheduled Month" },
                        { key: "Training_Date", label: "Conducted Date" },
                        { key: "Training_Name", label: "Type" },
                        { key: "Train_Mode", label: "Mode" },
                        { key: "Schedule_Type", label: "Schedule Type" },
                        { key: "Training_Status", label: "Training Status" },
                        {key: "Training_Budget", label: "Budget"}]
                        .map(({ key, label }, index) => (
                          <th
                            key={key}
                            className={`px-4 py-2 border text-left cursor-pointer ${index === 0 ? "sticky left-0 bg-muted z-20" : ""}`}
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
                      paginatedData.map((item, index) => {
                        const isTotalRow = (item.Program_Name?.toString().toLowerCase().includes("total") || item.Training_Name?.toString().toLowerCase().includes("total"));
                        return (
                          <tr key={index} className={`border ${isTotalRow ? "bg-gray-200" : "hover:bg-gray-100"}`}>
                            <td className="px-4 py-2 border">{item.Program_Name}</td>
                            <td className="px-4 py-2 border">{item.Req_Months}</td>
                            <td className="px-4 py-2 border">
                              {item.Training_Date
                                ? new Date(item.Training_Date).toLocaleDateString()
                                : ""}
                            </td>
                            <td className="px-4 py-2 border">{item.Training_Name}</td>
                            <td className="px-4 py-2 border">{item.Train_Mode}</td>
                            <td className="px-4 py-2 border">{item.Schedule_Type}</td>
                            <td className="px-4 py-2 border">{item.Training_Status}</td>
                            <td className="px-4 py-2 border">{item.Training_Budget}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-4 text-center text-gray-500">
                          No matching training data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            { (
              <div className="flex flex-wrap justify-between items-center mt-4 text-sm">
                {/* <div>
                  Showing {filteredData.length > 0
                    ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                        currentPage * rowsPerPage,
                        filteredData.length
                      )} of ${filteredData.length} entries`
                    : "0 entries"}
                </div> */}

                {/* <div className="flex space-x-1">
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
                      className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-primary text-white" : ""}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
                </div> */}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingBudget;
