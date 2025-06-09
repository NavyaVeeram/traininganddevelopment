"use client";
import { FaSearch } from "react-icons/fa";
import { useMemo, useState, useEffect, useRef } from "react";
import Select from "react-select";

const EmployeeHistoryList = () => {
  const [EmployeeId, setEmployeeId] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trainingDetails, setTrainingDetails] = useState({
    Username: "",
    Department: "",
    Section: "",
    Designation: "",
    Emp_Type: "",
    Emp_Category: "",
    No_Hrs: "",
    DOJ: "",
    DOJFormatted: "",
    IsActive: "",
  });
  const [qualifiedTrainers, setQualifiedTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const dropdownRef = useRef(null);
const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
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
             if (data.Access_Role === "Res_Person" || data.Access_Role === "HOS" || data.Access_Role === "HOD") {
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
     
  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // setIsOpen(false);
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
    setEmployeeId(null);
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
  };
  useEffect(() => {
    if (EmployeeId) {
      fetchQualifiedTrainers(EmployeeId);
      setRowsPerPage(10);
      setCurrentPage(1);
    }
  }, [EmployeeId]);

  const filteredData = sortedData.filter(
    (trainer) =>
      tableSearchTerm === "" ||
      trainer.EmployeeId?.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
      trainer.Training_Name?.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
      trainer.Program_Name?.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
      trainer.Train_Mode?.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
      trainer.No_Hrs?.toString().includes(tableSearchTerm) ||
      trainer.Training_Date?.toString().includes(tableSearchTerm)
  );

  const totalPages = rowsPerPage === "All" ? 1 : Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData =
    rowsPerPage === "All"
      ? filteredData
      : filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    const fetchEmployeeOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/user_dropdown");
        const data = await res.json();
        if (res.status === 200) {
          setEmployeeOptions(data);
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

  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value;
    setTableSearchTerm(searchQuery);
  };

  const handleClearTableSearch = async () => {
    setTableSearchTerm("");
    await fetchQualifiedTrainers(EmployeeId);
  };

  const fetchQualifiedTrainers = async (empId) => {
    if (!empId) return;
    setLoading(true);
    setError(null);

    try {
      const url = `/api/get_employee_history_table?EmployeeId=${empId}`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.status === 200) {
        if (Array.isArray(data)) {
          const formatDateYYYYMMDD = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };
          const formattedData = data.map(item => ({
            ...item,
            Training_DateFormatted: item.Training_Date ? formatDateYYYYMMDD(item.Training_Date) : "",
          }));
          setQualifiedTrainers(formattedData);
          if (data.length === 0) {
            setError("No data found for the selected employee.");
          }
        } else if (Object.keys(data).length === 0) {
          setQualifiedTrainers([]);
          setError("No data found for the selected employee.");
        } else {
          console.error("Unexpected response:", data);
          setQualifiedTrainers([]);
          setError(data.message || "Error fetching qualified trainers data");
        }
      } else if (res.status === 404) {
        setQualifiedTrainers([]);
        setError(null);
      } else {
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
    if (!selectedOption) {
      setEmployeeId(null);
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
      setQualifiedTrainers([]);
      return;
    }
    const selectedEmployeeId = selectedOption.value;
    setEmployeeId(selectedEmployeeId);
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
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/get_emp_history?EmployeeId=${selectedEmployeeId}`);
        const data = await res.json();

        if (res.status === 200) {
          const formatDateYYYYMMDD = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };
          const formattedDOJ = data.DOJ ? formatDateYYYYMMDD(data.DOJ) : "";
          setTrainingDetails({
            Username: data.Username || "",
            Department: data.Department || "",
            Section: data.Section || "",
            Designation: data.Designation || "",
            Emp_Type: data.Emp_Type || "",
            Emp_Category: data.Emp_Category || "",
            No_Hrs: data.No_Hrs,
            DOJ: data.DOJ || "",
            DOJFormatted: formattedDOJ,
            IsActive: data.IsActive || "",
          });
          setError(null);
        } else if (res.status === 404) {
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
          setError(null);
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
  const options = employeeOptions.map((option) => ({
    value: option.Value,
    label: option.Text,
  }));
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
      selector: (row) => (row.Training_Date ? new Date(row.Training_Date).toLocaleDateString() : ""),
      sortable: true,
    },
  ];

  const paginationComponentOptions = {
    rowsPerPageText: "Rows per page:",
    rangeSeparatorText: "of ",
    selectAllRowsItem: true,
    selectAllRowsItemText: "All",
  };
 if (isAuthorized === null) {
    return (
      <div>Loading..</div>
      // <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
      //   <div className="bg-white p-10 rounded shadow text-center">
      //     <h2 className="text-2xl font-bold">Loading...</h2>
      //   </div>
      // </div>
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
    <div>
      <div className="max-w-full mx-auto bg-white p-2 rounded-lg w-full">
        <div className="bg-sky-400 flex text-white justify-between p-2 rounded-t-lg">
          <div className="text-lg font-semibold">Employee History</div>
          <div className="flex items-center space-x-2"></div>
        </div>
        <br />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-900">Select EmployeeId:</label>
            <div>
                   <Select
               options={options}
               value={options.find((o) => o.value === EmployeeId) || null}
               onChange={handleEmployeeIdChange}
               placeholder="Select EmployeeId"
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
            />
          </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Username</label>
            <input
              type="text"
              value={trainingDetails.Username || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Department</label>
            <input
              type="text"
              value={trainingDetails.Department || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Section</label>
            <input
              type="text"
              value={trainingDetails.Section || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-900">Designation</label>
            <input
              type="text"
              value={trainingDetails.Designation || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Emp Type</label>
            <input
              type="text"
              value={trainingDetails.Emp_Type || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Emp Category</label>
            <input
              type="text"
              value={trainingDetails.Emp_Category || ""}
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
              value={trainingDetails.DOJFormatted || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Status</label>
            <input
              type="text"
              value={trainingDetails.IsActive || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
        </div>

        <br />
        {EmployeeId && (
          <div className="card rounded-lg  mt-6">
            <div className="card-header  text-black rounded-t-lg py-3 px-3">
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
                          { key: "Training_Date", label: "Training Date" },
                        ].map(({ key, label }, index) => (
                          <th
                            key={key}
                            className={`px-4 py-2 border text-left cursor-pointer ${
                              index === 0 ? "left-0 bg-muted z-20" : ""
                            }`}
                            onClick={() => handleSort(key)}
                          >
                            {label}{" "}
                            {sortConfig.key === key ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => (
                          <tr key={index} className="hover:bg-muted border">
                            <td className="px-4 py-2 border left-0 bg-white z-10">{item.EmployeeId}</td>
                            <td className="px-4 py-2 border">{item.Training_Name}</td>
                            <td className="px-4 py-2 border">{item.Program_Name}</td>
                            <td className="px-4 py-2 border">{item.Train_Mode}</td>
                            <td className="px-4 py-2 border">{item.No_Hrs}</td>
                            <td className="px-4 py-2 border">
                              {item.Training_Date ? item.Training_DateFormatted : ""}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            No results found.
                          </td>
                        </tr>
                      )}
                    </tbody>
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
                          currentPage === i + 1 ? "bg-primary text-white" : ""
                        }`}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeHistoryList;
