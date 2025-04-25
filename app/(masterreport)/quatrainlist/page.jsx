"use client";
import { FaEdit, FaSearch, FaSortUp } from 'react-icons/fa';
import { useState, useEffect, useRef ,useMemo} from "react";
import DataTable from "react-data-table-component";

const QualifiedTrainerList = () => {
  const [data, setData] = useState([]);
  const [EmployeeId, setEmployeeId] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
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
    setEmployeeId([-1]);
    setTrainingName([]); 
    setCertified(false); 
    setExp5Yr(false); 
    setExp3Yr(false); 
    setHodRec(false); 
    setQualified(false);
    setSearchTerm(""); 
    setIsOpen(false);
  };
  // Handle input changes to search employee options
   const handleSearchChange = (e) => {
    const searchQuery = e.target.value;
    setSearchTerm(searchQuery);

     const filtered = employeeOptions.filter((option) =>
       option.Text.toLowerCase().includes(searchQuery.toLowerCase())
     );
     setFilteredOptions(filtered);
   };
  //  const handleTableSearchChange = (e) => {
  //   const searchQuery = e.target.value;
  //   setTableSearchTerm(searchQuery);
  
  //   if (searchQuery === "") {
  //     fetchQualifiedTrainers(); 
  //   } else {
  //     const filteredData = qualifiedTrainers.filter((trainer) =>
  //       trainer.EmployeeId.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       trainer.Username.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       trainer.Training_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       trainer.Designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       trainer.Department.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       trainer.Certified.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       trainer.Exp_5_Yr.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       trainer.Exp_3_yr.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       trainer.HOD_Rec.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       trainer.Qualified.toString().toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   setQualifiedTrainers(filteredData);
  //   }
  // };
  
  const handleClearTableSearch = () => {
    setTableSearchTerm(""); 
    fetchQualifiedTrainers();
  };
  // Handle selection of employee ID from the dropdown
  const handleEmployeeIdChange = async (selectedOption) => {
    const selectedEmployeeId = selectedOption.Value;
    setEmployeeId(selectedEmployeeId);
    setSearchTerm(selectedOption.Text);
    setIsOpen(false);
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
  

  const handleClear = () => {
    setSearchTerm("");
    setEmployeeId(null);
    setTrainingDetails({ Username: "", Department: "", Section: "", Designation: "", Gender: "", DOJ: "" });
    setFilteredOptions(employeeOptions); // Reset filtered options
  };
  

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  
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
      selector: row => row.Exp_3_yr ? "Yes" : "No",
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
    EmployeeId: " Emp Id",
    Username: "Username",
    DOJ: " DOJ",
    Designation: " Designation",
    Section: "  Section",
    Department: "Department",
    Training_Name: "Training Name",
    Certified:  "Certified",
    Exp_5_Yr:"Exp 5 Years",
    Exp_3_yr: "Exp 6 years",
    HOD_Rec: "HOD Rec",
    Qualified: "Qualified"
  }
  const handleSort = (column) => {
    const key = columnKeyMap[column];
    if (!key) return;

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      setSortConfig({ key: null, direction: null });
      setData(qualifiedTrainers);
      return;
    }

    setSortConfig({ key, direction });
    const sortedData = [...data].sort((a, b) => {
      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].toLowerCase().localeCompare(b[key].toLowerCase())
          : b[key].toLowerCase().localeCompare(a[key].toLowerCase());
      } else {
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
      
  return (
    

    <div className="max-w-full mx-auto bg-white p-4 shadow-md rounded-lg w-full">
      <div className="bg-sky-600 text-white p-2 rounded-t-lg">
        <h2 className="text-lg font-semibold">Add Qualified Trainers List</h2>
      </div>
      <br></br>
      <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Custom Searchable Dropdown */}
        <div >
  <div className="relative" ref={dropdownRef}>
  <label className="block text-sm font-medium text-gray-900">Select EmployeeId:</label>
  <div className="relative">
    {/* Search input */}
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Select EmployeeId"
      onFocus={() => setIsOpen(true)}
      required
      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10" // Add padding to the right for the icon
    />
    
    {/* Down arrow icon */}
    <div
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
      onClick={() => setIsOpen((prev) => !prev)} // Toggle dropdown on click
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
<div >
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
       className="px-6 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-300 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
    >
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
 
          {/* <DataTable
            columns={columns} 
            data={qualifiedTrainers}
            pagination
            paginationPerPage={5} 
            paginationRowsPerPageOptions={[5,15, 25, 50, 100]}
            highlightOnHover
            responsive
            striped
            paginationComponentOptions={paginationComponentOptions}
            sortIcon={<span className="text-black-600">▼</span>}
            customStyles={CustomStyles}
          /> */}
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
                  {/* Pagination UI*/
                  }
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