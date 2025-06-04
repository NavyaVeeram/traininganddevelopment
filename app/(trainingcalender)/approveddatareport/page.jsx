"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

export default function ApprovedDataReport() {
  const searchParams = useSearchParams();

  const idParam = searchParams.get("id") || searchParams.get("Program_Id") || searchParams.get("programid") || searchParams.get("program_id");

  const [programId, setProgramId] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination, sorting, and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!idParam) {
      setError("No program ID provided.");
      setLoading(false);
      return;
    }

    setProgramId(idParam);

    fetch(`/api/approval_form_data_view?programId=${idParam}`)
      .then((res) => res.json())
      .then((data) => {
        setReportData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch report data.");
        setLoading(false);
      });
  }, [idParam]);

  // Sorting handler
  const handleSort = (key) => {
    if (!key) return;

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return reportData;

    const sorted = [...reportData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (aValue === null || aValue === undefined) {
        return 1;
      } else if (bValue === null || bValue === undefined) {
        return -1;
      } else {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
    });

    return sorted;
  }, [reportData, sortConfig]);

  // Filtered data by search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return sortedData;

    return sortedData.filter((item) =>
      Object.values(item).some((val) =>
        val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [sortedData, searchQuery]);

  // Pagination calculations
  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData =
    rowsPerPage === "All"
      ? filteredData
      : filteredData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  if (loading) return <div>Loading report...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  // Mapping of raw column names to user-friendly display names
  const columnNameMap = {
    EmployeeId: "Employee ID",
    Username: "Username",
    Department: "Department",
    Train_Mode: "Training Mode",
    Section: "Section",
    Training_Date: "Training Date",
    Schedule_Type: "Schedule Type",
    Trainer: "Trainer",
    Venue: "Venue",
    Training_Status: "Training Status",
  };

  return (
    <div className="max-w-full mx-auto bg-white p-2 w-full">
      <div className="bg-sky-400 text-white p-2 flex justify-between rounded-t-lg">
        <h1 className="font-bold">Approved Data Report - Program ID: {programId}</h1>
      </div>

      {reportData.length > 0 && (
        <>
          {/* Search and Rows per page controls */}
          <div className="flex justify-between items-center my-2">
            <div className="flex items-center gap-2 text-sm">
              <span>Show</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(e.target.value === "All" ? "All" : parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded p-1"
              >
                {[10, 20, 30, 40, 100, "All"].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
              <span>entries</span>
            </div>

            <div>
              <input
                type="text"
                placeholder="Search..."
                className="border p-1 rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {reportData.length > 0 ? (
        <div className="overflow-x-auto">
          <table
            className="min-w-full border relative z-0 bg-card text-foreground"
            style={{
              tableLayout: "fixed",
              fontSize: "13px",
              padding: "1px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <thead className="bg-muted sticky top-0 z-10">
              <tr className="bg-gray-100">
                {Object.keys(reportData[0]).map((key) => (
                  <th
                    key={key}
                    className="cursor-pointer px-4 py-2 border text-left select-none"
                    onClick={() => handleSort(key)}
                  >
                    {columnNameMap[key] || key}{" "}
                    {sortConfig.key === key ? (
                      sortConfig.direction === "asc" ? (
                        "▲"
                      ) : (
                        "▼"
                      )
                    ) : (
                      "↕"
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr key={row.EmployeeId || idx} className="border hover:bg-muted">
                    {Object.entries(row).map(([key, value], index) => {
                      let displayValue = value;
                      const keyLower = key.toLowerCase();
                      if (keyLower === "training_date" && value) {
                        displayValue = new Date(value).toLocaleDateString();
                      }
                      return (
                        <td key={index} className="px-4 py-2 border">
                          {displayValue?.toString()}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={Object.keys(reportData[0]).length} className="text-center p-4">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <div className="text-center p-4">No records found.</div>
      )}
      {rowsPerPage !== "All" && filteredData.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <span>
            Showing{" "}
            {filteredData.length > 0
              ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                  currentPage * rowsPerPage,
                  filteredData.length
                )} of ${filteredData.length}`
              : "0"}{" "}
            entries
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded"
            >
              {"<<"}
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded"
            >
              {"<"}
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => setCurrentPage(i + 1)}
                type="button"
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              {">"}
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded"
            >
              {">>"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
