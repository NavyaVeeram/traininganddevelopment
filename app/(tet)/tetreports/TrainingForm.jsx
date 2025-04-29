"use client";
import React, { useState, useEffect } from "react";

const TrainingEffectivenessForm = ({programId}) => {
  const [programDetails, setProgramDetails] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: "",
    programTitle: "",
    employeeID: "",
    trainerName: "",
    designation: "",
    modeOfTraining: "",
    section: "",
    duration: "",
    department: "",
    dateOfTraining: "",
    placeOfTraining: "",
    dateOfEvaluation: "",
    ratings: Array(10).fill(5), // Initialize all ratings to 0 (no selection)
    remarks: "",
  });

  // Fetch data on component mount
  useEffect(() => {
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

    fetchData();
  }, [programId]);

  const [averageRating, setAverageRating] = useState(0);
  const [percentage, setPercentage] = useState(0);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRatingChange = (index, rating) => {
    const newRatings = [...formData.ratings];
    newRatings[index] = rating;
    setFormData({ ...formData, ratings: newRatings });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Form submitted! Check console for data.");
  };

  useEffect(() => {
    const filledRatings = formData.ratings.filter(r => r > 0);
    const total = filledRatings.reduce((sum, r) => sum + r + 5 , 0); // Sum of ratings
    const maxPossible = parameters.length * 1 ; // 10 * 5 = 50
    if (filledRatings.length > 0) {
      setAverageRating(total); // now averageRating variable will store TOTAL
      setPercentage(((total / maxPossible) * 10).toFixed(2)); // % calculation
    } else {
      setAverageRating(0);
      setPercentage(0);
    }
  }, [formData.ratings]);

  // Fetch employee details by employee ID when clicked
  const fetchEmployeeDetails = async (employeeID) => {
    try {
      const res = await fetch(`/api/get_tet_form_emp_details?id=${employeeID}`);
      const data = await res.json();
      setSelectedEmployeeDetails(data);
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-sky-400 text-white p-2 rounded-t-lg">
        <h1 className="text-center font-bold text-xl">Training Effectiveness Tracing Form</h1>
      </div>

      {/* Selected Employee Details Display */}
      {selectedEmployeeDetails && (
        <div className="border p-4 mb-6 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">Selected Employee Details</h2>
          <table className="table-auto w-full text-sm">
            <tbody>
              {Object.entries(selectedEmployeeDetails).map(([key, value]) => (
                <tr key={key}>
                  <td className="font-semibold border px-2 py-1">{key.replace(/_/g, " ")}</td>
                  <td className="border px-2 py-1">{value?.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="overflow-x-auto mb-6">
          <table className="table-auto w-full border text-sm">
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2 font-semibold">Employee Name</td>
                  <td className="border px-4 py-2">{item.employeeName || "N/A"}</td>
                  <td className="border px-4 py-2 font-semibold">Program Title</td>
                  <td className="border px-4 py-2">{item.programTitle || "N/A"}</td>
                </tr>
              ))}
              {filteredData.map((item, index) => (
                <tr key={"empid-" + index}>
                  <td className="border px-4 py-2 font-semibold">Employee ID</td>
                  <td
                    className="border px-4 py-2 cursor-pointer text-blue-600 underline"
                    onClick={() => fetchEmployeeDetails(item.employeeID)}
                  >
                    {item.employeeID || "N/A"}
                  </td>
                  <td className="border px-4 py-2 font-semibold">Trainer Name</td>
                  <td className="border px-4 py-2">{item.trainerName || "N/A"}</td>
                </tr>
              ))}
              {filteredData.map((item, index) => (
                <tr key={"designation-" + index}>
                  <td className="border px-4 py-2 font-semibold">Designation</td>
                  <td className="border px-4 py-2">{item.designation || "N/A"}</td>
                  <td className="border px-4 py-2 font-semibold">Mode of Training</td>
                  <td className="border px-4 py-2">{item.modeOfTraining || "N/A"}</td>
                </tr>
              ))}
              {filteredData.map((item, index) => (
                <tr key={"section-" + index}>
                  <td className="border px-4 py-2 font-semibold">Section</td>
                  <td className="border px-4 py-2">{item.section || "N/A"}</td>
                  <td className="border px-4 py-2 font-semibold">Duration</td>
                  <td className="border px-4 py-2">{item.duration || "N/A"}</td>
                </tr>
              ))}
              {filteredData.map((item, index) => (
                <tr key={"department-" + index}>
                  <td className="border px-4 py-2 font-semibold">Department</td>
                  <td className="border px-4 py-2">{item.department || "N/A"}</td>
                  <td className="border px-4 py-2 font-semibold">Date of Training</td>
                  <td className="border px-4 py-2">{item.dateOfTraining || "N/A"}</td>
                </tr>
              ))}
              {filteredData.map((item, index) => (
                <tr key={"place-" + index}>
                  <td className="border px-4 py-2 font-semibold">Place of Training</td>
                  <td className="border px-4 py-2">{item.placeOfTraining || "N/A"}</td>
                  <td className="border px-4 py-2 font-semibold">Date of Evaluation</td>
                  <td className="border px-4 py-2">{item.dateOfEvaluation || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rating Table */}
        <div className="border mb-6 overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2" colSpan={2}>Rating</th>
                <th className="border p-2" colSpan={1}>1️⃣ Poor</th>
                <th className="border p-2" colSpan={1}>2️⃣ Average</th>
                <th className="border p-2" colSpan={1}>3️⃣ Good</th>
                <th className="border p-2" colSpan={1}>4️⃣ Very Good</th>
                <th className="border p-2" colSpan={2}>5️⃣ Excellent</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border p-2" rowSpan="2">S.No</th>
                <th className="border p-2" rowSpan="2">Parameters</th>
                <th className="border p-2" colSpan="5">Rating</th>
                <th className="border p-2" rowSpan="2">Rating</th>
              </tr>
              <tr className="bg-gray-100">
                {[1, 2, 3, 4, 5].map((num) => (
                  <th key={num} className="border p-2">{num}</th>
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
          <div className="text-lg">{averageRating}</div>
        </div>

        <div className="mt-4 flex justify-between border p-2">
          <div className="font-bold">Percentage</div>
          <div className="text-lg">{percentage}%</div>
        </div>

        {/* Score Range */}
        <div className="border mt-4 p-4">
          <table className="w-full table-auto border-collapse text-sm">
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
            name="remarks"
            className="w-full border p-2"
            rows="4"
            placeholder="Enter remarks..."
            onChange={handleInputChange}
          ></textarea>
        </div>

        {/* Footer */}
        <div className="flex justify-between text-xs text-gray-600 mt-6">
          <div>
            <div>T & D - HR</div>
            <div>Greentech Industries (India) Pvt. Ltd.</div>
          </div>
          <div>Authorized Person from concerned Dept</div>
        </div>

        {/* Submit Button */}
        <div className="text-end mt-6">
          <button
            type="submit"
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-900"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
    
  );
};

export default TrainingEffectivenessForm;
