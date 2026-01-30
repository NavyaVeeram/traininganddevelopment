"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaSearch, FaTimes, FaEdit } from "react-icons/fa";
import Select from "react-select";
import EmailRejection from "../email/EmailRejection";
import EmailApprovalWeekForHrHod from "../email/EmailApprovalforhrhod";
import FullYearCalendar from "../calendar/page";
import dynamic from "next/dynamic";
import BackButton from "@/components/BackButton";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from 'xlsx';
const MonthCount = dynamic(() => import("./monthcount"), { ssr: false });

export default function TrainingDataTable() {
  // Add tab state
  const [activeTab, setActiveTab] = useState('approval');
  const [selectedProgramIds, setSelectedProgramIds] = useState([]);

  const [trainingData, setTrainingData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('');
  const [username, setUsername] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // NEW: Training Name filter states
  const [trainingNameOptions, setTrainingNameOptions] = useState([]);
  const [selectedTrainingName, setSelectedTrainingName] = useState('');
const weekOptions = Array.from({ length: 52 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `Week ${i + 1}`
}));
// Add this function in your component
const getISOWeeksForMonth = (monthValue, year) => {
  const monthMap = {
    "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
    "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
  };
  
  const monthIndex = monthMap[monthValue];
  const weeks = [];
  
  // Get first and last day of the month
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  
  // Helper to get ISO week number
  const getISOWeek = (date) => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  };
  
  // Get all unique week numbers in the month
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const weekNum = getISOWeek(d);
    if (!weeks.includes(weekNum)) {
      weeks.push(weekNum);
    }
  }
  
  return weeks.sort((a, b) => a - b);
};
// Add this useMemo hook
const filteredWeekOptions = useMemo(() => {
  if (!editingData?.Req_Months || !editingData?.Year_No) {
    return weekOptions; // Return all weeks if no month selected
  }
  
  const weeksInMonth = getISOWeeksForMonth(editingData.Req_Months, editingData.Year_No);
  
  return weekOptions.filter(week => 
    weeksInMonth.includes(parseInt(week.value))
  );
}, [editingData?.Req_Months, editingData?.Year_No]);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const storedDepartment = localStorage.getItem('department');
    const storedUsername = localStorage.getItem('username');
    const storedEmployeeId = localStorage.getItem('employeeId');

    if (storedDepartment && storedUsername && storedEmployeeId) {
      setDepartment(storedDepartment);
      setUsername(storedUsername);
      setEmployeeId(storedEmployeeId);
    } else {
      window.location.href = '/';
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/approval_form_data?employeeId=${storedEmployeeId}&department=${storedDepartment}`);
        const data = await response.json();

        if (response.ok) {
          const updatedData = data.map(item => ({
            ...item
          }));
          setTrainingData(updatedData);

          // Generate unique Training_Name options for dropdown
          const uniqueTrainingNames = [...new Set(updatedData.map(item => item.Training_Name))];
          const options = [{ value: '', label: 'All Categories' }, ...uniqueTrainingNames.map(name => ({
            value: name,
            label: name
          }))];
          setTrainingNameOptions(options);
        } else {
          console.error('Failed to fetch training data:', data.message);
          setTrainingData([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setTrainingData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');

    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    } else {
      window.location.href = '/';
      return;
    }

    const fetchAccessRole = async () => {
      try {
        const res = await fetch(`/api/get_access_role?employeeId=${storedEmployeeId}`);
        const data = await res.json();

        if (res.ok && data.Access_Role) {
          if (data.Access_Role === "HOS" || data.Access_Role === "HOD" || data.Access_Role === "Res_Person") {
            setIsAuthorized(false);
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

  const monthOptions = [
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
    { value: "Dec", label: "Dec" },
  ];

  const validateWeeksBeforeApproval = () => {
    const selectedItems = paginatedData.filter(item => 
      selectedProgramIds.includes(item.Program_Id)
    );
    
    const itemsWithoutWeek = selectedItems.filter(item => {
      if (item.Train_Mode === "Internal") {
        return false;
      }
      const weekStr = item.Week ? String(item.Week).trim() : '';
      return weekStr === '';
    });
    
    if (itemsWithoutWeek.length > 0) {
      const programNames = itemsWithoutWeek
        .map(item => item.Program_Name)
        .join('\n- ');
      
      alert(`Please select the week for the following programs:\n\n- ${programNames}`);
      return false;
    }
    
    return true;
  };

  const handleSort = (key) => {
    if (!key) return;

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sortedData = [...trainingData].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    setTrainingData(sortedData);
  };

  // UPDATED: Enhanced filteredData with Training_Name filter
  const filteredData = useMemo(() => {
    return trainingData.filter(item =>
      (selectedTrainingName === '' || item.Training_Name === selectedTrainingName) &&
      (
        item.Training_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Program_Name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [trainingData, searchQuery, selectedTrainingName]);

  const totalPages = rowsPerPage === "All" ? 1 : Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData =
    rowsPerPage === "All"
      ? filteredData
      : filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleEdit = (data) => {
    setEditingData(data);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e, key) => {
    setEditingData(prevData => {
      let value = e.target.value;
      if (key === "Training_Budget") {
        value = value === "" ? "" : parseFloat(value);
        if (isNaN(value)) value = "";
      }
      return {
        ...prevData,
        [key]: value,
      };
    });
  };

  const handleUpdate = async () => {
    console.log("handleUpdate called with Train_Mode:", editingData?.Train_Mode);
    if (
      (editingData.Train_Mode !== "Internal" && (!editingData?.Week || editingData.Week.trim() === "")) ||
      (editingData.Train_Mode !== "Internal" &&
        (editingData.Training_Budget === "" ||
         editingData.Training_Budget === undefined ||
         editingData.Training_Budget === null ||
         isNaN(Number(editingData.Training_Budget))))
    ) {
      if (editingData.Train_Mode !== "Internal") {
        alert("Week and Training_Budget are required and must be valid.");
      }
      setError("Week and Training_Budget are required and must be valid.");
      return;
    }
    try {
      const programId = editingData?.Program_Id;
      console.log('Program_Id:', programId);

      console.log('Updating with data:', editingData);

      const updatedDataWithCreatedBy = {
        ...editingData,
        Training_Budget: editingData.Train_Mode === "Internal" ? (editingData.Training_Budget === "" ? 0 : Number(editingData.Training_Budget)) : Number(editingData.Training_Budget),
        CreatedBy: employeeId,
      };

      const res = await fetch(`/api/update_approval_form_week?Program_Id=${programId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDataWithCreatedBy),
      });
      const responseData = await res.json();
      if (res.ok) {
         setIsModalOpen(false); // ✅ Close modal BEFORE alert
        alert(` ${responseData.message}`);


  // Refetch the data after successful update
      const response = await fetch(`/api/approval_form_data?employeeId=${employeeId}&department=${department}`);
      const data = await response.json();

      if (response.ok) {
        const updatedData = data.map(item => ({
          ...item
        }));
        setTrainingData(updatedData);
      }
        console.log("Updated trainingData:", updatedData);
        setIsModalOpen(false);
        setError("");
      } else {
        alert(`Error: ${responseData.message || "Unknown error"}`);
      }
    } catch (err) {
      setError("Failed to update the record");
    }
  };
const handleExcelExport = () => {
  // Prepare data for export
  const exportData = filteredData.map(item => ({
    'Category': item.Training_Name,
    'Year': item.Year_No,
    'Department': item.Department,
    'Section': item.Section,
    'Program Name': item.Program_Name,
    'Training Mode': item.Train_Mode,
    'Persons': item.Persons,
    'Hours': item.No_Hrs,
    'Times': item.No_Times,
    'Months': item.Req_Months,
    'Evaluation Period': item.Evaluation_Period,
    'Week': item.Week,
    'Training Budget': item.Training_Budget
  }));

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Training Data");

  // Generate file and download
  XLSX.writeFile(wb, `Training_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
};

  const renderTabContent = () => {
    switch (activeTab) {
      case 'approval':
        return renderApprovalFormContent();
      case 'other':
        return <MonthCount />;
  default:
        return renderApprovalFormContent();
    }
  };
// Add this useEffect after your other useEffect hooks
useEffect(() => {
  if (editingData?.Req_Months && isModalOpen) {
    // Clear the Week field when month changes
    setEditingData(prev => ({
      ...prev,
      Week: ""
    }));
  }
}, [editingData?.Req_Months, isModalOpen]);
  const renderApprovalFormContent = () => {
    if (loading) return <div>Loading...</div>;

    return (
      <div className="p-4 bg-white">
        {/* UPDATED: Enhanced Search and Filter Controls */}
        <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
          {/* Rows per page */}
          <div className="flex items-center gap-2 text-sm">
            <span>Show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(e.target.value === "All" ? "All" : parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded p-1"
            >
              {[10, 20, 30, 40, 100, "All"].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>

          {/* NEW: Training Name Filter Dropdown */}
      {trainingData.length > 0 && (    
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">Select Category:</label>
            <Select
              options={trainingNameOptions}
              value={trainingNameOptions.find(opt => opt.value === selectedTrainingName) || null}
              onChange={(selected) => setSelectedTrainingName(selected ? selected.value : '')}
              placeholder="All Categories"
              isClearable
              className="text-sm min-w-[200px] dark:z-0"
              styles={{
                control: (base) => ({
                  ...base,
                  padding: "2px",
                  borderRadius: "0.5rem",
                  borderColor: "#d1d5db",
                  minHeight: "2.4rem",
             
                }),
              }}
            />
          </div>
)}
          {/* Search and Calendar */}
          <div className="flex items-center gap-2 text-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="border pl-8 p-1 rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-2 top-2 text-gray-400" />
            </div>
            <div>
              {accessRole !== "Res_Person" && accessRole !== "HOS" && accessRole !== "HOD" && (
                <FullYearCalendar />
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-sm sticky top-0">
              <tr>
                <th className="px-2">
                  <input
                    type="checkbox"
                    checked={selectedProgramIds.length === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProgramIds(paginatedData.map(item => item.Program_Id));
                      } else {
                        setSelectedProgramIds([]);
                      }
                    }}
                    className="accent-green-500 cursor-pointer"
                  />
                </th>    
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("Training_Name")}>
                  Category{sortConfig.key === "Training_Name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th>
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("Year_No")}>
                  Year {sortConfig.key === "Year_No" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th>
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("Department")}>
                  Department {sortConfig.key === "Department" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th>
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("Section")}>
                  Section {sortConfig.key === "Section" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th>
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("Program_Name")}>
                  Program_Name {sortConfig.key === "Program_Name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th> 
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("Train_Mode")}>
                  Training Mode {sortConfig.key === "Train_Mode" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th>
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("Persons")}>
                  Persons {sortConfig.key === "Persons" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th>
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("No_Hrs")}>
                  Hours {sortConfig.key === "No_Hrs" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th>
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("No_Times")}>
                  Times {sortConfig.key === "No_Times" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th>
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("Req_Months")}>
                  Months {sortConfig.key === "Req_Months" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th>
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("Evaluation_Period")}>
                  Evaluation Period {sortConfig.key === "Evaluation_Period" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th>
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("Week")}>
                  Week {sortConfig.key === "Week" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th>
                <th className="border p-2 cursor-pointer text-left" onClick={() => handleSort("Training_Budget")}>
                  Training Budget {sortConfig.key === "Training_Budget" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                </th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.Program_Id} className="hover:bg-gray-50">
                    <td className="border p-2 text-left">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedProgramIds.includes(item.Program_Id)}
                          onChange={(e) => {
                            console.log('Checkbox change for Program_Id:', item.Program_Id, 'Checked:', e.target.checked);
                            if (e.target.checked) {
                              setSelectedProgramIds(prev => [...prev, item.Program_Id]);
                            } else {
                              setSelectedProgramIds(prev => prev.filter(id => id !== item.Program_Id));
                            }
                          }}
                          className="accent-green-500 cursor-pointer"
                          title={selectedProgramIds.includes(item.Program_Id) ? "Selected" : "Not selected"}
                        />
                      </div>
                    </td>
                    <td className="border p-2 text-left">{item.Training_Name}</td>
                    <td className="border p-2 text-left">{item.Year_No}</td>
                    <td className="border p-2 text-left">{item.Department}</td>
                    <td className="border p-2 text-left">{item.Section}</td>
                    <td className="border p-2 text-left">{item.Program_Name}</td>
                    <td className="border p-2 text-left">{item.Train_Mode}</td>
                    <td className="border p-2 text-left">{item.Persons}</td>
                    <td className="border p-2 text-left">{item.No_Hrs}</td>
                    <td className="border p-2 text-left">{item.No_Times}</td>
                    <td className="border p-2 text-left">{item.Req_Months}</td>
                    <td className="border p-2 text-left">{item.Evaluation_Period}</td>
                    <td className="border p-2 text-left">{item.Week}</td>
                    <td className="border p-2 text-left">{item.Training_Budget}</td>
                    <td className="border p-2">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(item)}>
                          <FaEdit className="text-blue-500 cursor-pointer" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15} className="text-center border p-4">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap justify-between items-center mt-4 space-y-2">
          {/* Showing entries */}
          <div style={{ fontSize: "14px" }}>
            Showing{" "}
            {paginatedData.length > 0 ? (
              rowsPerPage === "All" ? (
                `1 to ${paginatedData.length} of ${paginatedData.length} entries`
              ) : (
                `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                  currentPage * rowsPerPage,
                  paginatedData.length
                )} of ${filteredData.length} entries`
              )
            ) : (
              "0 entries"
            )}
          </div>

          {/* Pagination buttons */}
          {rowsPerPage !== "All" && (
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
                className="px-3 py-1 border cursor-pointer rounded"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                {"<"}
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`px-3 py-1 border cursor-pointer rounded ${
                    currentPage === i + 1 ? "bg-black text-white" : ""
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                className="px-3 py-1 border cursor-pointer rounded"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                {">"}
              </button>
              <button
                type="button"
                className="px-3 py-1 border cursor-pointer rounded"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                {">>"}
              </button>
            </div>
          )}
        </div>

        <BackButton/>

        {/* Approval Buttons */}
        {selectedProgramIds.length > 0 && (
          <div className="flex justify-end mt-6 gap-x-2">
            <EmailApprovalWeekForHrHod
              selectedItems={trainingData.filter(item => selectedProgramIds.includes(item.Program_Id))}
              employeeId={employeeId}
              selectedProgramIds={selectedProgramIds}
            />
            <EmailRejection
              weeks={trainingData.filter(item => selectedProgramIds.includes(item.Program_Id)).map(item => item.Week)}
              Training_Budget={trainingData.filter(item => selectedProgramIds.includes(item.Program_Id)).map(item => item.Training_Budget)}
              trainModeList={trainingData.filter(item => selectedProgramIds.includes(item.Program_Id)).map(item => item.Train_Mode)}
              selectedProgramIds={selectedProgramIds}
              selectedProgramNames={trainingData.filter(item => selectedProgramIds.includes(item.Program_Id)).map(item => item.Program_Name)}
              employeeId={employeeId}
              onRejectSuccess={() => {
                // Refresh data or handle post-rejection logic here
              }}
            />
          </div>
        )}
      </div>
    );
  };
useEffect(() => {
  const storedEmployeeId = localStorage.getItem("employeeId");

  if (!storedEmployeeId) {
    window.location.href = '/';
    return;
  }

  setEmployeeId(storedEmployeeId);

  const fetchAccessRole = async () => {
    try {
      const res = await fetch(
        `/api/get_access_role?employeeId=${storedEmployeeId}`
      );
      const data = await res.json();

      if (res.ok && data.Access_Role) {
        // ✅ ONLY allow HOS access
        if (data.Access_Role === "HR_Res" || data.Access_Role === "HR_Hod") {
          setAccessRole(data.Access_Role);
          setIsAuthorized(true);
        } else {
          // ❌ Block everyone else
          setIsAuthorized(false);
        }
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
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!username) {
    return <div>Loading user information...</div>;
  }

  // if (isAuthorized === null) {
  //   return <div>Loading authorization...</div>;
  // }

  // if (!isAuthorized) {
  //   return (
  //     <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
  //       <div className="bg-white p-10 rounded shadow text-center">
  //         <h2 className="text-2xl font-bold">Unauthorized</h2>
  //         <p className="mt-2">You do not have access to view this page.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div>
      <div className="max-w-full mx-auto bg-white p-2 w-full">
        {/* Header with Tabs */}
        <div className="bg-sky-400 text-white p-2 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-6">
            <p className="font-semibold">Approval Form</p>
            
            <div className="flex space-x-1 bg-sky-500 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('approval')}
                className={`px-3 py-1 rounded-md cursor-pointer text-xs font-medium transition-colors ${
                  activeTab === 'approval'
                    ? 'bg-white text-sky-600 shadow-sm'
                    : 'text-white hover:bg-sky-300'
                }`}
              >
                Training Data
              </button>
              <button
                onClick={() => setActiveTab('other')}
                className={`px-3 py-1 rounded-md cursor-pointer text-xs font-medium transition-colors ${
                  activeTab === 'other'
                    ? 'bg-white text-sky-600 shadow-sm'
                    : 'text-white hover:bg-sky-300'
                }`}
              >
                Summary
              </button>
            </div>
          </div>


          <div className="flex justify-end mx-3">
           
            {username ? (
              <p className="font-bold">{username}</p>
            ) : (
              <p>Loading the Username</p>
            )}

          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white">
          {renderTabContent()}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 flex justify-center items-center z-40 bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="relative z-50 w-full max-w-4xl p-6 bg-white shadow-lg rounded-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="bg-sky-400 text-white p-3 flex justify-between items-center rounded-t-lg">
                Update Approval Details
                <button onClick={handleCancel} className="text-white hover:text-gray-200">
                  <FaTimes />
                </button>
              </h3>
              {editingData && (
                <div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Category */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Category</label>
                      <input
                        type="text"
                        value={editingData.Training_Name}
                        readOnly
                        className="border p-2 bg-gray-100 border-gray-300 cursor-not-allowed rounded-md"
                      />
                    </div>

                    {/* Year */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Year</label>
                      <input
                        type="text"
                        value={editingData.Year_No}
                        readOnly
                        className="border p-2 bg-gray-100 border-gray-300 cursor-not-allowed rounded-md"
                      />
                    </div>

                    {/* Department */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Department</label>
                      <input
                        type="text"
                        value={editingData.Department}
                        readOnly
                        className="border p-2 bg-gray-100 border-gray-300 cursor-not-allowed rounded-md"
                      />
                    </div>

                    {/* Section */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Section</label>
                      <input
                        type="text"
                        value={editingData.Section}
                        readOnly
                        className="border p-2 bg-gray-100 border-gray-300 cursor-not-allowed rounded-md"
                      />
                    </div>

                    {/* Program Name */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Program Name</label>
                      <input
                        type="text"
                        value={editingData.Program_Name}
                        readOnly
                        className="border p-2 bg-gray-100 border-gray-300 cursor-not-allowed rounded-md"
                      />
                    </div>

                    {/* Training Mode */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Training Mode</label>
                      <input
                        type="text"
                        value={editingData.Train_Mode}
                        readOnly
                        className="border p-2 bg-gray-100 border-gray-300 cursor-not-allowed rounded-md"
                      />
                    </div>

                    {/* Purpose */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Purpose</label>
                      <input
                        type="text"
                        value={editingData.Train_Purpose}
                        readOnly
                        className="border p-2 bg-gray-100 border-gray-300 cursor-not-allowed rounded-md"
                      />
                    </div>

                    {/* Persons */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Persons</label>
                      <input
                        type="number"
                        min="0"
                        value={editingData.Persons}
                        onChange={(e) => handleInputChange(e, "Persons")}
                        className="border p-2 rounded-md"
                      />
                    </div>

                    {/* Hours */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Hours</label>
                      <input
                        type="number"
                        min="0"
                        value={editingData.No_Hrs}
                        onChange={(e) => handleInputChange(e, "No_Hrs")}
                        className="border p-2 rounded-md"
                      />
                    </div>

                    {/* Times */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Times</label>
                      <input
                        type="number"
                        min="0"
                        readOnly
                        value={editingData.No_Times}
                        className="border p-2 bg-gray-100 cursor-not-allowed rounded-md"
                      />
                    </div>

                    {/* Months */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Months</label>
<Select
  options={monthOptions}
  value={monthOptions.find(opt => opt.value === editingData.Req_Months) || null}
  onChange={(selected) => {
    const val = selected ? selected.value : "";
    setEditingData(prevData => ({
      ...prevData,
      Req_Months: val,
      Week: "" // Clear weeks when month changes
    }));
  }}
  placeholder="Select Month"
  isClearable
  className="text-sm"
  styles={{
    control: (base) => ({
      ...base,
      padding: "2px",
      borderRadius: "0.5rem",
      borderColor: "#d1d5db",
      minHeight: "2.4rem",
    }),
  }}
/>
                    </div>

                    {/* Week (only if not Internal) */}
                    {/* {editingData.Train_Mode !== "Internal" && ( */}
                  <div className="flex flex-col">
  <label className="font-semibold mb-1">Week No</label>
  <Select
    options={filteredWeekOptions}  // Use filtered options instead of weekOptions
    isMulti
    value={
      (() => {
        if (!editingData.Week) return [];
        const weekStr = String(editingData.Week);
        return weekStr.split(',').map(w => ({
          value: w.trim(),
          label: `Week ${w.trim()}`
        })).filter(w => w.value);
      })()
    }
    onChange={(selected) => {
      const val = selected && selected.length > 0 
        ? selected.map(opt => opt.value).join(',')
        : "";
      handleInputChange({ target: { value: val } }, "Week");
    }}
    placeholder={editingData.Req_Months ? `Weeks in ${editingData.Req_Months}` : "Select month first"}
  />
</div>
                    {/* )} */}

                    {/* Training Budget (only if not Internal) */}
                    {editingData.Train_Mode !== "Internal" && (
                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">Training Budget</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingData.Training_Budget ?? ""}
                          onChange={(e) => handleInputChange(e, "Training_Budget")}
                          className="border p-2 rounded-md"
                        />
                      </div>
                    )}

                    {/* Evaluation Period */}
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1">Evaluation Period</label>
                      <input
                        type="text"
                        value={editingData.Evaluation_Period}
                        onChange={(e) => handleInputChange(e, "Evaluation_Period")}
                        className="border p-2 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button 
                      onClick={handleUpdate} 
                      className="px-6 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors"
                    >
                      Update
                    </button>
                    <button 
                      onClick={handleCancel} 
                      className="px-6 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
