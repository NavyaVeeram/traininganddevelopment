"use client";

import React, { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
export default function TrainingDataTable() {
const [loading, setLoading] = useState(true);
const [data, setData] = useState([]);
const [selectedDate, setSelectedDate] = useState(new Date());
const [trainingName, setTrainingName] = useState("IATF");
const [recordCounts, setRecordCounts] = useState({}); // New state for record counts

// Pagination, sorting, and search states
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState("10");
const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
const [searchQuery, setSearchQuery] = useState("");
const [yearNo, setYearNo] = useState(new Date().getFullYear());

// Mapping of raw column names to user-friendly display names
const columnNameMap = {
"programid": "Program ID",
"training_name":'Training Name',
"year_no":"Year No",
"program_name":"Program Name",
"train_mode":"Training Mode ",
"train_purpose":"Purpose",
"no_hrs":"No Hours",
"no_times":"No Times",
"req_months":"Req Months",
"evaluation_period":"Evaluation Period",
"emp_send": "Res Person Status",
"hos": "HOS Status",
"hod": "HOD Status",
"hr_res": "HR Res Status",
"hr_hod": "HR HOD Status",
"isactive": "Status",
"email_status": "Email Status",
// Add other mappings as needed
};


useEffect(() => {
const storedEmployeeId = localStorage.getItem("employeeId");

if (!storedEmployeeId) {
alert("Employee ID not found in localStorage");
return;
}

if (!yearNo) {
alert("Please select a year");
return;
}

fetch("/api/view_approval_form_submit_data", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ employeeId: storedEmployeeId, year_No: yearNo, trainingName: trainingName }),
})
.then((res) => res.json())
.then((data) => {
if (Array.isArray(data.data) && data.data.length > 0) {
console.log("Data keys:", Object.keys(data.data[0]));
console.log("First row data:", data.data[0]);
setData(data.data);
} else {
setData([]);
}
setLoading(false);
})
.catch((err) => {
console.error("Error fetching approval data:", err);
setLoading(false);
});
}, [yearNo, trainingName]);

// New effect to fetch record counts for each programId
useEffect(() => {
if (!data || data.length === 0) {
setRecordCounts({});
return;
}

const uniqueProgramIds = Array.from(
new Set(data.map((item) => item.programid || item.Program_Id))
);

const fetchCounts = async () => {
const counts = {};
await Promise.all(
uniqueProgramIds.map(async (programId) => {
try {
const res = await fetch(`/api/approval_form_data_view?programId=${programId}`);
if (res.ok) {
const result = await res.json();
counts[programId] = Array.isArray(result) ? result.length : 0;
} else {
counts[programId] = 0;
}
} catch (error) {
console.error(`Error fetching count for programId ${programId}:`, error);
counts[programId] = 0;
}
})
);
setRecordCounts(counts);
};

fetchCounts();
}, [data]);

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
if (!sortConfig.key) return data;

const sorted = [...data].sort((a, b) => {
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
}, [data, sortConfig]);

// Filtered data by search query
const filteredData = useMemo(() => {
if (!searchQuery) return sortedData;

return sortedData.filter((item) =>
Object.values(item).some((val) =>
val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
)
);
}, [sortedData, searchQuery]);

// Helper to get rowsPerPage as number for calculations
const getRowsPerPageNumber = () => {
if (rowsPerPage === "All") return filteredData.length;
return parseInt(rowsPerPage) || 10;
};

const rowsPerPageNumber = getRowsPerPageNumber();

// Pagination calculations
const totalPages =
rowsPerPage === "All" ? 1 : Math.ceil(filteredData.length / rowsPerPageNumber);

const paginatedData =
rowsPerPage === "All"
? filteredData
: filteredData.slice(
(currentPage - 1) * rowsPerPageNumber,
currentPage * rowsPerPageNumber
);

if (loading) return <div>Loading...</div>;

// Generate year options for dropdown (e.g., last 10 years)
const currentYear = new Date().getFullYear();
const yearOptions = [];
for (let y = currentYear; y >= currentYear - 10; y--) {
yearOptions.push(y);
}

// Filter out "programid" from columns to display
const columnsToDisplay =
    data.length > 0
      ? Object.keys(data[0]).filter((key) => {
          const lowerKey = key.toLowerCase();
          return (
            lowerKey !== "programid" &&
            lowerKey !== "program_id" &&
            lowerKey !== "year_no" &&
            lowerKey !== "train_purpose" &&
            lowerKey !== "no_times" &&
            lowerKey !== "isactive" &&
            lowerKey !== "email_status" &&
            lowerKey !== "training_name" &&
            lowerKey !== "emp_send"
          );
        })
      : [];

return (
<div className="max-w-full mx-auto bg-white p-2 w-full">
<div className="bg-sky-400 text-white p-2 flex justify-between rounded-t-lg">
<h1 className="font-bold">Approved Data</h1>
</div>

{/* Year dropdown */}
<div className="flex items-center">
<div className="flex mt-3 mx-2 items-center">
<label htmlFor="year-select" className="mr-2 font-semibold">
Select Year:
</label>
<DatePicker
selected={selectedDate}
onChange={(date) => setSelectedDate(date)}
dateFormat="yyyy"
showYearPicker
placeholderText="Select Year"
className="p-2 border border-gray-300 rounded-lg"
calendarClassName="z-50"
popperPlacement="top-start"
popperModifiers={{
preventOverflow: {
enabled: true,
boundariesElement: "viewport",
},
}}
/>
</div>

<div className="flex mt-3 items-center" >
<label htmlFor="training-select" className="mr-2 font-semibold">
Select Training:
</label>
<Select
inputId="training-select"
value={{ value: trainingName, label: trainingName === "IATF" ? "IATF (International Automotive Task Force)" : "HSE (Health, Safety, and Environment)" }}
onChange={(selectedOption) => setTrainingName(selectedOption.value)}
options={[
{ value: "IATF", label: "IATF (International Automotive Task Force)" },
{ value: "HSE", label: "HSE (Health, Safety, and Environment)" }
]}
isSearchable={false}
classNamePrefix="react-select"
styles={{
control: (provided) => ({
...provided,
padding: "2px",
borderColor: "#D1D5DB", // Tailwind gray-300
borderRadius: "0.5rem", // rounded-lg
cursor: "pointer",

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
</div>



{data.length > 0 && (
<>
{/* Search and Rows per page controls */}
<div className="flex justify-between items-center my-2">
<div className="flex items-center gap-2 text-sm">
<span>Show</span>
<select
value={rowsPerPage}
onChange={(e) => {
setRowsPerPage(e.target.value);
setCurrentPage(1);
}}
className="border rounded p-1"
>
{[10, 20, 30, 40, 100, "All"].map((val) => (
<option key={val} value={val.toString()}>
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

{data.length > 0 ? (
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
{columnsToDisplay.map((key) => (
<th
key={key}
className="cursor-pointer px-4 py-2 border text-left select-none"
onClick={() => handleSort(key)}
>
{columnNameMap[key.toLowerCase()] || key}{" "}
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
<th className="cursor-default px-4 py-2 border text-left select-none">
Actions
</th>
</tr>
</thead>
<tbody>
{paginatedData.length > 0 ? (
paginatedData.map((row, idx) => {
const programId = row.programid || row.Program_Id;
const count = recordCounts[programId] || 0;
const isDisabled = count === 0;
return (
<tr key={programId || idx} className="border hover:bg-muted">
{Object.entries(row)
.filter(([key]) => columnsToDisplay.includes(key))
.map(([key, value], index) => {
let displayValue = value;
const keyMap = {};
Object.keys(row).forEach(k => {
keyMap[k.toLowerCase()] = k;
});

const approvedFields = [
"emp_send",
"hos",
"hod",
"hr_res",
"hr_hod",
];
const keyLower = key.toLowerCase();

// Get email_status value from row for conditional display
let emailStatus = row[keyMap["email_status"]] ?? null;
// Log emailStatus and value for debugging
console.log("emailStatus:", emailStatus, "key:", keyLower, "value:", value);
console.log("Full row data:", row);
// emailStatus = emailStatus !== null ? Number(emailStatus) : null;

if (keyLower === "isactive") {
if (value === 1 || value === true) displayValue = "Active";
else if (value === 0 || value === false) displayValue = "InActive";
} else if (keyLower === "email_status") {
if (value === true) displayValue = "Accepted";
else if (value === false || value === null) displayValue = "Rejected";
} else if (approvedFields.includes(keyLower)) {
if (emailStatus === false) {
// If email_status is false, display "Rejected" for the first null field only, others empty
const approvalFieldsOrder = ["emp_send", "hos", "hod", "hr_res", "hr_hod"];
const firstNullField = approvalFieldsOrder.find(field => {
const val = row[keyMap[field]] ?? row[keyMap[field.charAt(0).toUpperCase() + field.slice(1)]];
return val === null || val === undefined;
});
console.log("firstNullField:", firstNullField, "keyLower:", keyLower);
if ((value === null || value === undefined) && keyLower === firstNullField) {
displayValue = "Rejected";
} else if ((value === null || value === undefined) && keyLower !== firstNullField) {
displayValue = "";
} else if (value === 1 || value === true) {
displayValue = "Approved";
} else {
displayValue = "";
}
} else if (emailStatus === true) {
// If email_status is true, display these fields as Waiting if null
if (value === null || value === undefined) {
displayValue = "Waiting";
} else if (value === 1 || value === true) {
displayValue = "Approved";
} else {
displayValue = "Waiting";
}
} else {
if (value === 1 || value === true) displayValue = "Approved";
else if (value === 0 || value === false || value === null) displayValue = "Waiting";
}
}
return (
<td key={index} className="px-4 py-2 border">
{(displayValue === "Approved" && (
<span className="text-green-600 font-semibold">{displayValue}</span>
)) ||
(displayValue === "Waiting" && (
<span className="text-blue-600 font-semibold">{displayValue}</span>
)) ||
(displayValue === "Accepted" && (
<span className="text-green-600 font-semibold">{displayValue}</span>
)) ||
(displayValue === "Rejected" && (
<span className="text-red-600 font-semibold">{displayValue}</span>
)) ||
(displayValue === "Active" && (
<span className="text-green-600 font-semibold">{displayValue}</span>
)) ||
(displayValue === "InActive" && (
<span className="text-red-600 font-semibold">{displayValue}</span>
)) || <>{displayValue?.toString()}</>}
</td>
);
})}
<td className="px-4 py-2 border">
<a
href={`/approveddatareport?id=${programId}`}
target="_blank"
rel="noopener noreferrer"
className={`underline ${isDisabled ? "text-gray-400 pointer-events-none" : "text-blue-600"}`}
>
View Report
</a>
</td>
</tr>
);
})
) : (
<tr>
<td colSpan={columnsToDisplay.length} className="text-center p-4">
No data found.
</td>
</tr>
)}
</tbody>
</table>
</div>
) : (
<div className="text-center p-4">No records found.</div>
)}

{/* Pagination controls */}
{filteredData.length > 0 && (
<div className="flex justify-between items-center mt-4 text-sm">
<span>
Showing{" "}
{filteredData.length > 0
? `${(currentPage - 1) * rowsPerPageNumber + 1} to ${Math.min(
currentPage * rowsPerPageNumber,
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
currentPage === i + 1 ? "bg-black text-primary-foreground" : ""
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
