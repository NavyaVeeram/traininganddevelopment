"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch } from "react-icons/fa";
import Select from "react-select";

const HeadCount = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("overall");
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
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentwiseData, setdepartmentwiseData] = useState([]);
  const [departmentwiseSearchTerm, setdepartmentwiseSearchTerm] = useState("");
  const [departmentwiseFilteredData, setdepartmentwiseFilteredData] = useState([]);
  const [departmentwiseLoading, setdepartmentwiseLoading] = useState(false);
  const [departmentwiseError, setdepartmentwiseError] = useState(null);
  const [departmentwiseSelectedDate, setdepartmentwiseSelectedDate] =
    useState(null);

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

  useEffect(() => {
    fetch("/api/get_data_by_department_dropdown_head_count")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((error) => console.error("Failed to load departments", error));
  }, []);
  const options = departments.map((option) => ({
    value: option.Value,
    label: option.Text,
  }));
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
        `/api/get_data_by_overall_summary_head_Count?year=${year}`
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

  const fetchdepartmentwiseData = async (date, selectedDepartment) => {
    if (!date && !selectedDepartment) {
      alert("Please select a year and department");
      return;
    }
    setdepartmentwiseLoading(true);
    setdepartmentwiseError(null);
    try {
      const year = date.getFullYear();
      const deptcode = selectedDepartment;
      const response = await fetch(
        `/api/get_data_by_department_head_count?year=${year}&Department=${deptcode}`
      );

      if (!response.ok) {
        throw new Error("No data available.");
      }
      const data = await response.json();
      console.log(
        "departmentwise first data item keys:",
        data.length > 0 ? Object.keys(data[0]) : "No data"
      );
      if (data && data.length === 0) {
        setdepartmentwiseError("No data available for the selected Year.");
        setdepartmentwiseFilteredData([]);
      } else {
        setdepartmentwiseData(data);
        setdepartmentwiseFilteredData(data);
      }
    } catch (err) {
      setdepartmentwiseError(
        err.message || "An error occurred while fetching data."
      );
      setdepartmentwiseFilteredData([]);
    } finally {
      setdepartmentwiseLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && activeTab === "overall") fetchData(selectedDate);
  }, [selectedDate, activeTab]);

  useEffect(() => {
    if (
      departmentwiseSelectedDate &&
      activeTab === "departmentwise" &&
      selectedDepartment
    ) {
      fetchdepartmentwiseData(departmentwiseSelectedDate, selectedDepartment);
    }
  }, [departmentwiseSelectedDate, activeTab, selectedDepartment]);

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

  const sorteddepartmentwiseData = [...departmentwiseFilteredData].sort(
    (a, b) => {
      if (!sortConfig.key) return 0;
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }
  );

  const totalPagespaginateddepartmentwiseData =
    rowsPerPage === "All"
      ? 1
      : Math.ceil(sorteddepartmentwiseData.length / rowsPerPage);
  const paginateddepartmentwiseData =
    rowsPerPage === "All"
      ? sorteddepartmentwiseData
      : sorteddepartmentwiseData.slice(
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
  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value;
    setTableSearchTerm(searchQuery);
    if (!searchQuery) {
      setFilteredData(trainingData);
    } else {
      const lowerSearchQuery = searchQuery.toLowerCase();
      const filtered = trainingData.filter((trainer) => {
        return [
          "Employee_Id",
          "Username",
          "Department",
          "Section",
          "Designation",
          "DOJ",
          "IsActive",
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
        ].some((field) =>
          trainer[field]?.toString().toLowerCase().includes(lowerSearchQuery)
        );
      });
      setFilteredData(filtered);
    }
  };

  const handledepartmentwiseSearchChange = (e) => {
    const searchQuery = e.target.value;
    setdepartmentwiseSearchTerm(searchQuery);
    if (!searchQuery) {
      setdepartmentwiseData(departmentwiseData);
    } else {
      const lowerSearchQuery = searchQuery.toLowerCase();
      const filtered = departmentwiseData.filter((trainer) => {
        return [
          "Employee_Id",
          "Username",
          "Department",
          "Section",
          "Designation",
          "DOJ",
          "IsActive",
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
        ].some((field) =>
          trainer[field]?.toString().toLowerCase().includes(lowerSearchQuery)
        );
      });
      setdepartmentwiseData(filtered);
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
  const renderoverallTableRows = (data, isActualTab = true) => {
    return data.map((item, index) => {
      return (
        <tr key={item.EmployeeId || index}>
          <td className="px-4 py-2 border">{item.EmployeeId}</td>
          <td className="px-4 py-2 border">{item.Username}</td>
          <td className="px-4 py-2 border">{item.Department}</td>
          <td className="px-4 py-2 border">{item.Section}</td>
          <td className="px-4 py-2 border">{item.Designation}</td>
          <td className="px-4 py-2 border">{item.DOJ}</td>
          <td className="px-4 py-2 border">
            {item.IsActive == 1 ? "Active" : "Left"}
          </td>
          <td className="px-4 py-2 border text-right">{item.Jan}</td>
          <td className="px-4 py-2 border text-right">{item.Feb}</td>
          <td className="px-4 py-2 border text-right">{item.Mar}</td>
          <td className="px-4 py-2 border text-right">{item.Apr}</td>
          <td className="px-4 py-2 border text-right">{item.May}</td>
          <td className="px-4 py-2 border text-right">{item.Jun}</td>
          <td className="px-4 py-2 border text-right">{item.Jul}</td>
          <td className="px-4 py-2 border text-right">{item.Aug}</td>
          <td className="px-4 py-2 border text-right">{item.Sep}</td>
          <td className="px-4 py-2 border text-right">{item.Oct}</td>
          <td className="px-4 py-2 border text-right">{item.Nov}</td>
          <td className="px-4 py-2 border text-right">{item.Dec}</td>
          <td className="px-4 py-2 border text-right">{item.Total}</td>
        </tr>
      );
    });
  };

  const renderdepartmentwiseTableRows = (data, isActualTab = true) => {
    return data.map((item, index) => {
      return (
        <tr key={item.EmployeeId || index}>
          <td className="px-4 py-2 border">{item.EmployeeId}</td>
          <td className="px-4 py-2 border">{item.Username}</td>
          <td className="px-4 py-2 border">{item.Department}</td>
          <td className="px-4 py-2 border">{item.Section}</td>
          <td className="px-4 py-2 border">{item.Designation}</td>
          <td className="px-4 py-2 border">{item.DOJ}</td>
          <td className="px-4 py-2 border">
            {item.IsActive == 1 ? "Active" : "Left"}
          </td>
          <td className="px-4 py-2 border text-right">{item.Jan}</td>
          <td className="px-4 py-2 border text-right">{item.Feb}</td>
          <td className="px-4 py-2 border text-right">{item.Mar}</td>
          <td className="px-4 py-2 border text-right">{item.Apr}</td>
          <td className="px-4 py-2 border text-right">{item.May}</td>
          <td className="px-4 py-2 border text-right">{item.Jun}</td>
          <td className="px-4 py-2 border text-right">{item.Jul}</td>
          <td className="px-4 py-2 border text-right">{item.Aug}</td>
          <td className="px-4 py-2 border text-right">{item.Sep}</td>
          <td className="px-4 py-2 border text-right">{item.Oct}</td>
          <td className="px-4 py-2 border text-right">{item.Nov}</td>
          <td className="px-4 py-2 border text-right">{item.Dec}</td>
          <td className="px-4 py-2 border text-right">{item.Total}</td>
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
          <h1 className="font-semibold">Head Count</h1>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "overall"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-white hover:bg-sky-300"
            }`}
            onClick={() => setActiveTab("overall")}
          >
            Overall Summary
          </button>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "departmentwise"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-white hover:bg-sky-300"
            }`}
            onClick={() => setActiveTab("departmentwise")}
          >
            Department Wise Summary
          </button>
        </div>
      </div>

      {activeTab === "overall" && (
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
                  <div className="flex items-center space-x-2 text-sm">
                    <span>Show</span>
                    <select
                      className="border p-1 rounded bg-secondary"
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(
                          e.target.value === "All"
                            ? "All"
                            : parseInt(e.target.value)
                        );
                        setCurrentPage(1);
                      }}
                    >
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="All">All</option>
                    </select>
                    <span>entries</span>
                  </div>
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
                <div>
                  <table
                    className="min-w-full border z-0 rounded-lg bg-card text-sm"
                    style={{ tableLayout: "fixed", fontSize: "13px" }}
                  >
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        {[
                          { key: "EmployeeId", label: "Emp ID" },
                          { key: "Username", label: "Username" },
                          { key: "Department", label: "Department" },
                          { key: "Section", label: "Section" },
                          { key: "Designation", label: "Designation" },
                          { key: "DOJ", label: "DOJ" },
                          { key: "IsActive", label: "Status" },
                          { key: "Jan", label: "Jan" },
                          { key: "Feb", label: "Feb" },
                          { key: "Mar", label: "Mar" },
                          { key: "Apr", label: "Apr" },
                          { key: "May", label: "May" },
                          { key: "Jun", label: "Jun" },
                          { key: "Jul", label: "Jul" },
                          { key: "Aug", label: "Aug" },
                          { key: "Sep", label: "Sep" },
                          { key: "Oct", label: "Oct" },
                          { key: "Nov", label: "Nov" },
                          { key: "Dec", label: "Dec" },
                          { key: "Total", label: "Total" },
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
                    <tbody>{renderoverallTableRows(paginatedData, true)}</tbody>
                  </table>
                </div>
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
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "departmentwise" && (
        <>
          <div className="my-4 relative z-50">
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {/* Year Picker */}
              <div className="flex items-center space-x-2">
                <label className="font-semibold whitespace-nowrap">Year</label>
                <DatePicker
                  selected={departmentwiseSelectedDate}
                  onChange={(date) => setdepartmentwiseSelectedDate(date)}
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

              {/* Department Dropdown */}
              <div className="flex items-center space-x-2 min-w-[250px]">
                <label className="font-semibold whitespace-nowrap">
                  Department
                </label>
                <Select
                  options={options}
                  value={
                    options.find((o) => o.value === selectedDepartment) || null
                  }
                  onChange={(option) =>
                    setSelectedDepartment(option?.value || "")
                  }
                  placeholder="Select Department"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                      boxShadow: state.isFocused
                        ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
                        : "none",
                      borderRadius: "0.5rem",
                      minHeight: "2rem",
                      display: "flex",
                      alignItems: "center",
                      minWidth: "200px",
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 50,
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                  menuPortalTarget={document.body}
                />
              </div>
            </div>
          </div>

          {departmentwiseLoading && <p>Loading...</p>}
          {departmentwiseError && (
            <div className="flex justify-center items-center h-64 text-center text-red-500 mt-4">
              <p>{departmentwiseError}</p>
            </div>
          )}
          {departmentwiseSelectedDate &&
            selectedDepartment &&
            !departmentwiseLoading &&
            !departmentwiseError && (
              <div className="card-body p-0 pb-3">
                <div className="p-4 bg-card">
                  <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <span>Show</span>
                      <select
                        className="border p-1 rounded bg-secondary"
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(
                            e.target.value === "All"
                              ? "All"
                              : parseInt(e.target.value)
                          );
                          setCurrentPage(1);
                        }}
                      >
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="All">All</option>
                      </select>
                      <span>entries</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm"></div>
                    <div className="relative">
                      <input
                        type="text"
                        value={departmentwiseSearchTerm}
                        onChange={handledepartmentwiseSearchChange}
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
                          {[
                            { key: "EmployeeId", label: "Emp ID" },
                            { key: "Username", label: "Username" },
                            { key: "Department", label: "Department" },
                            { key: "Section", label: "Section" },
                            { key: "Designation", label: "Designation" },
                            { key: "DOJ", label: "DOJ" },
                            { key: "IsActive", label: "Status" },
                            { key: "Jan", label: "Jan" },
                            { key: "Feb", label: "Feb" },
                            { key: "Mar", label: "Mar" },
                            { key: "Apr", label: "Apr" },
                            { key: "May", label: "May" },
                            { key: "Jun", label: "Jun" },
                            { key: "Jul", label: "Jul" },
                            { key: "Aug", label: "Aug" },
                            { key: "Sep", label: "Sep" },
                            { key: "Oct", label: "Oct" },
                            { key: "Nov", label: "Nov" },
                            { key: "Dec", label: "Dec" },
                            { key: "Total", label: "Total" },
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
                        {renderdepartmentwiseTableRows(
                          paginateddepartmentwiseData,
                          true
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap justify-between items-center mt-4 text-sm">
                    <div>
                      Showing{" "}
                      {departmentwiseFilteredData.length > 0
                        ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                            currentPage * rowsPerPage,
                            departmentwiseFilteredData.length
                          )} of ${departmentwiseFilteredData.length} entries`
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
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        {"<"}
                      </button>
                      {Array.from(
                        { length: totalPagespaginateddepartmentwiseData },
                        (_, i) => (
                          <button
                            key={i}
                            className={`px-3 py-1 border rounded ${
                              currentPage === i + 1 ? "bg-black text-white" : ""
                            }`}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </button>
                        )
                      )}
                      <button
                        className="px-3 py-1 border rounded"
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(
                              p + 1,
                              totalPagespaginateddepartmentwiseData
                            )
                          )
                        }
                        disabled={
                          currentPage === totalPagespaginateddepartmentwiseData
                        }
                      >
                        {">"}
                      </button>
                      <button
                        className="px-3 py-1 border rounded"
                        onClick={() =>
                          setCurrentPage(totalPagespaginateddepartmentwiseData)
                        }
                        disabled={
                          currentPage === totalPagespaginateddepartmentwiseData
                        }
                      >
                        {">>"}
                      </button>
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
