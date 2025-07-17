"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch } from "react-icons/fa";
import Select from "react-select";

const HeadCount = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("programwise");
  const [selectedDate, setSelectedDate] = useState(null);
  const [trainingData, setTrainingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [designationwiseData, setdesignationwiseData] = useState([]);
  const [designationwiseSearchTerm, setdesignationwiseSearchTerm] =
    useState("");
  const [designationwiseFilteredData, setdesignationwiseFilteredData] =
    useState([]);
  const [designationwiseLoading, setdesignationwiseLoading] = useState(false);
  const [designationwiseError, setdesignationwiseError] = useState(null);
  const [designationwiseSelectedDate, setdesignationwiseSelectedDate] =
    useState(null);
  const [programwiseData, setprogramwiseData] = useState([]);
  const [programwiseSearchTerm, setprogramwiseSearchTerm] = useState("");
  const [programwiseFilteredData, setprogramwiseFilteredData] = useState([]);
  const [programwiseLoading, setprogramwiseLoading] = useState(false);
  const [programwiseError, setprogramwiseError] = useState(null);
  const [programwiseSelectedDate, setprogramwiseSelectedDate] = useState(null);

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
      const response = await fetch(
        `/api/get_data_by_dept_wise_mnthsVShrs?year=${year}`
      );
      if (!response.ok) {
        throw new Error("No data available.");
      }
      const data = await response.json();
      console.log(
        "First data item full object:",
        data.length > 0 ? data[0] : "No data"
      );
      console.log(
        "First data item keys:",
        data.length > 0 ? Object.keys(data[0]) : "No data"
      );
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

  const fetchdesignationwiseData = async (date) => {
    if (!date) {
      alert("Please select a year");
      return;
    }
    setdesignationwiseLoading(true);
    setdesignationwiseError(null);
    try {
      const year = date.getFullYear();
      const response = await fetch(
        `/api/get_data_by_desg_wise_mnthsVShrs?year=${year}`
      );

      if (!response.ok) {
        throw new Error("No data available.");
      }
      const data = await response.json();
      console.log(
        "designationwise first data item keys:",
        data.length > 0 ? Object.keys(data[0]) : "No data"
      );
      if (data && data.length === 0) {
        setdesignationwiseError("No data available for the selected Year.");
        setdesignationwiseFilteredData([]);
      } else {
        setdesignationwiseData(data);
        setdesignationwiseFilteredData(data);
      }
    } catch (err) {
      setdesignationwiseError(
        err.message || "An error occurred while fetching data."
      );
      setdesignationwiseFilteredData([]);
    } finally {
      setdesignationwiseLoading(false);
    }
  };
  const fetchprogramwiseData = async (date) => {
    if (!date) {
      alert("Please select a year");
      return;
    }
    setprogramwiseLoading(true);
    setprogramwiseError(null);
    try {
      const year = date.getFullYear();
      const response = await fetch(
        `/api/get_data_by_program_wise_mnthsVShrs?year=${year}`
      );

      if (!response.ok) {
        throw new Error("No data available.");
      }
      const data = await response.json();
      console.log(
        "programwise first data item keys:",
        data.length > 0 ? Object.keys(data[0]) : "No data"
      );
      if (data && data.length === 0) {
        setprogramwiseError("No data available for the selected Year.");
        setprogramwiseFilteredData([]);
      } else {
        setprogramwiseData(data);
        setprogramwiseFilteredData(data);
      }
    } catch (err) {
      setprogramwiseError(
        err.message || "An error occurred while fetching data."
      );
      setprogramwiseFilteredData([]);
    } finally {
      setprogramwiseLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && activeTab === "departmentwise") fetchData(selectedDate);
  }, [selectedDate, activeTab]);

  useEffect(() => {
    if (designationwiseSelectedDate && activeTab === "designationwise") {
      fetchdesignationwiseData(designationwiseSelectedDate);
    }
  }, [designationwiseSelectedDate, activeTab]);

  useEffect(() => {
    if (programwiseSelectedDate && activeTab === "programwise") {
      fetchprogramwiseData(programwiseSelectedDate);
    }
  }, [programwiseSelectedDate, activeTab]);

  const groupedData = programwiseFilteredData.reduce((acc, row) => {
    if (!acc[row.Month_Name]) acc[row.Month_Name] = [];
    acc[row.Month_Name].push(row);
    return acc;
  }, {});

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

  const sorteddesignationwiseData = [...designationwiseFilteredData].sort(
    (a, b) => {
      if (!sortConfig.key) return 0;
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }
  );
  const sortedprogramwiseData = [...programwiseFilteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPagespaginateddesignationwiseData =
    rowsPerPage === "All"
      ? 1
      : Math.ceil(sorteddesignationwiseData.length / rowsPerPage);
  const paginateddesignationwiseeData =
    rowsPerPage === "All"
      ? sorteddesignationwiseData
      : sorteddesignationwiseData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData =
    rowsPerPage === "All"
      ? sortedData
      : sortedData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  const totalPagespaginatedprogramwiseData =
    rowsPerPage === "All"
      ? 1
      : Math.ceil(sortedprogramwiseData.length / rowsPerPage);
  const paginatedprogramwiseData =
    rowsPerPage === "All"
      ? sortedprogramwiseData
      : sortedprogramwiseData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );
  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value;
    setTableSearchTerm(searchQuery);
    if (!searchQuery) {
      setFilteredData(trainingData);
    } else {
      const lowerSearchQuery = searchQuery.toLowerCase();
      const filtered = trainingData.filter((trainer) => {
        return [
          "Department",
          "Jan_Emp",
          "Jan_Hrs",
          "Feb_Emp",
          "Feb_Hrs",
          "Mar_Emp",
          "Mar_Hrs",
          "Apr_Emp",
          "Apr_Hrs",
          "May_Emp",
          "May_Hrs",
          "Jun_Emp",
          "Jun_Hrs",
          "Jul_Emp",
          "Jul_Hrs",
          "Aug_Emp",
          "Aug_Hrs",
          "Sep_Emp",
          "Sep_Hrs",
          "Oct_Emp",
          "Oct_Hrs",
          "Nov_Emp",
          "Nov_Hrs",
          "Dec_Emp",
          "Dec_Hrs",
          "Total_Emp",
          "Total_Hrs",
        ].some((field) =>
          trainer[field]?.toString().toLowerCase().includes(lowerSearchQuery)
        );
      });
      setFilteredData(filtered);
    }
  };

  const handledesignationwiseSearchChange = (e) => {
    const searchQuery = e.target.value;
    setdesignationwiseSearchTerm(searchQuery);
    if (!searchQuery) {
      setdesignationwiseFilteredData(designationwiseData);
    } else {
      const lowerSearchQuery = searchQuery.toLowerCase();
      const filtered = designationwiseData.filter((trainer) => {
        return [
          "Emp_Type",
          "Jan_Emp",
          "Jan_Hrs",
          "Feb_Emp",
          "Feb_Hrs",
          "Mar_Emp",
          "Mar_Hrs",
          "Apr_Emp",
          "Apr_Hrs",
          "May_Emp",
          "May_Hrs",
          "Jun_Emp",
          "Jun_Hrs",
          "Jul_Emp",
          "Jul_Hrs",
          "Aug_Emp",
          "Aug_Hrs",
          "Sep_Emp",
          "Sep_Hrs",
          "Oct_Emp",
          "Oct_Hrs",
          "Nov_Emp",
          "Nov_Hrs",
          "Dec_Emp",
          "Dec_Hrs",
          "Total_Emp",
          "Total_Hrs",
        ].some((field) =>
          trainer[field]?.toString().toLowerCase().includes(lowerSearchQuery)
        );
      });
      setdesignationwiseFilteredData(filtered);
    }
  };
  const handleprogramwiseSearchChange = (e) => {
    const searchQuery = e.target.value;
    setprogramwiseSearchTerm(searchQuery);
    if (!searchQuery) {
      setprogramwiseFilteredData(programwiseData);
    } else {
      const lowerSearchQuery = searchQuery.toLowerCase();
      const filtered = programwiseData.filter((trainer) => {
        return [
          "Month_Name",
          "Program_Name",
          "Department",
          "Persons",
          "No_Hrs",
        ].some((field) =>
          trainer[field]?.toString().toLowerCase().includes(lowerSearchQuery)
        );
      });
      setprogramwiseFilteredData(filtered);
    }
  };
  const handleClearTableSearch = () => {
    setTableSearchTerm("");
    setFilteredData(trainingData);
  };

  const handleClearBepartmentwiseSearch = () => {
    setdepartmentwiseSearchTerm("");
    setdepartmentwiseFilteredData(departmentwiseData);
  };

  // Render table rows with conditional text field for additional training programs in actual tab
  const renderdepartmentwiseTableRows = (data, isActualTab = true) => {
    return data.map((item, index) => {
      return (
        <tr key={item.EmployeeId || index}>
          <td className="px-4 py-2 border">{item.Department}</td>
          <td className="px-4 py-2 border text-right">{item.Jan_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Jan_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Feb_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Feb_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Mar_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Mar_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Apr_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Apr_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.May_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.May_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Jun_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Jun_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Jul_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Jul_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Aug_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Aug_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Sep_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Sep_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Oct_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Oct_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Nov_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Nov_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Dec_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Dec_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Total_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Total_Hrs}</td>
        </tr>
      );
    });
  };

  const renderdesignationwiseTableRows = (data, isActualTab = true) => {
    return data.map((item, index) => {
      return (
        <tr key={item.EmployeeId || index}>
          <td className="px-4 py-2 border">{item.Emp_Type}</td>
          <td className="px-4 py-2 border text-right">{item.Jan_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Jan_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Feb_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Feb_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Mar_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Mar_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Apr_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Apr_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.May_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.May_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Jun_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Jun_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Jul_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Jul_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Aug_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Aug_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Sep_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Sep_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Oct_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Oct_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Nov_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Nov_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Dec_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Dec_Hrs}</td>
          <td className="px-4 py-2 border text-right">{item.Total_Emp}</td>
          <td className="px-4 py-2 border text-right">{item.Total_Hrs}</td>
        </tr>
      );
    });
  };
  const renderprogramwiseTableRows = (data, isActualTab = true) => {
    return data.map((item, index) => {
      return (
        <tr key={item.Program_Id || index}>
          <td className="px-4 py-2 border">{item.Month_Name}</td>
          <td className="px-4 py-2 border">{item.Program_Name}</td>
          <td className="px-4 py-2 border">{item.Department}</td>
          <td className="px-4 py-2 border">{item.Persons}</td>
          <td className="px-4 py-2 border">{item.No_Hrs}</td>
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
      <div className="bg-sky-400 text-white p-2 rounded-t-lg flex items-center justify-between">
        {/* Left side: Title + Tabs */}
        <div className="flex items-center space-x-4">
          <h1 className="font-semibold">Training Details</h1>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "programwise"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-white hover:bg-sky-300"
            }`}
            onClick={() => setActiveTab("programwise")}
          >
            Program Wise
          </button>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "departmentwise"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-white hover:bg-sky-300"
            }`}
            onClick={() => setActiveTab("departmentwise")}
          >
            Department Wise
          </button>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "designationwise"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-white hover:bg-sky-300"
            }`}
            onClick={() => setActiveTab("designationwise")}
          >
            Designation Wise
          </button>
        </div>
      </div>

      {activeTab === "programwise" && (
        <>
          <div className="my-4 relative z-50">
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {/* Year Picker */}
              <div className="flex items-center space-x-2">
                <label className="font-semibold whitespace-nowrap">Year</label>
                <DatePicker
                  selected={programwiseSelectedDate}
                  onChange={(date) => setprogramwiseSelectedDate(date)}
                  dateFormat="yyyy"
                  showYearPicker
                  placeholderText="Select Year"
                  className="p-2 border border-gray-300 rounded-lg min-w-[120px]"
                  calendarClassName="z-50"
                  popperPlacement="top-start"
                  isClearable
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
          </div>

          {programwiseLoading && <p>Loading...</p>}
          {programwiseError && (
            <div className="flex justify-center items-center h-64 text-center text-red-500 mt-4">
              <p>{programwiseError}</p>
            </div>
          )}
          {programwiseSelectedDate &&
            !programwiseLoading &&
            !programwiseError && (
              <div className="card-body p-0 pb-3">
                <div className="p-4 bg-card">
                  <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
                    <div className="flex items-center space-x-2 text-sm"></div>
                    <div className="relative">
                      <input
                        type="text"
                        value={programwiseSearchTerm}
                        onChange={handleprogramwiseSearchChange}
                        placeholder="Search..."
                        className="border p-1 pl-8 rounded bg-secondary"
                      />
                      <FaSearch className="absolute left-2 top-2 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <table
                      className="min-w-full border z-0 rounded-lg bg-card text-sm"
                      style={{ tableLayout: "fixed", fontSize: "13px" }}
                    >
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="border px-4 py-2 text-center">
                            Months
                          </th>
                          <th className="border px-4 py-2 text-center">
                            Program Name
                          </th>
                          <th className="border px-4 py-2 text-center">
                            Department
                          </th>
                          <th className="border px-4 py-2 text-center">
                            Persons
                          </th>
                          <th className="border px-4 py-2 text-center">
                            Total No. Of Hrs
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(groupedData).map(([month, entries]) =>
                          entries.map((entry, index) => (
                            <tr key={`${month}-${index}`}>
                              {index === 0 && (
                                <td
                                  rowSpan={entries.length}
                                  className="border px-4 py-2 text-center font-semibold bg-muted"
                                >
                                  {month}
                                </td>
                              )}
                              <td className="border px-4 py-2">
                                {entry.Program_Name}
                              </td>
                              <td className="border px-4 py-2">
                                {entry.Department}
                              </td>
                              <td className="border px-4 py-2 text-right">
                                {entry.Persons}
                              </td>
                              <td className="border px-4 py-2 text-right">
                                {entry.No_Hrs}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap justify-between items-center mt-4 text-sm">
                    <div>
                      Showing{" "}
                      {programwiseFilteredData.length > 0
                        ? `1 to ${programwiseFilteredData.length} of ${programwiseFilteredData.length} entries`
                        : "0 entries"}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </>
      )}

      {activeTab === "departmentwise" && (
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
                <div className="flex justify-end items-center mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={tableSearchTerm}
                      onChange={handleTableSearchChange}
                      placeholder="Search..."
                      className="w-full border p-1 pl-8 rounded bg-secondary"
                    />
                    <FaSearch className="absolute left-2 top-2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <table
                    className="min-w-full border rounded-lg bg-card text-sm"
                    style={{ tableLayout: "fixed", fontSize: "13px" }}
                  >
                    <thead className="bg-muted sticky top-0 ">
                      <tr>
                        <th
                          rowSpan={2}
                          className="px-4 py-2 border text-center sticky left-0 bg-muted "
                        >
                          Department
                        </th>
                        {[
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                          "Total",
                        ].map((month) => (
                          <th
                            key={month}
                            colSpan={2}
                            className="px-4 py-2 border text-center"
                          >
                            {month}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {Array.from({ length: 13 }).flatMap(() => [
                          <th
                            key={`emp-${Math.random()}`}
                            className="px-4 py-2 border text-right"
                          >
                            Emp
                          </th>,
                          <th
                            key={`hrs-${Math.random()}`}
                            className="px-4 py-2 border text-right"
                          >
                            Hrs
                          </th>,
                        ])}
                      </tr>
                    </thead>

                    <tbody>
                      {renderdepartmentwiseTableRows(filteredData, true)}
                    </tbody>
                  </table>
                </div>
                {/* Entry count */}
                <div className="flex flex-wrap justify-between items-center mt-4 text-sm">
                  <div>
                    Showing{" "}
                    {filteredData.length > 0
                      ? `1 to ${filteredData.length} of ${filteredData.length} entries`
                      : "0 entries"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "designationwise" && (
        <>
          <div className="my-4 relative">
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {/* Year Picker */}
              <div className="flex items-center space-x-2">
                <label className="font-semibold whitespace-nowrap">Year</label>
                <DatePicker
                  selected={designationwiseSelectedDate}
                  onChange={(date) => setdesignationwiseSelectedDate(date)}
                  dateFormat="yyyy"
                  showYearPicker
                  placeholderText="Select Year"
                  className="p-2 border border-gray-300 rounded-lg min-w-[120px]"
                  calendarClassName="z-50"
                  popperPlacement="top-start"
                  isClearable
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
          </div>

          {designationwiseLoading && <p>Loading...</p>}
          {designationwiseError && (
            <div className="flex justify-center items-center h-64 text-center text-red-500 mt-4">
              <p>{designationwiseError}</p>
            </div>
          )}

          {designationwiseSelectedDate &&
            !designationwiseLoading &&
            !designationwiseError && (
              <div className="card-body p-0 pb-3">
                <div className="p-4 bg-card">
                  <div className="flex justify-end items-center mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={designationwiseSearchTerm}
                        onChange={handledesignationwiseSearchChange}
                        placeholder="Search..."
                        className="w-full border p-1 pl-8 rounded bg-secondary"
                      />
                      <FaSearch className="absolute left-2 top-2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <table
                      className="min-w-full border  rounded-lg bg-card text-sm"
                      style={{ tableLayout: "fixed", fontSize: "13px" }}
                    >
                      <thead className="bg-muted sticky top-0 ">
                        <tr>
                          <th
                            rowSpan={2}
                            className="px-4 py-2 border text-left sticky left-0 bg-muted"
                          >
                            Designation
                          </th>
                          {[
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                            "Total",
                          ].map((month) => (
                            <th
                              key={month}
                              colSpan={2}
                              className="px-4 py-2 border text-center"
                            >
                              {month}
                            </th>
                          ))}
                        </tr>
                        <tr>
                          {Array.from({ length: 13 }).flatMap(() => [
                            <th
                              key={Math.random()}
                              className="px-4 py-2 border text-left"
                            >
                              Emp
                            </th>,
                            <th
                              key={Math.random()}
                              className="px-4 py-2 border text-left"
                            >
                              Hrs
                            </th>,
                          ])}
                        </tr>
                      </thead>

                      <tbody>
                        {renderdesignationwiseTableRows(
                          designationwiseFilteredData,
                          true
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap justify-between items-center mt-4 text-sm">
                    <div>
                      Showing{" "}
                      {designationwiseFilteredData.length > 0
                        ? `1 to ${designationwiseFilteredData.length} of ${designationwiseFilteredData.length} entries`
                        : "0 entries"}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default HeadCount;
