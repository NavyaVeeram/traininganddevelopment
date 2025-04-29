"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch } from "react-icons/fa";
import Select from "react-select";

export default function UploadMaterials() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [uploadedData, setUploadedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [trainerOptions, setTrainerOptions] = useState([]);
  const [trainingDate, setTrainingDate] = useState("");
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [options, setOptions] = useState([]);
  const [fileUrl, setFileUrl] = useState(null);
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
    Training_Budget: "",
    CreatedBy: "admin",
    EmployeeIds: [],
    selectedMonth: "",
  });
  const resetForm = () => {
    setFormData({
      Program_Id: "",
      Persons: "",
      No_Hrs: "",
      Training_Date: "",
      Train_Mode: "",
      Training_Name: "",
      Training_Status: "",
      Schedule_Type: "",
      Trainer: "",
      Venue: "",
      Training_Budget: "",
      CreatedBy: "admin",
      selectedMonth: "",
      EmployeeIds: [],
    });
    setSelectedDate(null);
    setFile(null);
    setUploadSuccess(null);
    setOptions([]);
  };
  const mappedTrainerOptions = trainerOptions.map((trainer) => ({
    value: trainer.Value,
    label: trainer.Text,
  }));

useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await fetch("/api/qualified_trainer_dropdown");
        const data = await res.json();
        setTrainerOptions(data);
      } catch (err) {
        console.error("Failed to fetch trainers:", err);
      }
    };

    fetchTrainers();
  }, []);

  useEffect(() => {
    if (formData.Program_Id) {
      fetchTrainingData(formData.Program_Id);
    }
  }, [formData.Program_Id]);

  const fetchTrainingData = async (programId) => {
    try {
      const res = await fetch(
        `/api/get_training_att_entry?program_id=${programId}`
      );
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Error fetching training details");

      const trainingData = data[0] || {};

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
        Training_Budget: trainingData.Training_Budget || "",
        EmployeeIds: trainingData.EmployeeId
          ? trainingData.EmployeeId.split(",").map((id) => id.trim())
          : [],
      }));
    } catch (err) {
      setError(err.message);
    }
  };

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
        setOptions(data);
      } else {
        throw new Error(data.error || "Error fetching data");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !formData.Training_Date || !formData.Program_Id) {
      alert("File, Training Date, or Program ID is missing!");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("program_id", formData.Program_Id);

    try {
      console.log("Uploading file...");

      const response = await fetch("/api/upload_files", {
        method: "POST",
        body: uploadData,
      });

      const data = await response.json();

      if (response.ok && data.message === "File uploaded successfully") {
        try {
          const insertRes = await fetch("/api/insert_upload_materials_status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Program_Id: formData.Program_Id,
              IsUpload: 1,
              CreatedBy: "admin",
            }),
          });

          const insertData = await insertRes.json();

          if (insertRes.ok) {
            alert(insertData.message);
          } else {
            console.error("Error saving upload status:", insertData.message);
          }
        } catch (err) {
          console.error("Error inserting upload status:", err.message);
        }

        setErrorMessage("");
        setFileList((prev) => [...prev, data.fileUrl]);

        setFile(null);
        document.getElementById("fileInput").value = "";

        resetForm();
        fetchUploadedData();
      } else {
        console.error("Error uploading file:", data);
        setErrorMessage("Error uploading file");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setErrorMessage("Upload failed.");
    }
  };

  useEffect(() => {
    fetchUploadedData();
  }, []);

  const fetchUploadedData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/view_upload_materials");
      const data = await res.json();
      //if (!res.ok) throw new Error(data.error || "Error loading data");

      setUploadedData(data);
      setFilteredData(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];

  const totalPages =
    rowsPerPage === "All"
      ? 1
      : Math.ceil(safeFilteredData.length / rowsPerPage);

  const paginatedData =
    rowsPerPage === "All"
      ? safeFilteredData
      : safeFilteredData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );
  const handleTableSearchChange = (e) => {
    const searchQuery = e.target.value;
    setTableSearchTerm(searchQuery);

    if (!searchQuery) {
      setFilteredData(programDetails);
    } else {
      const filtered = programDetails.filter((trainer) =>
        [
          "Training_Name",
          "Program_Name",
          "Year_No",
          "Department",
          "Trainer",
          "Training_Date",
          "Train_Mode",
        ].some((field) =>
          trainer[field]
            ?.toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  };
  useEffect(() => {
    fetch(`/api/get_file_by_program_id?id=${formData.Program_Id}`)
      .then(res => res.json())
      .then(data => {
        if (data.file) {
          setFileUrl(data.file);
        }
      })
      .catch(err => {
        console.error("Failed to fetch file", err);
      });
  }, [formData.Program_Id]);
  return (
    <div className="max-w-full mx-auto bg-white p-2 shadow-md rounded-lg w-full">
      <div className="bg-sky-600 text-white p-2 rounded-t-lg">
        <h2 className="font-semibold">Upload Materials</h2>
      </div>

      <form onSubmit={handleUpload} className="space-y-4 mt-2">
        {/* Month-Year Picker */}
        <div className="flex items-center space-x-4">
          <label className="w-40 block font-medium">Select Month</label>
          <DatePicker
            selected={selectedDate}
            onChange={handleMonthYearChange}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            placeholderText="Select Month and Year"
            className="w-120 pl-4 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Program Name */}
        <div className="flex items-center space-x-4">
          <label className="w-40 block font-medium">Program</label>
          <select
            required
            disabled={!selectedDate || loading}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                Program_Id: e.target.value,
              }))
            }
            value={formData.Program_Id || ""}
            //className="w-80 pl-4 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            className={`w-120 pl-4 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !selectedDate || loading
                ? "bg-gray-100 text-gray-500"
                : "bg-white"
            }`}
          >
            <option value="">Select Program</option>
            {options.map((option) => (
              <option key={option.Value} value={option.Value}>
                {option.Text}
              </option>
            ))}
          </select>
        </div>

        {/* Trainer */}
        <div className="flex items-center space-x-4">
            <label htmlFor="Trainer" className="w-40 block font-medium">
              Trainer
            </label>
            <div>
              <Select
                id="Trainer"
                name="Trainer"
                options={mappedTrainerOptions}
                placeholder=""
                value={
                  mappedTrainerOptions.find(
                    (opt) => opt.value === formData.Trainer
                  ) || null
                }
                isDisabled={true} 
                className="w-120"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: "#f3f4f6",
                    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "none",
                    padding: "1px",
                    borderRadius: "0.5rem",
                    minHeight: "2rem",
                    display: "flex",
                    alignItems: "center",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "#000000da",
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
              />
            </div>
          </div>
        {/* Training Date */}
        <div className="flex items-center space-x-4">
          <label className="w-40 block font-medium">Training Date</label>
          <input
            type="date"
            value={
              formData.Training_Date ? formData.Training_Date.split("T")[0] : ""
            }
            readOnly
            className="w-120 pl-4 py-2 text-left border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* File Upload + Submit Button */}
        <div className="flex items-start space-x-4">
          <label htmlFor="fileInput" className="w-40 block font-medium">
            Upload File
          </label>
          <div className="flex flex-col w-120 space-y-2">
            <div className="border border-gray-300 rounded-md px-2 py-1">
              <input
                id="fileInput"
                type="file"
                accept="*"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  !formData.Training_Date || !file || !formData.Program_Id
                }
                className={`px-6 py-2 rounded ${
                  formData.Training_Date
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-4">Loading data...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : filteredData.length > 0 ? (
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
                        { key: "Training_Name", label: "Training Name" },
                        { key: "Program_Name", label: "Username" },
                        { key: "Year_No", label: "Year No" },
                        { key: "Department", label: "Department" },
                        { key: "Trainer", label: "Trainer" },
                        { key: "Training_Date", label: "Training Date" },
                        { key: "", label: "Traiining Material" },
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
                            {item.Training_Name}
                          </td>
                          <td className="px-4 py-2 border">
                            {item.Program_Name}
                          </td>
                          <td className="px-4 py-2 border">{item.Year_No}</td>
                          <td className="px-4 py-2 border">
                            {item.Department}
                          </td>
                          <td className="px-4 py-2 border">{item.Trainer}</td>
                          <td className="px-4 py-2 border">
                            {item.Training_Date
                              ? new Date(
                                  item.Training_Date
                                ).toLocaleDateString()
                              : ""}
                          </td>
                          <td className="px-4 py-2 border text-blue-600 underline cursor-pointer">
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {/* <FileLink programId={item.Program_Id} /> */}

                              View
                            </a>
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
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No Files Uploaded Yet.
        </div>
      )}
    </div>
  );
}