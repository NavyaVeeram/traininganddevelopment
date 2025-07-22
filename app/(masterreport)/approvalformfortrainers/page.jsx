"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FaSearch, FaEdit } from "react-icons/fa";
import Select from "react-select";
import EmailApprovalForTrainers from "../emailfortrainers/EmailApprovalForTrainers";
import EmailRejectionForTrainers from "../emailfortrainers/EmailRejectionForTrainers";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function TrainerApprovalForm() {
  const [trainerData, setTrainerData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState("");
  const [username, setUsername] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [error, setError] = useState("");
    const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId");
    const storedUsername = localStorage.getItem("username");

    if (storedEmployeeId && storedUsername) {
      setEmployeeId(storedEmployeeId);
      setUsername(storedUsername);
    } else {
      window.location.href = "/";
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/trainer_approval_form_data?employeeId=${storedEmployeeId}`
        );
        const data = await response.json();

        if (response.ok) {
          setTrainerData(data);
        } else {
          console.error("Failed to fetch trainer approval data:", data.message);
          setTrainerData([]);
        }
      } catch (error) {
        console.error("Error fetching trainer approval data:", error);
        setTrainerData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
 useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId");
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    }

    const fetchAccessRole = async () => {
      try {
        const res = await fetch(
          `/api/get_access_role?employeeId=${storedEmployeeId}`
        );
        const data = await res.json();

        if (res.ok && data.Access_Role) {
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

  const handleSort = (key) => {
    if (!key) return;

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sortedData = [...trainerData].sort((a, b) => {
      if (!sortConfig.key) return 0;

      const aValue = a[key];
      const bValue = b[key];

      // Handle date fields (example: if key is a date field, adjust accordingly)
      // Assuming no explicit date fields here, but can add if needed

      // Handle boolean values
      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return direction === "asc"
          ? aValue === bValue
            ? 0
            : aValue
            ? -1
            : 1
          : aValue === bValue
          ? 0
          : aValue
          ? 1
          : -1;
      }

      // Handle number values
      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Handle string values
      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Fallback to string comparison
      return direction === "asc"
        ? aValue?.toString().localeCompare(bValue?.toString())
        : bValue?.toString().localeCompare(aValue?.toString());
    });

    setTrainerData(sortedData);
  };

  const filteredData = useMemo(() => {
    return trainerData.filter(
      (item) =>
        item.Training_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Program_Name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trainerData, searchQuery]);

  // Convert rowsPerPage to number for calculations, handle "All" case
  const rowsPerPageNumber = rowsPerPage === "All" ? filteredData.length : Number(rowsPerPage);

  const totalPages = rowsPerPage === "All" ? 1 : Math.ceil(filteredData.length / rowsPerPageNumber);
  const paginatedData =
    rowsPerPage === "All"
      ? filteredData
      : filteredData.slice(
          (currentPage - 1) * rowsPerPageNumber,
          currentPage * rowsPerPageNumber
        );

  const handleEdit = (data) => {
    setEditingData(data);
    setIsModalOpen(true);
  };

  const handleInputChange = (e, key) => {
    setEditingData((prevData) => ({
      ...prevData,
      [key]: e.target.value,
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div>
        <p className="font-semibold text-sky-400">Trainer Approval Form:</p>
        <div className="p-4 bg-white">
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm">
              <span>Show</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(
                    e.target.value === "All" ? "All" : parseInt(e.target.value)
                  );
                  setCurrentPage(1);
                }}
                className="border rounded p-1"
              >
                {[5, 10, 20, 30, 40, 100, "All"].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
              <span>entries</span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="border pl-8 p-1 rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-2 top-2 text-gray-400" />
            </div>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="border p-2 cursor-pointer text-left"
                  onClick={() => handleSort("Training_Name")}
                >
                  Training Name
                  {sortConfig.key === "Training_Name"
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : " ↕"}
                </th>
                <th
                  className="border p-2 cursor-pointer text-left"
                  onClick={() => handleSort("Username")}
                >
                  Username
                  {sortConfig.key === "Username"
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : " ↕"}
                </th>
                <th
                  className="border p-2 cursor-pointer text-left"
                  onClick={() => handleSort("Department")}
                >
                  Department
                  {sortConfig.key === "Department"
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : " ↕"}
                </th>
                <th
                  className="border p-2 cursor-pointer text-left"
                  onClick={() => handleSort("Section")}
                >
                  Section
                  {sortConfig.key === "Section"
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : " ↕"}
                </th>
                <th
                  className="border p-2 cursor-pointer text-left"
                  onClick={() => handleSort("Qualified")}
                >
                  Qualified
                  {sortConfig.key === "Qualified"
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : " ↕"}
                </th>
                <th
                  className="border p-2 cursor-pointer text-left"
                  onClick={() => handleSort("Certified")}
                >
                  Certified
                  {sortConfig.key === "Certified"
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : " ↕"}
                </th>
                <th
                  className="border p-2 cursor-pointer text-left"
                  onClick={() => handleSort("Cert_Des")}
                >
                  Cer_Des
                  {sortConfig.key === "Cert_Des"
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : " ↕"}
                </th>
                <th
                  className="border p-2 cursor-pointer text-left"
                  onClick={() => handleSort("Exp_5_Yr")}
                >
                  Overall Exp (5 yrs)
                  {sortConfig.key === "Exp_5_Yr"
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : " ↕"}
                </th>
                <th
                  className="border p-2 cursor-pointer text-left"
                  onClick={() => handleSort("Exp_3_Yr")}
                >
                 GTI Exp (3 yrs)
                  {sortConfig.key === "Exp_3_Yr"
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : " ↕"}
                </th>
                <th
                  className="border p-2 cursor-pointer text-left"
                  onClick={() => handleSort("HOD_Rec")}
                >
                  Nominated by HOD
                  {sortConfig.key === "HOD_Rec"
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : " ↕"}
                </th>
                <th
                  className="border p-2 cursor-pointer text-left"
                  onClick={() => handleSort("IsActive")}
                >
                  Is Active
                  {sortConfig.key === "IsActive"
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : " ↕"}
                </th>
                {/* <th
                  className="border p-2 cursor-pointer text-left"
                  onClick={() => handleSort("Qual_Id")}
                >
                  Qual Id
                  {sortConfig.key === "Qual_Id"
                    ? sortConfig.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : " ↕"}
                </th> */}
                
                  {accessRole !== "HOS"  &&(
                    <th
                      className="border p-2 cursor-pointer text-left"
                      onClick={() => handleSort("Approval_Status")}
                    >
                      Approval Status
                    </th>
                  )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.Qual_Id} className="hover:bg-gray-50">
                    <td className="border p-2 text-left">
                      {item.Training_Name}
                    </td>
                    <td className="border p-2 text-left">{item.Username}</td>
                    <td className="border p-2 text-left">{item.Department}</td>
                    <td className="border p-2 text-left">{item.Section}</td>
                    <td className="border p-2 text-left">
                      {item.Qualified ? "Yes" : "No"}
                    </td>
                    <td className="border p-2 text-left">
                      {item.Certified ? "Yes" : "No"}
                    </td>
                    <td className="border p-2 text-left">{item.Cert_Des}</td>
                    <td className="border p-2 text-left">
                      {item.Exp_5_Yr ? "Yes" : "No"}
                    </td>
                    <td className="border p-2 text-left">
                      {item.Exp_3_Yr ? "Yes" : "No"}
                    </td>
                    <td className="border p-2 text-left">
                      {item.HOD_Rec ? "Yes" : "No"}
                    </td>
                    
                    <td className="border p-2 text-left">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.IsActive}
                          onChange={async (e) => {
                            const newStatus = e.target.checked;
                            try {
                              const response = await fetch(
                                "/api/update_active_status_qualified_trainers",
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    Qual_Id: item.Qual_Id,
                                    IsActive: newStatus,
                                  }),
                                }
                              );
                              if (response.ok) {
                                // Update local state to reflect change
                                setTrainerData((prevData) =>
                                  prevData.map((trainer) =>
                                    trainer.Qual_Id === item.Qual_Id
                                      ? { ...trainer, IsActive: newStatus }
                                      : trainer
                                  )
                                );
                                alert("Status updated successfully");
                              } else {
                                alert("Failed to update status");
                              }
                            } catch (error) {
                              alert("Error updating status");
                            }
                          }}
                        />
                        <span
                          className={
                            item.IsActive
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {item.IsActive ? "Active" : "Inactive"}
                        </span>
                      </label>
                    </td>
                    {/* <td className="border p-2 text-left">{item.Qual_Id}</td> */}
                    
{accessRole !== "HOS" &&(
  <td className="border p-2 text-left font-bold">
{(() => {
  const status = item.Approval_Status?.trim().toLowerCase();
  const pendingStatuses = ["Pending with HOD", "Pending with HR_Res", "pending with hr_hod"];
  const isPending = pendingStatuses.includes(status);
  const isApproved = status === "approved";
  const colorClass = isPending ? "text-red-600" : isApproved ? "text-green-600" : "";
  return (
    <span className={colorClass}>
      {item.Approval_Status}
    </span>
  );
})()}
  </td>
)}             
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={19} className="text-center border p-4">
                  No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {rowsPerPage !== "All"  && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <div>
                Showing{" "}
                {paginatedData.length > 0
                  ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                      currentPage * rowsPerPage,
                      paginatedData.length
                    )} of ${paginatedData.length} entries`
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
          )}
          {trainerData.length > 0 && (
            <div className="flex justify-end mt-6 gap-x-2">
              <EmailApprovalForTrainers />
               {accessRole !== "HOS" &&(
              <EmailRejectionForTrainers />
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
