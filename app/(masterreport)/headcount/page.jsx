
"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch } from "react-icons/fa";
import Select from "react-select";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";

const HeadCount = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("overall");
  const [selectedDate, setSelectedDate] = useState(null);
  const [trainingData, setTrainingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Pagination removed - displaying all data
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

  // Export to Excel function moved inside component to access state
  const exportToExcel = () => {
    let dataToExport = [];
    let sheetName = "";

    if (activeTab === "overall") {
      dataToExport = trainingData;
      sheetName = "Overall Summary";
    } else if (activeTab === "departmentwise") {
      dataToExport = departmentwiseData;
      sheetName = "Department Wise Summary";
    } else {
      return;
    }

    if (!dataToExport || dataToExport.length === 0) {
      alert("No data to export");
      return;
    }

    // Format data for export: map keys to readable headers
    const formattedData = dataToExport.map((item) => ({
      "Emp ID": item.EmployeeId || item.Employee_Id || "",
      Username: item.Username || "",
      Department: item.Department || "",
      Section: item.Section || "",
      Designation: item.Designation || "",
      DOJ: item.DOJ || "",
      IsActive: item.Active_Status || "",
      Jan: item.Jan || "",
      Feb: item.Feb || "",
      Mar: item.Mar || "",
      Apr: item.Apr || "",
      May: item.May || "",
      Jun: item.Jun || "",
      Jul: item.Jul || "",
      Aug: item.Aug || "",
      Sep: item.Sep || "",
      Oct: item.Oct || "",
      Nov: item.Nov || "",
      Dec: item.Dec || "",
      Total: item.Total || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${sheetName}.xlsx`);
  };

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
      
      // Filter out any header rows or invalid data
      const filteredData = data.filter(item => 
        item && 
        item.EmployeeId && 
        typeof item.EmployeeId === 'string' &&
        item.EmployeeId.trim() !== '' &&
        item.EmployeeId !== 'EmployeeId' && 
        item.EmployeeId !== 'Emp ID' &&
        !item.EmployeeId.toString().toLowerCase().includes('total')
      );
      
      console.log(
        "Filtered data count:",
        filteredData.length,
        "Original count:",
        data.length
      );
      
      if (filteredData && filteredData.length === 0) {
        setError("No data available for the selected Year.");
        setFilteredData([]);
      } else {
        setTrainingData(filteredData);
        setFilteredData(filteredData);
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
      
      // Filter out any header rows or invalid data
      const filteredData = data.filter(item => 
        item && 
        item.EmployeeId && 
        typeof item.EmployeeId === 'string' &&
        item.EmployeeId.trim() !== '' &&
        item.EmployeeId !== 'EmployeeId' && 
        item.EmployeeId !== 'Emp ID' &&
        !item.EmployeeId.toString().toLowerCase().includes('total')
      );
      
      console.log(
        "Filtered departmentwise data count:",
        filteredData.length,
        "Original count:",
        data.length
      );
      
      if (filteredData && filteredData.length === 0) {
        setdepartmentwiseError("No data available for the selected Year.");
        setdepartmentwiseFilteredData([]);
      } else {
        setdepartmentwiseData(filteredData);
        setdepartmentwiseFilteredData(filteredData);
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

  // Pagination removed - displaying all data
  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value;
    setTableSearchTerm(searchQuery);
    if (!searchQuery) {
      setFilteredData(trainingData);
    } else {
      const lowerSearchQuery = searchQuery.toLowerCase();
      const filtered = trainingData.filter((trainer) => {
        return [
          "EmployeeId",
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
          String(trainer[field] || '').toLowerCase().includes(lowerSearchQuery)
        );
      });
      setFilteredData(filtered);
    }
  };

  const handledepartmentwiseSearchChange = (e) => {
    const searchQuery = e.target.value;
    setdepartmentwiseSearchTerm(searchQuery);
    if (!searchQuery) {
      setdepartmentwiseFilteredData(departmentwiseData);
    } else {
      const lowerSearchQuery = searchQuery.toLowerCase();
      const filtered = departmentwiseData.filter((trainer) => {
        return [
          "EmployeeId",
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
      setdepartmentwiseFilteredData(filtered);
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

  // Calculate totals for the data
  const calculateTotals = (data) => {
    const totals = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
      Total: 0
    };
    
    data.forEach(item => {
      Object.keys(totals).forEach(key => {
        const value = parseInt(item[key]) || 0;
        totals[key] += value;
      });
    });
    
    return totals;
  };

  // Render table rows with totals row
  const renderoverallTableRows = (data, isActualTab = true) => {
    const totals = calculateTotals(data);
    
    return (
      <>
        {data.map((item, index) => (
          <tr key={item.EmployeeId || index}>
            <td className="px-4 py-2 border">{item.EmployeeId}</td>
            <td className="px-4 py-2 border">{item.Username}</td>
            <td className="px-4 py-2 border">{item.Department}</td>
            <td className="px-4 py-2 border">{item.Section}</td>
            <td className="px-4 py-2 border">{item.Designation}</td>
            <td className="px-4 py-2 border">{item.DOJ}</td>
            <td className="px-4 py-2 border">
              {item.IsActive}
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
        ))}
        {data.length > 0 && (
          <tr className="bg-gray-100 font-bold sticky bottom-0">
            <td className="px-4 py-2 border text-center" colSpan="7">Grand Total</td>
            <td className="px-4 py-2 border text-right">{totals.Jan}</td>
            <td className="px-4 py-2 border text-right">{totals.Feb}</td>
            <td className="px-4 py-2 border text-right">{totals.Mar}</td>
            <td className="px-4 py-2 border text-right">{totals.Apr}</td>
            <td className="px-4 py-2 border text-right">{totals.May}</td>
            <td className="px-4 py-2 border text-right">{totals.Jun}</td>
            <td className="px-4 py-2 border text-right">{totals.Jul}</td>
            <td className="px-4 py-2 border text-right">{totals.Aug}</td>
            <td className="px-4 py-2 border text-right">{totals.Sep}</td>
            <td className="px-4 py-2 border text-right">{totals.Oct}</td>
            <td className="px-4 py-2 border text-right">{totals.Nov}</td>
            <td className="px-4 py-2 border text-right">{totals.Dec}</td>
            <td className="px-4 py-2 border text-right">{totals.Total}</td>
          </tr>
        )}
      </>
    );
  };

  const renderdepartmentwiseTableRows = (data, isActualTab = true) => {
    const totals = calculateTotals(data);
    
    return (
      <>
        {data.map((item, index) => (
          <tr key={item.EmployeeId || index}>
            <td className="px-4 py-2 border">{item.EmployeeId}</td>
            <td className="px-4 py-2 border">{item.Username}</td>
            <td className="px-4 py-2 border">{item.Department}</td>
            <td className="px-4 py-2 border">{item.Section}</td>
            <td className="px-4 py-2 border">{item.Designation}</td>
            <td className="px-4 py-2 border">{item.DOJ}</td>
            <td className="px-4 py-2 border">
              {item.IsActive}
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
        ))}
        {data.length > 0 && (
          <tr className="bg-gray-100 font-bold sticky bottom-0">
            <td className="px-4 py-2 border text-center" colSpan="7">Grand Total</td>
            <td className="px-4 py-2 border text-right">{totals.Jan}</td>
            <td className="px-4 py-2 border text-right">{totals.Feb}</td>
            <td className="px-4 py-2 border text-right">{totals.Mar}</td>
            <td className="px-4 py-2 border text-right">{totals.Apr}</td>
            <td className="px-4 py-2 border text-right">{totals.May}</td>
            <td className="px-4 py-2 border text-right">{totals.Jun}</td>
            <td className="px-4 py-2 border text-right">{totals.Jul}</td>
            <td className="px-4 py-2 border text-right">{totals.Aug}</td>
            <td className="px-4 py-2 border text-right">{totals.Sep}</td>
            <td className="px-4 py-2 border text-right">{totals.Oct}</td>
            <td className="px-4 py-2 border text-right">{totals.Nov}</td>
            <td className="px-4 py-2 border text-right">{totals.Dec}</td>
            <td className="px-4 py-2 border text-right">{totals.Total}</td>
          </tr>
        )}
      </>
    );
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
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeTab === "overall"
              ? "bg-white text-sky-600 shadow-sm"
              : "text-white hover:bg-sky-300"
              }`}
            onClick={() => setActiveTab("overall")}
          >
            Overall Summary
          </button>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeTab === "departmentwise"
              ? "bg-white text-sky-600 shadow-sm"
              : "text-white hover:bg-sky-300"
              }`}
            onClick={() => setActiveTab("departmentwise")}
          >
            Department Wise Summary
          </button>
        </div>
      </div>

      {/* Export Button below the sky blue header */}
      {/* <div className="p-2 bg-white  flex justify-end">
  <button
    onClick={() => exportToExcel()}
    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs font-medium"
    title="Export to Excel"
  >
    <FaFileExcel size={18}  />
    <span>Export Excel</span>
  </button>
</div> */}


      {activeTab === "overall" && (
        <>
          <div className="p-2 bg-white flex items-center justify-between flex-wrap gap-4">
            {/* Year dropdown */}
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

            {/* Excel Export Button */}
            {selectedDate && !loading && !error && filteredData.length > 0 && (
              <button
                onClick={() => exportToExcel()}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs font-medium"
                title="Export to Excel"
              >
                <FaFileExcel size={18} />
              </button>
            )}
          </div>

         

         {selectedDate && (
  <>
    {loading && <p>Loading...</p>}

    {error && (
      <div className="flex justify-center items-center h-64 text-center text-red-500 mt-4">
        <p>{error}</p>
      </div>
    )}
             {!loading && !error && (
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
                      <tbody>{renderoverallTableRows(sortedData, true)}</tbody>
                      </table>
                    </div>
                    <div className="flex flex-wrap justify-between items-center mt-4 text-sm">
                      {/* Pagination removed - displaying all data */}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === "departmentwise" && (
        <>
          <div className="my-4 relative z-50">
            <div className="mt-2 flex flex-wrap items-center gap-4 justify-between">
              {/* Left Section: Year + Department */}
              <div className="flex flex-wrap items-center gap-4">
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
                  <label className="font-semibold whitespace-nowrap">Department</label>
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

              {/* Right Section: Export Button */}
              {departmentwiseSelectedDate && selectedDepartment && !departmentwiseLoading && !departmentwiseError && departmentwiseFilteredData.length > 0 && (
                <div className="flex items-center">
                  <button
                    onClick={() => exportToExcel()}
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs font-medium"
                    title="Export to Excel"
                  >
                    <FaFileExcel size={18} />
                  </button>
                </div>
              )}
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
                        {renderdepartmentwiseTableRows(
                          sorteddepartmentwiseData,
                          true
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap justify-between items-center mt-4 text-sm">
                    {/* Pagination removed - displaying all data */}
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

function exportToExcel() {
  let dataToExport = [];
  let sheetName = "";

  if (typeof window === "undefined") return;

  const activeTab = document.querySelector(
    ".bg-white.text-sky-600.shadow-sm"
  )?.textContent;

  if (activeTab === "Overall Summary") {
    // Get data from the overall tab table
    const table = document.querySelector("table");
    if (!table) return;
    dataToExport = extractTableData(table);
    sheetName = "Overall Summary";
  } else if (activeTab === "Department Wise Summary") {
    // Get data from the departmentwise tab table
    const table = document.querySelector("table");
    if (!table) return;
    dataToExport = extractTableData(table);
    sheetName = "Department Wise Summary";
  } else {
    return;
  }

  if (dataToExport.length === 0) {
    alert("No data to export");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${sheetName}.xlsx`);
}

function extractTableData(table) {
  const data = [];
  const headers = [];
  const headerCells = table.querySelectorAll("thead tr th");
  headerCells.forEach((headerCell) => {
    headers.push(headerCell.textContent.trim());
  });

  const rows = table.querySelectorAll("tbody tr");
  rows.forEach((row) => {
    const rowData = {};
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, index) => {
      rowData[headers[index]] = cell.textContent.trim();
    });
    data.push(rowData);
  });

  return data;
}
