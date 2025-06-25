"use client";
import { FaSearch } from "react-icons/fa";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Select from "react-select";

const EmployeeHistoryList = () => {
  const [EmployeeId, setEmployeeId] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [trainingDetails, setTrainingDetails] = useState({
    Username: "",
    Department: "",
    Section: "",
    Designation: "",
    Emp_Type: "",
    Emp_Category: "",
    No_Hrs: "",
    DOJ: "",
    DOJFormatted: "",
    IsActive: "",
  });
  const [qualifiedTrainers, setQualifiedTrainers] = useState([]);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [certificates, setCertificates] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Fetch employee options and access role on mount
  useEffect(() => {
    const fetchEmployeeOptions = async () => {
      try {
        const res = await fetch("/api/user_dropdown");
        const data = await res.json();
        if (res.status === 200) {
          setEmployeeOptions(data);
        }
      } catch (err) {}
    };

    const fetchAccessRole = async () => {
      try {
        const storedEmployeeId = localStorage.getItem("employeeId");
        if (!storedEmployeeId) {
          setIsAuthorized(false);
          return;
        }
        const res = await fetch(`/api/get_access_role?employeeId=${storedEmployeeId}`);
        const data = await res.json();
        if (res.ok && data.Access_Role) {
          if (
            data.Access_Role === "Res_Person" ||
            data.Access_Role === "HOS" ||
            data.Access_Role === "HOD"
          ) {
            setIsAuthorized(false);
            return;
          }
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        setIsAuthorized(false);
      }
    };

    fetchEmployeeOptions();
    fetchAccessRole();
  }, []);

  // Fetch qualified trainers when EmployeeId changes
  useEffect(() => {
    if (EmployeeId) {
      fetchQualifiedTrainers(EmployeeId);
      setRowsPerPage(10);
      setCurrentPage(1);
    }
  }, [EmployeeId, fetchQualifiedTrainers]);

  // Sorting logic
  const sortedData = useMemo(() => {
    let sortableItems = [...qualifiedTrainers];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [qualifiedTrainers, sortConfig]);

  // Table search
  const filteredData = useMemo(() => {
    return sortedData.filter(
      (trainer) =>
        tableSearchTerm === "" ||
        (trainer.EmployeeId && trainer.EmployeeId.toString().toLowerCase().includes(tableSearchTerm.toLowerCase())) ||
        (trainer.Training_Name && trainer.Training_Name.toLowerCase().includes(tableSearchTerm.toLowerCase())) ||
        (trainer.Program_Name && trainer.Program_Name.toLowerCase().includes(tableSearchTerm.toLowerCase())) ||
        (trainer.Train_Mode && trainer.Train_Mode.toLowerCase().includes(tableSearchTerm.toLowerCase())) ||
        (trainer.No_Hrs && trainer.No_Hrs.toString().includes(tableSearchTerm)) ||
        (trainer.Training_Date && trainer.Training_Date.toString().includes(tableSearchTerm))
    );
  }, [sortedData, tableSearchTerm]);

  // Pagination
  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(
    () =>
      rowsPerPage === "All"
        ? filteredData
        : filteredData.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage
          ),
    [filteredData, currentPage, rowsPerPage]
  );

  // Prevent infinite loop: store last fetched programIds
  const lastFetchedProgramIds = useRef([]);

  // Fetch upload statuses for paginated data (optimized)
  const fetchUploadStatuses = useCallback(async () => {
    const programIds = paginatedData.map((item) => item.Program_Id);

    // Only fetch if programIds changed
    if (
      programIds.length === lastFetchedProgramIds.current.length &&
      programIds.every((id, i) => id === lastFetchedProgramIds.current[i])
    ) {
      return;
    }

    lastFetchedProgramIds.current = programIds;

    if (programIds.length === 0 || !EmployeeId) {
      setUploadStatus({});
      setCertificates({});
      return;
    }

    try {
      const statusPromises = programIds.map(async (programId) => {
        const response = await fetch(
          `/api/get_emp_certificate_status?ProgramId=${programId}&Employee_Id=${EmployeeId}`
        );
        const result = await response.json();

        let isUpload = 0;
        let fileUrl = null;
        if (Array.isArray(result.data) && result.data.length > 0) {
          isUpload = result.data[0].IsUpload === 1 || result.data[0].IsUpload === "1" ? 1 : 0;
          fileUrl = result.data[0].FileUrl || null;
        }
        return {
          programId,
          status: isUpload,
          fileUrl,
        };
      });

      const results = await Promise.all(statusPromises);

      const updatedStatuses = {};
      const updatedCertificates = {};

      results.forEach(({ programId, status, fileUrl }) => {
        updatedStatuses[programId] = status;
        if (fileUrl) updatedCertificates[programId] = fileUrl;
      });

      setUploadStatus((prev) => {
        const isSame =
          Object.keys(prev).length === Object.keys(updatedStatuses).length &&
          Object.keys(prev).every((k) => prev[k] === updatedStatuses[k]);
        return isSame ? prev : updatedStatuses;
      });

      setCertificates((prev) => {
        const isSame =
          Object.keys(prev).length === Object.keys(updatedCertificates).length &&
          Object.keys(prev).every((k) => prev[k] === updatedCertificates[k]);
        return isSame ? prev : updatedCertificates;
      });
    } catch (error) {
      console.error("Failed to fetch certificate upload statuses:", error);
    }
  }, [paginatedData, EmployeeId]);

  useEffect(() => {
    fetchUploadStatuses();
  }, [fetchUploadStatuses]);

  // Fetch qualified trainers
  const fetchQualifiedTrainers = useCallback(async (empId) => {
    if (!empId) return;
    try {
      const url = `/api/get_employee_history_table?EmployeeId=${empId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.status === 200) {
        if (Array.isArray(data)) {
          const formatDateYYYYMMDD = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };
          const formattedData = data.map((item) => ({
            ...item,
            Training_DateFormatted: item.Training_Date
              ? formatDateYYYYMMDD(item.Training_Date)
              : "",
          }));
          setQualifiedTrainers(formattedData);
        } else {
          setQualifiedTrainers([]);
        }
      } else {
        setQualifiedTrainers([]);
      }
    } catch (err) {
      setQualifiedTrainers([]);
    }
  }, []);

  // Handle employee select
  const handleEmployeeIdChange = async (selectedOption) => {
    if (!selectedOption) {
      setEmployeeId(null);
      setTrainingDetails({
        Username: "",
        Department: "",
        Section: "",
        Designation: "",
        Emp_Type: "",
        Emp_Category: "",
        No_Hrs: "",
        DOJ: "",
        DOJFormatted: "",
        IsActive: "",
      });
      setQualifiedTrainers([]);
      return;
    }
    const selectedEmployeeId = selectedOption.value;
    setEmployeeId(selectedEmployeeId);
    setTrainingDetails({
      Username: "",
      Department: "",
      Section: "",
      Designation: "",
      Emp_Type: "",
      Emp_Category: "",
      No_Hrs: "",
      DOJ: "",
      DOJFormatted: "",
      IsActive: "",
    });

    if (selectedEmployeeId) {
      try {
        const res = await fetch(
          `/api/get_emp_history?EmployeeId=${selectedEmployeeId}`
        );
        const data = await res.json();

        if (res.status === 200) {
          const formatDateYYYYMMDD = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };
          const formattedDOJ = data.DOJ ? formatDateYYYYMMDD(data.DOJ) : "";
          setTrainingDetails({
            Username: data.Username || "",
            Department: data.Department || "",
            Section: data.Section || "",
            Designation: data.Designation || "",
            Emp_Type: data.Emp_Type || "",
            Emp_Category: data.Emp_Category || "",
            No_Hrs: data.No_Hrs,
            DOJ: data.DOJ || "",
            DOJFormatted: formattedDOJ,
            IsActive: data.IsActive || "",
          });
        } else {
          setTrainingDetails({
            Username: "",
            Department: "",
            Section: "",
            Designation: "",
            Emp_Type: "",
            Emp_Category: "",
            No_Hrs: "",
            DOJ: "",
            DOJFormatted: "",
            IsActive: "",
          });
        }
      } catch (err) {
        setTrainingDetails({
          Username: "",
          Department: "",
          Section: "",
          Designation: "",
          Emp_Type: "",
          Emp_Category: "",
          No_Hrs: "",
          DOJ: "",
          DOJFormatted: "",
          IsActive: "",
        });
      }
    }
  };

  // Handles file upload for certificate
  const handleFileChange = (e, programId) => {
    const file = e.target.files?.[0];
    const year = new Date().getFullYear();

    if (file && EmployeeId && programId) {
      handleFileUpload(file, programId, EmployeeId, year);
    } else {
      alert("Missing file, EmployeeId, or ProgramId");
    }
    if (e.target) e.target.value = "";
  };

  const handleFileUpload = async (file, programId, employeeId, year) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("program_id", programId);
    formData.append("EmployeeId", employeeId);
    formData.append("Year", year);

    try {
      const response = await fetch("/api/emp_certificates", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "File uploaded successfully.");
        await updateUploadStatus(programId, 1);
        setTimeout(() => {
          fetchUploadStatuses();
        }, 500);
      } else if (response.status === 409) {
        alert("File already exists");
      } else {
        alert("Upload failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      alert("Error uploading file: " + error.message);
    }
  };

  const updateUploadStatus = async (programId, isUpload) => {
    const storedEmployeeId = localStorage.getItem("employeeId");
    if (!storedEmployeeId) return;

    try {
      await fetch("/api/insert_emp_certificates_status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Program_Id: programId,
          Employee_Id: EmployeeId,
          IsUpload: isUpload,
          CreatedBy: storedEmployeeId,
        }),
      });
    } catch (error) {
      console.error("Failed to update upload status:", error);
    }
  };

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Table columns
  const columns = [
    { key: "EmployeeId", label: "Employee ID" },
    { key: "Training_Name", label: "Training Name" },
    { key: "Program_Name", label: "Program Name" },
    { key: "Train_Mode", label: "Training Mode" },
    { key: "No_Hrs", label: "Hours" },
    { key: "Training_Date", label: "Training Date" },
    { key: "Certificates", label: "Certificates" },
  ];

  if (isAuthorized === null) {
    return <div>Loading..</div>;
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

  const options = employeeOptions.map((option) => ({
    value: option.Value,
    label: option.Text,
  }));

  return (
    <div>
      <div className="max-w-full mx-auto bg-white p-2 rounded-lg w-full">
        <div className="bg-sky-400 flex text-white justify-between p-2 rounded-t-lg">
          <div className="text-lg font-semibold">Employee History</div>
        </div>
        <br />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-900">
              Select EmployeeId:
            </label>
            <div>
              <Select
                options={options}
                value={options.find((o) => o.value === EmployeeId) || null}
                onChange={handleEmployeeIdChange}
                placeholder="Select EmployeeId"
                styles={{
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
                }}
                menuPortalTarget={typeof window !== "undefined" ? document.body : null}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Username</label>
            <input
              type="text"
              value={trainingDetails.Username || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Department</label>
            <input
              type="text"
              value={trainingDetails.Department || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Section</label>
            <input
              type="text"
              value={trainingDetails.Section || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-900">Designation</label>
            <input
              type="text"
              value={trainingDetails.Designation || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Emp Type</label>
            <input
              type="text"
              value={trainingDetails.Emp_Type || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Emp Category</label>
            <input
              type="text"
              value={trainingDetails.Emp_Category || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Total Hrs</label>
            <input
              type="text"
              value={trainingDetails.No_Hrs}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">DOJ</label>
            <input
              type="text"
              value={trainingDetails.DOJFormatted || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Status</label>
            <input
              type="text"
              value={
                trainingDetails.IsActive === 1 || trainingDetails.IsActive === "1"
                  ? "Active"
                  : trainingDetails.IsActive === 0 || trainingDetails.IsActive === "0"
                  ? "Inactive"
                  : ""
              }
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
        </div>
        <br />
        {EmployeeId && (
          <div className="card rounded-lg  mt-6">
            <div className="card-header  text-black rounded-t-lg py-3 px-3">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                <div className="flex flex-col">
                  <h2 className="text-sm font-bold">Employee Training History</h2>
                </div>
              </div>
            </div>
            <div className="card-body p-0 overflow-x-auto pb-3">
              <div className="p-4 bg-card">
                <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <span>Show</span>
                    <select
                      className="border p-1 rounded bg-secondary"
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(
                          e.target.value === "All"
                            ? "All"
                            : parseInt(e.target.value)
                        );
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
                    <span>entries</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      className="border p-1 pt-[0.9] pl-8 rounded bg-secondary"
                      placeholder="Search..."
                      value={tableSearchTerm}
                      onChange={(e) => setTableSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-2 top-2 text-gray-400" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table
                    className="min-w-full border rounded-lg bg-card text-sm"
                    style={{ tableLayout: "fixed", fontSize: "13px" }}
                  >
                    <thead className="bg-muted sticky top-0 z-10">
                      <tr>
                        {columns.map(({ key, label }, index) => (
                          <th
                            key={key}
                            className={`px-4 py-2 border text-left cursor-pointer ${
                              index === 0 ? "left-0 bg-muted z-20" : ""
                            }`}
                            onClick={() => key !== "Certificates" && handleSort(key)}
                          >
                            {label}{" "}
                            {sortConfig.key === key && key !== "Certificates"
                              ? sortConfig.direction === "asc"
                                ? "▲"
                                : "▼"
                              : key !== "Certificates"
                              ? "↕"
                              : ""}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => (
                          <tr key={item.Program_Id || index} className="hover:bg-muted border">
                            <td className="px-4 py-2 border">{item.EmployeeId}</td>
                            <td className="px-4 py-2 border">{item.Training_Name}</td>
                            <td className="px-4 py-2 border">{item.Program_Name}</td>
                            <td className="px-4 py-2 border">{item.Train_Mode}</td>
                            <td className="px-4 py-2 border">{item.No_Hrs}</td>
                            <td className="px-4 py-2 border">
                              {item.Training_Date
                                ? new Date(item.Training_Date).toLocaleDateString()
                                : ""}
                            </td>
                            <td className="px-4 py-2 border text-center">
                              {uploadStatus[item.Program_Id] === 1 ? (
                                certificates[item.Program_Id] ? (
                                  <button
                                    className="text-blue-600 underline text-sm hover:text-blue-800"
                                    onClick={() => window.open(certificates[item.Program_Id], "_blank")}
                                  >
                                    View
                                  </button>
                                ) : (
                                  <span className="text-green-600 text-sm">Uploaded</span>
                                )
                              ) : (
                                <>
                                  <label
                                    htmlFor={`uploadCertificate-${item.Program_Id}`}
                                    className="cursor-pointer px-3 py-1 rounded text-gray-500 hover:text-neutral-700 text-sm"
                                  >
                                    Upload
                                  </label>
                                  <input
                                    type="file"
                                    id={`uploadCertificate-${item.Program_Id}`}
                                    accept="application/pdf,image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, item.Program_Id)}
                                  />
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={columns.length} className="text-center py-4">
                            No results found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap justify-between items-center mt-4 text-sm">
                  <div>
                    Showing{" "}
                    {filteredData.length > 0
                      ? `${(currentPage - 1) * (rowsPerPage === "All" ? filteredData.length : rowsPerPage) + 1} to ${Math.min(
                          currentPage * (rowsPerPage === "All" ? filteredData.length : rowsPerPage),
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
                          currentPage === i + 1 ? "bg-black text-white" : ""
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeHistoryList;
