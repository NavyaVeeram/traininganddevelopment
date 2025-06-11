"use client";
import { FaEdit, FaSearch, FaSortUp } from "react-icons/fa";
import { useState, useEffect, useRef, useMemo } from "react";
import DataTable from "react-data-table-component";
import Select from "react-select";

const QualifiedTrainerList = () => {
  const [data, setData] = useState([]);
  const [EmployeeId, setEmployeeId] = useState(null);

  // Add useEffect to set EmployeeId from localStorage on mount
  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    }
  }, []);

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [trainingDetails, setTrainingDetails] = useState({
    Username: "",
    Department: "",
    Section: "",
    Designation: "",
    Gender: "",
    DOJ: "",
  });
  const [qualifiedTrainers, setQualifiedTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [trainingName, setTrainingName] = useState("");
  const [certified, setCertified] = useState(false);
  const [exp5Yr, setExp5Yr] = useState(false);
  const [exp3Yr, setExp3Yr] = useState(false);
  const [hodRec, setHodRec] = useState(false);
  const [qualified, setQualified] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const options = employeeOptions.map((option) => ({
    value: option.Value,
    label: option.Text,
  }));
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
     
  // Fetch employee options
  useEffect(() => {
    const fetchEmployeeOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/user_qualified_dropdown");
        const data = await res.json();
        if (res.status === 200) {
          setEmployeeOptions(data);
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

  // Fetch qualified trainers list
  const fetchQualifiedTrainers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/view_qualifier_list");
      const data = await res.json();
      if (res.status === 200) {
        setQualifiedTrainers(data);
        setData(data);
        setFilteredData(data);
      } else {
        setError(data.message || "Error fetching qualified trainers data");
      }
    } catch (err) {
      setError("Failed to fetch qualified trainers data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualifiedTrainers(); // Call the function when the component mounts
  }, []); // Empty dependency array means this will run once when the component mounts

  const resetForm = () => {
    setTrainingDetails({
      Username: "",
      Department: "",
      Section: "",
      Designation: "",
      Gender: "",
      DOJ: "",
    });
    setEmployeeId(null);
    setTrainingName("");
    setCertified(false);
    setExp5Yr(false);
    setExp3Yr(false);
    setHodRec(false);
    setQualified(false);
  };

  // Handle selection of employee ID from the dropdown
  const handleEmployeeIdChange = async (selectedOption) => {
    const selectedEmployeeId = selectedOption ? selectedOption.value : null;
    setEmployeeId(selectedEmployeeId);
    setTrainingDetails({
      Username: "",
      Department: "",
      Section: "",
      Designation: "",
      Gender: "",
      DOJ: "",
    });

    if (selectedEmployeeId) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/get_user_details?EmployeeId=${selectedEmployeeId}`
        );
        const data = await res.json();

        if (res.status === 200) {
          const formattedDOJ = data.DOJ
            ? new Date(data.DOJ).toLocaleDateString()
            : "";
          setTrainingDetails({
            Username: data.Username || "",
            Department: data.Department || "",
            Section: data.Section || "",
            Designation: data.Designation || "",
            Gender: data.Gender || "",
            DOJ: formattedDOJ,
          });
        } else {
          setError(data.message || "Error fetching user details");
        }
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCheckboxChange = (setter, currentState, checkboxName) => {
    setter((prev) => {
      const newValue = !prev;
      const updatedState = {
        certified,
        exp3Yr,
        exp5Yr,
        hodRec,
        [checkboxName]: newValue,
      };

      const isAnyChecked = Object.values(updatedState).some((value) => value);

      setQualified(isAnyChecked);

      return newValue;
    });
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!qualified) {
      alert("You must check the Qualified checkbox!");
      return;
    }

    // Get CreatedBy from localStorage directly
    const createdByFromStorage = localStorage.getItem('employeeId');

    const dataToSubmit = {
      Training_Name: trainingName,
      EmployeeId: EmployeeId,
      Certified: certified ? 1 : 0,
      Exp_5_Yr: exp5Yr ? 1 : 0,
      Exp_3_Yr: exp3Yr ? 1 : 0,
      HOD_Rec: hodRec ? 1 : 0,
      Qualified: qualified ? 1 : 0,
      CreatedBy: createdByFromStorage || "", // Use localStorage EmployeeId for CreatedBy
    };

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/insert_qualified_trainer_list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });
      const responseData = await res.json();

      if (res.ok) {
        alert(` ${responseData.message}`);
        fetchQualifiedTrainers();
        resetForm();
      } else {
        alert(`Error: ${responseData.message || "Unknown error"}`);
      }
    } catch (error) {
      alert("An error occurred while submitting the form");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columnKeyMap = {
    EmployeeId: "EmployeeId",
    Username: "Username",
    DOJ: "DOJ",
    Designation: "Designation",
    Section: "Section",
    Department: "Department",
    Training_Name: "Training_Name",
    Certified: "Certified",
    Exp_5_Yr: "Exp(5yr)",
    Exp_3_Yr: "Exp(3yr)",
    HOD_Rec: "HOD_Rec",
    Qualified: "Qualified",
  };
  // const handleSort = (column) => {
  //   const key = column;
  //   if (!key) return;

  //   let direction = "asc";
  //   if (sortConfig.key === key && sortConfig.direction === "asc") {
  //     direction = "desc";
  //   } else if (sortConfig.key === key && sortConfig.direction === "desc") {
  //     // Instead of resetting to original data, toggle back to ascending
  //     direction = "asc";
  //   }

  //   setSortConfig({ key, direction });
  //   const sortedData = [...data].sort((a, b) => {
  //     // Handle date field DOJ
  //     if (key === "DOJ") {
  //       const dateA = a[key] ? new Date(a[key]) : new Date(0);
  //       const dateB = b[key] ? new Date(b[key]) : new Date(0);
  //       return direction === "asc" ? dateA - dateB : dateB - dateA;
  //     }
  //     // Handle boolean fields
  //     else if (["Certified", "Exp_5_Yr", "Exp_3_Yr", "HOD_Rec", "Qualified"].includes(key)) {
  //       const boolA = a[key] ? 1 : 0;
  //       const boolB = b[key] ? 1 : 0;
  //       return direction === "asc" ? boolA - boolB : boolB - boolA;
  //     }
  //     // Handle string fields
  //     else if (typeof a[key] === "string") {
  //       return direction === "asc"
  //         ? a[key].toLowerCase().localeCompare(b[key].toLowerCase())
  //         : b[key].toLowerCase().localeCompare(a[key].toLowerCase());
  //     }
  //     // Handle number fields
  //     else {
  //       return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
  //     }
  //   });
  //   setData(sortedData);
  // };
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];

  const totalPages =
    rowsPerPage === "All"
      ? 1
      : Math.ceil(safeFilteredData.length / rowsPerPage);

  const sortedData = [...safeFilteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const key = sortConfig.key;
    const aVal = a[key];
    const bVal = b[key];

    if (key === "DOJ") {
      return sortConfig.direction === "asc"
        ? new Date(aVal) - new Date(bVal)
        : new Date(bVal) - new Date(aVal);
    }

    if (typeof aVal === "boolean" || typeof aVal === "number") {
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortConfig.direction === "asc"
      ? aVal?.toString().localeCompare(bVal?.toString())
      : bVal?.toString().localeCompare(aVal?.toString());
  });

  const paginatedData =
    rowsPerPage === "All"
      ? sortedData
      : sortedData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    setTableSearchTerm(searchQuery);

    if (!searchQuery) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((trainer) =>
      [
        "EmployeeId",
        "Username",
        "Department",
        "Section",
        "Designation",
        "DOJ",
        "Training_Name",
        "Certified",
        "Exp_5_Yr",
        "Exp_3_Yr",
        "HOD_Rec",
        "Qualified",
      ].some((field) => {
        const rawValue = trainer[field];

        let valueToSearch = "";

        if (typeof rawValue === "boolean") {
          valueToSearch = rawValue ? "yes" : "no";
        } else {
          valueToSearch = rawValue?.toString().toLowerCase();
        }

        return valueToSearch?.includes(searchQuery);
      })
    );

    setFilteredData(filtered);
  };
 if (isAuthorized === null) {
    return (
      <div>Loading...</div>
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
    <div className="max-w-full mx-auto bg-white p-2 shadow-md rounded-lg w-full">
      <div className="bg-sky-400 text-white p-2 rounded-t-lg">
        <h2 className="text-lg font-semibold">Add Qualified Trainers List</h2>
      </div>
      <br></br>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* React Select Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Select EmployeeId:
            </label>
            <Select
              options={options}
              value={options.find((o) => o.value === EmployeeId) || null}
              onChange={handleEmployeeIdChange}
              placeholder="Select EmployeeId"
              isClearable
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                  boxShadow: state.isFocused
                    ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
                    : "none",
                  padding: "1px",
                  borderRadius: "0.5rem",
                  minHeight: "2rem",
                  display: "flex",
                  alignItems: "center",
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
              className="w-full"
              classNamePrefix="react-select"
              required
            />
          </div>

          {/* Other form fields */}
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Username
            </label>
            <input
              type="text"
              value={trainingDetails.Username}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Department
            </label>
            <input
              type="text"
              value={trainingDetails.Department}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Section
            </label>
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
            <label className="block text-sm font-medium text-gray-900">
              Designation
            </label>
            <input
              type="text"
              value={trainingDetails.Designation}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Gender
            </label>
            <input
              type="text"
              value={trainingDetails.Gender}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              DOJ
            </label>
            <input
              type="text"
              value={trainingDetails.DOJ}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          {/* Training Name Label and Radio buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Category
            </label>
            <div className="flex space-x-6 mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="trainingName"
                  value="IATF"
                  checked={trainingName === "IATF"}
                  onChange={() => setTrainingName("IATF")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  required
                />
                <span>IATF</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="trainingName"
                  value="HSE"
                  checked={trainingName === "HSE"}
                  onChange={() => setTrainingName("HSE")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  required
                />
                <span>HSE</span>
              </label>
            </div>
          </div>
        </div>
        {/* Checkbox Section */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-gray-900">
              Certified
            </label>
            <input
              type="checkbox"
              checked={certified}
              onChange={() =>
                handleCheckboxChange(setCertified, certified, "certified")
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-gray-900">
              Experience (5 Years)
            </label>
            <input
              type="checkbox"
              checked={exp5Yr}
              onChange={() => handleCheckboxChange(setExp5Yr, exp5Yr, "exp5Yr")}
              className="h-4 w-4 "
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-gray-900">
              Experience (3 Years)
            </label>
            <input
              type="checkbox"
              checked={exp3Yr}
              onChange={() => handleCheckboxChange(setExp3Yr, exp3Yr, "exp3Yr")}
              className="h-4 w-4 "
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-gray-900">
              HOD Rec
            </label>
            <input
              type="checkbox"
              checked={hodRec}
              onChange={() => handleCheckboxChange(setHodRec, hodRec, "hodRec")}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-gray-900">
              Qualified
            </label>
            <input
              type="checkbox"
              checked={qualified}
              required
              disabled
              className="h-4 w-4"
            />
          </div>

          <div>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
      <br></br>

      <div className="card-body p-0 overflow-x-auto pb-3">
        <div className="card-body p-0 overflow-x-auto pb-3">
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
              <div className="flex ">
                <div className="relative">
                  <input
                    type="text"
                    className="border p-1 pl-8 rounded bg-secondary"
                    placeholder="Search..."
                    value={tableSearchTerm}
                    onChange={handleTableSearchChange}
                  />
                  <FaSearch className="absolute left-2 top-2 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table
                className="min-w-full border rounded-lg bg-card text-foreground text-sm"
                style={{
                  tableLayout: "fixed",
                  fontSize: "13px",
                  padding: "1px",
                }}
              >
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
                    {[
                      { key: "EmployeeId", label: "Employee ID" },
                      { key: "Username", label: "Username" },
                      { key: "DOJ", label: "DOJ" },
                      { key: "Designation", label: "Designation" },
                      { key: "Section", label: "Section" },
                      { key: "Department", label: "Department" },
                      { key: "Training_Name", label: "Training Name" },
                      { key: "Certified", label: "Certified" },
                      { key: "Exp_5_Yr", label: "Exp (5Yr)" },
                      { key: "Exp_3_yr", label: "Exp (3Yr)" },
                      { key: "HOD_Rec", label: "HOD Rec" },
                      { key: "Qualified", label: "Qualified" },
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
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={index} className="border hover:bg-muted">
                        <td className="px-4 py-2 border">{item.EmployeeId}</td>
                        <td className="px-4 py-2 border">{item.Username}</td>
                        <td className="px-4 py-2 border">
                          {" "}
                          {new Date(item.DOJ).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 border">
                          {item.Designation}{" "}
                        </td>
                        <td className="px-4 py-2 border">{item.Section}</td>
                        <td className="px-4 py-2 border">{item.Department}</td>
                        <td className="px-4 py-2 border">
                          {item.Training_Name}
                        </td>
                        <td className="px-4 py-2 border">
                          {item.Certified ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-2 border">
                          {item.Exp_5_Yr ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-2 border">
                          {item.Exp_3_yr ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-2 border">
                          {item.HOD_Rec ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-2 border">
                          {item.Qualified ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="15" className="text-center py-4">
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="15" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            {
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
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifiedTrainerList;