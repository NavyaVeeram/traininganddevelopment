'use client'

import { useState, useEffect,useMemo } from 'react'
import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
const ViewEditUpload = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trainingData, setTrainingData] = useState([]);
  const [data,setData] = useState([]);
  const [IsActive, setIsActive] = useState(false); 
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [editingData, setEditingData] = useState(null); // Store data for editing
  const handleDateChange = async (date) => {
    setSelectedDate(date)

    if (date) {
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      // Fetch data when date changes
      fetchData(month, year)
    } else {
      setError('Please select a valid date.')
    }
  }

  // useEffect(() => {
  //   const month = selectedDate.getMonth() + 1
  //   const year = selectedDate.getFullYear()
  //   fetchData(month, year)
  // }, [selectedDate]);

  const fetchData = async (month, year) => {
    if (!month || !year) {
      setError('Month and Year are required.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/view_trainingdata?month=${month}&year=${year}`)
      if (!res.ok) {
        throw new Error('Failed to fetch data')
      }

      const result = await res.json()
      console.log('API Response:', result)
      result.forEach(item => {
        console.log(`Program_Id: ${item.Program_Id}, Status: ${item.IsActive ? 'Active' : 'Inactive'}`)
      })
      setTrainingData(result)
      setData(result) // Set initial data
    } catch (err) {
      setError(err.message)
      setTrainingData([])
    } finally {
      setLoading(false)
    }
  }
  const handleCheckboxChange = async (Program_Id, currentIsActive) => {
    const newIsActive = !currentIsActive;
    // Optimistically update trainingData and data
    setTrainingData((prevData) =>
      prevData.map((item) =>
        item.Program_Id === Program_Id ? { ...item, IsActive: newIsActive } : item
      )
    );
    setData((prevData) =>
      prevData.map((item) =>
        item.Program_Id === Program_Id ? { ...item, IsActive: newIsActive } : item
      )
    );
  
    try {
      const response = await fetch("/api/update_user_active_status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Program_Id,
          IsActive: newIsActive,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update user status");
      }
  
      const result = await response.json();
      console.log("API response:", result);
      alert("IsActive updated successfully");
      // Already updated UI optimistically
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Failed to update user status.");
  
      // Optional: Revert UI if needed
      setTrainingData((prevData) =>
        prevData.map((item) =>
          item.Program_Id === Program_Id ? { ...item, IsActive: currentIsActive } : item
        )
      );
      setData((prevData) =>
        prevData.map((item) =>
          item.Program_Id === Program_Id ? { ...item, IsActive: currentIsActive } : item
        )
      );
    }
  };
  const handleCompleted = async (Program_Id, currentTrainingStatus) => {
    const newTrainingStatus = !currentTrainingStatus?'Completed' :'Not Completed' ;
  
    // Optimistically update trainingData and data
    setTrainingData((prevData) =>
      prevData.map((item) =>
        item.Program_Id === Program_Id ? { ...item, Training_Status: newTrainingStatus } : item
      )
    );
    setData((prevData) =>
      prevData.map((item) =>
        item.Program_Id === Program_Id ? { ...item, Training_Status: newTrainingStatus } : item
      )
    );
  
    try {
      const response = await fetch("/api/update_user_completed_status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Program_Id,
          Training_Status: newTrainingStatus,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update user status");
      }
  
      const result = await response.json();
      console.log("API response:", result);
    alert("Status updated successfully");
      // Already updated UI optimistically
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Failed to update user status.");
  
      // Optional: Revert UI if needed
      setTrainingData((prevData) =>
        prevData.map((item) =>
          item.Program_Id === Program_Id ? { ...item, Training_Status: currentTrainingStatus } : item
        )
      );
      setData((prevData) =>
        prevData.map((item) =>
          item.Program_Id === Program_Id ? { ...item, Training_Status: currentTrainingStatus } : item
        )
      );
    }
  };
  

const handleEdit = (data) => {
    setEditingData(data); // Set the data of the row to be edited
    setIsModalOpen(true); // Open the modal
    setEditingData(data); // Set the data of the row to be edited
    setIsModalOpen(true); // Open the modal
  };

  // Handle update button in the modal
  const handleUpdate = async () => {
    try {
      const programId = editingData?.Program_Id;
      console.log('Program_Id:', programId);

      // Log the data to check if all fields are present
      console.log('Updating with data:', editingData);

      const res = await fetch(`/api/update_trainingdata?Program_Id=${programId}`, {
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
   Training_Name:"Training Name",   
  Department:"Department",
  Program_Name:"Program Name",
  Train_Mode:"Mode",
  Train_Purpose:"Purpose",
  Persons:"Persons",
  No_Hrs:"Hours",
  Req_Months:"Req Months",
  Evaluation_Period:"Evaluation Period",
  Training_Date:"Training Date",

  };
   const handleSort = (column) => {
      const key = column;
      if (!key) return;
  
      let direction = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.key === key && sortConfig.direction === "desc") {
        setSortConfig({ key: null, direction: null });
        setTrainingData(data);
        return;
      }
  
      setSortConfig({ key, direction });
  
      const sortedData = [...data].sort((a, b) => {
        if (key === "Training_Date") {
          const dateA = new Date(a[key]);
          const dateB = new Date(b[key]);
          return direction === "asc" ? dateA - dateB : dateB - dateA;
        } else if (typeof a[key] === "string") {
          return direction === "asc"
            ? a[key].toLowerCase().localeCompare(b[key].toLowerCase())
            : b[key].toLowerCase().localeCompare(a[key].toLowerCase());
        } else {
          return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
        }
      });
      setTrainingData(sortedData);
    };
  
    const filteredData = useMemo(() => {
      return trainingData.filter((item) =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }, [trainingData, searchQuery]);
  
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData =
      rowsPerPage === "All"
        ? filteredData
        : filteredData.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage
          );
   const handlePageChange = (page) => {
            if (page < 1 || page > totalPages) return;
            setCurrentPage(page);
          };
  const handleRowsPerPageChange = (event) => {
            setRowsPerPage(Number(event.target.value));
            setCurrentPage(1); // Reset to the first page when rows per page change
          };
  return (
    <div className="max-w-full mx-auto bg-white p-4 shadow-md rounded-lg w-full">
    <div className="bg-sky-600 text-white p-2 rounded-t-lg">
      <h1 className="font-semibold">Training Attendance Entry</h1>
    </div>
    <div className="my-4 relative z-50">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Month</label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                placeholderText="Select Month and Year"
                className="p-2 border border-gray-300 rounded-lg"
                calendarClassName="z-50"        />
            </div>
          </div>
       
          {loading && <p className="text-blue-600">Loading data...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {/* view the training attendance entry and also edit*/}
          {selectedDate &&(
          <div className="card shadow rounded-lg bg-[var(--bgBody)] mt-6">
  <div className="card-header bg-[var(--bgBody)] text-black rounded-t-lg py-3 px-3">
   <div className="card-body p-0 overflow-x-auto pb-3">
  <div className="p-4 bg-card">
          {paginatedData.length > 0 && (
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
          )}
        
            {selectedDate && (
            <div className="overflow-auto ">
              {paginatedData.length > 0 ? (
                <table className="min-w-full relative z-0 overf border border-gray-300 bg-card text-foreground"
                style={{ 
                  tableLayout: "fixed" ,
                  fontSize: "13px", 
                  whiteSpace: "nowrap", 
                  overflow: "hidden",   
                  textOverflow: "ellipsis",
                  borderCollapse: "collapse",
                }}>
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr className="bg-gray-100">
                      {Object.keys(columnKeyMap).map((key) => (
                        <th
                          key={key}
                          onClick={() => handleSort(key)}
                          className="cursor-pointer px-4 py-2 border text-left"
                        >
                      {key}{" "}
                          {sortConfig.key === key ? (
                            sortConfig.direction === "asc" ? "▲" : "▼"
                          ) : (
                            "↕"
                          )}
                        </th>
                      ))}
                        <th className="cursor-pointer px-4 py-2 border text-left">IsActive</th>
                        <th className="cursor-pointer px-4 py-2 border text-left">Status</th>
                      <th className="cursor-pointer px-4 py-2 border text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody style={{fontSize:"12px"}}>
                    {!loading && paginatedData.length > 0 && paginatedData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border px-3 py-1">{item.Training_Name}</td>
                        <td className="border px-3 py-1">{item.Department}</td>
                        <td className="border px-3 py-1">{item.Program_Name}</td>
                        <td className="border px-3 py-1">{item.Train_Mode}</td>
                        <td className="border px-3 py-1">{item.Train_Purpose}</td>
                        <td className="border px-3 py-1">{item.Persons}</td>
                        <td className="border px-3 py-1">{item.No_Hrs}</td>
                        <td className="border px-3 py-1">{item.Req_Months}</td>
                        <td className="border px-3 py-1">{item.Evaluation_Period}</td>
                        <td className="border px-3 py-1"> {new Date(item.Training_Date).toLocaleDateString()}</td>
             
                          <td className="py-2 px-4   text-left border border-blue-100">
                          <label className="flex items-center justify-center gap-2">
                <input
                  type="checkbox"
                  checked={item.IsActive} // This will update the checkbox based on the local state
                  onChange={() => handleCheckboxChange(item.Program_Id, item.IsActive)} // Trigger the toggle
                  className="h-5 w-4"
                  disabled={item.Training_Status === 'Completed'}
                />
                <span className={item.IsActive ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {item.IsActive ? "Active"  : "Inactive"} {/* This will show Active or Inactive */}
                </span>
              </label>
          
                        </td>
                        <td className="py-2 px-4   text-left border border-blue-100">
                            <label className="flex items-center justify-center gap-2">
                <input
                  type="checkbox"
                  checked={item.Training_Status==='Completed'} // This will update the checkbox based on the local state
                  onChange={() => handleCompleted(item.Program_Id, item.Training_Status === 'Completed')} // Trigger the toggle
                  className="h-5 w-4"
                  disabled={!item.IsActive}
                />
                <span className={item.Training_Status === 'Completed' ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {item.Training_Status === 'Completed' ? "Completed" : "Not Completed"} {/* This will show Active or Inactive */}
                </span>
              </label>
          
                        </td>
                        <td className='border px-3 py-1 text-center'>   <button
                onClick={() => handleEdit(item)}
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
              >
              <FontAwesomeIcon icon={faEdit} />
              </button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-4 font-semibold text-red-500">
                  No results found.
                </div>
              )}
            </div>
            )}

          {paginatedData.length > 0 && (
          <div className="flex flex-wrap justify-between items-center mt-4 space-y-2">
              <div   className="flex space-x-2" style={{fontSize:"14px"}}>
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
          )}

      {isModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center z-50" onClick={handleCancel}>
            <div className="w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg " onClick={(e) => e.stopPropagation()}>
              <h2 className="font-semibold text-white bg-gray-500 py-3 px-3 mb-1 rounded-t-lg"> Update Training Data</h2>
              <div className="space-y-4">
                {/* Program Name (Readonly) - Single Row */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Program Name</label>
                  <input
                    type="text"
                    value={editingData?.Program_Name || ''}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-200 text-gray-500 border border-gray-300 rounded-md cursor-not-allowed"
                  />
                </div>

                {/* 2 Columns for Remaining Attributes */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Req Months (Shortform) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Required Months</label>
                    <select
                      value={editingData?.Req_Months || ''}
                      onChange={(e) => setEditingData({ ...editingData, Req_Months: e.target.value })}
                      className="w-70 px-4 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Month</option>
                      <option value="Jan">Jan</option>
                      <option value="Feb">Feb</option>
                      <option value="Mar">Mar</option>
                      <option value="Apr">Apr</option>
                      <option value="May">May</option>
                      <option value="Jun">Jun</option>
                      <option value="Jul">Jul</option>
                      <option value="Aug">Aug</option>
                      <option value="Sep">Sep</option>
                      <option value="Oct">Oct</option>
                      <option value="Nov">Nov</option>
                      <option value="Dec">Dec</option>
                    </select>
                  </div>

                  {/* Train Mode (Radio buttons for Internal, External, Overseas) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Train Mode</label>
                    <div className="flex items-center space-x-4">
                      {/* Internal Radio Button */}
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="Internal"
                          checked={editingData?.Train_Mode === 'Internal'} // Checks if the current Train_Mode is "Internal"
                          onChange={(e) => setEditingData({ ...editingData, Train_Mode: e.target.value })} // Updates Train_Mode to "Internal"
                          className="form-radio"
                        />
                        <span className="ml-2">Internal</span>
                      </label>

                      {/* External Radio Button */}
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="External"
                          checked={editingData?.Train_Mode === 'External'} // Checks if the current Train_Mode is "External"
                          onChange={(e) => setEditingData({ ...editingData, Train_Mode: e.target.value })} // Updates Train_Mode to "External"
                          className="form-radio"
                        />
                        <span className="ml-2">External</span>
                      </label>

                      {/* Overseas Radio Button */}
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="Overseas"
                          checked={editingData?.Train_Mode === 'Overseas'} // Checks if the current Train_Mode is "Overseas"
                          onChange={(e) => setEditingData({ ...editingData, Train_Mode: e.target.value })} // Updates Train_Mode to "Overseas"
                          className="form-radio"
                        />
                        <span className="ml-2">Overseas</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Another row for remaining fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Train Purpose</label>
                    <input
                      type="text"
                      value={editingData?.Train_Purpose || ''}
                      onChange={(e) => setEditingData({ ...editingData, Train_Purpose: e.target.value })}
                      className="w-70 px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Persons</label>
                    <input
                      type="text"
                      value={editingData?.Persons || ''}
                      onChange={(e) => setEditingData({ ...editingData, Persons: e.target.value })}
                      className="w-70 px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">No of Hours</label>
                    <input
                      type="number"
                      value={editingData?.No_Hrs || ''}
                      onChange={(e) => setEditingData({ ...editingData, No_Hrs: e.target.value })}
                      className="w-70 px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Evaluation Period</label>
                    <input
                      type="number"
                      value={editingData?.Evaluation_Period || ''}
                      onChange={(e) => setEditingData({ ...editingData, Evaluation_Period: e.target.value })}
                      className="w-70 px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Training Date</label>
                    <input
  type="date"
  value={editingData?.Training_Date ? editingData.Training_Date.slice(0, 10) : ''}
  onChange={(e) => setEditingData({ ...editingData, Training_Date: e.target.value })}
  className="w-70 px-4 py-2 border border-gray-300 rounded-md"
/>

                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-600">No of Times</label>
                    <input
                      type="number"
                      value={editingData?.No_Times || ''}
                      readOnly
                      onChange={(e) => setEditingData({ ...editingData, No_Times: e.target.value })}
                      className="w-70 px-4 py-2 bg-gray-200 text-gray-500 border border-gray-300 rounded-md cursor-not-allowed"
                    />
                  </div> */}
                </div>
                {/* Buttons */}
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
            </div>
     
        )}
</div>
    </div>
    </div>
    </div>
          )}
</div>
    
  )
}

export default ViewEditUpload
