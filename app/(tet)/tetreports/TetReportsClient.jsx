"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPrint, FaSearch } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";  // Import green tick icon
import Select from "react-select";
import makeAnimated from "react-select/animated";
import React from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from '@pdf-lib/fontkit';

const TetReportsClient = () => {


  const parameters = [
    "Benefit to the person/employee",
    "Benefit to the team",
    "Benefit to the section/department",
    "Improvement in process",
    "Improvement in technical knowledge",
    "Practical Working Improvement",
    "Creativity",
    "Meeting the department/section requirements",
    "Self/Managerial (Focused) Change",
    "Usefulness of the programme",
  ];
  const [percentage, setPercentage] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const searchParams = useSearchParams();
  const programId = searchParams.get("id"); // `id` represents the Program_Id

  const [formData, setFormData] = useState({
    Program_Id: '',
    EmployeeId: '',
    Overall: 0,
    Percentage: 0,
    CreatedBy: '',
    Remarks: '',
    ratings: Array(10).fill(5),
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [programName, setProgramName] = useState('');
  const [options, setOptions] = useState([]);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [allFormsFilled, setAllFormsFilled] = useState(false);
const [accessRole, setAccessRole] = useState(null);
const [isAuthorized, setIsAuthorized] = useState(null);
const [employeeId, setEmployeeId] = useState(null);
const [submittedEmployeeIds, setSubmittedEmployeeIds] = useState([]);

useEffect(() => {
  const fetchSubmittedEmployees = async () => {
    if (!programId) return;
    try {
      const res = await fetch(`/api/get_tet_form_emp_details_for_report?programId=${programId}`);
      if (!res.ok) {
        setSubmittedEmployeeIds([]);
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        setSubmittedEmployeeIds([]);
        return;
      }
      // Filter employees who have submitted (all Q_1 to Q_10 > 0)
      const submittedIdsFromApi = data
        .filter(emp => {
          for (let i = 1; i <= 10; i++) {
            const key = `Q_${i}`;
            if (!emp[key] || emp[key] <= 0) {
              return false;
            }
          }
          return true;
        })
        .map(emp => emp.EmployeeId);

      // Also get submitted IDs from localStorage
      let storedIds = [];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("submittedEmployeeIds");
        storedIds = stored ? JSON.parse(stored) : [];
      }

      // Merge and deduplicate
      const mergedIds = Array.from(new Set([...submittedIdsFromApi, ...storedIds]));

      setSubmittedEmployeeIds(mergedIds);

      // Update localStorage with merged IDs
      if (typeof window !== "undefined") {
        localStorage.setItem("submittedEmployeeIds", JSON.stringify(mergedIds));
      }
    } catch (error) {
      setSubmittedEmployeeIds([]);
    }
  };

  fetchSubmittedEmployees();
}, [programId]);
  // Set Program_Id dynamically when programId changes
  React.useEffect(() => {
    if (programId) {
      setFormData((prev) => ({ ...prev, Program_Id: programId }));
    }
  }, [programId]);

  // Set CreatedBy from localStorage on mount
  React.useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');
    if (storedEmployeeId) {
      setFormData((prev) => ({ ...prev, CreatedBy: storedEmployeeId }));
    }
  }, []);

  // Set EmployeeId dynamically when selectedEmployee changes
  React.useEffect(() => {
    if (selectedEmployee) {
      setFormData((prev) => ({ ...prev, EmployeeId: selectedEmployee.value }));
    }
  }, [selectedEmployee]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRatingChange = (index, rating) => {
    const newRatings = [...formData.ratings];
    newRatings[index] = rating;
    setFormData({ ...formData, ratings: newRatings });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (!formData.Program_Id || !formData.EmployeeId || !formData.CreatedBy) {
      alert("Please fill in all required fields: Program_Id, EmployeeId, CreatedBy.");
      return;
    }

    const payload = {
      Program_Id: formData.Program_Id,
      EmployeeId: formData.EmployeeId,
      Overall: Number(formData.Overall) || 0,
      Percentage: Number(formData.Percentage) || 0,
      CreatedBy: formData.CreatedBy,
      Remarks: formData.Remarks,
      Q_1: formData.ratings[0] || 0,
      Q_2: formData.ratings[1] || 0,
      Q_3: formData.ratings[2] || 0,
      Q_4: formData.ratings[3] || 0,
      Q_5: formData.ratings[4] || 0,
      Q_6: formData.ratings[5] || 0,
      Q_7: formData.ratings[6] || 0,
      Q_8: formData.ratings[7] || 0,
      Q_9: formData.ratings[8] || 0,
      Q_10: formData.ratings[9] || 0,
    };

    const res = await fetch('/api/post_tet_form_review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    alert(data.message);

    // After successful submission, re-check if all forms are filled to enable print button dynamically
    if (res.ok) {
      checkAllFormsFilled(programId);
      setSubmittedEmployeeIds((prev) => {
        const newIds = prev.includes(selectedEmployee?.value) ? prev : [...prev, selectedEmployee?.value];
        if (typeof window !== "undefined") {
          localStorage.setItem("submittedEmployeeIds", JSON.stringify(newIds));
        }
        return newIds;
      });
    }
  };
  useEffect(() => {
    const filledRatings = formData.ratings.filter((r) => r > 0);
    const total = filledRatings.reduce((sum, r) => sum + r, 0);
    const maxPossible = parameters.length * 5; // 10 * 5 = 50
  
    if (filledRatings.length > 0) {
      const average = total * 2; // or total / filledRatings.length if you want mean
      const percent = ((total / maxPossible) * 100).toFixed(2);
  
      setAverageRating(average);
      setPercentage(percent);
  
      // ✅ Update formData with these values
      setFormData((prev) => ({
        ...prev,
        Overall: average,
        Percentage: percent,
      }));
    } else {
      setAverageRating(0);
      setPercentage(0);
      setFormData((prev) => ({
        ...prev,
        Overall: 0,
        Percentage: 0,
      }));
    }
  }, [formData.ratings]);
     useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');
  
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    } else {
      window.location.href = '/';
      return;
    }
  
    const fetchAccessRole = async () => {
      try {
        const res = await fetch(`/api/get_access_role?employeeId=${storedEmployeeId}`);
        const data = await res.json();
  
        if (res.ok && data.Access_Role) {
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
  const [response, setResponse] = useState(null);

  // Generate PDF based on the filtered employee data
async function generatePdfForEmployees(programId) {
      const templatePath = "/Training_Effect_Tracing_Form.pdf";
      const label = "Training_Effectiveness_Filtered_Employees.pdf";
      const templateBytes = await fetch(templatePath).then((res) => res.arrayBuffer());
      const mergedPdf = await PDFDocument.create();

      // Register fontkit to embed custom fonts
      mergedPdf.registerFontkit(fontkit);

      // const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
const fontBytes = await fetch("/fonts/Cambria-01.ttf").then(res => res.arrayBuffer());

// Embed it in the PDF
const font = await mergedPdf.embedFont(fontBytes);
      // Embed tick image 
      const tickImageBytes = await fetch("/assets/tick.png").then(res => res.arrayBuffer());
      const tickImage = await mergedPdf.embedPng(tickImageBytes);
    const tickImageDims = tickImage.scale(0.015);
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
            // Customize on the first page
            // page.drawText(emp.Username || "", {
            //   x: 170,
            //   y: height - 55,
            //   size: 9,
            //   font,
            //   color: rgb(0, 0, 0),
            // });
             // Split  into two lines for drawing
                              const Username = emp.Username || "";
                              const words = Username.split(" ").filter(Boolean);
                              if (words.length > 4) {
                                // Draw all words in one line lower
                                page.drawText(Username, {
                                  x: 165,
                                  y: height - 55,
                                  size: 9,
                                  font,
                                  color: rgb(0, 0, 0),
                                });
                              } else {
                                // Draw all words in one line at top
                                page.drawText(Username, {
                                  x: 165,
                                  y: height - 55,
                                  size: 9,
                                  font,
                                  color: rgb(0, 0, 0),
                                });
                              }
            page.drawText(emp.EmployeeId || "", {
              x: 165,
              y: height - 77,
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
  
            page.drawText(emp.Designation || "", {
              x: 165,
              y: height - 100,
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(emp.Section || "", {
              x: 165,
              y: height - 120,
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(emp.Department || "", {
              x: 165,
              y: height - 142,
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(emp.Venue || "", {
              x: 165,
              y: height - 165,
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
               // Split Program_Name into two lines for drawing
                    const programName = emp.Program_Name || "";
                    const wordss = programName.split(" ").filter(Boolean);
                    if (wordss.length > 4) {
                      const mid = Math.ceil(wordss.length / 2);
                      const line1 = wordss.slice(0, mid).join(" ");
                      const line2 = wordss.slice(mid).join(" ");
                      page.drawText(line1, {
                        x: 385,
                        y: height - 46,
                        size: 9,
                        font,
                        color: rgb(0, 0, 0),
                      });
                      page.drawText(line2, {
                        x: 385,
                        y: height - 55, // Adjust line height as needed
                        size: 9,
                        font,
                        color: rgb(0, 0, 0),
                      });
                    } else {
                      page.drawText(programName, {
                        x: 385,
                        y: height - 55,
                        size: 9,
                        font,
                        color: rgb(0, 0, 0),
                      });
                    }
            page.drawText(emp.Trainer || "", {
              x: 385,
              y: height - 75,
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });

            // Draw tick image instead of SVG path
            const mode = emp.Train_Mode;
            let xPos = 420;
            if (mode === "Internal") {
              xPos = 420;
            } else if (mode === "External") {
              xPos = 458;
            } else if (mode === "Overseas") {
              xPos = 518;
            }
            const yPos = height - 93;
            const imageWidth = 15;
            const imageHeight = 15;
            page.drawImage(tickImage, {
              x: xPos,
              y: yPos,
              width: imageWidth,
              height: imageHeight,
            });

            page.drawText(String(emp.No_Hrs +""+ "hrs") || "", {
              x: 385,
              y: height - 118,
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
             page.drawText(String(Evaluation_Date) || "", {
              x: 385,
              y: height - 142,
              size:9,
              font,
              color: rgb(0, 0, 0),
            });   

            page.drawText(String(formattedTrainingDate) || "", {
              x: 385,
              y: height - 142,
              size:9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(formattedEvaluationDate) || "", {
              x: 385,
              y: height - 164,
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(emp.Q_1) || "", {
              x: 538,
              y: height -230, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(emp.Q_2) || "", {
              x: 538,
              y: height -255, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(emp.Q_3) || "", {
              x: 538,
              y: height -278, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(emp.Q_4) || "", {
              x: 538,
              y: height -303, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(emp.Q_5) || "", {
              x: 538,
              y: height -327, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(emp.Q_6) || "", {
              x: 538,
              y: height -350, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(emp.Q_7) || "", {
              x: 538,
              y: height -376, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(emp.Q_8) || "", {
              x: 538,
              y: height -400, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(emp.Q_9) || "", {
              x: 538,
              y: height -423, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(emp.Q_10) || "", {
              x: 538,
              y: height -448, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(emp.Overall) || "", {
              x: 538,
              y: height - 474, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(String(emp.Percentage) || "", {
              x: 538,
              y: height - 491, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            page.drawText(emp.Remarks || "", {
              x: 105,
              y: height - 585, 
              size: 9,
              font,
              color: rgb(0, 0, 0),
            });
            let ratingYPositions = [229, 256, 281, 305.5, 329.5, 353.5, 378, 403, 427, 452];
                      for (let idx = 0; idx < 10; idx++) {
        const rating = emp[`Q_${idx + 1}`];
        let rowY = height - ratingYPositions[idx];
        let xOffset = 385 + (rating - 1) * 10;
        if (rating === 1) {
          xOffset = 390;
        } else if (rating === 2) {
          xOffset = 424;
        } else if (rating === 3) {
          xOffset = 453;
        } else if (rating === 4) {
          xOffset = 480;
        } else if (rating === 5) {
          xOffset = 509;
        }
        if (rating > 0) {
          page.drawImage(tickImage, { x: xOffset, y: rowY, width: tickImageDims.width, height: tickImageDims.height });
        }
      }
       }

          mergedPdf.addPage(page);
        });
      }

      const finalPdfBytes = await mergedPdf.save();
      const blob = new Blob([finalPdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = label;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

  // Fetch program data for the selected program
  useEffect(() => {
    if (programId) {
      setLoading(true);
      fetchProgramData();
      checkAllFormsFilled(programId);
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
      }

      if (!Array.isArray(empData) || empData.length === 0 || empData.every((emp) => !emp.EmployeeId)) {
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

  // Check if all forms are filled for the program
  const checkAllFormsFilled = async (programId) => {
    try {
      const res = await fetch(`/api/get_tet_form_emp_details_for_report?programId=${programId}`);
      if (!res.ok) {
        setAllFormsFilled(false);
        return;
      }
      const data = await res.json();
      console.log("checkAllFormsFilled data:", data); // Debug log
      if (!Array.isArray(data) || data.length === 0) {
        setAllFormsFilled(false);
        return;
      }
      // Check if all employees have filled forms
      // Assuming form is filled if all Q_1 to Q_10 fields are non-null and > 0
      const allFilled = data.every(emp => {
        for (let i = 1; i <= 10; i++) {
          const key = `Q_${i}`;
          if (!emp[key] || emp[key] <= 0) {
            return false;
          }
        }
        return true;
      });
      setAllFormsFilled(allFilled);
    } catch (error) {
      setAllFormsFilled(false);
    }
  };

  // Fetch employee data options for the dropdown
 useEffect(() => {
  const fetchDropdownData = async () => {
    try {
      const storedEmployeeId = localStorage.getItem('employeeId');
      if (!storedEmployeeId) return;

      const res = await fetch(`/api/get_tet_form_user_dropdown?programId=${programId}&EmployeeId=${storedEmployeeId}`);
      const data = await res.json();

      const formattedOptions = data.map((item) => ({
        value: item.Value,
        label: `${item.Text}`,
      }));

      setOptions(formattedOptions);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  fetchDropdownData();
}, [programId]); // 👈 Triggered when programId changes


  // Fetch employee details based on selected EmployeeId
  useEffect(() => {
    if (selectedEmployee) {
      setLoading(true);
      fetchEmployeeDetails(selectedEmployee.value);
    }
  }, [selectedEmployee]);

  const fetchEmployeeDetails = async (employeeId) => {
    setLoading(true); // Set loading state to true before fetching data
    try {
      const res = await fetch(`/api/get_tet_form_emp_details_for_report_empid?programId=${programId}&employeeId=${employeeId}`);
      const data = await res.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        setEmployeeDetails(data[0]);
        setErrorMessage(""); // Clear any previous error messages
      } else {
        setEmployeeDetails(null);
        setErrorMessage("No details available for the selected employee.");
      }
    } catch (error) {
      setEmployeeDetails(null); // Clear employee details if an error occurs
      setErrorMessage("Error fetching employee details.");
    } finally {
      setLoading(false); // Always stop loading, whether success or failure
    }
  };
  
  useEffect(() => {
    setIsMounted(true); // Set the mounted state to true once the component is mounted
  }, []);

  // Sync employeeDetails Q_1 to Q_10 into formData.ratings and Remarks
  useEffect(() => {
    if (employeeDetails) {
      const newRatings = [];
      for (let i = 1; i <= 10; i++) {
        const key = `Q_${i}`;
        const ratingValue = employeeDetails[key];
        newRatings.push(ratingValue !== null && ratingValue !== undefined ? Number(ratingValue) : 5);
      }
      setFormData((prev) => ({
        ...prev,
        ratings: newRatings,
        Remarks: employeeDetails.Remarks || '',
        Overall: employeeDetails.Overall !== null && employeeDetails.Overall !== undefined ? employeeDetails.Overall : 0,
        Percentage: employeeDetails.Percentage !== null && employeeDetails.Percentage !== undefined ? employeeDetails.Percentage : 0,
      }));
    }
  }, [employeeDetails]);
  
  if (!isMounted) {
    return null; // Ensure nothing is rendered until the component has mounted
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
      <div className="bg-sky-400 text-white p-2 rounded-t-lg flex justify-between items-center">
        <h1 className="font-semibold">
          TET Report Generation
{programName && (
  <>
  <span className="font-semibold text-[#f8e111]"> {'(' + programName + ')'}</span>
  </>
)}
        </h1>
        {/* important code dont delete it  */}
        {/* <div className="flex mt-2 lg:mt-0 w-full lg:w-auto justify-start">
{accessRole === "HR_Res" && (
  <button
    type="button"
    onClick={() => {
      if (allFormsFilled) {
        generatePdfForEmployees(programId);
      } else {
        alert("Please fill all the forms before printing.");
      }
    }}
    disabled={!allFormsFilled}
    className={`flex items-center justify-end px-4 py-2 rounded-sm transition ${
      allFormsFilled
        ? "bg-gray-600 text-white hover:bg-gray-900"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`}
  >
    
    <FaPrint />
  </button>
)}
        </div> */}
      </div>
        <div className="my-4 relative z-0">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Select EmpId</label>
  <Select
  options={options}
  onChange={(selectedOption) => {
    setSelectedEmployee(selectedOption);
    console.log(selectedOption); // Log the selected employee
  }}
  placeholder="Select an Employee Id"
  styles={{
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "none",
      padding: "1px",
      borderRadius: "0.5rem",
      minHeight: "2rem",
      display: "flex",
      alignItems: "center",
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
  className="w-[400px]"
  components={{
    Option: (props) => {
      const { data, innerRef, innerProps } = props;
      return (
        <div ref={innerRef} {...innerProps} className="flex items-center justify-between px-2 py-1">
          <div>{data.label}</div>
          {submittedEmployeeIds.includes(data.value) && (
            <FaCheckCircle className="text-green-500" />
          )}
        </div>
      );
    },
  }}
/>

</div>
</div>
{/* 
      </div> */}
     
        {/* Personal Info */}
    
      {loading && <p>Loading...</p>}
      {errorMessage && <p>{errorMessage}</p>}
      {employeeDetails && (
        <div className="max-w-5xl mx-auto p-6">
        <div className="bg-sky-400 text-white p-2 rounded-t-lg">
          <h1 className="text-center font-bold text-xl">Training Effectiveness Evaluation</h1>
    </div>
    <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto mb-6">
         <table className="table-fixed w-full border text-sm">
            <tbody>
          <tr>
          <td className="border px-4 py-2 font-semibold">Employee Name</td>
          <td className="border px-4 py-2">{ employeeDetails.Username}</td>
          <td className="border px-4 py-2 font-semibold">Program Title</td>
          <td className="border px-4 py-2">{employeeDetails.Program_Name}</td>
        </tr>
        <tr>
        <td className="border px-4 py-2 font-semibold">Employee ID</td>
        <td className="border px-4 py-2">{employeeDetails.EmployeeId}</td>
        <td className="border px-4 py-2 font-semibold">Trainer Name</td>
        <td className="border px-4 py-2">{employeeDetails.Trainer}</td>
      </tr>
      <tr>
        <td className="border px-4 py-2 font-semibold">Designation</td>
        <td className="border px-4 py-2">{employeeDetails.Designation}</td>
        <td className="border px-4 py-2 font-semibold">Mode of Training</td>
        <td className="border px-4 py-2">{employeeDetails.Train_Mode}</td>
      </tr>
      <tr>
        <td className="border px-4 py-2 font-semibold">Section</td>
        <td className="border px-4 py-2">{employeeDetails.Section}</td>
        <td className="border px-4 py-2 font-semibold">Duration</td>
        <td className="border px-4 py-2">{employeeDetails.No_Hrs} hrs</td>
      </tr>
      <tr>
        <td className="border px-4 py-2 font-semibold">Department</td>
        <td className="border px-4 py-2">{employeeDetails.Department}</td>
        <td className="border px-4 py-2 font-semibold">Date of Training</td>
<td className="border px-4 py-2">{employeeDetails.Training_Date}</td>
      </tr>
      <tr>
        <td className="border px-4 py-2 font-semibold">Place of Training</td>
        <td className="border px-4 py-2">{employeeDetails.Venue}</td>
        <td className="border px-4 py-2 font-semibold">Date of Evaluation</td>
<td className="border px-4 py-2">{employeeDetails.Evaluation_Date}</td>
      </tr>
        </tbody>
            
    </table>
    </div>
    <div className="border mb-6 overflow-x-auto">
    <div className="flex justify-around bg-gray-100 font-bold text-center">
  <div className="flex items-center justify-center  mx-9">
    Rating
  </div>
  <div className="flex p-1">
    <div className="mx-4">1️⃣ Poor</div>
    <div className="mx-4">2️⃣ Average</div>
    <div className="mx-4">3️⃣ Good</div>
    <div className="mx-4">4️⃣ Very Good</div>
    <div className="mx-4">5️⃣ Excellent</div>
  </div>
</div>

  <table className="w-full table-fixed text-sm">
    <thead>
      <tr className="bg-gray-100">
        <th className="border p-2" rowSpan="2">S.No</th>
        <th className="border p-2 w-64" rowSpan="2">Parameters</th>
        <th className="border p-2" colSpan="5">Rating</th>
        <th className="border p-2" rowSpan="2">Selected</th>
      </tr>
      <tr className="bg-gray-100">
        {[1, 2, 3, 4, 5].map((num) => (
          <th key={num} className="border p-2 w-[80px]">{num}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {parameters.map((param, index) => (
        <tr key={index}>
          <td className="border p-2 text-center">{index + 1}</td>
          <td className="border p-2">{param}</td>
          {[1, 2, 3, 4, 5].map((rating) => (
            <td className="border p-2 text-center" key={rating}>
              <input
                type="radio"
                name={`rating-${index}`}
                checked={formData.ratings[index] === rating}
                onChange={() => handleRatingChange(index, rating)}
              />
            </td>
          ))}
          <td className="border p-2 text-center">{formData.ratings[index]}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        <div className="mt-4 flex justify-between border p-2">
        <div className="font-bold">Overall Rating</div>
        {/* <div className="text-lg">{averageRating}</div> */}
        <input name="Overall" type="number" value={formData.Overall ?? 0} readOnly className="bg-gray-100" />      </div>

        <div className="mt-4 flex justify-between border p-2">
            <div className="font-bold">Percentage</div>
            <input name="Percentage" type="number" value={formData.Percentage ?? 0} readOnly className="bg-gray-100" />
            {/* <div className="text-lg">{percentage}%</div> */}
          </div>

        {/* Score Range */}
        <div className="border mt-4 p-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border p-2">&lt;35</th>
                <th className="border p-2">36-50</th>
                <th className="border p-2">51-70</th>
                <th className="border p-2">71-85</th>
                <th className="border p-2">86-100</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 text-center">Poor</td>
                <td className="border p-2 text-center">Adequate</td>
                <td className="border p-2 text-center">Good</td>
                <td className="border p-2 text-center">Very Good</td>
                <td className="border p-2 text-center">Excellent</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-2 text-sm">Note: Retraining will be conducted if percentage is below 50</div>
        </div>
        {/* Remarks */}
        <div className="mb-6 mt-6">
          <label className="block font-semibold mb-2">HOD/HOS Remarks (If any):</label>
          <textarea
            name="Remarks"
            className="w-full border p-2"
            rows="4"
            placeholder="Enter remarks..."
            value={formData.Remarks ?? ''}
            onChange={handleInputChange}
          ></textarea>
        </div>

     {/* Footer */}
      <div className="flex justify-between text-xs text-gray-600 mt-9">
              <div>
                <div>T & D - HR</div>
                <div>Greentech Industries (India) Pvt. Ltd.</div>
              </div>
              <div>Authorized Person from concerned Dept</div>
             </div>
             <div className="flex justify-end text-xs text-gray-600 mb-2 gap-90">
                 <div>Greentech Industries (India) Pvt. Ltd.</div>
                 <div className="text-xs text-gray-600"> HR-040-3</div>
             </div>
          
<div className="flex justify-end">
<button
       type="submit"
       className="px-6 py-2 text-sm font-semibold cursor-pointer text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"          >
    submit</button>
</div>
   
    </form>
    </div>
      )}

    </div>


  );
};

export default TetReportsClient; 