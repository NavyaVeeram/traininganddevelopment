"use client";
import { FaSearch,FaPrint } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useMemo, useState, useEffect, useRef } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
const EmployeeHistoryList = () => {
  const [EmployeeId, setEmployeeId] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [uploading, setUploading] = useState(false);

  // New state to store file extensions for uploaded files keyed by `${Program_Id}_${EmployeeId}_${year}`
  const [fileExtensions, setFileExtensions] = useState({});




  useEffect(() => {
    // Removed setting EmployeeId from localStorage to avoid default display in Select dropdown

    const fetchAccessRole = async () => {
      try {
        const res = await fetch(
          `/api/get_access_role?employeeId=${localStorage.getItem(
            "employeeId"
          )}`
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const sortedData = useMemo(() => {
    let sortableItems = [...qualifiedTrainers];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [qualifiedTrainers, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  const handleClear = () => {
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
      IsActive: "",
    });
  };
  useEffect(() => {
    if (EmployeeId) {
      fetchQualifiedTrainers(EmployeeId);
      setRowsPerPage(10);
      setCurrentPage(1);
    }
  }, [EmployeeId]);

  const filteredData = sortedData.filter(
    (trainer) =>
      tableSearchTerm === "" ||
      trainer.EmployeeId?.toLowerCase().includes(
        tableSearchTerm.toLowerCase()
      ) ||
      trainer.Training_Name?.toLowerCase().includes(
        tableSearchTerm.toLowerCase()
      ) ||
      trainer.Program_Name?.toLowerCase().includes(
        tableSearchTerm.toLowerCase()
      ) ||
      trainer.Train_Mode?.toLowerCase().includes(
        tableSearchTerm.toLowerCase()
      ) ||
      trainer.No_Hrs?.toString().includes(tableSearchTerm) ||
      trainer.Training_Date?.toString().includes(tableSearchTerm)
  );

  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData =
    rowsPerPage === "All"
      ? filteredData
      : filteredData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  // useEffect(() => {
  //   const fetchEmployeeOptions = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const res = await fetch("/api/user_dropdown");
  //       const data = await res.json();
  //       if (res.status === 200) {
  //         setEmployeeOptions(data);
  //         fetchQualifiedTrainers();
  //       } else {
  //         setError(data.message || "Error fetching employee data");
  //       }
  //     } catch (err) {
  //       setError("Failed to fetch employee data");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchEmployeeOptions();
  // }, []);
const loadOptions = async (inputValue) => {
  try {
    // Send empty string to API if inputValue is empty
    const url = `/api/user_dropdown?search=${inputValue || ""}`;

    const res = await fetch(url);
    const data = await res.json();

    return data.map((emp) => ({
      value: emp.Value,
      label: emp.Text,
    }));
  } catch (err) {
    console.error("Error loading employees", err);
    return [];
  }
};
const handleDownloadPDF = async () => {
  if (!selectedEmployee) {
    alert("Please select an employee");
    return;
  }

  if (!selectedDate) {
    alert("Please select the month and year");
    return;
  }

  const parts = selectedEmployee.label.split("|").map((p) => p.trim());
  const empName = parts[1] || selectedEmployee.label;
  const employeeId = selectedEmployee.value;

  try {
    const [tableRes, detailsRes] = await Promise.all([
      fetch(`/api/get_employee_history_table?EmployeeId=${employeeId}`),
      fetch(`/api/get_emp_history?EmployeeId=${employeeId}`),
    ]);

    const employeeData = await tableRes.json();
    const employeeDetails = await detailsRes.json();

    if (!employeeData || employeeData.length === 0) {
      alert("No data found for this employee");
      return;
    }
    if (!employeeDetails || employeeDetails.length === 0) {
      alert("No data found for this employee");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    // Header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TRAINING AND DEVELOPMENT", 14, 15);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Employee Training History", 14, 19);

    doc.setFontSize(7);
    doc.text(
      `We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit to improve our GTI"`,
      14,
      23
    );

    // Employee details table
    autoTable(doc, {
      startY: 25,
      tableWidth: 180,
      margin: { left: 14, right: 14 },
      body: [
        ["Employee Name:", employeeDetails.Username, "DOJ:", employeeDetails.DOJ],
        ["Employee ID:", employeeDetails.EmployeeId, "Employee Category:", employeeDetails.Emp_Category],
        ["Designation:", employeeDetails.Designation, "Employee Type:", employeeDetails.Emp_Type],
        ["Section:", employeeDetails.Section, "Employee Status:", employeeDetails.IsActive === "Active" ? "Active" : "Left"],
        ["Department:", employeeDetails.Department, "Total Training Hours:", employeeDetails.No_Hrs],
      ],
      styles: { fontSize: 9, cellPadding: 3, lineWidth: 0.1, textColor: [0, 0, 0] },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 50 },
        2: { fontStyle: "bold", cellWidth: 40 },
        3: { cellWidth: 50 },
      },
    });

    // Main training history table
    const finalY = doc.lastAutoTable.finalY;
    const headers = [["S.No", "Category", "Program Name", "Mode", "Hours", "Conducted on"]];
    const dataRows = employeeData.map((item, index) => [
      index + 1,
      item.Training_Name || "",
      item.Program_Name || "",
      item.Train_Mode || "",
      item.No_Hrs || "",
      item.Training_Date || "",
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: headers,
      body: dataRows,
      theme: "grid",
      tableWidth: 180,
      margin: { left: 14, right: 14, top: 35, bottom: 30 },
      styles: {
        fontSize: 8,
        cellPadding: 1.8,
        valign: "middle",
        halign: "left",
        lineWidth: 0.1,
        lineColor: "#5f5e5e",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 }, // S.No
        1: { halign: "center",cellWidth: 30 },
        2: { cellWidth: 55 },
        3: {halign: "center", cellWidth: 25 },
        4: {halign: "center", cellWidth: 25 },
        5: {halign: "center", cellWidth: 30 },
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 0,
        fontStyle: "bold",
        halign: "center",
        lineWidth: 0.1,
        lineColor: "#5f5e5e",
      },
      didDrawPage: function (data) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const today = new Date();
        const formattedDate = today
          .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          .replace(/ /g, "-");

        // Footer text
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Greentech Industries (India) Pvt. Ltd @ HR ${formattedDate} By Syam Prasad`,
          pageWidth / 2,
          pageHeight - 5,
          { align: "center" }
        );
      },
    });

    // ✅ Add page numbers after all tables are drawn
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Page: ${String(i).padStart(2, "0")} of ${String(pageCount).padStart(2, "0")}`, pageWidth - 40, 20);
    }

    const filename = `Employee_${empName.replace(/\s+/g, "_")}_${selectedDate.toLocaleString(
      "default",
      { month: "short" }
    )}_${selectedDate.getFullYear()}.pdf`;

    doc.save(filename);
  } catch (err) {
    console.error("Error generating PDF:", err);
    alert("Error generating PDF. Please try again.");
  }
};


  const handleClearTableSearch = async () => {
    setTableSearchTerm("");
    await fetchQualifiedTrainers(EmployeeId);
  };

  const fetchQualifiedTrainers = async (empId) => {
    if (!empId) return;
    setLoading(true);
    setError(null);

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
          if (data.length === 0) {
            setError("No data found for the selected employee.");
          }
        } else if (Object.keys(data).length === 0) {
          setQualifiedTrainers([]);
          setError("No data found for the selected employee.");
        } else {
          console.error("Unexpected response:", data);
          setQualifiedTrainers([]);
          setError(data.message || "Error fetching qualified trainers data");
        }
      } else if (res.status === 404) {
        setQualifiedTrainers([]);
        setError(null);
      } else {
        console.error("Unexpected response:", data);
        setQualifiedTrainers([]);
        setError(data.message || "Error fetching qualified trainers data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch qualified trainers data");
    } finally {
      setLoading(false);
    }
  };

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
        IsActive: "",
      });
      setQualifiedTrainers([]);
      return;
    }
    const selectedEmployeeId = selectedOption.value;
    setEmployeeId(selectedEmployeeId);
    setSelectedEmployee(selectedOption);  // Add this line
    setTrainingDetails({
      Username: "",
      Department: "",
      Section: "",
      Designation: "",
      Emp_Type: "",
      Emp_Category: "",
      No_Hrs: "",
      DOJ: "",
      IsActive: "",
    });

    if (selectedEmployeeId) {
      setLoading(true);
      setError(null);
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
          setError(null);
        } else if (res.status === 404) {
          setTrainingDetails({
            Username: "",
            Department: "",
            Section: "",
            Designation: "",
            Emp_Type: "",
            Emp_Category: "",
            No_Hrs: "",
            DOJ: "",
            IsActive: "",
          });
          setError(null);
        } else {
          setError(data.message || "Error fetching employee details");
        }
      } catch (err) {
        setError("Failed to fetch employee data");
      } finally {
        setLoading(false);
      }
    }
  };
  const options = employeeOptions.map((option) => ({
    value: option.Value,
    label: option.Text,
  }));
  const columns = [
    {
      name: "Employee ID",
      selector: (row) => row.EmployeeId,
      sortable: true,
      width: "10%",
    },
    {
      name: "Category",
      selector: (row) => row.Training_Name,
      sortable: true,
    },
    {
      name: "Program Name",
      selector: (row) => row.Program_Name,
      sortable: true,
    },
    {
      name: "Training Mode",
      selector: (row) => row.Train_Mode,
      sortable: true,
    },
    {
      name: "Hours",
      selector: (row) => row.No_Hrs,
      sortable: true,
      width: "8%",
    },
    {
      name: "Training Date",
      selector: (row) =>
        row.Training_Date
          ? new Date(row.Training_Date).toLocaleDateString()
          : "",
      sortable: true,
    },
  ];
// ... above your return (
const handleTableSearchChange = (e) => {
  setTableSearchTerm(e.target.value);
};

  const paginationComponentOptions = {
    rowsPerPageText: "Rows per page:",
    rangeSeparatorText: "of ",
    selectAllRowsItem: true,
    selectAllRowsItemText: "All",
  };

  const handleFileUpload = async (event, item) => {
    const file = event.target.files[0];
    if (!file || !["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      alert("Please upload a valid PDF, JPG, or PNG file.");
      return;
    }
    const storedEmployeeId = localStorage.getItem("employeeId");
    const year = new Date(item.Training_Date).getFullYear();

    // Determine file extension based on MIME type
    let extension = "";
    switch (file.type) {
      case "application/pdf":
        extension = "pdf";
        break;
      case "image/jpeg":
        extension = "jpg";
        break;
      case "image/png":
        extension = "png";
        break;
      default:
        extension = "pdf"; // fallback
    }

    const filename = `${item.Program_Id}_${item.EmployeeId}_${year}.${extension}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", filename);
    formData.append("Program_Id", item.Program_Id);
    formData.append("Employee_Id", item.EmployeeId);
    formData.append("CreatedBy", storedEmployeeId);
    console.log("📤 Uploading with form data:", {
      file,
      filename,
      Program_Id: item.Program_Id,
      Employee_Id: item.EmployeeId,
      CreatedBy: storedEmployeeId,
    });

    const res = await fetch("/api/insert_upload_emp_certificate_status", {
      method: "POST",
      body: formData,
    });

    const contentType = res.headers.get("content-type");

    let result = {};
    if (contentType && contentType.includes("application/json")) {
      result = await res.json();
    }

    if (res.ok) {
      alert("File uploaded successfully!");
      // Update fileExtensions state with the new extension
      setFileExtensions((prev) => ({
        ...prev,
        [`${item.Program_Id}_${item.EmployeeId}_${year}`]: extension,
      }));
      await fetchQualifiedTrainers(item.EmployeeId);
    } else {
      console.error("Server error:", result);
      alert(result.message || "Upload failed");
    }
  };
  const handleViewFile = (item) => {
    const year = new Date(item.Training_Date).getFullYear();
    const key = `${item.Program_Id}_${item.EmployeeId}_${year}`;
    const extension = fileExtensions[key] || "pdf"; // default to pdf if not found
    const filename = `${item.Program_Id}_${item.EmployeeId}_${year}.${extension}`;
    const url = `api/filesemp/${filename}`;
    window.open(url, "_blank");
  };

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

  return (
    <div>
      <div className="max-w-full mx-auto bg-white p-2 rounded-lg w-full">
        <div className="bg-sky-400 flex text-white justify-between p-2 rounded-t-lg">
          <div className="text-lg font-semibold">Employee History</div>
          <div className="flex items-center space-x-2"></div>
        </div>
        <br />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* <div>
            <label
              htmlFor="employee"
              className="block text-sm font-medium text-gray-900"
            >
               EmployeeId
            </label>
            <div>
              <Select
                options={options}
                value={options.find((o) => o.value === EmployeeId) || null}
                onChange={handleEmployeeIdChange}
                placeholder="EmployeeId"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    cursor: "pointer",
                    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
                      : "none",
                    borderRadius: "0.5rem",
                    minHeight: "2rem",
                    display: "flex",
                    alignItems: "center",
                  }),
                  option: (base) => ({
                    ...base,
                    cursor: "pointer",
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
              />
            </div>
          </div> */}
              <div>
            <label
              htmlFor="employee"
              className="block text-sm font-medium text-gray-900"
            >
               EmployeeId
            </label>
<AsyncSelect
  cacheOptions
  loadOptions={loadOptions}
  defaultOptions={true}   // 👈 show default options when clicked
  onChange={handleEmployeeIdChange}
  placeholder="Search Employee..."
  styles={{
    control: (base) => ({
      ...base,
      cursor: "pointer",
      borderRadius: "0.5rem",
      minHeight: "2rem",
    }),
    option: (base) => ({ ...base, cursor: "pointer" }),
  }}
/>
</div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Username
            </label>
            <input
              type="text"
              value={trainingDetails?.Username ?? ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Department
            </label>
            <input
              type="text"
              value={trainingDetails?.Department ?? ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Section
            </label>
            <input
              type="text"
              value={trainingDetails?.Section ?? ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Designation
            </label>
            <input
              type="text"
              value={trainingDetails?.Designation ?? ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Emp Type
            </label>
            <input
              type="text"
              value={trainingDetails?.Emp_Type ?? ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Emp Category
            </label>
            <input
              type="text"
              value={trainingDetails?.Emp_Category ?? ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Total Hrs
            </label>
            <input
              type="number"
              //  step="any"
              value={trainingDetails?.No_Hrs ?? ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              DOJ
            </label>
            <input
              type="text"
              value={trainingDetails?.DOJ ?? ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Status
            </label>
            <input
              type="text"
              value={(() => {
                if (
                  // trainingDetails.IsActive === 1 ||
                  trainingDetails.IsActive === "Active"
                )
                  return "Active";
                if (
                  // trainingDetails.IsActive === 0 ||
                  trainingDetails.IsActive === "Left"
                )
                  return "Left";
                return "";
              })()}
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
                  <h2 className="text-sm font-bold">
                    Employee Training History
                  </h2>
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
<div className="flex ">
     {selectedEmployee && (
    <button
      onClick={handleDownloadPDF}
      className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors duration-200"
      aria-label="Download PDF Report"
      title="Download Training Report"
    >
      <FaPrint />
    </button>
  )}

         
                  <div className="relative ml-2">
                    <input
                      type="text"
                      className="border p-1 pt-[0.9] pl-8 rounded bg-secondary"
                      placeholder="Search..."
                      value={tableSearchTerm}
                      onChange={handleTableSearchChange}
                    />
                    <FaSearch className="absolute left-2 top-2 text-gray-400" />
                  </div>
                </div>
</div>
                <div className="overflow-x-auto">
                  <table
                    className="min-w-full border rounded-lg bg-card text-sm"
                    style={{ tableLayout: "fixed", fontSize: "13px" }}
                  >
                    <thead className="bg-muted sticky top-0 z-10">
                      <tr>
                        {[
                          {key : "S.no", label: "S.No"},
                       //   { key: "EmployeeId", label: "Employee ID" },
                          { key: "Training_Name", label: "Category" },
                          { key: "Program_Name", label: "Program Name" },
                          { key: "Train_Mode", label: "Training Mode" },
                          { key: "No_Hrs", label: "Hours" },
                          { key: "Training_Date", label: "Training Date" },
                          { key: "  ", label: "Upload" },
                          { key: "", label: "View" },
                        ].map(({ key, label }, index) => (
                          <th
                            key={key}
                            className={`px-4 py-2 border text-left cursor-pointer ${
                              index === 0 ? "left-0 bg-muted z-20" : ""
                            }`}
                            onClick={() => handleSort(key)}
                          >
                            {label}{" "}
                            {sortConfig.key === key
                              ? sortConfig.direction === "asc"
                                ? "▲"
                                : "▼"
                              : "↕"}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => (
                          <tr key={index} className="hover:bg-muted border">
                            {/* <td className="px-4 py-2 border left-0 bg-white z-10">
                              {item.EmployeeId}
                            </td> */}
                             <td className="px-4 py-2 border left-0 bg-white z-10">
                              { index + 1}
                            </td>
                            <td className="px-4 py-2 border">
                              {item.Training_Name}
                            </td>
                            <td className="px-4 py-2 border">
                              {item.Program_Name}
                            </td>
                            <td className="px-4 py-2 border">
                              {item.Train_Mode}
                            </td>
                            <td className="px-4 py-2 border">{item.No_Hrs}</td>
                            <td className="px-4 py-2 border">
                              {item.Training_Date}
                            </td>
                            <td className="px-4 py-2 border">
                            <div style={{ position: "relative" }}>
    <input
      type="file"
      id={`file-upload-${index}`}
      style={{ display: "none" }}
      accept="application/pdf,image/jpeg,image/png"
      onChange={(e) => handleFileUpload(e, item)}
    />
    <label
      htmlFor={`file-upload-${index}`}
      className={`custom-file-label ${
        uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {item.selectedFileName ? item.selectedFileName : "No file chosen"}
    </label>
  </div>
                            </td>
                            <td className="px-4 py-2 border">
                              <button
                                onClick={() => handleViewFile(item)}
                                className={`text-blue-600 hover:underline ${
                                  item.IsUpload
                                    ? ""
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                                disabled={!item.IsUpload}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            No results found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

             <div className="flex flex-wrap justify-between items-center mt-4 text-sm">
  {/* Showing entries */}
  <div>
    Showing{" "}
    {filteredData.length > 0 ? (
      rowsPerPage === "All" ? (
        `1 to ${filteredData.length} of ${filteredData.length} entries`
      ) : (
        `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
          currentPage * rowsPerPage,
          filteredData.length
        )} of ${filteredData.length} entries`
      )
    ) : (
      "0 entries"
    )}
  </div>

  {/* Pagination controls (only show if not All) */}
  {rowsPerPage !== "All" && (
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
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
  )}
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
