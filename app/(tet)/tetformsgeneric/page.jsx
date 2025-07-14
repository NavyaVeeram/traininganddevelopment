"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
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

  // Normalize rowsPerPage to always be a number for pagination calculations
  const normalizedRowsPerPage =
    rowsPerPage === "All" ? filteredData.length || 1 : rowsPerPage;
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  // Removed submittedStatusMap and submittedStatusLoading states
  // const [submittedStatusMap, setSubmittedStatusMap] = useState({});
  // const [submittedStatusLoading, setSubmittedStatusLoading] = useState(false);
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);

  // New state variables for user dropdown data
  const [userDropdownData, setUserDropdownData] = useState([]);
  const [userDropdownLoading, setUserDropdownLoading] = useState(false);
  const [userDropdownError, setUserDropdownError] = useState(null);

  const getMonthNumber = (date) => (date ? date.getMonth() + 1 : null);

  const fetchData = async (date, trainingName) => {
    // const storedEmployeeId = localStorage.getItem("employeeId");
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
        `/api/get_tet_form_data_generic?year=${date}&training_name=${encodeURIComponent(
          trainingName
        )}&EmployeeId=${storedEmployeeId}`
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
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching data.");
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch user dropdown data from API
  const fetchUserDropdownData = async (programId, empId) => {
    if (!programId || !empId) return;
    setUserDropdownLoading(true);
    setUserDropdownError(null);
    try {
      const res = await fetch(
        `/api/get_tet_form_user_dropdown_by_generic?programId=${programId}&EmployeeId=${empId}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch user dropdown data");
      }
      const data = await res.json();
      setUserDropdownData(data);
    } catch (error) {
      setUserDropdownError(
        error.message || "Error fetching user dropdown data"
      );
      setUserDropdownData([]);
    } finally {
      setUserDropdownLoading(false);
    }
  };

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
          if (data.Access_Role === "Res_Person" && data.Access_Role === 'HOS' && data.Access_Role ==='HOD') {
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

  // New useEffect to fetch user dropdown data when trainingData and employeeId change
  useEffect(() => {
    if (trainingData.length > 0 && employeeId) {
      const programId = trainingData[0].Program_Id;
      fetchUserDropdownData(programId, employeeId);
    } else {
      setUserDropdownData([]);
    }
  }, [trainingData, employeeId]);

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

  const totalPages = Math.ceil(filteredData.length / normalizedRowsPerPage);

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
      <div className="bg-sky-400 text-white p-2 rounded-t-lg">
        <h1 className="font-semibold">TET Forms</h1>
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
          <div className="mx-2 flex items-center" style={{ minWidth: "250px" }}>
            <label htmlFor="training-select" className="mr-2 font-semibold ">
              Select Training:
            </label>
            <div className="relative" style={{ minWidth: "250px" }}>
              <Select
                inputId="Training_Name"
                value={{
                  value: trainingName,
                  label:
                    trainingName === "IATF"
                      ? "International Automotive Task Force - (IATF)"
                      : "Health, Safety, and Environment - (HSE)",
                }}
                className="relative"
                onChange={(selectedOption) =>
                  setTrainingName(selectedOption.value)
                }
                options={[
                  {
                    value: "IATF",
                    label: "International Automotive Task Force - (IATF)",
                  },
                  {
                    value: "HSE",
                    label: "Health, Safety, and Environment - (HSE)",
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
            </div>

            <div className="overflow-auto">
              <div>
                <table
                  className="min-w-full border bg-card text-sm "
                  style={{
                    tableLayout: "fixed",
                    fontSize: "13px",
                    padding: "1px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
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
                        { key: "actions", label: "Report" },
                        { key: "Training_Status", label: "Status" },
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
                        <tr
                          key={`${item.Program_Id}-${index}`}
                          className="hover:bg-gray-100 border"
                        >
                          <td className="px-4 py-2 border">{item.Year_No}</td>
                          <td className="px-4 py-2 border">
                            {item.Department}
                          </td>
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
                            {item.Evaluation_Date}
                          </td>
                          <td
                            className={`px-4 py-2 border font-bold ${
                              item.Training_Status?.toLowerCase() ===
                              "completed"
                                ? "text-green-600"
                                : item.Training_Status?.toLowerCase() ===
                                  "pending"
                                ? "text-red-600"
                                : ""
                            }`}
                          >
                            {item.Training_Status}
                          </td>
                          <td className="px-4 py-2 border text-blue-600 underline">
                            <Link
                              href={`/terreportsgeneric?id=${item.Program_Id}`}
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
                          colSpan="8"
                          className="py-4 text-center text-gray-500"
                        >
                          No matching training data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="flex flex-wrap justify-between items-center mt-4 space-y-2">
                  <div style={{ fontSize: "14px" }}>
                    Showing{" "}
                    {filteredData.length > 0
                      ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                          currentPage * rowsPerPage,
                          filteredData.length
                        )} of ${filteredData.length} entries`
                      : "0 entries"}
                  </div>
                  <div className="flex space-x-2" style={{ fontSize: "14px" }}>
                    <button
                      type="button"
                      className="px-3 py-1 border cursor-pointer rounded"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      {"<<"}
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 border cursor-pointer  rounded"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      {"<"}
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`px-3 py-1 border cursor-pointer  rounded ${
                          currentPage === i + 1
                            ? "bg-black text-primary-foreground"
                            : ""
                        }`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="px-3 py-1 border cursor-pointer  rounded"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      {">"}
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 border cursor-pointer  rounded"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      {">>"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TETForms;
