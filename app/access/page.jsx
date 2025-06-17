"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import AccessList from "./AccessList";

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
  const [designations, setDesignations] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [empRes, desigRes] = await Promise.all([
          fetch("/api/access_user_dropdown"),
          fetch("/api/access_role_dropdown"),
        ]);

        const empData = await empRes.json();
        const desigData = await desigRes.json();

        setEmployeeOptions(
          empData.map((item) => ({
            value: item.Value,
            label: `${item.Text}`,
          }))
        );

        setDesignations(
          desigData.map((item) => ({
            value: item.Designation,
            label: item.Designation,
          }))
        );
      } catch (err) {
        console.error("Error fetching options:", err);
        setError("Failed to fetch employee or designation options.");
        setEmployeeOptions([]);
        setDesignations([]);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const checkAuthorization = async () => {
      const storedEmployeeId = localStorage.getItem("employeeId");

      if (!storedEmployeeId) {
        window.location.href = "/";
        return;
      }

      try {
        const res = await fetch(`/api/get_access_role?employeeId=${storedEmployeeId}`);
        const data = await res.json();

        if (
          res.ok &&
          ["Res_Person", "HR_Res", "HR_Hod", "HOD", "HOS", "HR_Hos"].includes(data.Access_Role)
        ) {
          setAccessRole(data.Access_Role);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Authorization error:", error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, []);

  const handleEmployeeIdChange = (selectedOption) => {
    setSelectedEmployeeId(selectedOption?.value || null);
  };

  const handleDesignationChange = (selectedOption) => {
    setSelectedDesignation(selectedOption?.value || null);
  };

  const handleSubmit = async () => {
    if (!selectedEmployeeId || !selectedDesignation) {
      alert("Please select both Employee ID and Designation.");
      return;
    }

    const CreatedBy = localStorage.getItem("employeeId") || "unknown";

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
        setRefreshTrigger((prev) => prev + 1);

        // Clear form
        setSelectedEmployeeId(null);
        setSelectedDesignation(null);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // UI feedback during loading
  if (loading || employeeOptions === null) {
    return <div className="text-gray-700 p-4">Loading...</div>;
  }

  if (!isAuthorized) {
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
      <div className="flex flex-wrap items-end gap-6 mt-6 m-2">
        <div className="flex flex-col w-100">
          <label className="text-sm font-medium text-gray-900 mb-1">
            Select Employee ID
          </label>
          <Select
            options={employeeOptions}
            value={employeeOptions.find((o) => o.value === selectedEmployeeId) || null}
            onChange={handleEmployeeIdChange}
            placeholder="Select Employee ID"
            styles={customSelectStyles}
          />
        </div>

        <div className="flex flex-col w-100">
          <label className="text-sm font-medium text-gray-900 mb-1">
            Select Access Role
          </label>
          <Select
            options={designations}
            value={designations.find((o) => o.value === selectedDesignation) || null}
            onChange={handleDesignationChange}
            placeholder="Select Designation"
            styles={customSelectStyles}
          />
        </div>

        <div className="flex">
          <button
            onClick={handleSubmit}
            className="px-6 mt-2 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
      </div>

      <AccessList refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default Access;
