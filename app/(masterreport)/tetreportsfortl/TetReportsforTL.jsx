"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { FaCheckCircle } from "react-icons/fa";

const animatedComponents = makeAnimated();

const TetReportsforTL = () => {
  const searchParams = useSearchParams();
  const programId = searchParams.get("programId") || searchParams.get("id");

  const [programName, setProgramName] = useState("");
  const [options, setOptions] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [dropdownValue, setDropdownValue] = useState(null);
  const [tlDropdownOptions, setTlDropdownOptions] = useState([]);

  // Remove updatedEmployees state and localStorage usage as it's no longer needed for tick display

  // const [updatedEmployees, setUpdatedEmployees] = useState(() => {
  //   try {
  //     const stored = localStorage.getItem('updatedEmployees');
  //     return stored ? JSON.parse(stored) : [];
  //   } catch {
  //     return [];
  //   }
  // });

  // useEffect(() => {
  //   try {
  //     localStorage.setItem('updatedEmployees', JSON.stringify(updatedEmployees));
  //   } catch (error) {
  //     console.error('Error saving updatedEmployees to localStorage:', error);
  //   }
  // }, [updatedEmployees]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const storedEmployeeId = localStorage.getItem("employeeId");
        if (!storedEmployeeId) return;

        const res = await fetch(
          `/api/get_tet_form_user_dropdown_res_person_update_tl?programId=${programId}&EmployeeId=${storedEmployeeId}`
        );
        const data = await res.json();

        const formattedOptions = data.map((item) => ({
          value: item.Value,
          label: item.Text,
          flag: item.Flag, // include flag property
        }));

        setOptions(formattedOptions);
        setEmployeeData(data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    if (programId) {
      fetchDropdownData();
    }
  }, [programId]);

  useEffect(() => {
    const fetchProgramName = async () => {
      try {
        const res = await fetch(
          `/api/get_tet_form_program_name?id=${programId}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch program name");
        }
        const data = await res.json();
        if (data.length > 0) {
          setProgramName(data[0].Program_Name);
        }
      } catch (error) {
        console.error("Error fetching program name:", error);
      }
    };

    if (programId) {
      fetchProgramName();
    }
  }, [programId]);

  useEffect(() => {
    const fetchTlDropdown = async () => {
      try {
        const storedEmployeeId = localStorage.getItem("employeeId");
        if (!storedEmployeeId) {
          throw new Error("Missing employeeId in localStorage");
        }
        const res = await fetch(
          `/api/update_tl_dropdown?employeeId=${storedEmployeeId}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch TL dropdown data");
        }
        const data = await res.json();
        setTlDropdownOptions(data);
      } catch (error) {
        console.error("Error fetching TL dropdown:", error);
      }
    };

    if (showPopup) {
      fetchTlDropdown();
    }
  }, [showPopup]);

  const handleSelectAll = () => {
    setSelectedEmployees(options.map((option) => option.value));
  };

  const handleCheckboxChange = (value) => {
    if (selectedEmployees.includes(value)) {
      setSelectedEmployees(selectedEmployees.filter((item) => item !== value));
    } else {
      setSelectedEmployees([...selectedEmployees, value]);
    }
  };

  // Map tlDropdownOptions to { value, label } format for react-select
  const formattedTlDropdownOptions = tlDropdownOptions.map((option) => ({
    value: option.Value || option.value,
    label: option.Text || option.label,
  }));

  const [tableMaxHeight, setTableMaxHeight] = useState("400px");

  useEffect(() => {
    const updateTableMaxHeight = () => {
      const offset = 250; // Adjust this offset as needed based on layout
      const maxHeight = window.innerHeight - offset;
      setTableMaxHeight(maxHeight > 200 ? `${maxHeight}px` : "200px"); // minimum height 200px
    };

    updateTableMaxHeight();
    window.addEventListener("resize", updateTableMaxHeight);
    return () => window.removeEventListener("resize", updateTableMaxHeight);
  }, []);

  return (
    <div className="max-w-full mx-auto bg-white p-2 shadow-md rounded-lg w-full">
      <div className="bg-sky-400 text-white p-2 rounded-t-lg flex justify-between items-center">
        <h1 className="font-semibold cursor-pointer">
          Update TL
          {programName && (
            <>
              <span className="font-semibold text-[#f8e111]">
                {" "}
                {"(" + programName + ")"}
              </span>
            </>
          )}
        </h1>
      </div>
      <div
        style={{
          padding: "1.5rem",
          maxWidth: "800px",
          margin: "2rem auto",
          border: "1px solid #ccc",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        {/* Top header actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
            alignItems: "center",
          }}
        >
          {/* Select All container */}
          <div>
            <input
              type="checkbox"
              id="select-all"
              className="cursor-pointer"
              checked={
                selectedEmployees.length === options.length &&
                options.length > 0
              }
              onChange={() => {
                if (selectedEmployees.length === options.length) {
                  setSelectedEmployees([]);
                } else {
                  handleSelectAll();
                }
              }}
            />
            <label
              htmlFor="select-all"
              style={{
                cursor: "pointer",
                marginLeft: "0.5rem",
                fontWeight: "bold",
              }}
            >
              Select All
            </label>
          </div>

          {/* Update TL button aligned right */}
          <button
            onClick={() => setShowPopup(true)}
            className="px-6 mt-2 py-2 cursor-pointer text-sm font-semibold text-white bg-sky-400 rounded-md shadow-md hover:bg-sky-600 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
          >
            Update TL
          </button>
        </div>

        {/* Missing programId error */}
        {!programId && (
          <p style={{ color: "red", marginBottom: "1rem" }}>
            Error: programId is missing in URL parameters.
          </p>
        )}

        {/* Table container */}
        <div style={{ maxHeight: tableMaxHeight, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    borderBottom: "1px solid #ccc",
                    padding: "0.5rem",
                    textAlign: "left",
                  }}
                >
                  Select
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #ccc",
                    padding: "0.5rem",
                    textAlign: "left",
                  }}
                >
                  Employee
                </th>
              </tr>
            </thead>
            <tbody>
              {options.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ padding: "0.5rem" }}>
                    No employees found.
                  </td>
                </tr>
              )}
              {options.map((option) => (
                <tr key={option.value}>
                  <td
                    style={{
                      padding: "0.5rem",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`employee-${option.value}`}
                      checked={selectedEmployees.includes(option.value)}
                      onChange={() => handleCheckboxChange(option.value)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td
                    style={{
                      padding: "0.5rem",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <label
                      htmlFor={`employee-${option.value}`}
                      style={{ cursor: "pointer" }}
                      className="flex items-center"
                    >
                      {option.label}
                      {option.flag === 1 && (
                        <span
                          style={{
                            color: "green",
                            marginLeft: "0.5rem",
                            fontWeight: "bold",
                          }}
                        >
                          <FaCheckCircle className="text-green-500" />
                        </span>
                      )}
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Update TL popup modal */}
        {showPopup && (
          <div
            onClick={() => setShowPopup(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "8px",
                width: "fit-content",
                minWidth: "250px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              <p
                style={{
                  marginBottom: "1rem",
                  color: "black",
                  padding: "0.5rem 1rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                className="cursor-pointer"
              >
                Update TL
              </p>
              <Select
                components={animatedComponents}
                options={formattedTlDropdownOptions}
                value={dropdownValue}
                onChange={setDropdownValue}
                placeholder="Select an option"
                styles={{
                  control: (base) => ({
                    ...base,
                    padding: "0.25rem",
                    marginBottom: "1rem",
                    minWidth: "400px",
                    cursor: "pointer",
                  }),
                  option: (base) => ({
                    ...base,
                    cursor: "pointer",
                  }),
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.5rem",
                }}
              >
                <button
                  onClick={async () => {
                    if (!dropdownValue) {
                      alert("Please select a TL from the dropdown.");
                      return;
                    }
                    if (selectedEmployees.length === 0) {
                      alert("Please select at least one employee.");
                      return;
                    }
                    try {
                      const res = await fetch("/api/update_res_person", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          programId,
                          resPerson: dropdownValue.value,
                          employeeIds: selectedEmployees,
                        }),
                      });
                      if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(
                          errorData.error || "Failed to update Res_Person"
                        );
                      }
                      alert("Res_Person updated successfully.");
                      setShowPopup(false);
                      setDropdownValue(null);
                      setUpdatedEmployees((prev) => [
                        ...new Set([...prev, ...selectedEmployees]),
                      ]);
                    } catch (error) {
                      alert("Error updating Res_Person: " + error.message);
                    }
                  }}
                  className="px-6 cursor-pointer mt-2 py-2 text-sm font-semibold text-white bg-sky-400 rounded-md shadow-md hover:bg-sky-600 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setDropdownValue(null);
                  }}
                  className="px-6 mt-2 py-2 cursor-pointer text-sm font-semibold text-white bg-sky-400 rounded-md shadow-md hover:bg-sky-600 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TetReportsforTL;
