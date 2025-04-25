"use client";
import { FaSearch } from "react-icons/fa";
import { useMemo,useState, useEffect, useRef } from "react";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Ensure you import the datepicker styles.
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
const EmployeeHistoryList = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [EmployeeId, setEmployeeId] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [trainingDetails, setTrainingDetails] = useState({
    Username: "",
    Department: "",
    Section: "",
    Designation: "",
    Emp_Type: "",
    Emp_Category: "",
    No_Hrs: "",
    DOJ: "",
    IsActive: "",
  });
  const [qualifiedTrainers, setQualifiedTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

const sortedData = useMemo(() => {
  let sortableItems = [...qualifiedTrainers];
  if (sortConfig.key) {
    sortableItems.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }
  return sortableItems;
}, [qualifiedTrainers, sortConfig]);

const handleSort = (key) => {
  let direction = "asc";
  if (sortConfig.key === key && sortConfig.direction === "asc") {
    direction = "desc";
  }
  setSortConfig({ key, direction });
};
const handleClear = () => {
  setSearchTerm("");
  setEmployeeId(null);
  setTrainingDetails({ Username: "", Department: "", Section: "", Designation: "", Emp_Type: "",Emp_Category:"",No_Hrs:"", DOJ: "" ,IsActive:""});
  setFilteredOptions(employeeOptions);
};
const isYearEnabled = (date) => {
  const year = date.getFullYear();
  return [2024, 2025, 2026].includes(year);
};
  useEffect(() => {
    if (EmployeeId && selectedDate) {
      const year = selectedDate.year(); 
    // Get the year from the selected date
      console.log("Selected Year:", year);  // Debugging log
      fetchQualifiedTrainers(EmployeeId, year); // Pass both EmployeeId and year to the function
      setRowsPerPage(10);
      setCurrentPage(1);
   
    }
  }, [EmployeeId, selectedDate]);  // Ensure selectedDate is a dependency
// Filter and pagination
const filteredData = sortedData.filter((trainer) =>
  tableSearchTerm === "" ||
  trainer.EmployeeId?.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
  trainer.Training_Name?.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
  trainer.Program_Name?.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
  trainer.Train_Mode?.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
  trainer.No_Hrs?.toString().includes(tableSearchTerm) ||
  trainer.Training_Date?.toString().includes(tableSearchTerm)
);

const totalPages = rowsPerPage === "All" ? 1 : Math.ceil(filteredData.length / rowsPerPage);
const paginatedData = rowsPerPage === "All"
  ? filteredData
  : filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);


  // Fetch employee options
  useEffect(() => {
    const fetchEmployeeOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/user_dropdown");
        const data = await res.json();
        if (res.status === 200) {
          setEmployeeOptions(data);
          setFilteredOptions(data);
          fetchQualifiedTrainers();
        } else {
          setError(data.message || "Error fetching employee data");
        }
      } catch (err) {
        setError("Failed to fetch employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeOptions();
  }, []);

  // Fetch employee history data
  
  

  // Handle input changes to search employee options
  const handleSearchChange = (e) => {
    const searchQuery = e.target.value;
    setSearchTerm(searchQuery);

    const filtered = employeeOptions.filter((option) =>
      option.Text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value;
    setTableSearchTerm(searchQuery);

    if (searchQuery === "") {
      fetchQualifiedTrainers(EmployeeId);
    } else {
      const filteredData = qualifiedTrainers.filter((trainer) =>
        trainer.EmployeeId.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.Training_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.Train_Mode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.Program_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.No_Hrs.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.Training_Date.toString().toLowerCase().includes(searchQuery.toLowerCase()) 
      );
      setQualifiedTrainers(filteredData);
    }
  };

  const handleClearTableSearch = async () => {
    setTableSearchTerm("");
    await fetchQualifiedTrainers(EmployeeId);
  };
 


  // Handle selection of employee ID from the dropdown
  const fetchQualifiedTrainers = async (empId) => {
    if  (!empId || !selectedDate) return;
    const year = selectedDate.year(); 
    setLoading(true);
    setError(null);
  
    try {
      const url = `/api/get_employee_history_table?EmployeeId=${empId}&Year_No=${year}`;
      console.log("Fetching qualified trainers with URL:", url);
      const res = await fetch(url);
      const data = await res.json();
      console.log("Response status:", res.status, "Data:", data);
  
      if (res.status === 200) {
        if (Array.isArray(data)) {
          setQualifiedTrainers(data);
          if (data.length === 0) {
            setError("No data found for the selected year and employee.");
          }
        } else if (Object.keys(data).length === 0) {
          // Empty object received, treat as no data
          setQualifiedTrainers([]);
          setError("No data found for the selected year and employee.");
        } else {
          // For unexpected response, log error and set error message
          console.error("Unexpected response:", data);
          setQualifiedTrainers([]);
          setError(data.message || "Error fetching qualified trainers data");
        }
      } else if (res.status === 404) {
        // If no data found for first API, clear qualifiedTrainers but do not affect trainingDetails
        setQualifiedTrainers([]);
        setError(null); // Clear error to avoid hiding UI unnecessarily
      } else {
        // For non-200 status, log error and set error message
        console.error("Unexpected response:", data);
        setQualifiedTrainers([]);
        setError(data.message || "Error fetching qualified trainers data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch qualified trainers data");
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleEmployeeIdChange = async (selectedOption) => {
    const selectedEmployeeId = selectedOption.Value;
    console.log("Selected Employee ID:", selectedEmployeeId); // Debugging log
    setEmployeeId(selectedEmployeeId);
    setSearchTerm(selectedOption.Text);
    setIsOpen(false);
    setTrainingDetails({
      Username: "",
      Department: "",
      Section: "",
      Designation: "",
      Emp_Type: "",
      Emp_Category: "",
      No_Hrs: "",
      DOJ: "",
      IsActive: "",
    });
  
    if (selectedEmployeeId) {
      const year = selectedDate.year();
      setLoading(true);
      setError(null);
      await fetchQualifiedTrainers(selectedEmployeeId, selectedDate.year()); 
      try {
        // Fetch individual employee details
        const res = await fetch(`/api/get_emp_history?EmployeeId=${selectedEmployeeId}&Year_No=${year}`);
        const data = await res.json();
  
        if (res.status === 200) {
          const formattedDOJ = data.DOJ ? new Date(data.DOJ).toLocaleDateString() : '';
          setTrainingDetails({
            Username: data.Username || '',
            Department: data.Department || '',
            Section: data.Section || '',
            Designation: data.Designation || '',
            Emp_Type: data.Emp_Type || '',
            Emp_Category: data.Emp_Category || '',
            No_Hrs: data.No_Hrs ?? '',
            DOJ: formattedDOJ,
            IsActive: data.IsActive || '',
          });
          setError(null); // Clear error related to second API on success
        } else if (res.status === 404) {
          // If no data found for second API, clear trainingDetails but do not affect qualifiedTrainers
          setTrainingDetails({
            Username: '',
            Department: '',
            Section: '',
            Designation: '',
            Emp_Type: '',
            Emp_Category: '',
            No_Hrs: '',
            DOJ: '',
            IsActive: '',
          });
          setError(null); // Clear error to avoid hiding first API data
        } else {
          setError(data.message || "Error fetching employee details");
        }
      } catch (err) {
        setError("Failed to fetch employee data");
      } finally {
        setLoading(false);
      }
    }
  };
  
  const columns = [
    {
      name: "Employee ID",
      selector: (row) => row.EmployeeId,
      sortable: true,
      width: "10%",
    },
    {
      name: "Training Name",
      selector: (row) => row.Training_Name,
      sortable: true,
    },
    {
      name: "Program Name",
      selector: (row) => row.Program_Name,
      sortable: true,
    },
    {
      name: "Training Mode",
      selector: (row) => row.Train_Mode,
      sortable: true,
    },
    {
      name: "Hours",
      selector: (row) => row.No_Hrs,
      sortable: true,
      width: "8%",
    },
    {
      name: "Training Date",
      selector: (row) =>
        row.Training_Date ? new Date(row.Training_Date).toLocaleDateString() : "",
      sortable: true,
    },
  ];
  

  const paginationComponentOptions = {
    rowsPerPageText: "Rows per page:",
    rangeSeparatorText: "of ",
    selectAllRowsItem: true,
    selectAllRowsItemText: "All",
  };

  
  return (
    <div>
      <div className="max-w-full mx-auto bg-white p-4 shadow-md rounded-lg w-full">
        <div className="bg-sky-600 flex text-white justify-between p-2 rounded-t-lg">
          <div className="text-lg font-semibold">Employee History</div>
      <div className="flex items-center space-x-2">
                {/* <label className="block text-sm font-medium text-gray-900">Year</label> */}
                {/* <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy"
                    showYearPicker
                  className="p-2 border border-gray-300 rounded-lg"
                  calendarClassName="z-50" 
                  popperPlacement="top-start"
                  popperModifiers={{
                    preventOverflow: {
                      enabled: true,
                      boundariesElement: "viewport",
                    },
                  }}
                  filterDate={isYearEnabled}
                /> */}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={<span className="text-gray-800 dark:text-white">Select</span>}
            views={["year"]}
            openTo="year"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10" // Add padding to the right for the icon
            sx={{
              "& .MuiInputBase-root": {
                color: "var(--borderclr)",
                borderRadius: "8px",
                fontSize: "14px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--borderclr)"
              },
              "& .MuiSvgIcon-root": {
                color: "var(--borderclr)",
              },
            }}
          />
        </LocalizationProvider>
              </div>
        </div>
        <br />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Custom Searchable Dropdown */}
          <div>
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-900">Select EmployeeId:</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Select EmployeeId"
                  onFocus={() => setIsOpen(true)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
                />
                <div
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
                  onClick={() => setIsOpen((prev) => !prev)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
{/* Clear button (cross mark) */}
                {searchTerm && (
                  <button
                    onClick={handleClear}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-600 text-2xl cursor-pointer hover:text-gray-800"
                  >
                    &times;
                  </button>
                )}

                {/* Custom dropdown */}
                {isOpen && (
                  <div className="absolute w-full bg-white shadow-md border border-gray-300 z-10 max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((option) => (
                        <div
                          key={option.Value}
                          onClick={() => handleEmployeeIdChange(option)}
                          className="cursor-pointer p-2 hover:bg-gray-100"
                        >
                          {option.Text}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500">No results found</div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Other form fields */}
          <div>
            <label className="block text-sm font-medium text-gray-900">Username</label>
            <input
              type="text"
              value={trainingDetails.Username}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Department</label>
            <input
              type="text"
              value={trainingDetails.Department}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Section</label>
            <input
              type="text"
              value={trainingDetails.Section}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Designation</label>
            <input
              type="text"
              value={trainingDetails.Designation}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Emp Type</label>
            <input
              type="text"
              value={trainingDetails.Emp_Type}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Emp Category</label>
            <input
              type="text"
              value={trainingDetails.Emp_Category}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Total Hrs</label>
            <input
              type="text"
              value={trainingDetails.No_Hrs}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">DOJ</label>
            <input
              type="text"
              value={trainingDetails.DOJ}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Status</label>
            <input
              type="text"
              value={trainingDetails.IsActive}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
        </div>

        <br />
          {/* Conditional Section for Employee History */}
          {EmployeeId && (
        <div className="card shadow rounded-lg bg-[var(--bgBody)] mt-6">
  <div className="card-header bg-[var(--bgBody)] text-black rounded-t-lg py-3 px-3">
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
      <div className="flex flex-col">
        <h2 className="text-sm font-bold">Employee Training History</h2>
      </div>
    </div>
  </div>

  <div className="card-body p-0 overflow-x-auto pb-3">
    <div className="p-4 bg-card">
      <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <span>Show</span>
          <select
            className="border p-1 rounded bg-secondary"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(e.target.value === "All" ? "All" : parseInt(e.target.value));
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

        <div className="relative">
          <input
            type="text"
            className="border p-1 pt-[0.9] pl-8 rounded bg-secondary"
            placeholder="Search..."
            value={tableSearchTerm}
            onChange={handleTableSearchChange}
          />
          <FaSearch className="absolute left-2 top-2 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table
          className="min-w-full border rounded-lg bg-card text-sm"
          style={{ tableLayout: "fixed", fontSize: "13px" }}
        >
          <thead className="bg-muted sticky top-0 z-10">
            <tr>
              {[
                { key: "EmployeeId", label: "Employee ID" },
                { key: "Training_Name", label: "Training Name" },
                { key: "Program_Name", label: "Program Name" },
                { key: "Train_Mode", label: "Training Mode" },
                { key: "No_Hrs", label: "Hours" },
                { key: "Training_Date", label: "Training Date" }
              ].map(({ key, label }, index) => (
                <th
                  key={key}
                  className={`px-4 py-2 border text-left cursor-pointer ${
                    index === 0 ? "sticky left-0 bg-muted z-20" : ""
                  }`}
                  onClick={() => handleSort(key)}
                >
                  {label}{" "}
                  {/* {sortConfig.key === key && (sortConfig.direction === "asc" ? "▲" : "▼")} */}
                  {sortConfig.key === key ? (
                          sortConfig.direction === "asc" ? "▲" : "▼"
                        ) : (
                          "↕"
                        )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-muted border">
                  <td className="px-4 py-2 border sticky left-0 bg-white z-10">{item.EmployeeId}</td>
                  <td className="px-4 py-2 border">{item.Training_Name}</td>
                  <td className="px-4 py-2 border">{item.Program_Name}</td>
                  <td className="px-4 py-2 border">{item.Train_Mode}</td>
                  <td className="px-4 py-2 border">{item.No_Hrs}</td>
                  <td className="px-4 py-2 border">
                    {item.Training_Date ? new Date(item.Training_Date).toLocaleDateString() : ""}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">No results found.</td>
              </tr>
            )}
          </tbody>
          </table>
      </div>

      {/* Pagination UI */}
      { (
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
            <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>{"<<"}</button>
            <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>{"<"}</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-primary text-white" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>{">"}</button>
            <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>{">>"}</button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

          )}
      </div>
    </div>
  );
};

export default EmployeeHistoryList;
