"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import AccessList from "./AccessList";

// Custom Select Styles
const customSelectStyles = {
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
};

const Access = () => {
  const [employeeOptions, setEmployeeOptions] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [designations, setDesignations] = useState([]);
   const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [error, setError] = useState(null);

  // Fetch Employee Dropdown
  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/user_dropdown");
      const data = await res.json();
      const formatted = data.map((item) => ({
        value: item.Value,
        label: `${item.Text}`,
      }));
      setEmployeeOptions(formatted);
    } catch (err) {
      setError("Failed to fetch employees");
      setEmployeeOptions([]);
    }
  };

  // Fetch Designation Dropdown
  const fetchDesignation = async () => {
    try {
      const res = await fetch("/api/designation_dropdown");
      const data = await res.json();
      const formatted = data.map((item) => ({
        value: item.Designation,
        label: item.Designation,
      }));
      setDesignations(formatted);
    } catch (err) {
      setError("Failed to fetch designations");
      setDesignations([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDesignation();
  }, []);

  const handleEmployeeIdChange = (selectedOption) => {
    setSelectedEmployeeId(selectedOption ? selectedOption.value : null);
  };

  const handleDesignationChange = (selectedOption) => {
    setSelectedDesignation(selectedOption ? selectedOption.value : null);
  };

const handleSubmit = async () => {
  if (!selectedEmployeeId || !selectedDesignation) {
    alert("Please select both Employee ID and Designation.");
    return;
  }

  // Store the selectedDesignation (Access_Role) in localStorage
  localStorage.setItem("AccessRole", selectedDesignation);

  const CreatedBy = localStorage.getItem("employeeId"); // fallback

  try {
    const res = await fetch("/api/employee_access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        EmployeeId: selectedEmployeeId,
        Access: selectedDesignation,
        CreatedBy,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || "Access role updated successfully.");
       setRefreshTrigger((prev) => prev + 1); // <-- Trigger AccessList refresh
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error("Submission error:", error);
    alert("An error occurred. Please try again.");
  }
};


  if (employeeOptions === null) {
    return <div className="text-gray-700">Loading employees...</div>;
  }

  return (
    <div>
        <div className="flex flex-wrap items-end gap-6 mt-6 m-2">
      {/* Employee ID Dropdown */}
      <div className="flex flex-col w-100">
        <label className="text-sm font-medium text-gray-900 mb-1">
          Select Employee ID
        </label>
        <Select
          options={employeeOptions}
          value={
            employeeOptions.find((o) => o.value === selectedEmployeeId) || null
          }
          onChange={handleEmployeeIdChange}
          placeholder="Select Employee ID"
          styles={customSelectStyles}
        />
      </div>

      {/* Designation Dropdown */}
      <div className="flex flex-col w-100">
        <label className="text-sm font-medium text-gray-900 mb-1">
          Select Access Role
        </label>
        <Select
          options={designations}
          value={
            designations.find((o) => o.value === selectedDesignation) || null
          }
          onChange={handleDesignationChange}
          placeholder="Select Designation"
          styles={customSelectStyles}
        />
      </div>

      {/* Submit Button */}
      <div className="flex">
        <button
          onClick={handleSubmit}
         className="px-6 mt-2 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
        >
          Add
        </button>
      </div>

    </div>
    <AccessList refreshTrigger={refreshTrigger}/>
    </div>
  
  );
};

export default Access;