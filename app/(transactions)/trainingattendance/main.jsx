
"use client";
import { useState, useEffect, useRef } from "react";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaFilePdf, FaSearch, FaPrint } from "react-icons/fa";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";
const DatePicker = dynamic(() => import("react-datepicker"), { ssr: false });
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from '@pdf-lib/fontkit';
const animatedComponents = makeAnimated();

const TrainingAttendanceForm = () => {
    const [mounted, setMounted] = useState(false);
    const [year, setYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(null);
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
      Venue: "",
      Actual_Budget: "",
      CreatedBy: typeof window !== "undefined" ? localStorage.getItem("employeeId") || "" : "",
      EmployeeIds: [],
      selectedMonth: "",
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
  const [selectedDate, setSelectedDate] = useState(null);
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
    });
    setYear("");
    setSelectedMonth(null);
    setSelectedDate(null);
    setOptions([]);
    setIsCancelChecked(false); // <-- Reset Cancel checkbox
  };

  const handleTrainModeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      Train_Mode: e.target.value,
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
      const res = await fetch("/api/user_dropdown");
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

  const dialogMessageRef = useRef("");

  useEffect(() => {
    dialogMessageRef.current = dialogMessage;
  }, [dialogMessage]);
  useEffect(() => {
    if (formData.Program_Id) {
      fetchTrainingData(formData.Program_Id);
    }
  }, [formData.Program_Id]);

  const fetchTrainingData = async (programId) => {
    try {
      if (!programId) {
        setDialogVisible(false);
        setDialogMessage("");
        return;
      }

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
        selectedMonth: trainingData.Training_Status || "",
        Forward: trainingData.Forward || "",
        Schedule_Type: trainingData.Schedule_Type || "",
        Trainer: trainingData.Trainer || "",
        Venue: trainingData.Venue || "",
        Actual_Budget: trainingData.Actual_Budget || "",
        EmployeeIds: trainingData.EmployeeId
          ? trainingData.EmployeeId.split(",").map((id) => id.trim())
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

    const selectedMonth = date.getMonth() + 1;
    const selectedYear = date.getFullYear();
    setFormData((prev) => ({
      ...prev,
      selectedMonth: `${selectedMonth}-${selectedYear}`,
    }));

    try {
      const res = await fetch(
        `/api/get_training_attendance_dropdown?month=${selectedMonth}&year=${selectedYear}`
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

        if (res.ok && data.Access_Role) {
          // Restrict access for HR_Res and HR_HOD roles
          if (data.Access_Role === "HOS" || data.Access_Role === "HOD" || data.Access_Role === "Res_Person") {
            setIsAuthorized(false);
            //
           // window.location.href = '/unauthorized';
           return;
         }
         setAccessRole(data.Access_Role);
         setIsAuthorized(true);
       } else {
         setIsAuthorized(false);
       }
     } catch (error) {
       console.error('Error fetching access role:', error);
       setIsAuthorized(false);
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
      await fetchTrainingData(selectedProgramId);
      const [empRes, nameRes] = await Promise.all([
        fetch(`/api/get_tet_form_emp_details?id=${selectedProgramId}`),
        fetch(`/api/get_tet_form_program_name?id=${selectedProgramId}`),
      ]);
      const empData = await empRes.json();
      const nameData = await nameRes.json();
      if (nameData?.[0]) {
        setProgramDetails(empData);
        setFilteredData(empData);
      } else {
        throw new Error("No training data available");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const { EmployeeIds, selectedMonth, Training_Date } = formData;
      //alert(selectedMonth,Training_Date);
      if (!Training_Date && !selectedMonth) {
        alert("Either Training Date or Training Status must be selected.");
        return;
      }
      if (Training_Date) {
        const maxAllowedEmployees = Number(formData.Persons) || 0;

        if (
          EmployeeIds.length > maxAllowedEmployees ||
          EmployeeIds.length === 0 ||
          EmployeeIds.length < maxAllowedEmployees
        ) {
          alert(
            `You can only select up to ${maxAllowedEmployees} employee(s).`
          );
          setMessage("");
          setIsMessageVisible(false);
          return;
        }
      }
      const formDataToSend = {
        Program_Id: Number(formData.Program_Id),
        Persons: formData.Persons,
        No_Hrs: formData.No_Hrs,
        Training_Date: formData.Training_Date,
        Training_Status: formData.selectedMonth || null,
        Schedule_Type: formData.Schedule_Type || null,
        Trainer: formData.Trainer || null,
        Venue: formData.Venue || null,
        Actual_Budget: formData.Actual_Budget || null,
        EmployeeIds: formData.EmployeeIds || null,
        CreatedBy: (formData.CreatedBy || localStorage.getItem("employeeId") || "").trim(),
        Cancel: document.getElementById("Cancel")?.checked ? 1 : 0, // Pass as bit value
      };
      setLoading(true);
      const res = await fetch("/api/update_trainingdata_att_entry_submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataToSend),
      });
      const responseData = await res.json();
      if (res.ok) {
        alert(responseData.message);
        if (
          formData.EmployeeIds &&
          formData.EmployeeIds.length > 0 &&
          formData.Training_Date
        ) {
          const attendanceRes = await fetch(
            "/api/insert_emp_att_program_wise",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
             body: JSON.stringify({
  Program_Id: Number(formData.Program_Id),
  EmployeeIds: Array.isArray(formData.EmployeeIds)
    ? formData.EmployeeIds
    : formData.EmployeeIds.split(','),
  CreatedBy: (formData.CreatedBy || localStorage.getItem("employeeId") || "").trim(),
}),

            }
          );

          const attendanceData = await attendanceRes.json();
          if (attendanceRes.ok) {
            console.log(
              "Employee attendance inserted:",
              attendanceData.message
            );
          } else {
            console.error("Attendance insert failed:", attendanceData.message);
          }
        }
        setMessage("");
        setIsMessageVisible(false);
        setDialogVisible(false);
        setDialogMessage("");
        resetForm();
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
const fontBytes = await fetch("/fonts/Cambria-01.ttf").then(res => res.arrayBuffer());

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
                                    size: 11,
                                    font,
                                    color: rgb(0, 0, 0),
                                  });
                                  // Draw remaining words on next line lower
                                  page.drawText(secondLine, {
                                    x: 140,
                                    y: height - 85,
                                    size: 11,
                                    font,
                                    color: rgb(0, 0, 0),
                                  });
                                } else {
                                  // Draw all words in one line at top
                                  page.drawText(Username, {
                                    x: 140,
                                    y: height - 70,
                                    size: 11,
                                    font,
                                    color: rgb(0, 0, 0),
                                  });
                                }
          // Customize on first page
          page.drawText(String(emp.EmployeeId || "") , {
            x: 140,
            y: height - 104,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(String(emp.Designation || "") , {
            x: 140,
            y: height - 138,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(String(emp.Section || "") , {
            x: 140,
            y: height - 173,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(String(emp.Department || "") , {
            x: 140,
            y: height - 208,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });
          // Split Program_Name into two lines for drawing
        // Split Program_Name into two lines for drawing  
         const ProgramName = emp.Program_Name || "";
                                if (ProgramName.length > 35) {
                                  const firstLine = ProgramName.substring(0, 35);
                                  const secondLine = ProgramName.substring(35);
                                  page.drawText(firstLine, {
                                    x: 375,
                                    y: height - 70,
                                    size: 11,
                                    font,
                                    color: rgb(0, 0, 0),
                                  });
                                  page.drawText(secondLine, {
                                    x: 375,
                                    y: height - 85,
                                    size: 11,
                                    font,
                                    color: rgb(0, 0, 0),
                                  });
                                } else {
                                  page.drawText(ProgramName, {
                                    x: 375,
                                    y: height - 70,
                                    size: 11,
                                    font,
                                    color: rgb(0, 0, 0),
                                  });
                                }
          page.drawText(String(emp.Trainer || "") , {
            x: 375,
            y: height - 104,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(String(emp.Train_Mode || "") , {
            x: 375,
            y: height - 139,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });

          page.drawText(String(emp.No_Hrs + "hr") || "", {
            x: 375,
            y: height - 173,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });

          page.drawText(String(emp.Training_Date) || "", {
            x: 375,
            y: height - 208,
            size: 11,
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

  if (!mounted) {
    return null;
  }
const programOptions = options.map((option) => ({
  value: option.Value,
  label: option.Text,
}));

     // 🔒 Unauthorized view
  if (isAuthorized === null) {
    return (
      <div>
        Loading...
        </div>

      // <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
      //   <div className="bg-white p-10 rounded shadow text-center">
      //     <h2 className="text-2xl font-bold">loading...</h2>
      //   </div>
      // </div>
    );
  }
    // 🔒 Unauthorized view
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

      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-3 w-full">
          {/* Year Selection */} 
          <div className="md:col-span-1">
            <label className="block font-medium w-full">Select Year:</label>
            <DatePicker
              selected={selectedDate}
              onChange={handleMonthYearChange}
              dateFormat="MMM-yyyy"
              showMonthYearPicker
              placeholderText="Select Month and Year"
              className="w-full pl-4 pr-20 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Program Selection */}
          <div className="md:col-span-4">
            <label className="block font-medium">Select Program:</label>
            <div className="relative">
              <Select
                 isRequired
                isDisabled={!selectedDate || loading}
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
      className="w-[500px] cursor-pointer"
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
  <div className="flex items-center justify-start">
              <div className="flex items-center  gap-2 mt-6">
          <label htmlFor="Cancel" className="font-medium">
            Cancel
          </label>
          <input
                      type="checkbox"
                      id="Cancel"
                      name="Cancel"
                      className="w-5 h-4 cursor-pointer"
                      checked={isCancelChecked}
                      onChange={() => setIsCancelChecked((prev) => !prev)}
                      disabled={!!formData.Training_Date}
                    />
        </div>
        </div>
            </div>
            {/* Align these fields in a single row */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-2 w-full">
              <div>
              <label className="block font-medium">Category :</label>
              <input
                type="text"
                value={formData.Training_Name}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
              />
              </div>
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
                  className="form-radio"
                  required
                  />
                  <span className="ml-1">{mode}</span>
                </label>
                ))}
              </div>
              </div>
              {/* Number of Hours */}
              <div>
              <label className="block font-medium">Number of Hours:</label>
              <input
                type="number"
                name="No_Hrs"
                value={formData.No_Hrs}
                onChange={handleFormDataChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
                required
                min="1"
              />
              </div>
              {/* Number of Persons */}
              <div>
              <label htmlFor="Persons" className="block font-medium">
                Number of Persons:
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
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
                      selectedMonth: "",
                      Schedule_Type: "",
                      Trainer: "",
                      Venue: "",
                      Actual_Budget: "",
                      EmployeeIds: [],
                    }),
                  }));
                  // Reset Cancel checkbox when Training_Date changes
                  setIsCancelChecked(false);
                }}
                disabled={!!formData.selectedMonth}
                className={`w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 ${
                formData.selectedMonth ? "bg-gray-100 cursor-not-allowed" : ""
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
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-2">
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
                        disabled={!!formData.selectedMonth}
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
                        disabled={!!formData.selectedMonth}
                      />
                      <span className="mx-2">Additional</span>
                    </label>
                  </div>
                </div>

                {/* Trainer */}
                <div>
                  <label htmlFor="Trainer" className="block font-medium">
                    Trainer
                  </label>
                  <div className="relative">
                    <Select
                      id="Trainer"
                      name="Trainer"
                    options={mappedTrainerOptions}
                    value={
                      mappedTrainerOptions.find(
                        (opt) => opt.value === formData.Trainer
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      setFormData({
                        ...formData,
                        Trainer: selectedOption?.value || "",
                      })
                    }
                    placeholder="Select Trainer"
                    isSearchable
                    required
                    autoComplete="off"
                    className="text-gray-900 cursor-pointer"
                    isDisabled={!!formData.selectedMonth}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        cursor: !!formData.selectedMonth ? "not-allowed" : "pointer",
                        borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                        boxShadow: state.isFocused
                          ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
                          : "none",
                        padding: "1px",
                        borderRadius: "0.5rem",
                        minHeight: "2rem",
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: !!formData.selectedMonth ? "#f3f4f6" : "#fff",
                      }),
                      option: (base) => ({
                        ...base,
                        cursor: 'pointer',
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

                {/* Venue */}
                <div>
                  <label htmlFor="Venue" className="block font-medium">
                    Venue:
                  </label>
                  <div className="relative">
                    <Select
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
                    placeholder="Select Venue"
                    className="text-gray-900 rounded-md cursor-pointer"
                    isDisabled={!!formData.selectedMonth}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        cursor: !!formData.selectedMonth ? "not-allowed" : "pointer",
                        backgroundColor: !!formData.selectedMonth ? "#f3f4f6" : "#fff",
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
                  required/>
                  </div>
                </div>
              <div>
            <label className="block font-medium">Actual Budget:</label>
            <input
              type="number"
              name="Actual_Budget"
              value={formData.Actual_Budget}
              onChange={handleFormDataChange}
              disabled={formData.Train_Mode === "Internal"}
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
        isDisabled={!!formData.selectedMonth}
        getOptionLabel={(e) => e.label}
        formatOptionLabel={(data, { context }) =>
          context === "menu" ? data.label : data.value
        }
        required
        autoComplete="off"
        className="w-full text-gray-900 bg-white cursor-pointer"
        styles={{
          control: (base, state) => ({
            ...base,
            cursor: formData.selectedMonth ? "not-allowed" : "pointer",
            backgroundColor: formData.selectedMonth ? "#f3f4f6" : "#fff",
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
      disabled={formData.selectedMonth === "Completed"}
      className={`px-6 py-2 text-sm font-semibold text-white rounded-md shadow-md focus:ring-2 focus:ring-black-600 focus:ring-offset-2 ${
        formData.selectedMonth === "Completed"
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-gray-600 hover:bg-gray-900 cursor-pointer"
      }`}
    >
      Submit
      {formData.selectedMonth === "Completed" && (
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
                  <div className="flex ">
                          {" "}
{accessRole === "HR_Res" && (
              
                    <button
                      type="button"
                      onClick={() =>
                        generatePdfForEmployees(formData.Program_Id)
                      }
                      className="flex items-center cursor-pointer justify-end bg-gray-600 text-white px-4 py-2 mx-2 rounded-sm hover:bg-gray-900 transition"
                    >
                      <FaPrint />
                    </button>
)}
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
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
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
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {dialogVisible && dialogMessage && (
              <div className="w-100 bg-blue-100 border border-blue-500 text-blue-700 px-4 py-3 rounded shadow z-50">
                <p className="text-sm">{dialogMessage}</p>
              </div>
            )}
            {isMessageVisible && (
              <div className="mt-4 flex flex-col items-start">
                <label className="block font-medium">Message:</label>
                <input
                  type="text"
                  value={message}
                  readOnly
                  className="w-1/4 p-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100"
                />
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
  );
};

export default TrainingAttendanceForm;