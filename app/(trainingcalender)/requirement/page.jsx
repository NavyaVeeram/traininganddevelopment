"use client";
import React, { useState, useEffect,useMemo } from "react";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@headlessui/react";
import { FaEdit, FaSearch, FaTrash } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Ensure you import the datepicker styles.
import EmailApprovalMain from "../email/EmailApproval"
const animatedComponents = makeAnimated();
export default function Requirement() {
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [noOfTimes, setNoOfTimes] = useState(0);  // State for No. of Times
  const [programs, setPrograms] = useState([]);
  const [message, setMessage] = useState('');
  const [formloading, formsetLoading] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([]); // to store selected months
  const [department, setDepartment] = useState('');
  const [section,setSection] = useState('');
  const [username, setUsername] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // State to control visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formData, setFormData] = useState({
    Training_Name: '',
    Year_No: new Date().getFullYear().toString(),
    Department: '',
    Section :'',
    Program_Name: '',
    Train_Mode: '',
    Train_Purpose: '',
    Persons: '',
    No_Hrs: '',
    No_Times: 0,
    Req_Months: [],//to store the months selected
    Evaluation_Period: '',
    CreatedBy: '',
  });

  // Added missing states to fix "data is not defined" error
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [originalData, setOriginalData] = useState([]);
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  // Synchronize data and originalData with trainingData to keep hooks consistent
  useEffect(() => {
    setData(trainingData);
    setOriginalData(trainingData);
  }, [trainingData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const resetForm = () => {
    setFormData({
      Training_Name: '',
      Year_No: new Date().getFullYear().toString(),
      Department: '',
      Section:'',
      Program_Name: null,
      Train_Mode: '',
      Train_Purpose: '',
      Persons: '',
      No_Hrs: '',
      No_Times: 0,
      Req_Months: [],
      Evaluation_Period: '',
      CreatedBy: '',
    });
    setSelectedMonths([]); // Reset selected months if needed
    setSelectedOptions([]); // Reset selected options for months if needed
    setMessage(''); // Reset any messages displayed
  };
  
  useEffect(() => {
    // Retrieve the department, username, and employeeId from localStorage
    const storedDepartment = localStorage.getItem('department');
    const storedUsername = localStorage.getItem('username');
    const storedEmployeeId = localStorage.getItem('employeeId');
    const storedSection = localStorage.getItem('section');

    // If data is found, update state
    if (storedDepartment && storedUsername && storedEmployeeId && storedSection) {
      setDepartment(storedDepartment);
      setUsername(storedUsername);
      setEmployeeId(storedEmployeeId);
      setSection(storedSection)
    } else {
      // If no data found, redirect to login page
      window.location.href = '/';
    }
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/view_training_data_by_employee?employeeId=${storedEmployeeId}&department=${storedDepartment}`);
        const data = await response.json();
        if (response.ok) {
          setTrainingData(data); // Set the training data fetched from the server
        } else {
          console.error('Failed to fetch training data:', data.message);
          setTrainingData([]); // Fallback to empty array in case of failure
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setTrainingData([]); // Fallback to empty array in case of error
      }
    };

    fetchData();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');
    setError(null);

    try {
      const updatedFormData = {
        ...formData,
        CreatedBy: employeeId,
        UpdatedBy:employeeId,
        Department: department,
        Section: section,  // Added Section here
      };

      // Validate fields
      if (
        updatedFormData.Training_Name === '' ||
        updatedFormData.Program_Name === '' ||
        !updatedFormData.Train_Mode ||
        !updatedFormData.Train_Purpose ||
        !updatedFormData.Persons ||
        !updatedFormData.No_Hrs ||
        !updatedFormData.Evaluation_Period
      ) {
        alert('All fields must be filled!');
        setLoading(false);
        return;
      }

      if (isNaN(updatedFormData.Persons) || updatedFormData.Persons <= 0) {
        alert('Number of persons must be a positive number');
        setLoading(false);
        return;
      }

      if (isNaN(updatedFormData.No_Hrs) || updatedFormData.No_Hrs <= 0) {
        alert('Number of hours must be a positive number');
        setLoading(false);
        return;
      }

      // Submit data
      const postRes = await fetch('/api/insert_trainingdata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFormData),
      });

      const postData = await postRes.json();

      if (!postRes.ok) {
        alert(`Error: ${postData.message}`);
        setLoading(false);
        return;
      }

      alert('Data submitted successfully!');

      // Fetch updated data from the server (including newly added data)
      const res = await fetch(`/api/view_training_data_by_employee?employeeId=${employeeId}&department=${department}`);
      const newData = await res.json();
      setTrainingData(newData); // Update state with the latest data
      setIsSubmitted(false); // Reset submission state to allow re-render

      resetForm(); // Reset form after submission
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
      setIsSubmitted(true);
    }
  };
  
   // Fetch available programs when Training_Name changes
   const handleTrainingNameChange = async (event) => {
    const trainingName = event.target.value;
    setFormData((prevState) => ({
      ...prevState,
      Training_Name: trainingName,
      Program_Name: '', // Reset Program_Name when Training_Name changes
    }));

    if (trainingName) {
      try {
        const response = await fetch(`/api/get_programs_dropdown?Training_Name=${trainingName}`);
        const data = await response.json();

        if (response.ok) {
          setPrograms(data); // Populate the programs list
        } else {
          console.error('Failed to fetch programs:', data.message);
          setPrograms([]);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
        setPrograms([]);
      }
    } else {
      setPrograms([]); // Clear programs if no training name is selected
    }
  };
  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


  useEffect(() => {
    // Fetch or set options here
    const fetchedOptions = [
      { value: "Jan", label: "Jan" },
      { value: "Feb", label: "Feb" },
      { value: "Mar", label: "Mar" },
      { value: "Apr", label: "Apr" },
      { value: "May", label: "May" },
      { value: "Jun", label: "Jun" },
      { value: "Jul", label: "Jul" },
      { value: "Aug", label: "Aug" },
      { value: "Sep", label: "Sep" },
      { value: "Oct", label: "Oct" },
      { value: "Nov", label: "Nov" },
      { value: "Dec", label: "Dec" }
    ];

    // Set options once they're fetched or determined
    setOptions(fetchedOptions);
  }, []);
  const handleChange = (selectedOptions) => {
    if (!selectedOptions) {
      setFormData({
        ...formData,
        Req_Months: [],
        No_Times: 0,
      });
      return;
    }
  
    // Sort selected months based on monthOrder
    const sortedMonths = [...selectedOptions].sort(
      (a, b) => monthOrder.indexOf(a.value) - monthOrder.indexOf(b.value)
    );
  
    const selectedMonthValues = sortedMonths.map(option => option.value);
  
    setFormData({
      ...formData,
      Req_Months: selectedMonthValues,
      No_Times: selectedMonthValues.length,
    });
  };
  
  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId");
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    }

    const fetchAccessRole = async () => {
      try {
        const res = await fetch(
          "/api/get_access_role?employeeId=" + storedEmployeeId
        );
        const data = await res.json();

        if (res.ok && data.Access_Role) {
          if (
            data.Access_Role === "HR_Hod"
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
    // Update No. of Times based on selected months
    setNoOfTimes(selectedOptions.length);
  }, [selectedOptions]);  // Only run this effect when selectedOptions changes

  // Removed early return for loading state to fix hook order error
  // Instead, loading state will be conditionally rendered inside JSX below

  // const isYearEnabled function and other code remain unchanged
const isYearEnabled = (date) => {
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear + 1].includes(year);
};
const handleDelete = async (programId) => {
  try {
    const res = await fetch(`/api/delete_training_data_requirement?Program_Id=${programId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete data: ${res.statusText}`);
    }

    // Update the trainingData state, not formData
    setTrainingData((prevData) =>
      prevData.filter((item) => item.Program_Id !== programId)
    );

    alert('Data deleted successfully');
  } catch (err) {
    console.error('Error deleting data:', err.message);
    setError(err.message);
  }
};
const handleEdit = (data) => {
  setEditingData(data); // Set the data of the row to be edited
  setIsModalOpen(true); // Open the modal
  setEditingData(data); // Set the data of the row to be edited
  setIsModalOpen(true); // Open the modal
};
const programOptions = programs.map(program => ({
  value: program.value,
  label: program.text,
}));


  // Handle update button in the modal
  const handleUpdate = async () => {
    try {
      const programId = editingData?.Program_Id;
      console.log('Program_Id:', programId);

      // Log the data to check if all fields are present
      console.log('Updating with data:', editingData);

      const res = await fetch(`/api/update_training_data_requirement?Program_Id=${programId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingData), // Send updated data
      });
      const responseData = await res.json(); 
      if (res.ok) {
        alert(` ${responseData.message}`);
        
      // ✅ Optimistically update the local trainingData array
      const updatedList = trainingData.map((item) =>
        item.Program_Id === programId ? { ...item, ...editingData } : item
      );
      setTrainingData(updatedList);
        const month = selectedDate.getMonth() + 1; // Get the current month
        const year = selectedDate.getFullYear(); // Get the current year
        fetchData(month, year); // Refresh the list after updating
        setIsModalOpen(false); // Close the modal
        setError(""); // Clear any previous error messages
      } else {
        alert(`Error: ${responseData.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError('Failed to update the record');
    }
  };

  // Handle cancel button click in the modal
  const handleCancel = () => {
    setIsModalOpen(false); // Close the modal without making any changes
  };
  const columnKeyMap = {
    "Training Name": "Training_Name",
    Year: "Year_No",
    Department: "Department",
    Section: "Section",
    "Program Name": "Program_Name",
    "Training Mode": "Train_Mode",
    Purpose: "Train_Purpose",
    Persons: "Persons",
    Hours: "No_Hrs",
    Times: "No_Times",
    Months: "Req_Months",
    "Evaluation Period": "Evaluation_Period",
  };
  const handleSort = (column) => {
    const key = columnKeyMap[column];
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
      // Special handling for Req_Months (Months) array sorting
      if (key === "Req_Months") {
        const getMonthArray = (months) => {
          if (!months) return [];
          let monthArray = [];
          if (Array.isArray(months)) {
            monthArray = months;
          } else if (typeof months === "string") {
            monthArray = months.split(",").map(m => m.trim());
          }
          return monthArray;
        };
  
        const aMonths = getMonthArray(a[key]);
        const bMonths = getMonthArray(b[key]);
  
        // Compare arrays of months alphabetically (i.e., string sort)
        for (let i = 0; i < Math.min(aMonths.length, bMonths.length); i++) {
          const monthComparison = aMonths[i].localeCompare(bMonths[i]);
          if (monthComparison !== 0) {
            return direction === "asc" ? monthComparison : -monthComparison;
          }
        }
  
        // If all compared months are equal, shorter array comes first
        return direction === "asc" ? aMonths.length - bMonths.length : bMonths.length - aMonths.length;
      }
  
      // Convert numeric strings to numbers for sorting on numeric fields
      const aValue = !isNaN(a[key]) && a[key] !== null && a[key] !== undefined ? Number(a[key]) : a[key];
      const bValue = !isNaN(b[key]) && b[key] !== null && b[key] !== undefined ? Number(b[key]) : b[key];
  
      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc"
          ? aValue.toLowerCase().localeCompare(bValue.toLowerCase())
          : bValue.toLowerCase().localeCompare(aValue.toLowerCase());
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        // Fallback to string comparison if types differ
        return direction === "asc"
          ? String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase())
          : String(bValue).toLowerCase().localeCompare(String(aValue).toLowerCase());
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
  if (isAuthorized === null) {
    return (
      // <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
      //   <div className="bg-white p-10 rounded shadow text-center">
      //     <h2 className="text-2xl font-bold">Loading...</h2>
      //   </div>
      // </div>
      <div>
        Loading...
      </div>
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
    <div className="max-w-full mx-auto bg-white p-2 w-full">
    <div className="bg-sky-400 text-white p-2  flex justify-between rounded-t-lg">
        <p className="font-semibold">   Annual Training Requirement Form</p>
        <div className="flex justify-end mx-3">
        {username?(
          <>
          <p className="font-bold">{username}</p>
          </>
        ):(
          <p>Loading the Username</p>
        )}
       </div>
      
       
</div>
        {/* <p className=" text-sm text-white">
          We are following "IATF16949 CAPD method 10.3 Continuous Improvement Spirit" to improve our processes.
        </p>*/}

   
      <form onSubmit={handleSubmit} className="w-full p-3 bg-white shadow-lg my-1 rounded-lg">
      <div className="flex justify-between">
          <div className="flex items-center space-x-2">  {department ? (
    <>
      <label className="font-bold">Department :</label>
      <input
        type="text"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        readOnly // Makes sure the department is not editable by the user
      />
       <label className="font-bold " style={{visibility:"hidden"}}>Section :</label>
      <input
      style={{visibility:"hidden"}}
        type="text"
        value={section}
        onChange={(e) => setSection(e.target.value)}
        readOnly // Makes sure the department is not editable by the user
      />
    </>
  ) : (
    <p>Loading your information...</p>
  )}</div>
          <div className="flex items-center space-x-2">
  <label htmlFor="Year_No">Year </label>
 <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    if (date) {
                      setFormData((prevData) => ({
                        ...prevData,
                        Year_No: date.getFullYear().toString(),
                      }));
                    }
                  }}
                    dateFormat="yyyy"
                    showYearPicker
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
                  filterDate={isYearEnabled}
                />


</div>

        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Training */}
      <div className="space-y-0.5">
        <label htmlFor="Training_Name" className="block text-sm font-medium text-gray-900">
    Training Name
        </label>
        <div className="relative">
          <select
            id="Training_Name"
            name="Training_Name"
            value={formData.Training_Name}
            onChange={handleTrainingNameChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
            required 
          >
            <option value="">Select Training Name</option>
            <option value="IATF">International Automotive Task Force - (IATF)</option>
            <option value="HSE">Health, Safety, and Environment - (HSE)</option>
          </select>
        </div>
      </div>

      {/* Name of the Program */}
      <div className="space-y-0.5">
  <label htmlFor="Program_Name" className="block text-sm font-medium text-gray-900">
    Name of the Program
  </label>
  <div className="relative">
  <Select
  id="Program_Name"
  name="Program_Name"
  options={programOptions}
  value={programOptions.find(opt => opt.value === formData.Program_Name) || null}
  onChange={(selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      Program_Name: selectedOption ? selectedOption.value : '',
    }));
  }}
  isDisabled={formData.Training_Name === ''}
  classNamePrefix="react-select"
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
  className={`mb-1 ${formData.Training_Name === '' ? 'opacity-70 cursor-not-allowed' : ''}`}
  placeholder="Select program name"
  required
  autoComplete="off"
  instanceId="program-name-select"
/>

  </div>
</div>





      <div>        <fieldset className="space-y-2 ">
  <legend className="text-sm font-semibold text-gray-900">Mode of Training</legend>
  <div className="flex space-x-6">
    <div className="flex items-center gap-x-2">
      <input
        checked={formData.Train_Mode === 'Internal'}  // Check if 'Train_Mode' is equal to 'internal'
        id="Internal"
        name="Train_Mode"  // The 'name' is used to group the radio buttons together
        type="radio"
        value="Internal"  // The value when selected
        onChange={handleFormChange}  // Update the state when a radio button is selected
        className="h-4 w-4"
        required
      />
      <label htmlFor="Internal" className="text-sm text-gray-900">Internal</label>
    </div>
    <div className="flex items-center gap-x-2">
      <input
        checked={formData.Train_Mode === 'External'}  // Check if 'Train_Mode' is equal to 'external'
        id="External"
        name="Train_Mode"
        type="radio"
        value="External"
        onChange={handleFormChange}
        className="h-4 w-4"
        required
      />
      <label htmlFor="External" className="text-sm text-gray-900">External</label>
    </div>
    <div className="flex items-center gap-x-2">
      <input
        checked={formData.Train_Mode === 'Overseas'}  // Check if 'Train_Mode' is equal to 'overseas'
        id="Overseas"
        name="Train_Mode"
        type="radio"
        value="Overseas"
        onChange={handleFormChange}
        className="h-4 w-4"
        required
      />
      <label htmlFor="Overseas" className="text-sm text-gray-900">Overseas</label>
    </div>
  </div>
</fieldset></div>
<div className="space-y-0.5">
          <label htmlFor="Train_Purpose" className="block text-sm font-medium text-gray-900">
            Purpose of Training
          </label>
          <Input 
          type="text"
            id="Train_Purpose"
            name="Train_Purpose"
            value={formData.Train_Purpose}
            onChange={handleFormChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
            placeholder="Describe the purpose of the training"
         required autoComplete="off" />
        </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">  
          {/* No.of Persons */}
          <div className="space-y-0.5">
            <label htmlFor="Persons" className="block text-sm font-medium text-gray-900">
              No.of Persons
            </label>
            <Input
              type="number"
              id="Persons"
              name="Persons"
              value={formData.Persons}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
                required autoComplete="off"/>
          </div>
          <div className="space-y-0.5">
            <label htmlFor="No_Hrs" className="block text-sm font-medium text-gray-900">
              No.of Hours
            </label>
            <Input
              type="number"

              id="No_Hrs"
              name="No_Hrs"
              value={formData.No_Hrs}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
              required autoComplete="off"/>
          </div>
          {/* Required months */}
          <div className="space-y-0.5">
            <label htmlFor="Req_Months" className="block text-sm font-medium text-gray-900">
              Required months
            </label>
            <div className="relative">
          <Select
            id="Req_Months"
            name="Req_Months"
            closeMenuOnSelect={false}
            components={animatedComponents}
            
            isMulti
            options={options} 
            value={
              [...formData.Req_Months]
                .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
                .map(month => ({ value: month, label: month }))
            }
            onChange={handleChange}
            required autoComplete="off"
            instanceId="req-months-select"
            classNamePrefix="react-select" 
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
          />
            </div>
          </div>
        
       {/* No. of Times */}
       <div className="space-y-0.5">
            <label htmlFor="No_Times" className="block text-sm font-medium text-gray-900">
              No. of Times
            </label>
            <Input
              type="text"
              id="No_Times"
              name="No_Times"
              value={formData.No_Times}  // Bind the value here
              onChange={handleFormChange}
             // Make it read-only to prevent manual changes
             className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
             required  readOnly autoComplete="off"/>
          </div>
          </div>
        {/* No. of Hours */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">  
      
        {/* Evaluation */}
        <div className="space-y-0.5">
  <label htmlFor="Evaluation_Period" className="block text-sm font-medium text-gray-900">
    Evaluation Period
  </label>
  <Input
    type="text" // Keep as text
    id="Evaluation_Period"
    name="Evaluation_Period"
    value={formData.Evaluation_Period}
    onChange={(e) => {
      const newValue = e.target.value;
      // Check if the value is a number or an empty string (allowing clearing the field)
      if (/^\d*$/.test(newValue)) {
        handleFormChange(e);  // Only update if the value is numeric or empty
      }
    }}
    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-64"      
 aria-required  autoComplete="off"/>
</div>
   {/* Buttons */}
<div>
<label htmlFor="Evaluation_Period" style={{visibility:"hidden"}} className="block text-sm font-medium text-gray-900">
    Evaluation Period
  </label>
        <button type="submit" disabled={loading} className="px-6 mt-2 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
        >
      {loading ? 'Loading...' : 'Submit'}
    </button>
        </div>
</div>

{trainingData.length > 0 ? (
  <div className="card-body p-0 overflow-x-auto mt-2 pb-3">
    <div className="p-4 bg-card">
      <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
        <div className="flex items-center space-x-2">
          <span style={{ fontSize: "14px" }}>Show</span>
          <select
            style={{ fontSize: "14px" }}
            className="border p-0 rounded bg-secondary"
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
          <span style={{ fontSize: "14px" }}>entries</span>
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
      <table
        className="min-w-full overf border relative z-0  bg-card text-foreground"
        style={{
          tableLayout: "fixed",
          fontSize: "13px",
          padding: "1px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <thead className="bg-muted sticky top-0 z-10">
          <tr className="bg-gray-100">
            {Object.keys(columnKeyMap).map((key) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className="cursor-pointer px-4 py-2 border text-left"
              >
                {key}{" "}
                {sortConfig.key === columnKeyMap[key] ? (
                  sortConfig.direction === "asc" ? "▲" : "▼"
                ) : (
                  "↕"
                )}
              </th>
            ))}

            <th className="px-4 py-2 border text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((training) => (
              <tr className="border hover:bg-muted" key={training.Program_Id}>
                <td className="px-4 py-2 border">{training.Training_Name}</td>
                <td className="px-4 py-2 border">{training.Year_No}</td>
                <td className="px-4 py-2 border">{training.Department}</td>
                <td className="px-4 py-2 border">{training.Section}</td>
                <td className="px-4 py-2 border">
                  {programs.find(program => program.value === training.Program_Name)?.text || training.Program_Name}
                </td>
                <td className="px-4 py-2 border">{training.Train_Mode}</td>
                <td className="px-4 py-2 border">{training.Train_Purpose}</td>
                <td className="px-4 py-2 border">{training.Persons}</td>
                <td className="px-4 py-2 border">{training.No_Hrs}</td>
                <td className="px-4 py-2 border">{training.No_Times}</td>
                <td className="px-4 py-2 border">{training.Req_Months}</td>
                <td className="px-4 py-2 border">{training.Evaluation_Period}</td>
                <td className="px-4 py-2 border">
                  <div className="flex justify-center">
                    <button type="button" onClick={() => handleDelete(training.Program_Id)}>
                      <FaTrash style={{ color: "red", cursor: "pointer", fontSize: "15px" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={Object.keys(columnKeyMap).length + 1} className="text-center py-4">
                No results found.
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
            className="px-3 py-1 border rounded"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            {"<<"}
          </button>
          <button
            type="button"
            className="px-3 py-1 border rounded"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-black text-primary-foreground" : ""
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            className="px-3 py-1 border rounded"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
          <button
            type="button"
            className="px-3 py-1 border rounded"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            {">>"}
          </button>
        </div>
      </div>
      <div className="flex justify-end mt-3">
<EmailApprovalMain/>
      </div>
    </div>
  </div>
) : (
  ""
)
}
</form>
    </div>
  );
}