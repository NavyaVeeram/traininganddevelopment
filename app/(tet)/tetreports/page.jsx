"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPrint, FaSearch } from "react-icons/fa";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import React from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const TETFormsEmpDetails = () => {
  const searchParams = useSearchParams();
  const programId = searchParams.get("id"); // `id` represents the Program_Id

  const [programDetails, setProgramDetails] = useState(null);
  const [programName, setProgramName] = useState("");
  const [filteredData, setFilteredData] = useState([]); // filtered data for the table
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const animatedComponents = makeAnimated();

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [persons, setPersons] = useState(null);
  const [initialPersonsValue, setInitialPersonsValue] = useState(null);
  const [AddformData, setAddformData] = useState({
    EmployeeId: [],
  });


  async function generatePdfForEmployees(programId) {
    const templatePath = '/Training_Effect_Tracing_Form.pdf';
    const label = 'Training_Effectiveness_Filtered_Employees.pdf';
    const templateBytes = await fetch(templatePath).then(res => res.arrayBuffer());
    const mergedPdf = await PDFDocument.create();
    const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  
    // Fetch data from API for PDF generation
    const apiUrl = `/api/get_tet_form_emp_details_for_report?programId=${programId}`;
    let employees = [];
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        employees = await response.json();
      } else {
        alert("Failed to fetch employee data for PDF.");
        return;
      }
    } catch (error) {
      alert("Error fetching employee data for PDF.");
      return;
    }
  
    if (employees.length === 0) {
      alert("No employee data available for PDF.");
      return;
    }
  
    for (const emp of employees) {
      const templatePdf = await PDFDocument.load(templateBytes);
      const copiedPages = await mergedPdf.copyPages(templatePdf, templatePdf.getPageIndices());
  
      copiedPages.forEach((page, index) => {
        const height = page.getSize().height;
  
        if (index === 0) {
          // Customize on first page
          page.drawText(emp.EmployeeId || '', {
            x: 170,
            y: height - 55,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(emp.Username || '', {
            x: 170,
            y: height - 75,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(emp.Designation || '', {
            x: 170,
            y: height - 98,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(emp.Section || '', {
            x: 170,
            y: height - 118,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(emp.Department || '', {
            x: 170,
            y: height - 140,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(emp.Venue || '', {
            x: 170,
            y: height - 160,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(emp.Program_Name || '', {
            x: 385,
            y: height - 55,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(emp.Trainer || '', {
            x: 385,
            y: height - 75,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
  
          // Updated tickPath to scaled down version of provided SVG path for tick mark
          const tickPath = 'M18.277 3.03 6.99 14.32 0.92 8.25 0 9.18 6.99 16.16 19.2 3.95 z';
          const mode = emp.Train_Mode;
          if (mode === 'Internal') {
            page.drawSvgPath(tickPath, { x: 420, y: height - 77, font, color: rgb(0, 0, 0) });
          } else if (mode === 'External') {
            page.drawSvgPath(tickPath, { x: 458, y: height - 77, font, color: rgb(0, 0, 0) });
          } else if (mode === 'Overseas') {
            page.drawSvgPath(tickPath, { x: 518, y: height - 77, font, color: rgb(0, 0, 0) });
          }
  
          page.drawText(String(emp.No_Hrs) || '', {
            x: 385,
            y: height - 118,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
  
          const formattedTrainingDate = emp.Training_Date
            ? new Date(emp.Training_Date).toISOString().slice(0, 10)
            : '';
  
          const formattedEvaluationDate = emp.Evaluation_Date
            ? new Date(emp.Evaluation_Date).toISOString().slice(0, 10)
            : '';
  
          page.drawText(String(formattedTrainingDate) || '', {
            x: 385,
            y: height - 140,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(String(formattedEvaluationDate) || '', {
            x: 385,
            y: height - 160,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
        }
  
        mergedPdf.addPage(page);
      });
    }
  
    const finalPdfBytes = await mergedPdf.save();
    const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = label;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  useEffect(() => {
    if (programId) {
      setLoading(true);
      fetchProgramData();
    }
  }, [programId]);

  const fetchProgramData = async () => {
    try {
      const [empRes, nameRes] = await Promise.all([
        fetch(`/api/get_tet_form_emp_details?id=${programId}`),
        fetch(`/api/get_tet_form_program_name?id=${programId}`),
      ]);

      const empData = await empRes.json();
      const nameData = await nameRes.json();

      if (nameData && nameData[0]) {
        setProgramName(nameData[0].Program_Name);
        const personsValue = nameData[0].Persons;
        setPersons(personsValue);
        setInitialPersonsValue(personsValue);
      }

      if (!Array.isArray(empData) || empData.length === 0 || empData.every(emp => !emp.EmployeeId)) {
        setError("No training data available ...");
        setFilteredData([]);
      } else {
        setError(null);
        setProgramDetails(empData);
        setFilteredData(Array.isArray(empData) ? empData : [empData]);
      }
      
      setLoading(false);
    } catch (err) {
      setError("Error fetching program details");
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/get_tet_form_emp_details?id=${programId}`);
      const data = await res.json();
      setProgramDetails(data);
      setFilteredData(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error("Error fetching updated data:", error);
    }
  };

  // Reset pagination and filtered data if rows per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort filtered data based on the selected sort config
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate the sorted data
  const paginatedData =
    rowsPerPage === "All"
      ? sortedData
      : sortedData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value;
    setTableSearchTerm(searchQuery);

    if (!searchQuery) {
      setFilteredData(programDetails);
    } else {
      const filtered = programDetails.filter((employee) =>
        [
          "EmployeeId",
          "Username",
          "Department",
          "Section",
          "Designation",
          "DOJ",
          "IsActive",
        ].some((field) =>
          employee[field]
            ?.toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  };

  const handlestatusChange = (item) => async (e) => {
    const checked = e.target.checked;
    const newStatus = checked ? 1 : 0;

    console.log("Toggling status:", {
      EmployeeId: item.EmployeeId,
      from: item.Status,
      to: newStatus,
    });

    try {
      const response = await fetch("/api/update_emp_att_program_wise_status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Program_Id: programId,
          EmployeeId: item.EmployeeId,
          Status: newStatus,
          CreatedBy: "Admin",
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("API Error:", errorMessage);
        throw new Error(`API Error: ${errorMessage}`);
      }

      const result = await response.json();
      await fetch("/api/update_tet_form_persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      });
      alert(result.message || "Status updated successfully!");

      setFilteredData((prev) =>
        prev.map((emp) =>
          emp.EmployeeId === item.EmployeeId
            ? { ...emp, Status: newStatus }
            : emp
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Something went wrong updating status. Please try again.");
    }
  };

  const handleAddNewLocation = async () => {
    if (!AddformData.EmployeeId || AddformData.EmployeeId.length === 0) {
      alert("Please select at least one Employee ID!");
      return;
    }

    // const expectedPersons = programDetails?.Persons;
    // const selectedCount = AddformData.EmployeeId.length;
    // if (expectedPersons && selectedCount !== expectedPersons) {
    //   toast.error(
    //     `Please select exactly ${expectedPersons} employee(s). You selected ${selectedCount}.`
    //   );
    //   return;
    // }

    setSaveState("saving");

    try {
      const response = await fetch("/api/insert_emp_att_program_wise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Program_Id: programId,
          EmployeeIds: AddformData.EmployeeId,
          CreatedBy: "Admin",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add employee(s)");
      }
      await fetch("/api/update_tet_form_persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      });
      alert(result.message || "Employee(s) added successfully!");

      // ✅ Reset modal state and refresh table
      setAddformData({ EmployeeId: [] });
      setIsAddModalOpen(false);
      fetchData(); // <-- refresh employee table data
      setSaveState("success");

      setTimeout(() => {
        setSaveState("idle");
      }, 3000);
    } catch (error) {
      console.error("Add failed:", error.message);
      setSaveState("error");

      setTimeout(() => {
        setSaveState("idle");
      }, 3000);
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          `/api/get_tet_form_add_emp_dropdown?id=${programId}`
        );

        const data = await res.json();

        const formatted = data.map((item) => ({
          value: item.Value,
          label: String(item.Text),
        }));

        setEmployeeOptions(formatted);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };

    fetchEmployees();
  }, [programId]);

  return (
    <div className="max-w-full mx-auto bg-white p-4 shadow-md rounded-lg w-full">
      <div className="bg-sky-600 text-white p-2 rounded-t-lg flex justify-between items-center">
        <h1 className="font-semibold">
          TET Report Generation
          {programName && (
            <span className="font-semibold text-[#f8e111]">
              {" "}
              ({programName})
            </span>
          )}
        </h1>
        <div className="flex mt-2 lg:mt-0 w-full lg:w-auto justify-start">
          {/* <button
            className="cursor-pointer p-2 rounded-lg font-semibold 
                bg-gray-500 text-white hover:bg-gray-600 
                dark:bg-gray-600 dark:hover:bg-gray-400 transition-all duration-300"
            style={{ fontSize: "10px" }}
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add New EmpId
          </button> */}

           <button type="button"
      onClick={() => generatePdfForEmployees(programId)}
      className="flex items-center justify-end bg-gray-600 text-white px-4 py-2 rounded-sm hover:bg-gray-900 transition"
    >
      <FaPrint />
    </button>

        </div>
      </div>
      {/* Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
        onClick={() => {
          setIsAddModalOpen(false);
          setAddformData((prev) => ({
            ...prev,
            EmployeeId: [], // Clear the selected Employee IDs
          }));
        }}
        >
          <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg md:w-[60%] lg:w-[40%] h-[54vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
               <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl md:w-[60vw] lg:w-[40vw] max-h-[60vh] overflow-y-auto border border-gray-300">
            <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-t-lg">
              <h2 className="text-lg font-bold">Add New EmpId</h2>
            </div>
            <div className="p-6 overflow-y-auto h-[calc(53vh-100px)] relative z-50 ">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-1">
                {/* <div>
                  <label className="block font-medium mb-1">Persons:</label>
                  <input
                    type="number"
                    value={persons}
                    onChange={(e) => setPersons(e.target.value)}
                    className="border p-2 rounded-md w-full"
                  />
                </div> */}
                <div>
                  <label className="block font-medium mb-1">
                    Employee ID(s):
                  </label>
                  <div className="relative">
                    <Select
                      components={animatedComponents}
                      isMulti
                      options={employeeOptions}
                      value={employeeOptions.filter((opt) =>
                        (AddformData.EmployeeId || []).includes(opt.value)
                      )}
                      onChange={(selectedOptions) => {
                        const selectedValues = selectedOptions.map(
                          (opt) => opt.value
                        );
                        setAddformData((prev) => ({
                          ...prev,
                          EmployeeId: selectedValues,
                        }));
                      }}
                      getOptionLabel={(e) => e.label}
                      formatOptionLabel={(data, { context }) =>
                        context === "menu" ? data.label : data.value
                      }
                      placeholder="Select Employee ID(s)"
                      className="text-sm"
                      closeMenuOnSelect={false}
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "2.5rem",
                          borderColor: "#d1d5db",
                          boxShadow: "none",
                        }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: "#f3f4f6",
                        }),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* {persons &&
                AddformData.EmployeeId.length !== persons && (
                  <p className="text-red-500 text-sm mt-2">
                    You must select exactly {persons} employee
                    {persons > 1 ? "s" : ""}. Currently selected:{" "}
                    {AddformData.EmployeeId.length}.
                  </p>
                )} */}
            </div>

            <div className="flex justify-end p-2 bg-gray-200 dark:bg-gray-700 rounded-b-lg">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setAddformData((prev) => ({
                    ...prev,
                    EmployeeId: [], // Clear the selected Employee IDs
                  }));
                }}
                className=" cursor-pointer mr-2 px-4 py-2 rounded  bg-gray-500 text-white hover:bg-gray-600 
                dark:bg-gray-600 dark:hover:bg-gray-400 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewLocation}
                className={`cursor-pointer px-4 py-2 rounded flex items-center justify-center 
                  ${
                    saveState === "success"
                      ? "bg-green-500 text-white"
                      : saveState === "error"
                      ? "bg-red-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
              >
                {saveState === "saving" ? (
                  <div className="animate-spin w-5 h-5 border-4 border-white border-t-transparent rounded-full"></div>
                ) : saveState === "success" ? (
                  <span className="text-lg">✔</span>
                ) : saveState === "error" ? (
                  <span className="text-lg">❌</span>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
            </div>
        </div>
      )}
      {loading && <p>Loading...</p>}

      {error && (
        <div className="flex justify-center items-center h-64 text-center text-red-500 mt-4">
          <p>{error}</p>
        </div>
      )}
      {!loading && !error && (
        <div className="card-body p-0 pb-3">
          <div className="p-4 bg-card">
            <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <span>Show</span>
                <select
                  className="border p-1 rounded bg-secondary"
                  value={rowsPerPage}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRowsPerPage(val === "All" ? "All" : parseInt(val));
                    setCurrentPage(1);
                  }}
                >
                  {[10, 15, 25, 50, 100, "All"].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <span>entries</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={tableSearchTerm}
                  onChange={handleTableSearchChange}
                  placeholder="Search..."
                  autoComplete="off"
                  className="border p-1 pl-8 rounded bg-secondary"
                />
                <FaSearch className="absolute left-2 top-2 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table
                className="min-w-full border rounded-lg bg-card text-sm"
                style={{ tableLayout: "fixed", fontSize: "13px" }}
              >
                <thead className="bg-muted sticky top-0">
                  <tr>
                    {[
                      { key: "Status", label: "Attend" },
                      { key: "EmployeeId", label: "EmployeeId" },
                      { key: "Username", label: "Username" },
                      { key: "Department", label: "Department" },
                      { key: "Section", label: "Section" },
                      { key: "Designation", label: "Designation" },
                      { key: "DOJ", label: "DOJ" },
                      { key: "IsActive", label: "Status" },
                    ].map(({ key, label }, index) => (
                      <th
                        key={key}
                        className={`px-4 py-2 border text-left cursor-pointer ${
                          index === 0 ? "sticky left-0 bg-muted z-20" : ""
                        }`}
                        onClick={() => key !== "actions" && handleSort(key)}
                      >
                        {label}{" "}
                        {sortConfig.key === key
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : key !== "actions"
                          ? "↕"
                          : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-100 border">
                        {/* your row content */}
                        <td className="px-4 py-2 border text-center">
                          <label className="inline-flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.Status == 1}
                              onChange={handlestatusChange(item)}
                              className="form-checkbox h-4 w-4 text-green-500"
                            />
                            <span
                              className={`text-sm font-medium ${
                                item.Status ? "text-green-600" : "text-red-500"
                              }`}
                            >
                              {item.Status ? "Attend" : "Not Attend"}
                            </span>
                          </label>
                        </td>
                        <td className="px-4 py-2 border">{item.EmployeeId}</td>
                        <td className="px-4 py-2 border">{item.Username}</td>
                        <td className="px-4 py-2 border">{item.Department}</td>
                        <td className="px-4 py-2 border">{item.Section}</td>
                        <td className="px-4 py-2 border">{item.Designation}</td>
                        <td className="px-4 py-2 border">
                          {item.DOJ
                            ? new Date(item.DOJ).toLocaleDateString()
                            : ""}
                        </td>
                              <td className="px-4 py-2 border">
                          {item.IsActive ? "Active" : "Resign"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        No training data available for this program.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* {!loading && !error && filteredData.length === 0 && (
              <div className="flex justify-center items-center h-40 text-gray-500 text-center mt-4">
                <p>No training data available for this program.</p>
              </div>
            )} */}

            {
              <div className="flex flex-wrap justify-between items-center mt-4 text-sm">
                <div>
                  Showing{" "}
                  {filteredData.length > 0
                    ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                        currentPage * rowsPerPage,
                        filteredData.length
                      )} of ${filteredData.length} entries`
                    : "0 entries"}
                </div>

                <div className="flex space-x-1">
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    {"<<"}
                  </button>
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    {"<"}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 border rounded ${
                        currentPage === i + 1 ? "bg-primary text-white" : ""
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
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
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default TETFormsEmpDetails;