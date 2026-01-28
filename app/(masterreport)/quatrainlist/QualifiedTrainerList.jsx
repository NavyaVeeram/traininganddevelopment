"use client";
import { FaEdit, FaSearch, FaSortUp,FaTrash, FaEye  } from "react-icons/fa";
import { useState, useEffect, useRef, useMemo } from "react";
import Select from "react-select";
import DeleteTrainerButton from "../quatrainlist/DeleteTrainerButton";
import TrainerApprovalForm from "../approvalformfortrainers/page";
import BackButton from "@/components/BackButton";
const QualifiedTrainerList = () => {
  // 1. ADD NEW STATE VARIABLE (add this near your other useState declarations)
const [existingCertificates, setExistingCertificates] = useState([]);

  const [data, setData] = useState([]);
  const [EmployeeId, setEmployeeId] = useState(null);
  const fileInputRef = useRef(null);
  // Add useEffect to set EmployeeId from localStorage on mount
  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId");
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    }
  }, []);
const [uploadedFiles, setUploadedFiles] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [trainingDetails, setTrainingDetails] = useState({
    Username: "",
    Department: "",
    Section: "",
    Designation: "",
    Gender: "",
    DOJ: "",
Training_Name: "",
            Certified:"",
            Cert_Des: "",            
            View_Cert:  "",
            Exp_5_Yr: "",
            Exp_3_Yr: "",
            HOD_Rec:  "",
            Qualified: "",

  });

  // Computed variables to check DOJ experience for enabling/disabling checkboxes
  const dojDate = trainingDetails.DOJ ? new Date(trainingDetails.DOJ) : null;
  const today = new Date();
const threeYearsAgo = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());

const isExperienceLessThan3Years = dojDate ? dojDate > threeYearsAgo : false;
// Adjust logic: if DOJ is greater than 3 years ago, enable Experience (5 Years)
const isExperienceAtLeast3Years = dojDate ? dojDate <= threeYearsAgo : false;

const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
const isExperienceAtLeast5Years = dojDate ? dojDate <= fiveYearsAgo : false;
  const [qualifiedTrainers, setQualifiedTrainers] = useState([]);
    const [trainerData, setTrainerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
const [trainingName, setTrainingName] = useState([]);
  const [certified, setCertified] = useState(false);
  const [certifiedInput, setCertifiedInput] = useState("");
  const [showCertifiedInput, setShowCertifiedInput] = useState(false);
  const [exp5Yr, setExp5Yr] = useState(false);
  const [exp3Yr, setExp3Yr] = useState(false);
  const [hodRec, setHodRec] = useState(false);
  const [qualified, setQualified] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const options = employeeOptions.map((option) => ({
    value: option.Value,
    label: option.Text,
  }));

  console.log("DEBUG EmployeeId:", EmployeeId);
  console.log("DEBUG isExperienceAtLeast3Years:", isExperienceAtLeast3Years);

    // Fetch employee options
    useEffect(() => {
      const fetchEmployeeOptions = async () => {
        setLoading(true);
        setError(null);
        try {
          // Get department code from localStorage or other source
          const storedEmployeeId = localStorage.getItem("employeeId") || "";

          const res = await fetch(`/api/user_qualified_dropdown_testing?employeeId=${encodeURIComponent(storedEmployeeId)}`);
          const data = await res.json();
          if (res.status === 200) {
            setEmployeeOptions(data);
          } else {
            setError(data.message || "Error fetching employee data");
          }
        } catch (err) {
          setError("Failed to fetch employee data");
        } finally {
          setLoading(false);
        }
      };

      fetchEmployeeOptions();
    }, []);

  // Fetch qualified trainers list
  const fetchQualifiedTrainers = async () => {
    setLoading(true);
    setError(null);
    try {
      const storedEmployeeId = localStorage.getItem("employeeId");
      const url = storedEmployeeId
        ? `/api/view_qualifier_list?employeeId=${encodeURIComponent(storedEmployeeId)}`
        : "/api/view_qualifier_list";
      const res = await fetch(url);
      const data = await res.json();
      console.log("DEBUG qualifiedTrainers data:", data);
      if (res.status === 200) {
        setQualifiedTrainers(data);
        setData(data);
        setFilteredData(data);
        setTrainerData(data);
      } else {
        setError(data.message || "Error fetching qualified trainers data");
        setTrainerData([]);
      }
    } catch (err) {
      setError("Failed to fetch qualified trainers data");
      setTrainerData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualifiedTrainers(); // Call the function when the component mounts
  }, []); // Empty dependency array means this will run once when the component mounts

  const resetForm = () => {
    setTrainingDetails({
      Username: "",
      Department: "",
      Section: "",
      Designation: "",
      Gender: "",
      DOJ: "",
    });
    setEmployeeId(null);
    setTrainingName([]);
    setCertified(false);
    setCertifiedInput("");  // ✅ ADD THIS
  setShowCertifiedInput(false);  // ✅ ADD THIS
    setExp5Yr(false);
    setExp3Yr(false);
    setHodRec(false);
    setQualified(false);
     setExistingCertificates([]);
  };

  // Handle selection of employee ID from the dropdown
const handleEmployeeIdChange = async (selectedOption) => {
    const selectedEmployeeId = selectedOption ? selectedOption.value : null;
    setEmployeeId(selectedEmployeeId);
    
    // Reset states when clearing selection
    if (!selectedEmployeeId) {
      setTrainingDetails({
        Username: "",
        Department: "",
        Section: "",
        Designation: "",
        Gender: "",
        DOJ: "",
        Training_Name: "",
        Certified: "",
        Cert_Des: "",            
        View_Cert: "",
        Exp_5_Yr: "",
        Exp_3_Yr: "",
        HOD_Rec: "",
        Qualified: "",
      });
      setTrainingName([]);
       setCertifiedInput("");  // Add this
  setExistingCertificates([]);  // Add this
      return;
    }

    // Fetch data when an employee is selected
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/get_user_details?EmployeeId=${selectedEmployeeId}`
      );
      const fetchedData = await res.json();

      if (res.status === 200) {
    setTrainingDetails({
  Username: fetchedData.Username || "",
  Department: fetchedData.Department || "",
  Section: fetchedData.Section || "",
  Designation: fetchedData.Designation || "",
  Gender: fetchedData.Gender || "",
  DOJ: fetchedData.DOJ || "",
  Training_Name: fetchedData.Training_Name || "",
  Certified: fetchedData.Certified || "",
  Cert_Des: fetchedData.Cert_Des || "",
  View_Cert: fetchedData.View_Cert || "",
  Exp_5_Yr: fetchedData.Exp_5_Yr || "",
  Exp_3_Yr: fetchedData.Exp_3_Yr || "",
  HOD_Rec: fetchedData.HOD_Rec || "",
  Qualified: fetchedData.Qualified || "",
});
        // ✅ Parse Training_Name (independent)
if (fetchedData.Training_Name && fetchedData.Training_Name.trim() !== "") {
  setTrainingName(
    fetchedData.Training_Name.split(",").map(t => t.trim())
  );
} else {
  setTrainingName([]);
}

// ✅ Parse View_Cert (independent — THIS FIXES YOUR ISSUE)
if (fetchedData.View_Cert && fetchedData.View_Cert.trim() !== "") {
  setExistingCertificates(
    fetchedData.View_Cert
      .split(",")
      .map(cert => cert.trim())
      .filter(Boolean)
  );
} else {
  setExistingCertificates([]);
}

// Always reset new uploads
setUploadedFiles([]);

      } else {
        setError(fetchedData.message || "Error fetching user details");
      }
        // ✅ ADD THIS: Set checkbox states based on fetched data
  // ✅ ADD THIS: Set checkbox states based on fetched data
// If Cert_Des has data, consider Certified as true regardless of the boolean value
const hasCertification = fetchedData.Certified || (fetchedData.Cert_Des && fetchedData.Cert_Des.trim() !== "");
setCertified(hasCertification);
  setExp5Yr(fetchedData.Exp_5_Yr ? true : false);
  setExp3Yr(fetchedData.Exp_3_Yr ? true : false);
  setHodRec(fetchedData.HOD_Rec ? true : false);
  
  // ✅ If Certified is true, show the input and set the description
 if (hasCertification) {
    setShowCertifiedInput(true);
    setCertifiedInput(fetchedData.Cert_Des || "");
  } else {
    setShowCertifiedInput(false);
    setCertifiedInput("");
  }
 // 4. ADD NEW FUNCTION to handle removing existing certificates


  // ✅ Set qualified state if any checkbox is true
  const isAnyChecked = fetchedData.Certified || fetchedData.Exp_5_Yr || 
                       fetchedData.Exp_3_Yr || fetchedData.HOD_Rec;
  setQualified(isAnyChecked);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
};

  const handleCheckboxChange = (setter, currentState, checkboxName) => {
    setter((prev) => {
      const newValue = !prev;
      const updatedState = {
        certified,
        exp3Yr,
        exp5Yr,
        hodRec,
        [checkboxName]: newValue,
      };

      const isAnyChecked = Object.values(updatedState).some((value) => value);

      setQualified(isAnyChecked);

      if (checkboxName === "certified") {
        setShowCertifiedInput(newValue);
        if (!newValue) {
          setCertifiedInput("");
        }
      }

      return newValue;
    });
  };
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
  };
   const handleRemoveFile = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleRemoveExistingCert = (certName) => {
  setExistingCertificates((prev) => prev.filter((cert) => cert !== certName));
};
  
  // Submit form data
const handleSubmit = async (e) => {
  e.preventDefault();

  /* ==============================
     BASIC VALIDATIONS
  ============================== */
  if (trainingName.length === 0) {
    alert("Please select at least one Category (IATF or HSE)!");
    return;
  }

  if (!qualified) {
    alert("You must check the Qualified checkbox!");
    return;
  }

  const loggedInDepartment = localStorage.getItem("department") || "";
  if (loggedInDepartment !== trainingDetails.Department) {
    alert("You can only submit data for employees in your own department.");
    return;
  }

  const createdByFromStorage = localStorage.getItem("employeeId") || "";

  if (!createdByFromStorage) {
    alert("Invalid login session. Please re-login.");
    return;
  }

  /* ==============================
     BUILD FINAL FILE LIST
  ============================== */
 
const retainedFiles = [...existingCertificates]; // files user kept

// Add new file names to the final list
const newFileNames = uploadedFiles.map(file => file.name);
const finalFilenames = [...existingCertificates, ...newFileNames];

  setLoading(true);
  setError(null);

  try {
    /* ==============================
       STEP 1: SAVE QUALIFIED TRAINER
    ============================== */
    const dataToSubmit = {
      Training_Name: trainingName.join(","),
      EmployeeId: EmployeeId,
      Certified: certified ? 1 : 0,
      Cert_Des: certifiedInput,
      Exp_5_Yr: exp5Yr ? 1 : 0,
      Exp_3_Yr: exp3Yr ? 1 : 0,
      HOD_Rec: hodRec ? 1 : 0,
      Qualified: qualified ? 1 : 0,
      IsActive: 1,
      CreatedBy: createdByFromStorage,
      ExistingCertificates: retainedFiles.join(","), // informational
    };

    const res = await fetch("/api/insert_qualified_trainer_list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSubmit),
    });

    const responseData = await res.json();

    if (!res.ok) {
      throw new Error(responseData.message || "Failed to submit trainer data");
    }

   /* ==============================
   STEP 2: UPLOAD CERTIFICATES (ALWAYS)
============================== */
const formData = new FormData();

// Add new files to upload
uploadedFiles.forEach((file) => {
  formData.append("file", file);
});

formData.append("Employee_Id", EmployeeId);
formData.append("CreatedBy", createdByFromStorage);
formData.append("retainedFiles", JSON.stringify(existingCertificates));

const uploadRes = await fetch("/api/insert_upload_emp_certificates", {
  method: "POST",
  body: formData,
});

const uploadData = await uploadRes.json();

if (!uploadRes.ok) {
  throw new Error(uploadData.message || "Certificate sync failed");
}


    /* ==============================
       STEP 3: POST-SUBMIT ACTIONS
    ============================== */
    alert("Qualified trainer and certificates saved successfully.");

    fetchQualifiedTrainers();
    resetForm();

    setUploadedFiles([]);
    setExistingCertificates([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    /* ==============================
       STEP 4: EMAIL NOTIFICATION
    ============================== */
    try {
      await fetch("/api/generate_email_qualified_trainers_submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          localEmployeeId: createdByFromStorage,
          trainingEmployeeId: EmployeeId,
          username: trainingDetails.Username,
          approve: true,
        }),
      });
    } catch (emailErr) {
      console.warn("Email notification failed:", emailErr);
    }

    /* ==============================
       STEP 5: REFRESH APPROVAL DATA
    ============================== */
    try {
      await fetch(
        `/api/trainer_approval_form_data?employeeId=${createdByFromStorage}`
      );
    } catch (approvalErr) {
      console.warn("Approval refresh failed:", approvalErr);
    }

    window.location.reload();

  } catch (err) {
    console.error("Submission error:", err);
    alert(err.message || "An error occurred while submitting the form");
  } finally {
    setLoading(false);
  }
};




  const columnKeyMap = {
    EmployeeId: "EmployeeId",
    Username: "Username",
    DOJ: "DOJ",
    Designation: "Designation",
    Section: "Section",
    Department: "Department",
    Training_Name: "Training_Name",
    Certified: "Certified",
    Exp_5_Yr: "Exp(5yr)",
    Exp_3_Yr: "Exp(3yr)",
    HOD_Rec: "HOD_Rec",
    Qualified: "Qualified",
  };
  // const handleSort = (column) => {
  //   const key = column;
  //   if (!key) return;

  //   let direction = "asc";
  //   if (sortConfig.key === key && sortConfig.direction === "asc") {
  //     direction = "desc";
  //   } else if (sortConfig.key === key && sortConfig.direction === "desc") {
  //     // Instead of resetting to original data, toggle back to ascending
  //     direction = "asc";
  //   }

  //   setSortConfig({ key, direction });
  //   const sortedData = [...data].sort((a, b) => {
  //     // Handle date field DOJ
  //     if (key === "DOJ") {
  //       const dateA = a[key] ? new Date(a[key]) : new Date(0);
  //       const dateB = b[key] ? new Date(b[key]) : new Date(0);
  //       return direction === "asc" ? dateA - dateB : dateB - dateA;
  //     }
  //     // Handle boolean fields
  //     else if (["Certified", "Exp_5_Yr", "Exp_3_Yr", "HOD_Rec", "Qualified"].includes(key)) {
  //       const boolA = a[key] ? 1 : 0;
  //       const boolB = b[key] ? 1 : 0;
  //       return direction === "asc" ? boolA - boolB : boolB - boolA;
  //     }
  //     // Handle string fields
  //     else if (typeof a[key] === "string") {
  //       return direction === "asc"
  //         ? a[key].toLowerCase().localeCompare(b[key].toLowerCase())
  //         : b[key].toLowerCase().localeCompare(a[key].toLowerCase());
  //     }
  //     // Handle number fields
  //     else {
  //       return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
  //     }
  //   });
  //   setData(sortedData);
  // };
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];

  const totalPages =
    rowsPerPage === "All"
      ? 1
      : Math.ceil(safeFilteredData.length / rowsPerPage);

  const sortedData = [...safeFilteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const key = sortConfig.key;
    const aVal = a[key];
    const bVal = b[key];

    if (key === "DOJ") {
      return sortConfig.direction === "asc"
        ? new Date(aVal) - new Date(bVal)
        : new Date(bVal) - new Date(aVal);
    }

    if (typeof aVal === "boolean" || typeof aVal === "number") {
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortConfig.direction === "asc"
      ? aVal?.toString().localeCompare(bVal?.toString())
      : bVal?.toString().localeCompare(aVal?.toString());
  });

  const paginatedData =
    rowsPerPage === "All"
      ? sortedData
      : sortedData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    setTableSearchTerm(searchQuery);

    if (!searchQuery) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((trainer) =>
      [
        "EmployeeId",
        "Username",
        "Department",
        "Section",
        "Designation",
        "DOJ",
        "Training_Name",
        "Certified",
        "Cert_Des",
         "View_Cert", // ADD THIS
        "Exp_5_Yr",
        "Exp_3_Yr",
        "HOD_Rec",
        "Qualified",
      ].some((field) => {
        const rawValue = trainer[field];

        let valueToSearch = "";

        if (typeof rawValue === "boolean") {
          valueToSearch = rawValue ? "yes" : "no";
        } else {
          valueToSearch = rawValue?.toString().toLowerCase();
        }

        return valueToSearch?.includes(searchQuery);
      })
    );

    setFilteredData(filtered);
  };

  return (
    <div className="max-w-full mx-auto bg-white p-2 shadow-md rounded-lg w-full">
    
        <div>
      <div className="bg-sky-400 text-white p-2 rounded-t-lg">
        <h2 className="text-lg font-semibold">Add Qualified Trainers List</h2>
      </div>
 <BackButton/>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* React Select Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-900">
             EmployeeId
            </label>
            <Select
              options={options}
             value={EmployeeId ? options.find((o) => o.value === EmployeeId) || null : null}
              onChange={handleEmployeeIdChange}
              placeholder="Select EmployeeId"
              isClearable
              styles={{
                control: (base, state) => ({
                  ...base,
                  cursor: "pointer",
                  borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                  boxShadow: state.isFocused
                    ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
                    : "none",
                  padding: "1px",
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
                  zIndex: 9999,
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
              className="w-full cursor-pointer"
              classNamePrefix="react-select"
              required
            />
          </div>

          {/* Other form fields */}
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Username
            </label>
            <input
              type="text"
            value={trainingDetails.Username || ""}
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
              value={trainingDetails.Department || ""}
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
              value={trainingDetails.Section || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Designation
            </label>
            <input
              type="text"
            value={trainingDetails.Designation || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Gender
            </label>
            <input
              type="text"
            value={trainingDetails.Gender || ""}
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
             value={trainingDetails.DOJ || ""}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Category
            </label>
            <div className="flex space-x-6 mt-2">
              <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="trainingName"
                value="IATF"
                checked={trainingName.includes("IATF")}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setTrainingName((prev) => {
                    if (checked) {
                      return [...prev, "IATF"];
                    } else {
                      return prev.filter((item) => item !== "IATF");
                    }
                  });
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
                <span>IATF</span>
              </label>
              <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="trainingName"
                value="HSE"
                checked={trainingName.includes("HSE")}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setTrainingName((prev) => {
                    if (checked) {
                      return [...prev, "HSE"];
                    } else {
                      return prev.filter((item) => item !== "HSE");
                    }
                  });
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
                <span>HSE</span>
              </label>
            </div>
          </div>
        </div>
        {/* Checkbox Section */}
        
<div className="mt-6">
  <div className="flex items-center justify-around">
    {/* Certified Section */}
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-900 whitespace-nowrap">Certified</label>
      <input
        type="checkbox"
        checked={certified}
        onChange={() => handleCheckboxChange(setCertified, certified, "certified")}
        className="h-4 w-4 text-indigo-600"
      />
    </div>
    
 {showCertifiedInput && (
  <>
    <input
      type="text"
     value={certifiedInput || ""}
      onChange={(e) => setCertifiedInput(e.target.value)}
      placeholder="Enter certification description"
      className="w-48 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
      required
    />
    
   <div className="flex items-center gap-2">
  <label className="text-sm font-medium text-gray-900 whitespace-nowrap">
    Upload Files
  </label>
  
  {/* Multi-select style file upload */}
  <div className="relative w-52">
    <div 
      onClick={() => fileInputRef.current?.click()}
      className="min-h-[2.5rem] p-2 border border-gray-300 rounded-lg cursor-pointer hover:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400 bg-white"
    >
      {existingCertificates.length === 0 && uploadedFiles.length === 0 ? (
        <span className="text-gray-400 text-sm">Choose files...</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {/* Show existing certificates */}
          {existingCertificates.map((cert, index) => (
            <span
              key={`existing-${index}`}
              className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs border border-green-200"
            >
              <a 
                href={`/certificates/${cert}`}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[80px] truncate hover:underline"
                title={cert}
                onClick={(e) => e.stopPropagation()}
              >
                {cert.length > 15 ? `...${cert.slice(-12)}` : cert}
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveExistingCert(cert);
                }}
                className="hover:text-red-600 ml-1"
              >
                ×
              </button>
            </span>
          ))}
          
          {/* Show newly uploaded files */}
          {uploadedFiles.map((file, index) => (
            <span
              key={`new-${index}`}
              className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 px-2 py-1 rounded text-xs border border-sky-200"
            >
              <span className="max-w-[100px] truncate" title={file.name}>
                {file.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
                className="hover:text-red-600 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
    
    <input
      ref={fileInputRef}
      type="file"
      multiple
      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      onChange={handleFileChange}
      className="hidden"
    />
    
    {/* File count badge */}
    {(existingCertificates.length + uploadedFiles.length) > 0 && (
      <div className="absolute -top-2 -right-2 bg-sky-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
        {existingCertificates.length + uploadedFiles.length}
      </div>
    )}
  </div>
</div>
  </>
)}

    {/* Overall Exp Section */}
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-900 whitespace-nowrap">
        OverAll Exp (5 years)
      </label>
      <input
        type="checkbox"
        checked={exp5Yr}
        onChange={() => handleCheckboxChange(setExp5Yr, exp5Yr, "exp5Yr")}
        className="h-4 w-4"
      />
    </div>

    {/* GTI Exp Section */}
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-900 whitespace-nowrap">
        GTI Exp (3 yrs)
      </label>
      <input
        type="checkbox"
        checked={exp3Yr}
        onChange={() => handleCheckboxChange(setExp3Yr, exp3Yr, "exp3Yr")}
        className="h-4 w-4"
        disabled={!isExperienceAtLeast3Years}
      />
    </div>

    {/* Nominated by HOD Section */}
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-900 whitespace-nowrap">
        Nominated by HOD
      </label>
      <input
        type="checkbox"
        checked={hodRec}
        onChange={() => handleCheckboxChange(setHodRec, hodRec, "hodRec")}
        className="h-4 w-4"
      />
    </div>

    {/* Qualified Section */}
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-900 whitespace-nowrap">
        Qualified
      </label>
      <input
        type="checkbox"
        checked={qualified}
        required
        readOnly
        className="h-4 w-4"
      />
    </div>

    {/* Submit Button */}
    <button
      type="submit"
      className="px-6 py-2 cursor-pointer text-sm font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
    >
      Submit
    </button>
  </div>


</div>

      </form>
      </div>

<div>
  <TrainerApprovalForm />
</div>
   
        <div className="card-body p-0 overflow-x-auto pb-3">
           <p className="font-semibold text-sky-400">Qualified Trainers:</p>

          <div className="p-4 bg-card">
            
            <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                <span>Show</span>
                <select
                  className="border p-1 rounded bg-secondary"
                  value={rowsPerPage || 10}
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
                <div className="relative">
                  <input
                    type="text"
                    className="border p-1 pl-8 rounded "
                    placeholder="Search..."
                    value={tableSearchTerm || ""}
                    onChange={handleTableSearchChange}
                  />
                  <FaSearch className="absolute left-2 top-2 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table
                className="min-w-full border rounded-lg bg-card text-foreground text-sm"
                style={{
                  tableLayout: "fixed",
                  fontSize: "13px",
                  padding: "1px",
                }}
              >
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
{[
  { key: "EmployeeId", label: "Employee ID" },
  { key: "Username", label: "Username" },
  { key: "DOJ", label: "DOJ" },
  { key: "Designation", label: "Designation" },
  { key: "Section", label: "Section" },
  { key: "Department", label: "Department" },
  { key: "Training_Name", label: "Category" },
  { key: "Certified", label: "Certified" },
  { key :"Cert_Des",label:"Cert_Des"},
    { key: "View_Cert", label: "View Certificates" },
{ key: "Exp_5_Yr", label: "OverAll Exp (5 yrs)" },
{ key: "Exp_3_Yr", label: "GTI Exp (3 yrs)" },
  { key: "HOD_Rec", label: "Nominated by HOD" },
  { key: "Qualified", label: "Qualified" },
].map(({ key, label }, index) => (
  <th
    key={key}
    className={`px-2 py-2 border text-left cursor-pointer ${
      index === 0 ? "sticky left-0 bg-muted z-20" : ""
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

  <th
    key="Status"
    className="px-4 py-2 border text-left cursor-pointer"
    onClick={() => handleSort("Status")}
  >
    Status{" "}
    {sortConfig.key === "Status"
      ? sortConfig.direction === "asc"
        ? "▲"
        : "▼"
      : "↕"}
  </th>
  <th className="px-2 py-2 border">Actions</th>

                  </tr>
                </thead>
                <tbody>
{paginatedData.length > 0 ? (
  paginatedData.map((item, index) => {
    console.log('Rendering item:', item);
    return (
      <tr key={index} className="border hover:bg-muted">
        <td className="px-2 py-2 border">{item.EmployeeId}</td>
        <td className="px-2 py-2 border">{item.Username}</td>
        <td className="px-2 py-2 border">
          {" "}
          {item.DOJ}
        </td>
        <td className="px-2 py-2 border">
          {item.Designation}{" "}
        </td>
        <td className="px-2 py-2 border">{item.Section}</td>
        <td className="px-2 py-2 border">{item.Department}</td>
        <td className="px-2 py-2 border">
          {item.Training_Name}
        </td>
        <td className="px-2 py-2 border">
          {item.Certified ? "Yes" : "No"}
        </td>
         <td className="px-2 py-2 border">
          {item.Cert_Des}
        </td>
        {/* NEW CELL - View Certificates */}
<td className="px-2 py-2 border">
  {item.View_Cert ? (
    <div className="flex flex-wrap gap-2">
      {item.View_Cert.split(',').map((cert, idx) => {
        const certFile = cert.trim();
        if (!certFile) return null;
        
        return (
          <a 
            key={idx}
            href={`/certificates/${certFile}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded text-xs transition-colors"
            title={`View ${certFile}`}
          >
            <FaEye size={12} />
            Cert {idx + 1}
          </a>
        );
      })}
    </div>
  ) : (
    <span className="text-gray-400 text-xs italic">No files</span>
  )}
</td>
        <td className="px-2 py-2 border">
          {item.Exp_5_Yr ? "Yes" : "No"}
        </td>
<td className="px-2 py-2 border">
  {item.Exp_3_Yr ? "Yes" : "No"}
</td>
        <td className="px-2 py-2 border">
          {item.HOD_Rec ? "Yes" : "No"}
        </td>
        <td className="px-2 py-2 border">
          {item.Qualified ? "Yes" : "No"}
        </td>
        
      <td className="px-2 py-2 border flex items-center space-x-2">
      <input
        type="checkbox"
        checked={item.Status}
        onChange={async (e) => {
          const newStatus = e.target.checked;
          try {
            const response = await fetch('/api/update_active_status_to_remove_trainers', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ Qual_Id: item.Qual_Id, Status: newStatus }),
            });
            if (!response.ok) {
              throw new Error('Failed to update status');
            }
            const responseData = await response.json();
            alert(responseData.message || 'Status updated successfully');
            // Update local state to reflect the change
            const updatedData = [...data];
            const index = updatedData.findIndex((d) => d.Qual_Id === item.Qual_Id);
            if (index !== -1) {
              updatedData[index].Status = newStatus;
              setData(updatedData);
              setFilteredData(updatedData);
              setQualifiedTrainers(updatedData);
              setTrainerData(updatedData);
            }
          } catch (error) {
            alert('Error updating status: ' + error.message);
          }
        }}
        className="cursor-pointer"
      />
      <span className={item.Status ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
        {item.Status ? "Active" : "Inactive"}
      </span>
    </td>
      <td className="px-2 py-2 border">
  {item.Qual_Id ? (
    <DeleteTrainerButton 
      qualId={item.Qual_Id}
       username={item.Username}
       onResetSuccess={() => fetchQualifiedTrainers()}
    />
  ) : (
    <span className="text-red-500 text-xs">
      ID Missing: {JSON.stringify(Object.keys(item))}
    </span>
  )}
</td>  
    </tr>
  );
})
) : filteredData.length === 0 ? (
  <tr>
    <td colSpan="15" className="text-center py-4">
      No results found.
    </td>
  </tr>
) : (
  <tr>
    <td colSpan="15" className="text-center py-4">
      Loading...
    </td>
  </tr>
)}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            {
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

            }
          </div>
        </div>
   
    </div>
  );
};

export default QualifiedTrainerList;