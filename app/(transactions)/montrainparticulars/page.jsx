"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch } from "react-icons/fa";

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

  const getMonthNumber = (date) => (date ? date.getMonth() + 1 : null);

  const fetchData = async (date) => {
    if (!date) return;

    setLoading(true);
    setError(null);
    setFilteredData([]);

    try {
      const response = await fetch(
        `/api/get_monthly_particulars?month=${getMonthNumber(date)}&year=${date.getFullYear()}`
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
      : sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value;
    setTableSearchTerm(searchQuery);

    if (!searchQuery) {
      setFilteredData(trainingData);
    } else {
      const filtered = trainingData.filter((trainer) =>
        ["Program_Name", "Req_Months", "Training_Date", "Training_Name", "Train_Mode", "Schedule_Type", "Training_Status"]
          .some((field) => trainer[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredData(filtered);
    }
  };

  const handleClearTableSearch = () => {
    setTableSearchTerm("");
    setFilteredData(trainingData);
  };

  return (
    <div className="max-w-full mx-auto bg-white p-2 shadow-md rounded-lg w-full">
      <div className="bg-sky-400 text-white p-2 rounded-t-lg">
        <h1 className="font-semibold">Monthly Training Particulars</h1>
      </div>

      {/* Display only month dropdown initially */}
      
        <div className="my-4 relative z-30">
          <div className="flex items-center space-x-2">
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

            <div className="overflow-x-auto relative z-20">
                <table className="min-w-full border relative z-0 bg-card text-sm " 
                style={{ 
                  tableLayout: "fixed", 
                  fontSize: "13px" , 
                  padding: "1px",
                  whiteSpace: "nowrap", 
                  overflow: "hidden",   
                  textOverflow: "ellipsis", }} >
                  <thead className="bg-muted top-0 z-0" >
                    <tr>
                      {[{ key: "Program_Name", label: "Training Name" },
                        { key: "Req_Months", label: "Scheduled Month" },
                        { key: "Training_Date", label: "Conducted Date" },
                        { key: "Training_Name", label: "Type" },
                        { key: "Train_Mode", label: "Mode" },
                        { key: "Schedule_Type", label: "Schedule Type" },
                        { key: "Training_Status", label: "Training Status" }]
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
                      paginatedData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-100 border">
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
                        </tr>
                      ))
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

            {(
              <div className="flex flex-wrap justify-between items-center mt-4 text-sm">
                <div>
                  Showing {filteredData.length > 0
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
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyTrainingParticulars;