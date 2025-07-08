"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
export default function TrainingRecord() {
  const [message, setMessage] = useState("");
  const [department, setDepartment] = useState("");
  const [username, setUsername] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [trainingData, setTrainingData] = useState([]);
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isChecked, setIsChecked] = useState(false); // New state for checkbox
  const [formData, setFormData] = useState({
    Training_Name: "IATF",
    Program_Name: "",
    CreatedBy: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Reset checkbox when training mode changes
    if (name === "Training_Name") {
      setIsChecked(false);
    }
  };

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // Prepare data to send - include checkbox value only for HSE
      const dataToSend = {
        ...formData,
        Special_Position:
          formData.Training_Name === "HSE" ? (isChecked ? 1 : 0) : null,
      };

      const res = await fetch("/api/standard_program_add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        alert(data.message);
        setFormData((prev) => ({
          ...prev,
          Program_Name: "",
        }));
        setIsChecked(false); // Reset checkbox after successful submission
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId");

    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
      // Set CreatedBy in formData when employeeId is available
      setFormData((prev) => ({
        ...prev,
        CreatedBy: storedEmployeeId,
      }));
    }

    const fetchAccessRole = async () => {
      try {
        const res = await fetch(
          `/api/get_access_role?employeeId=${storedEmployeeId}`
        );
        const data = await res.json();

        if (res.ok && data.Access_Role) {
          // Restrict access for HR_Res and HR_HOD roles
          if (
            data.Access_Role === "Res_Person" ||
            data.Access_Role === "HOS" ||
            data.Access_Role === "HOD"
          ) {
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
        console.error("Error fetching access role:", error);
        setIsAuthorized(false);
      }
    };

    fetchAccessRole();
  }, []);

  // ✅ Authorized view
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
          <label
            htmlFor="Training_Name"
            className="block text-sm font-medium text-gray-900"
          >
            Mode of the Program
          </label>
          <Select
            inputId="Training_Name"
            name="Training_Name"
            value={[
              {
                value: "IATF",
                label: "International Automotive Task Force - (IATF)",
              },
              {
                value: "HSE",
                label: "Health, Safety, and Environment - (HSE)",
              },
            ].find((option) => option.value === formData.Training_Name)}
            onChange={(selectedOption) => {
              handleFormChange({
                target: {
                  name: "Training_Name",
                  value: selectedOption ? selectedOption.value : "",
                },
              });
            }}
            options={[
              {
                value: "IATF",
                label: "International Automotive Task Force - (IATF)",
              },
              {
                value: "HSE",
                label: "Health, Safety, and Environment - (HSE)",
              },
            ]}
            className="block w-full mt-1 cursor-pointer"
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => ({
                ...base,
                cursor: "pointer",
                backgroundColor: state.isFocused ? "white" : "white",
                color: "black",
                borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                boxShadow: state.isFocused
                  ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
                  : "none",
              }),
              singleValue: (base) => ({
                ...base,
                color: "black",
              }),
              placeholder: (base) => ({
                ...base,
                color: "#6b7280", // Tailwind gray-500
              }),
              option: (base, state) => ({
                ...base,
                cursor: "pointer",
                backgroundColor: state.isFocused ? "#e0e7ff" : "white", // Tailwind indigo-100
                color: "black",
              }),
            }}
            required
          />
        </div>

        {/* Program Name */}
        <div>
          <label
            htmlFor="Program_Name"
            className="block text-sm font-medium text-gray-900"
          >
            Name of the Program
          </label>
          <textarea
            id="Program_Name"
            name="Program_Name"
            value={formData.Program_Name}
            onChange={handleFormChange}
            required
            className="block w-full mt-1 py-3 pl-4 pr-8 border  rounded-sm text-gray-800"
            style={{ borderColor: "#d1d5db" }}
            placeholder="Enter Program Name"
          />
        </div>

        {/* Hidden CreatedBy field */}
        <input type="hidden" name="CreatedBy" value={formData.CreatedBy} />

        {/* Confirmation Checkbox - Only show for HSE */}
        {formData.Training_Name === "HSE" && (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="confirmation"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
            />
            <label
              htmlFor="confirmation"
              className="text-sm font-medium text-gray-900"
            >
              Special Position Training
            </label>
          </div>
        )}

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
            onClick={() => {
              setFormData({
                Training_Name: "IATF",
                Program_Name: "",
                CreatedBy: employeeId || "",
              });
              setIsChecked(false); // Reset checkbox when form is reset
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
