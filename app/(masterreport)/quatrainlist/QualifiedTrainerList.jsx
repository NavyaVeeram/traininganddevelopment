"use client";
import { FaEdit, FaSearch, FaSortUp } from 'react-icons/fa';
import { useState, useEffect, useRef ,useMemo} from "react";
import DataTable from "react-data-table-component";
import Select from "react-select";

const QualifiedTrainerList = () => {
  const [data, setData] = useState([]);
  const [EmployeeId, setEmployeeId] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [trainingDetails, setTrainingDetails] = useState({
    Username: "",
    Department: "",
    Section: "",
    Designation: "",
    Gender: "",
    DOJ: ""
  });
  const [qualifiedTrainers, setQualifiedTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [trainingName, setTrainingName] = useState('');
  const [certified, setCertified] = useState(false);
  const [exp5Yr, setExp5Yr] = useState(false);
  const [exp3Yr, setExp3Yr] = useState(false);
  const [hodRec, setHodRec] = useState(false);
  const [qualified, setQualified] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage,setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
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
        setData(data); // Sync data state with fetched data
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
    fetchQualifiedTrainers(); 
  }, []);
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
    setTrainingName(''); 
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
    setTrainingDetails({ Username: "", Department: "", Section: "", Designation: "", Gender: "", DOJ: "" });

    if (selectedEmployeeId) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/get_user_details?EmployeeId=${selectedEmployeeId}`);
        const data = await res.json();

        if (res.status === 200) {
          const formattedDOJ = data.DOJ ? new Date(data.DOJ).toLocaleDateString() : '';
          setTrainingDetails({
            Username: data.Username || '',
            Department: data.Department || '',
            Section: data.Section || '',
            Designation: data.Designation || '',
            Gender: data.Gender || '',
            DOJ: formattedDOJ
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

    const dataToSubmit = {
      Training_Name: trainingName,
      EmployeeId: EmployeeId,
      Certified: certified ? 1 : 0,
      Exp_5_Yr: exp5Yr ? 1 : 0,
      Exp_3_Yr: exp3Yr ? 1 : 0,
      HOD_Rec: hodRec ? 1 : 0,
      Qualified: qualified ? 1 : 0,
      CreatedBy: "admin", // Replace with the actual username if needed
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
        alert(`Error: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('An error occurred while submitting the form');
      console.error(error);
    } finally {
      setLoading(false); 
    }
  };

  const columns = [
    {
      name: 'Employee ID',
      selector: row => row.EmployeeId,
      sortable: true,
      searchable: true,
    },
    {
      name: 'Username',
      selector: row => row.Username,
      sortable: true,
      searchable: true,
    },
    {
      name: 'DOJ',
      selector: row => row.DOJ ? new Date(row.DOJ).toLocaleDateString() : '',
      sortable: true,
      searchable: true,
    },
    {
      name: 'Designation',
      selector: row => row.Designation,
      sortable: true,
      searchable: true,
    },
    {
      name: 'Department',
      selector: row => row.Department,
      sortable: true,
    },
    {
      name: 'Training Name',
      selector: row => row.Training_Name,
      sortable: true,
      searchable: true,
    },
    {
      name: 'Certified',
      selector: row => row.Certified ? "Yes" : "No",
      sortable: true,
      searchable: true,
    },
    {
      name: 'Experience (5 Years)',
      selector: row => row.Exp_5_Yr ? "Yes" : "No",
      sortable: true,
      searchable: true,
    },
    {
      name: 'Experience (3 Years)',
      selector: row => row.Exp_3_Yr ? "Yes" : "No",
      sortable: true,
      searchable: true,
    },
    {
      name: 'HOD Rec',
      selector: row => row.HOD_Rec ? "Yes" : "No",
      sortable: true,
      searchable: true,
    },
    {
      name: 'Qualified',
      selector: row => row.Qualified ? "Yes" : "No",
      sortable: true,
      searchable: true,
    },
  ];
  const paginationComponentOptions = {
    rowsPerPageText: 'Rows per page:',
    rangeSeparatorText: 'of ',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'All',
  }; 
  const CustomStyles ={
    headCells: {
      style: {
        backgroundColor:'#EEEEEE',
      },
    },
  }
  const columnKeyMap={
    EmployeeId: "EmployeeId",
    Username: "Username",
    DOJ: "DOJ",
    Designation: "Designation",
    Section: "Section",
    Department: "Department",
    Training_Name: "Training_Name",
    Certified:  "Certified",
    Exp_5_Yr:"Exp(5yr)",
    Exp_3_Yr: "Exp(3yr)",
    HOD_Rec: "HOD_Rec",
    Qualified: "Qualified"
  }
  const handleSort = (column) => {
    const key = column;
    if (!key) return;

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      // Instead of resetting to original data, toggle back to ascending
      direction = "asc";
    }

    setSortConfig({ key, direction });
    const sortedData = [...data].sort((a, b) => {
      // Handle date field DOJ
      if (key === "DOJ") {
        const dateA = a[key] ? new Date(a[key]) : new Date(0);
        const dateB = b[key] ? new Date(b[key]) : new Date(0);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      // Handle boolean fields
      else if (["Certified", "Exp_5_Yr", "Exp_3_Yr", "HOD_Rec", "Qualified"].includes(key)) {
        const boolA = a[key] ? 1 : 0;
        const boolB = b[key] ? 1 : 0;
        return direction === "asc" ? boolA - boolB : boolB - boolA;
      }
      // Handle string fields
      else if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].toLowerCase().localeCompare(b[key].toLowerCase())
          : b[key].toLowerCase().localeCompare(a[key].toLowerCase());
      }
      // Handle number fields
      else {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
    });
    setData(sortedData);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData =
    rowsPerPage === "All"
      ? filteredData
      : filteredData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );
        const options = employeeOptions.map((option) => ({
          value: option.Value,
          label: option.Text,
        }));
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
            <label className="block text-sm font-medium text-gray-900">Select EmployeeId:</label>
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
                  boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "none",
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
            <label className="block text-sm font-medium text-gray-900">Gender</label>
            <input
              type="text"
              value={trainingDetails.Gender}
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
          {/* Training Name Label and Radio buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-900">Category</label>
            <div className="flex space-x-6 mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="trainingName"
                  value="IATF"
                  checked={trainingName === 'IATF'}
                  onChange={() => setTrainingName('IATF')}
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
                  checked={trainingName === 'HSE'}
                  onChange={() => setTrainingName('HSE')}
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
            <label className="block text-sm font-medium text-gray-900">Certified</label>
            <input
              type="checkbox"
              checked={certified}
              onChange={() => handleCheckboxChange(setCertified, certified, "certified")}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-gray-900">Experience (5 Years)</label>
            <input
              type="checkbox"
              checked={exp5Yr}
              onChange={() => handleCheckboxChange(setExp5Yr, exp5Yr, "exp5Yr")}
              className="h-4 w-4 "
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-gray-900">Experience (3 Years)</label>
            <input
              type="checkbox"
              checked={exp3Yr}
              onChange={() => handleCheckboxChange(setExp3Yr, exp3Yr, "exp3Yr")}
              className="h-4 w-4 "
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-gray-900">HOD Rec</label>
            <input
              type="checkbox"
              checked={hodRec}
              onChange={() => handleCheckboxChange(setHodRec, hodRec, "hodRec")}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-gray-900">Qualified</label>
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
              className="px-6 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"          >
              Submit
            </button>
          </div>
        </div>
      </form>
      <br></br>

      {/* Qualified Trainers List */}
      <div className="card shadow rounded-lg bg-[var(--bgBody)] mt-6">
        <div className="card-header bg-[var(--bgBody)] text-black rounded-t-lg py-3 px-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold">Qualified Trainers List</h2>
            </div>
          </div>
        </div>

       
        <div className="card-body p-0 overflow-x-auto pb-3">
          <div className="p-4 bg-card">
            <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
              <div className="flex items-center space-x-2">
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
                <span style={{fontSize:"14px"}}>entries</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  className="border p-1 pt-[0.9] pl-8 rounded bg-secondary"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute left-2 top-2 text-muted-foreground" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border bg-card text-foreground" 
                style={{ 
                  tableLayout: "fixed" ,
                  fontSize: "13px", 
                  padding: "1px",
                  whiteSpace: "nowrap", 
                  overflow: "hidden",   
                  textOverflow: "ellipsis", }}>
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
                    {Object.keys(columnKeyMap).map((key) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className="cursor-pointer px-4 py-2 border text-left"
                      >
                        {columnKeyMap[key]}{" "}
                        {sortConfig.key === key ? (
                          sortConfig.direction === "asc" ? "▲" : "▼"
                        ) : (
                          "↕"
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ fontSize: "12px" }}>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item,index) => (
                      <tr key={index} className="border hover:bg-muted">
                        <td className="px-4 py-2 border">{item.EmployeeId}</td>                       
                        <td className="px-4 py-2 border">{item.Username}</td>
                        <td className="px-4 py-2 border">  {new Date(item.DOJ).toLocaleDateString()}</td>
                        <td className="px-4 py-2 border">{item.Designation}  </td>     
                        <td className="px-4 py-2 border">{item.Section}</td>
                        <td className="px-4 py-2 border">{item.Department}</td>
                        <td className="px-4 py-2 border">{item.Training_Name}</td>                       
                        <td className="px-4 py-2 border">{item.Certified?"Yes":"No"}</td>
                        <td className="px-4 py-2 border">{item.Exp_5_Yr?"Yes":"No"}</td>
                        <td className="px-4 py-2 border">{item.Exp_3_yr?"Yes":"No"}</td>
                        <td className="px-4 py-2 border">{item.HOD_Rec?"Yes":"No"}</td>                       
                        <td className="px-4 py-2 border">{item.Qualified?"Yes":"No"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="text-center py-4">
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination UI*/}
            <div className="flex flex-wrap justify-between items-center mt-4 space-y-2">
              <div style={{fontSize:"14px"}}>
                Showing{" "}
                {filteredData.length > 0
                  ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                      currentPage * rowsPerPage,
                      filteredData.length
                    )} of ${filteredData.length} entries`
                  : "0 entries"}
              </div>
              <div className="flex space-x-2" style={{fontSize:"14px"}}>
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  {"<<"}
                </button>
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  {"<"}
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 border rounded ${
                      currentPage === i + 1 ? "bg-primary text-primary-foreground" : ""
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
    </div>
  );
};

export default QualifiedTrainerList;
