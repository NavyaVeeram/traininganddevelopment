"use client";
import React, { useState, useEffect } from "react";


export default function TrainingRecord() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    Training_Name: '',
    Program_Name: '',
    CreatedBy: '',
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
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
        alert('Data submitted successfully!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('An error occurred while submitting the form');
      console.error(error);
    }
  };

  const handleTrainingNameChange = async (event) => {
    const trainingName = event.target.value;
    setFormData((prevState) => ({
      ...prevState,
      Training_Name: trainingName,
      Program_Name: '', // Reset Program_Name when Training_Name changes
    }));

    if (trainingName) {
      try {
        const response = await fetch(`/api/get_programs?Training_Name=${trainingName}`);
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

  return (
    
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r bg-gray-50 text-white" style={{margin:0,padding:0}}>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg space-y-8 transform transition-all duration-300 ease-in-out hover:scale-100">
        <h2 className="bg-sky-400 text-white p-4 rounded-t-lg">
          Program Request Form
        </h2>
        <div className="flex flex-col">
          {/* Training Mode */}
          <div className="space-y-1 mb-2">
            <label htmlFor="Training_Name" className="block text-sm font-medium text-gray-900">
              Mode of the Program
            </label>
            <div className="relative">
              <select
                id="Training_Name"
                name="Training_Name"
                value={formData.Training_Name}
                onChange={handleTrainingNameChange}
                autoComplete="off"
                className="block w-full py-3 pl-4 pr-8 border-2 border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="IATF">International Automotive Task Force - (IATF)</option>
                <option value="HSE">Health, Safety, and Environment - (HSE)</option>
              </select>
            </div>
          </div>

          {/* Program Name */}
          <div className="space-y-1">
            <label htmlFor="Program_Name" className="block text-sm font-medium text-gray-900">
              Name of the Program
            </label>
            <textarea 
            type="text"
              id="Program_Name"
              name="Program_Name"
              value={formData.Program_Name}
              onChange={handleFormChange}
              className=" block w-full py-3 pl-4 pr-8 border-2 border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter Program Name"
              autoComplete="off"
              required
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-x-6">
          <button
            type="submit"
            className="px-6 py-2 text-lg font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-g-600 focus:ring-offset-2 transform transition duration-200 hover:scale-105"
          >
            Save
          </button>
          <button
            type="button"
            className="px-6 py-2 text-lg font-semibold text-gray-800 bg-gray-200 rounded-md shadow-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transform transition duration-200 hover:scale-105"
            onClick={() => setFormData({ Training_Name: '', Program_Name: '', CreatedBy: '' })}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
