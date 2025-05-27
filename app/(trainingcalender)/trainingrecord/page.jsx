"use client";
import React, { useState, useEffect } from "react";

export default function TrainingRecord() {
  const [message, setMessage] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(null); // null: not decided yet

  const [formData, setFormData] = useState({
    Training_Name: 'IATF',
    Program_Name: '',
    CreatedBy: '',
  });

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');

    if (!storedEmployeeId) {
      window.location.href = '/';
      return;
    }

    setEmployeeId(storedEmployeeId);
    setFormData(prevData => ({
      ...prevData,
      CreatedBy: storedEmployeeId,
    }));

    const fetchAccessRole = async () => {
      try {
        const res = await fetch(`/api/get_access_role?employeeId=${storedEmployeeId}`);
        const data = await res.json();

<<<<<<< HEAD
        if (res.ok && (data.Access_Role === 'HOS' || data.Access_Role === 'HOD')) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error fetching access role:', error);
=======
      if (res.ok && (data.Access_Role === 'HR_Res')) {
        setAccessRole(data.Access_Role);
        setIsAuthorized(true);
      } else {
>>>>>>> a03421aa870365d2f9b309abc922f8668e2031a3
        setIsAuthorized(false);
      }
    };

    fetchAccessRole();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/standard_program_add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        alert(data.message);
        setFormData((prev) => ({
          ...prev,
          Program_Name: '',
        }));
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('An error occurred while submitting the form.');
    }
  };

  // 🚫 Block render until auth is determined
  if (isAuthorized === null) return null;

  // 🔒 Unauthorized view
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

  // ✅ Authorized view
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg space-y-8"
      >
        <h2 className="bg-sky-400 text-white p-4 rounded-t-lg">
          Program Request Form
        </h2>

        {/* Mode of Program */}
        <div>
          <label htmlFor="Training_Name" className="block text-sm font-medium text-gray-900">
            Mode of the Program
          </label>
          <select
            id="Training_Name"
            name="Training_Name"
            value={formData.Training_Name}
            onChange={handleFormChange}
            required
            className="block w-full mt-1 py-3 pl-4 pr-8 border-2 border-gray-300 rounded-md text-gray-800"
          >
            <option value="IATF">International Automotive Task Force - (IATF)</option>
            <option value="HSE">Health, Safety, and Environment - (HSE)</option>
          </select>
        </div>

        {/* Program Name */}
        <div>
          <label htmlFor="Program_Name" className="block text-sm font-medium text-gray-900">
            Name of the Program
          </label>
          <textarea
            id="Program_Name"
            name="Program_Name"
            value={formData.Program_Name}
            onChange={handleFormChange}
            required
            className="block w-full mt-1 py-3 pl-4 pr-8 border-2 border-gray-300 rounded-md text-gray-800"
            placeholder="Enter Program Name"
          />
        </div>

        {/* Hidden CreatedBy field */}
        <input type="hidden" name="CreatedBy" value={formData.CreatedBy} />

        {/* Buttons */}
        <div className="flex justify-between gap-x-6">
          <button
            type="submit"
            className="cursor-pointer px-6 py-2 text-lg font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-900 transition"
          >
            Save
          </button>
          <button
            type="button"
            className="cursor-pointer px-6 py-2 text-lg font-semibold text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() =>
              setFormData({
                Training_Name: 'IATF',
                Program_Name: '',
                CreatedBy: employeeId || '',
              })
            }
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
