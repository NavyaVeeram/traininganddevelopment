"use client";
import { useState, useEffect, useRef } from "react";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaFilePdf, FaSearch, FaPrint } from "react-icons/fa";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";
const DatePicker = dynamic(() => import("react-datepicker"), { ssr: false });
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import CreatableSelect from 'react-select/creatable';
import makeAnimated from "react-select/animated";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from '@pdf-lib/fontkit';
import BackButton from "@/components/BackButton";
const animatedComponents = makeAnimated();

const TrainingAttendanceForm = () => {
  const [isLoadingDropdown, setIsLoadingDropdown] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [year, setYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [Training_Name, setTraining_Name] = useState("");
      const [trainingName, setTrainingName] = useState("IATF");
     const [userDepartment, setUserDepartment] = useState(null);
      const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();
    const [formData, setFormData] = useState({
      Program_Id: "",
      Training_Name: "",
      Train_Mode: "",
      Persons: "",
      Req_Months: "",
      Start_Month: "",
      No_Hrs: "",
      Training_Date: "",
      Training_Status: "",
      Schedule_Type: "",
      Forward: "",
      Trainer: "",
      External_Trainer: "", // Add External_Trainer field
      Venue: "",
      Actual_Budget: "",
      CreatedBy: typeof window !== "undefined" ? localStorage.getItem("employeeId") || "" : "",
      EmployeeIds: [],
      selectedMonth: `${currentMonth}-${currentYear}`,
    });

    // New state for confirmation popup visibility
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    // Ref to store the submit event for later use
    const submitEventRef = useRef(null);

    // Helper function to convert dd-MMM-yyyy to yyyy-mm-dd for date input value
    const convertDateToInputValue = (dateStr) => {
      if (!dateStr) return "";
      const months = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };
      const parts = dateStr.split("-");
      if (parts.length !== 3) return "";
      const day = parts[0];
      const month = months[parts[1]];
      const year = parts[2];
      if (!month) return "";
      return `${year}-${month}-${day}`;
    };

    // Helper function to convert yyyy-mm-dd to dd-MMM-yyyy for storing in formData
    const convertInputValueToDate = (inputValue) => {
      if (!inputValue) return "";
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const parts = inputValue.split("-");
      if (parts.length !== 3) return "";
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      if (monthIndex < 0 || monthIndex > 11) return "";
      const month = months[monthIndex];
      return `${day}-${month}-${year}`;
    };
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [options, setOptions] = useState([]);
  const [trainerOptions, setTrainerOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [programDetails, setProgramDetails] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [qualifiedTrainers, setQualifiedTrainers] = useState([]);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [message, setMessage] = useState("");
  const [department, setDepartment] = useState('');
  const [username, setUsername] = useState('');
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const storedEmployeeId = typeof window !== "undefined" ? localStorage.getItem("employeeId") : null;
  const [employeeId, setEmployeeId] = useState(storedEmployeeId);
  const [isCancelChecked, setIsCancelChecked] = useState(false);
  const [venueOptions, setVenueOptions] = React.useState([]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      CreatedBy: employeeId || "",
    }));
  }, [employeeId]);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [trainingDetails, setTrainingDetails] = useState({
    Training_Name: "",
    Train_Mode: "",
    No_Hrs: "",
    Persons: "",
    Training_Date: "",
    Schedule_Type: "",
    Trainer: "",
    External_Trainer: "", // Add to training details
    Venue: "",
    Actual_Budget: "",
  });
  const monthOptions = [
    { value: "Jan", label: "Jan" },
    { value: "Feb", label: "Feb" },
    { value: "Mar", label: "Mar" },
    { value: "Apr", label: "Apr" },
    { value: "May", label: "May" },
    { value: "Jun", label: "Jun" },
    { value: "Jul", label: "Jul" },
    { value: "Aug", label: "Aug" },
    { value: "Sep", label: "Sep" },
    { value: "Oct", label: "Oct" },
    { value: "Nov", label: "Nov" },
    { value: "Dec", label: "Dec" },
  ];
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };


  // RESET FORM including Cancel checkbox
  const resetForm = () => {
    setFormData({
      Persons: "",
      No_Hrs: "",
      Training_Date: "",
      Train_Mode: "",
      Training_Name: "",
      Training_Status: "",
      Schedule_Type: "",
      Trainer: "",
      External_Trainer: "", // Reset External_Trainer
      Venue: "",
      Actual_Budget: "",
      CreatedBy: "",
      selectedMonth: "",
      EmployeeIds: [],
      Program_Id: "",
      Req_Months: "",
      Start_Month: "",
      Forward: "",
    });
    setTrainingDetails({
      Training_Name: "",
      Train_Mode: "",
      No_Hrs: "",
      Persons: "",
      Schedule_Type: "",
      External_Trainer: "", // Reset in training details
    });
    setYear("");
    setSelectedMonth(null);
    setSelectedDate(null);
    setOptions([]);
    setIsCancelChecked(false); // <-- Reset Cancel checkbox
  };

  const handleTrainModeChange = (e) => {
    const newTrainMode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      Train_Mode: newTrainMode,
      // Clear External_Trainer when switching away from External
      External_Trainer: newTrainMode === "External" ? prev.External_Trainer : "",
    }));
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleScheduleTypeChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      Schedule_Type: value,
    }));
  };
  const mappedTrainerOptions = (trainerOptions || []).map((trainer) => ({
    value: trainer.Value,
    label: trainer.Text,
  }));
  const handleFormDataChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  useEffect(() => {
    // Retrieve the department, username, and employeeId from localStorage
    const storedDepartment = localStorage.getItem('department');
    const storedUsername = localStorage.getItem('username');
    const storedEmployeeId = localStorage.getItem('employeeId');

    // If data is found, update state
    if (storedDepartment && storedUsername && storedEmployeeId) {
      setDepartment(storedDepartment);
      setUsername(storedUsername);
      setEmployeeId(storedEmployeeId);
    } else {
      // If no data found, redirect to login page
      window.location.href = '/';
    }
    // Removed fetchData and trainingData usage as trainingData state is unused
  }, [department, username, employeeId]);
  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/user_dropdown_attendance");
      const data = await res.json();
      const formatted = data.map((item) => ({
        value: item.Value,
        label: ` ${item.Text} `,
      }));
      setEmployeeOptions(formatted);
    } catch (err) {
      setError("Failed to fetch employees");
    }
  };

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await fetch("/api/qualified_trainer_dropdown");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTrainerOptions(data);
        } else {
          setTrainerOptions([]);
          console.error("Trainer data is not an array:", data);
        }
      } catch (err) {
        console.error("Failed to fetch trainers:", err);
        setTrainerOptions([]);
      }
    };

    fetchTrainers();
  }, []);
// useEffect(() => {
//   if (trainingName) {
//     const currentDate = new Date();
//     handleMonthYearChange(currentDate);
//   }
// }, [trainingName]);
  const dialogMessageRef = useRef("");

  useEffect(() => {
    dialogMessageRef.current = dialogMessage;
  }, [dialogMessage]);
  useEffect(() => {
    if (formData.Program_Id) {
      fetchTrainingData(formData.Program_Id);
    }
  }, [formData.Program_Id]);
useEffect(() => {
  if (selectedDate && trainingName) {
    handleMonthYearChange(selectedDate);
  }
}, [trainingName,selectedDate]);
  const fetchTrainingData = async (programId, trainingName) => {
    try {
      setTimeout(() => {
    if (!programId || !trainingName) {
        setDialogVisible(false);
        setDialogMessage("");
        return;
      }
}, 0);
      const res = await fetch(
        `/api/get_training_att_entry?program_id=${programId}`
      );
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Error fetching training details");

      const trainingData = data[0] || {};

      // Update formData
      setFormData((prev) => ({
        ...prev,
        Training_Name: trainingData.Training_Name || "",
        Train_Mode: trainingData.Train_Mode || "",
        Req_Months: trainingData.Req_Months || "",
        Start_Month: trainingData.Start_Month || "",
        No_Hrs: trainingData.No_Hrs || "",
        Persons: trainingData.Persons || "",
        Training_Date: trainingData.Training_Date || "",
        Training_Status: trainingData.Training_Status || "",
        Forward: trainingData.Forward || "",
        Schedule_Type: trainingData.Schedule_Type || "",
        External_Trainer: trainingData.External_Trainer || "", // Add External_Trainer from API
        Trainer: trainingData.Trainer || "",
        Venue: trainingData.Venue || "",
        Actual_Budget: trainingData.Actual_Budget || "",
        EmployeeIds: trainingData.EmployeeIds
          ? trainingData.EmployeeIds.split(",").map((id) => id.trim())
          : [],
      }));

      // Build dialog message
      const { Req_Months, Forward, Start_Month } = trainingData;
      const showDialog = Req_Months;

      if (showDialog) {
        const newMessage =
          Req_Months === Forward
            ? `This program has been resheduled from ${Start_Month} to ${Req_Months}`
            : null;

        // Only update if message has changed
        if (newMessage !== dialogMessageRef.current) {
          setDialogVisible(false); // force close
          setDialogMessage(""); // clear old

          setTimeout(() => {
            setDialogMessage(newMessage);
            setDialogVisible(true);
          }, 10); // small delay ensures re-render
        }
      } else {
        setDialogVisible(false);
        setDialogMessage("");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  React.useEffect(() => {
    async function fetchVenueOptions() {
      try {
        const response = await fetch('/api/get_venue_dropdown');
        if (!response.ok) {
          throw new Error('Failed to fetch venue options');
        }
        const data = await response.json();
        // Assuming data is an array of objects with Venue property
        const options = data.map((item) => ({
          value: item.Venue,
          label: item.Venue,
        }));
        setVenueOptions(options);
      } catch (error) {
        console.error('Error fetching venue options:', error);
      }
    }
    fetchVenueOptions();
  }, []);
const handleMonthYearChange = async (date) => {
  if (!date) return;
  setSelectedDate(date);
    setIsLoadingDropdown(true);
  setOptions([]);
  const selectedMonth = date.getMonth() + 1;
  const selectedYear = date.getFullYear();
  // Pad month with leading zero
  const formattedMonth = selectedMonth.toString().padStart(2, '0')
  setFormData((prev) => ({
    ...prev,
    selectedMonth: `${formattedMonth}-${selectedYear}`,
     Program_Id: "", 
  }));

  // Use the current trainingName state instead of formData.Training_Name
  if (!trainingName) {
    setOptions([]);
    return;
  }

  try {
    const res = await fetch(
     `/api/get_training_attendance_dropdown?month=${selectedMonth}&year=${selectedYear}&Training_Name=${encodeURIComponent(trainingName)}`
    );
    const data = await res.json();
    if (res.ok) {
      if (data.length === 0) {
        resetForm();
      } else {
        setOptions(data);
      }
    } else {
      throw new Error(data.error || "Error fetching data");
    }
  } catch (err) {
    setError(err.message);
  }
};
  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');

    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    }

const fetchAccessRole = async () => {
  try {
    const res = await fetch(`/api/get_access_role?employeeId=${storedEmployeeId}`);
    const data = await res.json();

    console.log('Debug Access:', {
      employeeId: storedEmployeeId,
      department: data.Department,
      accessRole: data.Access_Role,
      responseOk: res.ok,
      fullData: data
    });

    if (res.ok && data.Access_Role) {
      // ✅ Save the department to state
      setUserDepartment(data.Department);
      
      // Check if department is HR
      if (data.Department === "HR") {
        setAccessRole(data.Access_Role);
        setIsAuthorized(true);
        return;
      }

      // For non-HR departments, restrict specific roles
      if (data.Access_Role === "HOS" || 
          data.Access_Role === "HOD" || 
          data.Access_Role === "Res_Person") {
        setIsAuthorized(false);
        return;
      }
      
      setAccessRole(data.Access_Role);
      setIsAuthorized(true);
    } else {
      console.log('❌ Authorization failed - no Access_Role found');
      setIsAuthorized(false);
    }
  } catch (error) {
    console.error('Error fetching access role:', error);
    setIsAuthorized(false);
  } finally {
    setIsLoadingDropdown(false);
  }
};
   fetchAccessRole();
 }, []);
 const handleProgramChange = async (e) => {
  const selectedProgramId = e.target.value;
  if (!selectedProgramId) return;
  
  setFormData((prev) => ({
    ...prev,
    Program_Id: selectedProgramId,
  }));
  setMessage("");
  setIsMessageVisible(false);
  setLoading(true);
  setTableSearchTerm("");
  
  try {
    // Always fetch training data first
    await fetchTrainingData(selectedProgramId, trainingName);
    
    // Always fetch employee details regardless of training data
const empRes = await fetch(`/api/get_tet_form_emp_details?id=${encodeURIComponent(selectedProgramId)}`);    const empData = await empRes.json();
    
    if (empRes.ok) {
      setProgramDetails(empData);
      setFilteredData(empData);
    } else {
      // Even if employee API fails, show empty array instead of error
      setProgramDetails([]);
      setFilteredData([]);
      console.warn("Failed to fetch employee details:", empData);
    }
    
  } catch (err) {
    console.error("Error in handleProgramChange:", err);
    // Still set empty arrays to show the table structure
    setProgramDetails([]);
    setFilteredData([]);
  } finally {
    setLoading(false);
  }
};
const handleSubmit = async (e) => {
  try {
    e.preventDefault();
    const { EmployeeIds, Training_Status, Training_Date } = formData;

    // Validation for Training Date / Status
    if (!isCancelChecked) {
    if (!Training_Date && !Training_Status) {
      alert("Either Training Date or Training Status must be selected.");
      return;
    }
  }
    // Validation for max allowed employees
    if (Training_Date) {
      const maxAllowedEmployees = Number(formData.Persons) || 0;

      if (
        EmployeeIds.length > maxAllowedEmployees ||
        EmployeeIds.length === 0 ||
        EmployeeIds.length < maxAllowedEmployees
      ) {
        alert(`You can only select up to ${maxAllowedEmployees} employee(s).`);
        setMessage("");
        setIsMessageVisible(false);
        return;
      }
    }

    // Always send Program_Id as comma-separated string
// Build safe Program IDs string
const programIdsParam = Array.isArray(formData.Program_Id)
  ? formData.Program_Id.join(",")
  : String(formData.Program_Id || "").trim();

if (!programIdsParam) {
  alert("Please select at least one Program ID.");
  return;
}


// Use encodeURIComponent to avoid URL parsing issues


    const formDataToSend = {
      Program_Id: programIdsParam,
      Persons: formData.Persons,
      No_Hrs: formData.No_Hrs,
      Train_Mode: formData.Train_Mode || null,
      Training_Date: formData.Training_Date,
      Training_Status: formData.Training_Status || null,
      Schedule_Type: formData.Schedule_Type || null,
      Trainer: formData.Trainer || null,
      External_Trainer: formData.External_Trainer || null, // Include External_Trainer in submission
      Venue: formData.Venue || null,
      Actual_Budget: formData.Actual_Budget || null,
      EmployeeIds: formData.EmployeeIds || null,
      CreatedBy: (formData.CreatedBy || localStorage.getItem("employeeId") || "").trim(),
      Cancel: isCancelChecked ? 1 : 0,
    };

    setLoading(true);

    // First API call - Update training data
    const res = await fetch("/api/update_trainingdata_att_entry_submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDataToSend),
    });

    const responseData = await res.json();

    if (res.ok) {
      alert(responseData.message);

      // Insert employee attendance if needed
      if (formData.EmployeeIds && formData.EmployeeIds.length > 0 && formData.Training_Date) {
        if (!formData.Program_Id) {
          console.error("Program_Id is missing or empty:", formData.Program_Id);
          return;
        }

        const attendanceRes = await fetch("/api/insert_emp_att_program_wise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Program_Id: programIdsParam,
            EmployeeIds: Array.isArray(formData.EmployeeIds)
              ? formData.EmployeeIds
              : formData.EmployeeIds.split(','),
            CreatedBy: (formData.CreatedBy || localStorage.getItem("employeeId") || "").trim(),
          }),
        });

        console.log("About to call attendance API with:", {
          Program_Id: programIdsParam,
          EmployeeIds: Array.isArray(formData.EmployeeIds)
            ? formData.EmployeeIds
            : formData.EmployeeIds.split(','),
          CreatedBy: (formData.CreatedBy || localStorage.getItem("employeeId") || "").trim(),
        });

        const attendanceData = await attendanceRes.json();
        if (attendanceRes.ok) {
          console.log("Employee attendance inserted:", attendanceData.message);
        } else {
          console.error("Attendance insert failed:", attendanceData.message);
        }
      }

      // Refresh training data
      await fetchTrainingData(programIdsParam);

      // Fetch updated employee details
const empRes = await fetch(`/api/get_tet_form_emp_details?id=${encodeURIComponent(programIdsParam)}`);
      const empData = await empRes.json();

      if (empRes.ok) {
        setProgramDetails(empData);
        setFilteredData(empData);
      }
      setIsMessageVisible(true);

    } else {
      throw new Error(responseData.message || "Unknown error");
    }

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  // New function to handle form submit with confirmation popup
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Check if this is a last submission (late submission) condition
    // For demonstration, let's assume if Training_Date is set, it's a late submission
    if (formData.Training_Date) {
      // Show confirmation popup
      setShowConfirmPopup(true);
      // Store the event for later use
      submitEventRef.current = e;
       
    } else {
      // Directly call the original handleSubmit
      handleSubmit(e);
    }
  };

  // Function to handle confirmation OK click
  const handleConfirmOk = () => {
    setShowConfirmPopup(false);
    // Call the original handleSubmit with stored event
    if (submitEventRef.current) {
      handleSubmit(submitEventRef.current);
      submitEventRef.current = null;
    }
  };

  // Function to handle confirmation Cancel click or outside click
  const handleConfirmCancel = () => {
    setShowConfirmPopup(false);
    submitEventRef.current = null;
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];

  const totalPages =
    rowsPerPage === "All"
      ? 1
      : Math.ceil(safeFilteredData.length / rowsPerPage);

  const sortedData = [...safeFilteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedData =
    rowsPerPage === "All"
      ? sortedData
      : sortedData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value;
    setTableSearchTerm(searchQuery);

    if (!searchQuery) {
      setFilteredData(programDetails);
    } else {
      const filtered = Array.isArray(programDetails)
        ? programDetails.filter((trainer) =>
            [
              "EmployeeId",
              "Username",
              "Department",
              "Section",
              "Designation",
              "DOJ",
              "IsActive",
            ].some((field) =>
              trainer[field]
                ?.toString()
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
          )
        : [];

      setFilteredData(filtered);
    }
  };

  async function generatePdfForEmployees(Program_Id) {
    const templatePath = "/training_report.pdf";
    const label = "Training_Effectiveness_Filtered_Employees.pdf";
    const templateBytes = await fetch(templatePath).then((res) =>
      res.arrayBuffer()
    );
          const mergedPdf = await PDFDocument.create();
  // Register fontkit to embed custom fonts
      mergedPdf.registerFontkit(fontkit);

      // const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
      //user support
const fontBytes = await fetch("/fonts/cambriab.ttf").then(res => res.arrayBuffer());
// const fontBytes = await fetch("/fonts/CALIBRI.ttf").then(res => res.arrayBuffer());
// Embed it in the PDF
const font = await mergedPdf.embedFont(fontBytes);
    // Fetch data from API for PDF generation
    const apiUrl = `/api/get_tet_form_emp_details_for_report?programId=${Program_Id}`;
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
      const copiedPages = await mergedPdf.copyPages(
        templatePdf,
        templatePdf.getPageIndices()
      );

      copiedPages.forEach((page, index) => {
        const height = page.getSize().height;

        if (index === 0) {
        const Username = emp.UserName || "";
                                const words = Username.split(" ").filter(Boolean);
                                if (words.length > 3) {
                                  // Draw first 4 words on one line at top
                                  const firstLine = words.slice(0, 3).join(" ");
                                  const secondLine = words.slice(3).join(" ");
                                  page.drawText(firstLine, {
                                    x: 140,
                                    y: height - 70,
                                    size: 10,
                                    font,
                                    color: rgb(0, 0, 0),
                                  });
                                  // Draw remaining words on next line lower
                                  page.drawText(secondLine, {
                                    x: 140,
                                    y: height - 85,
                                    size: 10,
                                    font,
                                    color: rgb(0, 0, 0),
                                  });
                                } else {
                                  // Draw all words in one line at top
                                  page.drawText(Username, {
                                    x: 140,
                                    y: height - 70,
                                    size: 10,
                                    font,
                                    color: rgb(0, 0, 0),
                                  });
                                }
          // Customize on first page
          page.drawText(String(emp.EmployeeId || "") , {
            x: 140,
            y: height - 104,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(String(emp.Designation || "") , {
            x: 140,
            y: height - 138,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(String(emp.Section || "") , {
            x: 140,
            y: height - 173,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(String(emp.Department || "") , {
            x: 140,
            y: height - 208,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
          // Split Program_Name into two lines for drawing
        // Split Program_Name into two lines for drawing  
        //  const ProgramName = emp.Program_Name || "";
        //                         if (ProgramName.length > 24) {
        //                           const firstLine = ProgramName.substring(0, 24);
        //                           const secondLine = ProgramName.substring(24);
        //                           page.drawText(firstLine, {
        //                             x: 375,
        //                             y: height - 70,
        //                             size: 10,
        //                             font,
        //                             color: rgb(0, 0, 0),
        //                           });
        //                           page.drawText(secondLine, {
        //                             x: 375,
        //                             y: height - 85,
        //                             size: 10,
        //                             font,
        //                             color: rgb(0, 0, 0),
        //                           });
        //                         } else {
        //                           page.drawText(ProgramName, {
        //                             x: 375,
        //                             y: height - 70,
        //                             size: 10,
        //                             font,
        //                             color: rgb(0, 0, 0),
        //                           });
        //                         }
        function wrapText(text, maxCharsPerLine, maxLines = 2) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (let word of words) {
    // If adding the word exceeds max length, push currentLine to lines
    if ((currentLine + (currentLine ? " " : "") + word).length > maxCharsPerLine) {
      lines.push(currentLine.trim());
      currentLine = word; // start new line with the word
      if (lines.length >= maxLines - 1) break; // only allow up to maxLines
    } else {
      currentLine += (currentLine ? " " : "") + word;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine.trim());
  }

  return lines;
}

// Usage
const ProgramName = emp.Program_Name || "";
const wrappedLines = wrapText(ProgramName, 30, 5);

if (wrappedLines.length > 0) {
  page.drawText(wrappedLines[0], {
    x: 375,
    y: height - 70,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
}
if (wrappedLines.length > 1) {
  page.drawText(wrappedLines[1], {
    x: 375,
    y: height - 85,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
}

if (
  emp.External_Trainer === "NULL" ||
  emp.External_Trainer === null ||
  emp.External_Trainer === "undefined"
) {
  if (emp.Trainer && typeof emp.Trainer === "string") {
    const trainerLines = emp.Trainer
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    trainerLines.forEach((line, index) => {
      page.drawText(line, {
        x: 375,
        y: height - 104 - index * 12,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
    });
  }
}

// Internal Trainer (if exists)
if (emp.Trainer && typeof emp.Trainer === "string") {
  const trainerLines = emp.Trainer
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  trainerLines.forEach((line, index) => {
    page.drawText(line, {
      x: 375,
      y: height - 104 - index * 12,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
  });
}

// External Trainer with "And More" appended to 2nd line
if (emp.External_Trainer && typeof emp.External_Trainer === "string") {
  const trainerLines = emp.External_Trainer
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  let limitedLines = [];

  if (trainerLines.length > 2) {
    // First trainer stays the same, second trainer gets "And More..."
    limitedLines = [
      trainerLines[0],
      trainerLines[1] + " And More..."
    ];
  } else {
    limitedLines = trainerLines;
  }

  limitedLines.forEach((line, index) => {
    page.drawText(line, {
      x: 375,
      y: height - 104 - index * 12,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
  });
}


          page.drawText(String(emp.Train_Mode || "") , {
            x: 375,
            y: height - 139,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });



    page.drawText(String(emp.No_Hrs) || "", {
            x: 375,
            y: height - 173,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
      

          page.drawText(String(emp.Training_Date) || "", {
            x: 375,
            y: height - 208,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }

        mergedPdf.addPage(page);
      });
    }

    const finalPdfBytes = await mergedPdf.save();
    const blob = new Blob([finalPdfBytes], { type: "application/pdf" });
    if (typeof document !== "undefined") {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = label;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  useEffect(() => {
    if (formData.Program_Id) {
      setLoading(true);
      //fetchProgramData();
    }
  }, [formData.Program_Id]);
  useEffect(() => {
    setMounted(true);
  }, []);

  const exportToExcel = () => {
  if (!filteredData || filteredData.length === 0) {
    alert("No data to export");
    return;
  }

  // Convert SQL result to Excel-friendly format
  const formattedData = filteredData.map((item) => ({
    "Program Id": item.Program_Id || "",
    Status: item.Status === 1 ? "Active" : "Inactive", // Optional readability
    "Employee ID": item.EmployeeId || "",
    "Employee Name": item.Username || "",
    Department: item.Department || "",
    Section: item.Section || "",
    Designation: item.Designation || "",
    "Date of Joining": item.DOJ || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Details");

  XLSX.writeFile(workbook, "Employee_Details.xlsx");
};

  if (!mounted) {
    return null;
  }
const programOptions = options.map((option) => ({
  value: option.Value,
  label: option.Text,
}));

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
    <div className="max-w-full mx-auto bg-white p-2 shadow-md rounded-lg w-full">
      <div className="bg-sky-400 text-white p-2 rounded-t-lg">
        <h2 className="font-semibold">Training Attendance Entry</h2>
      </div>

      {/* Confirmation Popup Modal */}
      {showConfirmPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={handleConfirmCancel}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-center font-semibold">
              Please verify before submitting. Once submitted, it cannot be updated.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-700"
                onClick={handleConfirmOk}
              >
                OK
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                onClick={handleConfirmCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
<BackButton/>
      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mt-3 w-full">
          {/* Year Selection */} 
          <div className="md:col-span-1">
            <label className="block font-medium w-full">Year:</label>
            <DatePicker
            
              selected={selectedDate}
              onChange={handleMonthYearChange}
              dateFormat="MMM-yyyy"
              showMonthYearPicker
              placeholderText="Select Month and Year"
              className="w-full pl-4 pr-20 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
                   <div className="md:col-span-2">
           <label htmlFor="training-select" className="mr-2  font-semibold ">
            Category :
            </label>
            <Select
              inputId="training-select"
              value={{
                value: trainingName,
                label:
                  trainingName === "IATF"
                    ? "IATF (International Automotive Task Force)"
                    : "HSE (Health, Safety, and Environment)",
              }}
              
              onChange={(selectedOption) =>
                setTrainingName(selectedOption.value)
              }
              options={[
                {
                  value: "IATF",
                  label: "IATF (International Automotive Task Force)",
                },
                {
                  value: "HSE",
                  label: "HSE (Health, Safety, and Environment)",
                },
              ]}
              isSearchable={false}
              classNamePrefix="react-select"

              styles={{
                control: (provided) => ({
                  ...provided,
                  padding: "2px",
                  borderColor: "#D1D5DB", // Tailwind sky-500
                  borderRadius: "0.5rem", // rounded-lg
                  cursor: "pointer",
                  minHeight: "38px",
                }),
                option: (provided, state) => ({
                  ...provided,
                  cursor: "pointer",
                  backgroundColor: state.isFocused ? "#E0F2FE" : "white", // Tailwind sky-100
                  color: "black", 
                }),
              }}
            />
              </div>
          {/* Program Selection */}
          <div className="md:col-span-3">
            <label className="block font-medium">Program:</label>
            <div className="relative">
              <Select
                 isRequired
                isDisabled={!selectedDate || loading  }
                onChange={(selectedOption) => {
                  if (!selectedOption) return;
                  handleProgramChange({
                    target: { value: selectedOption.value },
                  });
                }}
               value={programOptions.find(
    (opt) => opt.value === formData.Program_Id
  ) || null}
                options={programOptions}
      className=" cursor-pointer"
                placeholder="Select Program"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    cursor: 'pointer',
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
                    cursor: 'pointer',
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
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                instanceId="program-select"
                // isClearable
                />
              </div>
              
              </div>
           <div className="md:col-span-1">
            </div>     
              <div className="md:col-span-1">
  <div className="flex items-center justify-start">
              <div className="flex items-center  gap-2 mt-6">
          <label htmlFor="Cancel" className="font-medium">
            Cancel
          </label>
          <input
                      type="checkbox"
                      id="Cancel"
                      name="Cancel"
                      checked={isCancelChecked}
                      onChange={() => setIsCancelChecked((prev) => !prev)}
                      disabled={!!formData.Training_Status}
                className={` w-5 h-4 cursor-pointer  ${
                formData.Training_Status ? "bg-gray-100 cursor-not-allowed" : ""
                }`} 
                    />
        </div>
        </div>
        </div>
            </div>
            {/* Align these fields in a single row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2 w-full">
    
              {/* Training Mode */}
              <div>
              <label className="block font-medium mb-1">Training Mode:</label>
              <div className="flex gap-2 mt-2">
                {["Internal", "External", "Overseas"].map((mode) => (
                <label key={mode} className="inline-flex items-center  w-full ">
                  <input
                  type="radio"
                  name="Train_Mode"
                  value={mode}
                  checked={formData.Train_Mode === mode}
                  onChange={handleTrainModeChange}
                  required
                 disabled={!!formData.Training_Status}
                className={` form-radio border border-gray-300  ${
                formData.Training_Status ? "bg-gray-100 cursor-not-allowed" : ""
                }`}  />
                  <span className="ml-1">{mode}</span>
                </label>
                ))}
              </div>
              </div>
              {/* Number of Hours */}
              <div className="ml-8">
              <label className="block font-medium">No of Hours:</label>
              <input
                type="number"
                
                name="No_Hrs"
                value={formData.No_Hrs}
                onChange={handleFormDataChange}
                // className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
                step="any"
                required={!isCancelChecked}
                min="1"
                      disabled={!!formData.Training_Status}
                className={`w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 ${
                formData.Training_Status ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
              </div>
              {/* Number of Persons */}
              <div>
              <label htmlFor="Persons" className="block font-medium">
                No of Persons:
              </label>
              <input
                type="number"
                id="Persons"
                name="Persons"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.Persons}
                onChange={handleFormDataChange}
                step="1"
                min="1"
                readOnly
                // className="w-full bg-gray-100 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              disabled={!!formData.Training_Status}
                className={`w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 ${
                formData.Training_Status ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
              </div>
              {/* Training Date */}
              <div>
              <label className="block font-medium">Training Date:</label>
              <input
                type="date"
                name="Training_Date"
                value={
                  convertDateToInputValue(formData.Training_Date)
                }
                onChange={(e) => {
                  const newDate = convertInputValueToDate(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    Training_Date: newDate,
                    // Reset these fields if Training_Date is cleared
                    ...(newDate === "" && {
                      Training_Status: "",
                      Schedule_Type: "",
                      Trainer: "",
                      External_Trainer: "", // Reset External_Trainer when Training_Date is cleared
                      Venue: "",
                      Actual_Budget: "",
                      EmployeeIds: [],
                    }),
                  }));
                  // Reset Cancel checkbox when Training_Date changes
                  setIsCancelChecked(false);
                }}
                disabled={!!formData.Training_Status}
                className={`w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 ${
                formData.Training_Status ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
              </div>
          
              <div>
                <label className="block font-medium">Rescheduled Month:</label>
                <Select
                  id="Training_Status"
                  name="Training_Status"
                  options={monthOptions}
                  value={
                    monthOptions.find(
                      (opt) => opt.value === formData.selectedMonth
                    ) || null
                  }
                onChange={(selectedOption) => {
                    const newSelectedMonth = selectedOption ? selectedOption.value : "";
                    const reqMonths = formData.Req_Months;
                    setFormData((prev) => ({
                      ...prev,
                      selectedMonth: newSelectedMonth,
                      EmployeeIds: [],
                      Schedule_Type: "",
                      Trainer: "",
                      External_Trainer: "", // Reset External_Trainer when rescheduling
                      Venue: "",
                      Actual_Budget: "",
                    }));
                    if (newSelectedMonth && reqMonths) {
                      const newMessage = `This program will be rescheduled from ${reqMonths} to ${newSelectedMonth}`;
                      setMessage(newMessage);
                      setIsMessageVisible(true);
                    } else {
                      setIsMessageVisible(false);
                      setMessage("");
                    }
                  }}
                  placeholder="Select Month"
                  isClearable
                  isSearchable
                  isDisabled={!!formData.Training_Date}
                  className="text-gray-900 cursor-pointer"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      cursor: 'pointer',
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
                    menu: (base) => ({
                      ...base,
                      zIndex: 50,
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  instanceId="month-select"
                />
              </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2">
                {/* Schedule Type */}
                <div>
                  <label className="block font-medium">Schedule Type:</label>
                  <div className="mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="Schedule_Type"
                        value="Planned"
                        checked={formData.Schedule_Type === "Planned"}
                        onChange={handleScheduleTypeChange}
                        required
                        className="form-radio"
                        disabled={!!formData.Training_Status}
                      />
                      <span className="mx-3">Planned</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="Schedule_Type"
                        value="Additional"
                        checked={formData.Schedule_Type === "Additional"}
                        onChange={handleScheduleTypeChange}
                        required
                        className="form-radio"
                        disabled={!!formData.Training_Status}
                      />
                      <span className="mx-2">Additional</span>
                    </label>
                  </div>
                </div>

                {/* Trainer */}
{formData.Train_Mode !== "External" && (
  <div>
    <label htmlFor="Trainer" className="block font-medium">
      Trainer:
    </label>
    <div className="relative">
      <Select
        id="Trainer"
        name="Trainer"
        options={mappedTrainerOptions}
        value={
          mappedTrainerOptions.filter((opt) => {
            let trainerArray = [];
            if (Array.isArray(formData.Trainer)) {
              trainerArray = formData.Trainer;
            } else if (
              typeof formData.Trainer === "string" &&
              formData.Trainer.trim() !== ""
            ) {
              trainerArray = formData.Trainer.split(",").map((t) => t.trim());
            }
            return trainerArray.includes(opt.value);
          }) || []
        }
        onChange={(selectedOptions) => {
          setFormData({
            ...formData,
            Trainer: selectedOptions
              ? selectedOptions.map((opt) => opt.value)
              : [],
          });
        }}
        placeholder="Select Trainer(s)"
        isSearchable
        isMulti
        autoComplete="off"
        isDisabled={!!formData.Training_Status}
        styles={{
          control: (base, state) => ({
            ...base,
            cursor: !!formData.Training_Status
              ? "not-allowed"
              : "pointer",
            borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
            boxShadow: state.isFocused
              ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
              : "none",
            padding: "1px",
            borderRadius: "0.5rem",
            minHeight: "2rem",
            display: "flex",
            alignItems: "center",
            backgroundColor: !!formData.Training_Status
              ? "#f3f4f6"
              : "#fff",
          }),
          option: (base) => ({
            ...base,
            cursor: "pointer",
          }),
          menu: (base) => ({
            ...base,
            zIndex: 50,
            position: "absolute",
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
        }}
        instanceId="trainer-select"
      />
    </div>
  </div>
)}

                {/* External Trainer - Only show when Train_Mode is "External" */}
                {formData.Train_Mode === "External" && (
                  <div>
                    <label htmlFor="External_Trainer" className="block font-medium">
                      External Trainer:
                    </label>
                    <input
                      type="text"
                      id="External_Trainer"
                      name="External_Trainer"
                      value={formData.External_Trainer}
                      onChange={handleFormDataChange}
                      placeholder="Enter external trainer name"
                      autoComplete="off"
                      disabled={!!formData.Training_Status}
                      className={`w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 ${
                        formData.Training_Status ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                )}

                {/* Venue */}
                <div>
                  <label htmlFor="Venue" className="block font-medium">
                    Venue:
                  </label>
                  <div className="relative">
                   <CreatableSelect
                      id="Venue"
                      name="Venue"
                    options={venueOptions}
                    value={
                      formData.Venue
                        ? venueOptions.find(
                            (option) => option.value === formData.Venue
                          )
                        : null
                    }
                    onChange={(selectedOption) => {
                      setFormData((prev) => ({
                        ...prev,
                        Venue: selectedOption ? selectedOption.value : "",
                      }));
                    }}
                    placeholder="Select Venue or Type to Add"
                    className="text-gray-900 rounded-md cursor-pointer"
                    isDisabled={!!formData.Training_Status}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        cursor: !!formData.Training_Status ? "not-allowed" : "pointer",
                        backgroundColor: !!formData.Training_Status ? "#f3f4f6" : "#fff",
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
                        cursor: 'pointer',
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 50,
                      }),
                    }}
                    isClearable
                  required={!isCancelChecked}/>
                  </div>
                </div>
              <div>
            <label className="block font-medium">Actual Budget:</label>
            <input
              type="number"
              name="Actual_Budget"
              value={formData.Actual_Budget}
              onChange={handleFormDataChange}
              disabled={formData.Train_Mode === "Internal" }
              autoComplete="off"
              className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 ${
                formData.Train_Mode === "Internal"
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>
      

</div>{" "}
<div className="flex items-end justify-between w-full p-4 gap-4">
  {/* Employee ID Input Section */}
  <div className="flex-1">
    <label htmlFor="EmployeeIds" className="block font-medium mb-1">
      Employee IDs:
    </label>
    <div className="relative">
      <Select
        id="EmployeeIds"
        name="EmployeeIds"
        closeMenuOnSelect={false}
        components={animatedComponents}
        isMulti
        options={employeeOptions}
        value={employeeOptions.filter((opt) =>
          (formData.EmployeeIds || []).includes(opt.value)
        )}
        onChange={(selectedOptions) => {
          const selectedValues = selectedOptions.map((opt) => opt.value);
          setFormData((prev) => ({
            ...prev,
            EmployeeIds: selectedValues,
            Persons: selectedValues.length.toString(),
          }));
        }}
        isDisabled={!!formData.Training_Status}
        getOptionLabel={(e) => e.label}
        formatOptionLabel={(data, { context }) =>
          context === "menu" ? data.label : data.value
        }
       required={!isCancelChecked}
        autoComplete="off"
        className="w-full text-gray-900 bg-white cursor-pointer"
        styles={{
          control: (base, state) => ({
            ...base,
            cursor: formData.Training_Status ? "not-allowed" : "pointer",
            backgroundColor: formData.Training_Status ? "#f3f4f6" : "#fff",
            borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
            boxShadow: state.isFocused
              ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
              : "none",
            padding: "1px",
            borderRadius: "0.5rem",
            minHeight: "2rem",
            display: "flex",
            alignItems: "center",
            overflowX: "auto",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          }),
          option: (base) => ({ ...base, cursor: 'pointer' }),
          menu: (base) => ({ ...base, zIndex: 50 }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: "#f3f4f6",
            whiteSpace: "nowrap",
            display: "inline-flex",
            maxWidth: "none",
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "#111827",
            whiteSpace: "nowrap",
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: "#6b7280",
            ":hover": {
              backgroundColor: "#e5e7eb",
              color: "#111827",
            },
          }),
          valueContainer: (base) => ({
            ...base,
            display: "flex",
            flexWrap: "wrap",
            overflowY: "auto",
            whiteSpace: "nowrap",
          }),
        }}
      />
    </div>
  </div>

  {/* Submit Button Section */}
  <div>
    <button
      type="submit"
      disabled={formData.Training_Status === "Completed"}
      className={`px-6 py-2 text-sm font-semibold text-white rounded-md shadow-md focus:ring-2 focus:ring-black-600 focus:ring-offset-2 ${
        formData.Training_Status === "Completed"
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-gray-600 hover:bg-gray-900 cursor-pointer"
      }`}
    >
      Submit
      {formData.Training_Status === "Completed" && (
        <FontAwesomeIcon
          icon={faTimes}
          className="ml-2 text-red-500"
          title="Disabled because training is completed"
        />
      )}
    </button>
  </div>
</div>
     {loading ? (
          <div className="text-center py-4">Loading data...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : formData.Program_Id && programDetails.length ? (
          <div className="card-body p-0 overflow-x-auto pb-3">
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
                  <div className="flex ">              <div className="flex items-center">
               <button
               type="button"
  onClick={exportToExcel}
  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
>
 <FaFileExcel size={18}  />
</button>

                    <button
                      type="button"
                      onClick={() =>
                        generatePdfForEmployees(formData.Program_Id)
                      }
                      className="flex items-center cursor-pointer justify-end bg-gray-600 text-white px-4 py-2 mx-2 rounded-sm hover:bg-gray-900 transition"
                    >
                      <FaPrint />
                    </button>
                    </div>

                           
                                    <div className="relative">
                      <input
                        type="text"
                        className="border p-1 pl-8 rounded bg-secondary"
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
                          { key: "Department", label: "Department" },
                          { key: "Section", label: "Section" },
                          { key: "Designation", label: "Designation" },
                          { key: "DOJ", label: "DOJ" },
                        ].map(({ key, label }, index) => (
                          <th
                            key={key}
                            className={`px-4 py-2 border text-left cursor-pointer ${
                              index === 0 ? "sticky left-0 bg-muted z-20" : ""
                            }`}
                            onClick={() => handleSort(key)}
                          >
                            {label}{" "}
                            {/* {sortConfig.key === key && (sortConfig.direction === "asc" ? "▲" : "▼")} */}
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
                            <td className="px-4 py-2 border ">
                              {item.EmployeeId}
                            </td>
                            <td className="px-4 py-2 border">
                              {item.Username}
                            </td>
                            <td className="px-4 py-2 border">
                              {item.Department}
                            </td>
                            <td className="px-4 py-2 border">{item.Section}</td>
                            <td className="px-4 py-2 border">
                              {item.Designation}
                            </td>
                            <td className="px-4 py-2 border">
                              {item.DOJ}
                            </td>
                          </tr>
                        ))
                      ) : // <tr>
                      //   <td colSpan="6" className="text-center py-4">
                      //     No results found.
                      //   </td>
                      // </tr>
                      filteredData.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            No results found.
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
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
          type="button"
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
        ) : (
          <div className="text-center py-4 text-gray-500">
            {dialogVisible && dialogMessage && (
              <div className="w-100 bg-blue-100 border border-blue-500 text-blue-700 px-4 py-3 rounded shadow z-50">
                <p className="text-sm">{dialogMessage}</p>
              </div>
            )}
            No data available.
          </div>
        )}
      </form>
      {/* Loading/Error Message */}
      {loading && <p className="text-center text-blue-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      </div>
  )
}
export default TrainingAttendanceForm;