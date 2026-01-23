"use client";

import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import axios from "axios";

const TrainerSummaryForm = () => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainerHistory, setTrainerHistory] = useState([]);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearchTerm, setTableSearchTerm] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [form, setForm] = useState({
    Username: "",
    Department: "",
    Section: "",
    Designation: "",
    EmpType: "",
    EmpCategory: "",
    Programs: "",
    TotalHrs: "",
    DOJ: "",
    Status: "",
  });

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    const res = await axios.get("/api/get_trainers_dropdown");
    setTrainers(res.data);
  };

  const handleTrainerChange = async (option) => {
    setSelectedTrainer(option);
    setCurrentPage(1);
    setTableSearchTerm("");

    if (!option) {
      setTrainerHistory([]);
      return;
    }

    const summaryRes = await axios.post(
      "/api/get_trainer_program_summary",
      { trainerId: option.value }
    );

    if (summaryRes.data.length > 0) {
      const d = summaryRes.data[0];
      setForm({
        Username: d.TrainerName,
        Department: d.Department,
        Section: d.Section,
        Designation: d.Designation,
        EmpType: d.Emp_Type,
        EmpCategory: d.Emp_Category,
        Programs: d.Program_Count,
        TotalHrs: d.No_Hrs,
        DOJ: d.DOJ,
        Status: d.IsActive,
      });
    }

    const historyRes = await axios.get(
      `/api/get_trainer_history_table?trainer=${option.value}`
    );
    setTrainerHistory(historyRes.data);
  };

  /* =======================
     SORT HANDLER (YOUR LOGIC)
     ======================= */
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  /* =======================
     SORTED DATA
     ======================= */
  const sortedData = useMemo(() => {
    let sortableItems = [...trainerHistory];

    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === null) return 1;
        if (bVal === null) return -1;

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [trainerHistory, sortConfig]);

  /* =======================
     SEARCH FILTER
     ======================= */
  const filteredData = useMemo(() => {
    return sortedData.filter((row) =>
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(tableSearchTerm.toLowerCase())
    );
  }, [sortedData, tableSearchTerm]);

  /* =======================
     PAGINATION
     ======================= */
  const totalPages =
    rowsPerPage === "All"
      ? 1
      : Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData =
    rowsPerPage === "All"
      ? filteredData
      : filteredData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  const Input = ({ label, value }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        value={value || ""}
        disabled
        className="border rounded px-3 py-2 bg-gray-50"
      />
    </div>
  );

 const SortIcon = ({ column }) => {
  if (sortConfig.key !== column) {
    return <span className="ml-1 text-gray-400">↕</span>;
  }

  return sortConfig.direction === "asc" ? (
    <span className="ml-1 text-black">↑</span>
  ) : (
    <span className="ml-1 text-black">↓</span>
  );
};


  return (
    <div className="max-w-full mx-auto bg-white p-2 w-full">
      <div className="bg-sky-400 text-white p-2 rounded-t-lg">
        <p className="font-semibold">Trainer History</p>
      </div>

      {/* Trainer Summary */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div>
          <label className="text-sm font-medium">Employee ID</label>
          <Select
            options={trainers}
            value={selectedTrainer}
            onChange={handleTrainerChange}
            placeholder="Search Trainer..."
            isClearable
          />
        </div>

        <Input label="Username" value={form.Username} />
        <Input label="Department" value={form.Department} />
        <Input label="Section" value={form.Section} />
        <Input label="Designation" value={form.Designation} />
        <Input label="Emp Type" value={form.EmpType} />
        <Input label="Emp Category" value={form.EmpCategory} />
        <Input label="Programs" value={form.Programs} />
        <Input label="Total Hrs" value={form.TotalHrs} />
        <Input label="DOJ" value={form.DOJ} />
        <Input label="Status" value={form.Status} />
      </div>

      {/* History Table */}
      {trainerHistory.length > 0 && (
        <div className="mt-6">
             <div className="flex flex-col">
                  <h2 className="text-sm font-bold">
                   Trainers Programs History
                  </h2>
                </div>
          <div className="flex justify-between items-center mb-3">
          
            <div className="text-sm">
              Show{" "}
              <select
                className="border rounded p-1 mx-1"
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
              entries
            </div>

            <input
              type="text"
              placeholder="Search..."
              className="border p-1 rounded"
              value={tableSearchTerm}
              onChange={(e) => setTableSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th onClick={() => handleSort("Training_Name")} className="border px-2 py-1 cursor-pointer">
                    Training Name{<SortIcon column="Training_Name" />}
                  </th>
                  <th onClick={() => handleSort("Program_Name")} className="border px-2 py-1 cursor-pointer">
                    Program Name{<SortIcon column="Program_Name" />}
                  </th>
                  <th onClick={() => handleSort("Train_Mode")} className="border px-2 py-1 cursor-pointer">
                    Mode{<SortIcon column="Train_Mode" />}
                  </th>
                  <th onClick={() => handleSort("Training_Date")} className="border px-2 py-1 cursor-pointer">
                    Training Date{<SortIcon column="Training_Date" />}
                  </th>
                  <th onClick={() => handleSort("No_Hrs")} className="border px-2 py-1 cursor-pointer">
                    Hours{<SortIcon column="No_Hrs" />}
                  </th>
                  <th onClick={() => handleSort("Employee_Count")} className="border px-2 py-1 cursor-pointer">
                    Employees{<SortIcon column="Employee_Count" />}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => (
                  <tr key={index}>
                    <td className="border px-2 py-1">{row.Training_Name}</td>
                    <td className="border px-2 py-1">{row.Program_Name}</td>
                    <td className="border px-2 py-1">{row.Train_Mode}</td>
                    <td className="border px-2 py-1">{row.Training_Date}</td>
                    <td className="border px-2 py-1">{row.No_Hrs}</td>
                    <td className="border px-2 py-1">{row.Employee_Count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rowsPerPage !== "All" && (
            <div className="flex justify-end mt-3 space-x-2 text-sm">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="border px-2 py-1"
              >
                {"<<"}
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="border px-2 py-1"
              >
                {"<"}
              </button>
              <span className="px-2 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border px-2 py-1"
              >
                {">"}
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="border px-2 py-1"
              >
                {">>"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainerSummaryForm;
