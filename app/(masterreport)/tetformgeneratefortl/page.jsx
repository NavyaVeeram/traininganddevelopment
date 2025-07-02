"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch } from "react-icons/fa";
import Link from "next/link";

const TETForms = () => {
const [selectedDate, setSelectedDate] = useState(new Date());
const [trainingName, setTrainingName] = useState("IATF");
  const [trainingData, setTrainingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [submittedStatusMap, setSubmittedStatusMap] = useState({});
  const [submittedStatusLoading, setSubmittedStatusLoading] = useState(false);
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const getMonthNumber = (date) => (date ? date.getMonth() + 1 : null);
const [EmployeeId,setEmployeeId] = useState(null);


  const fetchData = async (date, trainingName) => {
    const storedEmployeeId = localStorage.getItem("employeeId");

    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    } else {
      window.location.href = "/";
      return;
    }
    if (!date) return;

    setLoading(true);
    setError(null);
    setFilteredData([]);

    try {
      const response = await fetch(
        `/api/get_tet_form_data_res_person?year=${date}&training_name=${encodeURIComponent(trainingName)}&EmployeeId=${storedEmployeeId}`
      );

      if (!response.ok) {
        throw new Error("No training data available for the selected Year.");
      }

      const data = await response.json();

      if (data && data.length === 0) {
        setError("No training data available for the selected Year.");
        setFilteredData([]);
      } else {
        setTrainingData(data);
        setFilteredData(data);
        // Fetch submitted status map for all Program_Ids
        fetchSubmittedStatusMap(data);
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching data.");
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedStatusMap = async (trainingData) => {
    if (!trainingData || trainingData.length === 0) {
      setSubmittedStatusMap({});
      return;
    }
    setSubmittedStatusLoading(true);
    const storedUpdatedEmployees = localStorage.getItem('updatedEmployees');
    let updatedEmployees = [];
    if (storedUpdatedEmployees) {
      try {
        updatedEmployees = JSON.parse(storedUpdatedEmployees);
      } catch (error) {
        updatedEmployees = [];
      }
    }
    const statusMap = {};
    try {
      const fetchPromises = trainingData.map(async (item) => {
        try {
          const res = await fetch(`/api/get_tet_form_user_dropdown_res_person?programId=${item.Program_Id}`);
          if (!res.ok) {
            statusMap[item.Program_Id] = false;
            return;
          }
          const data = await res.json();
          const employeeIds = data.map(emp => emp.Value);
          const allUpdated = employeeIds.every(empId => updatedEmployees.includes(empId));
          statusMap[item.Program_Id] = allUpdated;
        } catch (error) {
          statusMap[item.Program_Id] = false;
        }
      });
      await Promise.all(fetchPromises);
    } catch (error) {
      setSubmittedStatusMap({});
    } finally {
      setSubmittedStatusMap(statusMap);
      setSubmittedStatusLoading(false);
    }
  };

  // useEffect(() => {
  //   if (selectedDate) fetchData(selectedDate);
  // }, [selectedDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, filteredData]);

  useEffect(() => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      fetchData(year, trainingName);
      setRowsPerPage(10);
      setCurrentPage(1);
    }
  }, [selectedDate, trainingName]);
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
           // Restrict access for HR_Res and HR_HOD roles
           if (data.Access_Role !== "Res_Person") {
             setIsAuthorized(false);
             // Optionally redirect to unauthorized page
             // window.location.href = '/unauthorized';
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
          "Year_No",
          "Department",
          "Program_Name",
          "Evaluation_Date",
          "Training_Date",
          "Training_Name",
          "IsActive",
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
   if (isAuthorized === null) {
    return (
      // <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
      //   <div className="bg-white p-10 rounded shadow text-center">
      //     <h2 className="text-2xl font-bold">Loading...</h2>
      //   </div>
      // </div>
      <div>Loading...</div>
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
  return (
    <div className="max-w-full mx-auto bg-white p-2 shadow-md rounded-lg w-full">
      <div className="bg-sky-400 text-white p-2 rounded-t-lg">
        <h1 className="font-semibold">TET Forms</h1>
      </div>
      <div className="my-4 flex relative z-50">
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
            popperModifiers={{
              preventOverflow: {
                enabled: true,
                boundariesElement: "viewport",
              },
            }}
          />
        </div>
   <div className="flex mx-2 items-center space-x-2">
        <label htmlFor="Training_Name" className="text-sm font-medium">
    Training Name
        </label>
        <div className="relative">
          <select
            id="Training_Name"
            name="Training_Name"
            value={trainingName}
            onChange={(e) => setTrainingName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
            required 
          >
            <option value="IATF">International Automotive Task Force - (IATF)</option>
            <option value="HSE">Health, Safety, and Environment - (HSE)</option>
          </select>
        </div>
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

            <div className="overflow-x-auto">
              <div>
                <table
                  className="min-w-full border bg-card text-sm "
                  style={{ tableLayout: "fixed", fontSize: "13px", padding: "1px",
                    whiteSpace: "nowrap", 
                    overflow: "hidden",   
                    textOverflow: "ellipsis",  }}
                >
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {[
                        { key: "Year_No", label: "Year" },
                        { key: "Department", label: "Department" },
                        { key: "Program_Name", label: "Program Name" },
                        { key: "Training_Name", label: "Type" },
                        { key: "Training_Date", label: "Training Date" },
                        { key: "Evaluation_Date", label: "Evaluation Date" },
                        // { key: "IsActive", label: "Status" },
                        { key: "actions", label: "Report" },
                      ].map(({ key, label }, index) => (
                          <th
                            key={key}
                            className={`px-4 py-2 border text-left cursor-pointer ${
                              index === 0 ? "sticky left-0 bg-muted z-20" : ""
                            }`}
                            onClick={() => key !== "actions" && handleSort(key)}
                          >
                            {label}{" "}
                            {sortConfig.key === key
                              ? sortConfig.direction === "asc"
                                ? "▲"
                                : "▼"
                              : key !== "actions"
                              ? "↕"
                              : ""}
                          </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      paginatedData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-100 border">
                          <td className="px-4 py-2 border">{item.Year_No}</td>
                          <td className="px-4 py-2 border">{item.Department}</td>
                          <td className="px-4 py-2 border">
                            {item.Program_Name}
                          </td>
                          <td className="px-4 py-2 border">
                            {item.Training_Name}
                          </td>
                          <td className="px-4 py-2 border">
                            {item.Training_Date}
                          </td>
                          <td className="px-4 py-2 border">
                            {(item.Evaluation_Date)}
                          </td>
                        {/* Removed Status column as it depends on unnecessary API */}
                          <td className="px-4 py-2 border text-blue-600 underline">
                            <Link
                              href={`/tetreportsfortl?id=${item.Program_Id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              View Report
                            </Link>
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
            </div>

            { (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TETForms;