"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaSearch, FaTrash, FaEdit } from "react-icons/fa";
import Select from "react-select";

import EmailApproval from "../email/page";
export default function TrainingDataTable() {
const [trainingData, setTrainingData] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(5);
const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
const [loading, setLoading] = useState(true);
const [department, setDepartment] = useState('');
const [username, setUsername] = useState('');
const [employeeId, setEmployeeId] = useState('');
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingData, setEditingData] = useState(null);
 const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
const [error, setError] = useState('');
const columnKeyMap = {
"Training Name": "Training_Name",
Year: "Year_No",
Department: "Department",
Section: "Section",
"Program Name": "Program_Name",
"Training Mode": "Train_Mode",
Purpose: "Train_Purpose",
Persons: "Persons",
Hours: "No_Hrs",
Times: "No_Times",
Months: "Req_Months",
"Evaluation Period": "Evaluation_Period",
IsActive:"IsActive",

};
  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');
  
    if (!storedEmployeeId) {
      window.location.href = '/';
      return;
    }
  
    setEmployeeId(storedEmployeeId);
  
    const fetchAccessRole = async () => {
      try {
        const res = await fetch(`/api/get_access_role?employeeId=${storedEmployeeId}`);
        const data = await res.json();
  
        if (res.ok && (data.Access_Role === 'HOS' || data.Access_Role === 'HOD'|| data.Access_Role === 'HR_Res'|| data.Access_Role === 'HR_HOD')) {
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
  
useEffect(() => {
const storedDepartment = localStorage.getItem('department');
const storedUsername = localStorage.getItem('username');
const storedEmployeeId = localStorage.getItem('employeeId');

if (storedDepartment && storedUsername && storedEmployeeId) {
setDepartment(storedDepartment);
setUsername(storedUsername);
setEmployeeId(storedEmployeeId);
} else {
window.location.href = '/';
}

const fetchData = async () => {
setLoading(true);
try {
const response = await fetch(`/api/approval_form_data?employeeId=${storedEmployeeId}&department=${storedDepartment}`);
const data = await response.json();

if (response.ok) {

const updatedData = data.map(item => ({
...item

}));
setTrainingData(updatedData);
} else {
console.error('Failed to fetch training data:', data.message);
setTrainingData([]);
}
} catch (error) {
console.error('Error fetching data:', error);
setTrainingData([]);
} finally {
setLoading(false);
}
};

fetchData();
}, []);

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
const handleSort = (column) => {
const key = columnKeyMap[column];
if (!key) return;

let direction = "asc";
if (sortConfig.key === key && sortConfig.direction === "asc") {
direction = "desc";
}

setSortConfig({ key, direction });

const sortedData = [...trainingData].sort((a, b) => {
const aValue = a[key];
const bValue = b[key];

if (typeof aValue === 'string' && typeof bValue === 'string') {
return direction === 'asc'
? aValue.localeCompare(bValue)
: bValue.localeCompare(aValue);
} else {
return direction === 'asc' ? aValue - bValue : bValue - aValue;
}
});

setTrainingData(sortedData);
};

const filteredData = useMemo(() => {
return trainingData.filter(item =>
item.Training_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
item.Program_Name.toLowerCase().includes(searchQuery.toLowerCase())
);
}, [trainingData, searchQuery]);

const totalPages = rowsPerPage === "All" ? 1 : Math.ceil(filteredData.length / rowsPerPage);
const paginatedData =
rowsPerPage === "All"
? filteredData
: filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

const handleEdit = (data) => {
setEditingData(data); // Store the row data to be edited
setIsModalOpen(true); // Open the modal
};

const handleCancel = () => {
setIsModalOpen(false); // Close the modal
};

const handleInputChange = (e, key) => {
setEditingData(prevData => ({
...prevData,
[key]: e.target.value
}));
};

const handleUpdate = async () => {
try {
const programId = editingData?.Program_Id;
console.log('Program_Id:', programId);

// Log the data to check if all fields are present
console.log('Updating with data:', editingData);

const res = await fetch(`/api/update_training_data_approval?Program_Id=${programId}`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(editingData), // Send updated data
});
const responseData = await res.json();
if (res.ok) {
alert(` ${responseData.message}`);

// ✅ Optimistically update the local trainingData array
const updatedList = trainingData.map((item) =>
item.Program_Id === programId ? { ...item, ...editingData } : item
);
setTrainingData(updatedList);
const month = selectedDate.getMonth() + 1; // Get the current month
const year = selectedDate.getFullYear(); // Get the current year
fetchData(month, year); // Refresh the list after updating
setIsModalOpen(false); // Close the modal
setError(""); // Clear any previous error messages
} else {
alert(`Error: ${responseData.message || 'Unknown error'}`);
}
} catch (err) {
setError('Failed to update the record');
}
};




const handleActiveToggle = async (programId, currentStatus) => {
try {
const newStatus = !currentStatus; // Toggle the status

const response = await fetch('/api/update_status_approval', {
method: 'PATCH',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ programId, newStatus }),
});

if (!response.ok) {
throw new Error('Failed to update status');
}

const data = await response.json();
console.log(data.message);
alert(`Status has been ${newStatus ? 'activated' : 'deactivated'}`);


setTrainingData(prev =>
prev.map(item =>
item.Program_Id === programId
? { ...item, IsActive: newStatus }
: item
)
);

} catch (error) {
console.error('Error updating status:', error);
}
};

  // 🔒 Unauthorized view
  if (!isAuthorized) {
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
<div className="max-w-full mx-auto bg-white p-2 w-full">
{/* Header */}
<div className="bg-sky-400 text-white p-2 flex justify-between rounded-t-lg">
<p className="font-semibold">Approval Form</p>
<div className="flex justify-end mx-3">
{username ? (
<p className="font-bold">{username}</p>
) : (
<p>Loading the Username</p>
)}
</div>
</div>

{/* Table Section */}
<div className="p-4 bg-white">
{/* Search and Pagination Controls */}
<div className="mb-4 flex justify-between items-center">
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

{/* Loading Spinner */}
{loading ? (
<p>Loading...</p>
) : (
<>
{/* Table */}
<table className="w-full border-collapse text-sm">
<thead className="bg-gray-100">
<tr>
{Object.keys(columnKeyMap).map((col) => (
<th
key={col}
className="border p-2 cursor-pointer text-left"
onClick={() => handleSort(col)}
>
{col}{" "}
{sortConfig.key === columnKeyMap[col]
? sortConfig.direction === "asc"
? "▲"
: "▼"
: "↕"}
</th>
))}
<th className="border p-2 text-left">Actions</th>
</tr>
</thead>
<tbody>
{paginatedData.length > 0 ? (
paginatedData.map((item) => (
<tr key={item.Program_Id} className="hover:bg-gray-50">
{Object.entries(columnKeyMap).map(([label, key]) => (
<td key={key} className="border p-2 text-center">
{key === "IsActive" ? (
<div className="flex items-center justify-center gap-2">
<input
type="checkbox"
checked={!!item.IsActive}
className="accent-green-500 cursor-pointer"
onChange={() => handleActiveToggle(item.Program_Id, item.IsActive)}
/>
<span className={item.IsActive ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
{item.IsActive ? "Active" : "Inactive"}
</span>
</div>
) : (
Array.isArray(item[key]) ? item[key].join(", ") : item[key]
)}

</td>
))}

{/* Actions Column */}
<td className="border p-2">
<div className="flex justify-center gap-2">
<button onClick={() => handleEdit(item)}>
<FaEdit className="text-blue-500 cursor-pointer" />
</button>
</div>
</td>
</tr>
))
) : (
<tr>
<td colSpan={Object.keys(columnKeyMap).length + 1} className="text-center p-4">
No data found.
</td>
</tr>
)}
</tbody>
</table>

{/* Pagination */}
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
<button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
className="px-3 py-1 border rounded">
&lt;&lt;
</button>
<button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}
className="px-3 py-1 border rounded">
&lt;
</button>
{[...Array(totalPages)].map((_, i) => (
<button
key={i}
className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-primary text-primary-foreground" : ""
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
&gt;
</button>
<button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
className="px-3 py-1 border rounded">
&gt;&gt;
</button>
</div>
</div>
)}

{/* Approval Button */}
{paginatedData.length > 0 && (

   <div className="flex mx-2 justify-end mt-6">
    <EmailApproval/>
  </div>
)}
</>
)}
{isModalOpen && (
<div
className="fixed inset-0 flex justify-center items-center "
onClick={() => setIsModalOpen(false)} 
>
<div
className="relative z-50 w-full max-w-4xl p-6 bg-white shadow-lg rounded-lg "
onClick={(e) => e.stopPropagation()} 
>
<h3 className="bg-sky-400 text-white p-2 flex justify-between rounded-t-lg">Update Approval Details</h3>
{editingData && (
<div>
<div className="grid grid-cols-2 gap-x-6 gap-y-4">
<div>
<label className="block font-semibold">Training Name</label>
<input
type="text"
value={editingData.Training_Name}
onChange={(e) => handleInputChange(e, 'Training_Name')}
readOnly
className="border p-2 w-70 bg-gray-200  border-gray-300 cursor-not-allowed rounded-md"
/>
</div>
<div>
<label className="block font-semibold">Year</label>
<input
type="text"
value={editingData.Year_No}
onChange={(e) => handleInputChange(e, 'Year_No')}
readOnly
className="border p-2 w-70 bg-gray-200  border-gray-300 cursor-not-allowed rounded-md"
/>
</div>

<div>
<label className="block font-semibold">Department</label>
<input
type="text"
value={editingData.Department}
onChange={(e) => handleInputChange(e, 'Department')}
readOnly
className="border p-2 w-70 bg-gray-200  border-gray-300 cursor-not-allowed rounded-md"
/>
</div>
<div>
<label className="block font-semibold">Section</label>
<input
type="text"
value={editingData.Section}
onChange={(e) => handleInputChange(e, 'Section')}
readOnly
className="border p-2 w-70 bg-gray-200  border-gray-300 cursor-not-allowed rounded-md"
/>
</div>

<div>
<label className="block font-semibold">Program Name</label>
<input
type="text"
value={editingData.Program_Name}
onChange={(e) => handleInputChange(e, 'Program_Name')}
readOnly
className="border p-2 w-70 bg-gray-200  border-gray-300 cursor-not-allowed rounded-md"
/>
</div>
<div>
<label className="block font-semibold">Training Mode</label>
<input
type="text"
value={editingData.Train_Mode}
onChange={(e) => handleInputChange(e, 'Train_Mode')}
readOnly
className="border p-2 w-70 bg-gray-200  border-gray-300 cursor-not-allowed rounded-md"
/>
</div>

<div>
<label className="block font-semibold ">Purpose</label>
<input
type="text"
value={editingData.Train_Purpose}
onChange={(e) => handleInputChange(e, 'Train_Purpose')}
readOnly
className="border p-2 w-70 bg-gray-200  border-gray-300 cursor-not-allowed rounded-md"
/>
</div>
<div>
<label className="block font-semibold">Persons</label>
<input
type="number"
step="1"
min="0"
value={editingData.Persons}
onChange={(e) => handleInputChange(e, 'Persons')}
className="border p-2 w-70 rounded-md"
/>
</div>

<div>
<label className="block font-semibold">Hours</label>
<input
type="number"
step="1"
min="0"
value={editingData.No_Hrs}
onChange={(e) => handleInputChange(e, 'No_Hrs')}
className="border p-2 w-70 rounded-md"
/>
</div>
<div>
<label className="block font-semibold">Times</label>
<input
type="number"
step="1"
min="0"
value={editingData.No_Times}
onChange={(e) => handleInputChange(e, 'No_Times')}
readOnly
className="border p-2 w-70 rounded-md bg-gray-200 cursor-not-allowed"
/>
</div>
<div className="mb-10">
<label className="block font-semibold w-32">Months</label> {/* Adjusted to w-32 */}

<Select
options={monthOptions}
value={monthOptions.find(opt => opt.value === editingData.Req_Months) || null}
onChange={(selectedOption) => {
const selectedMonth = selectedOption ? selectedOption.value : "";
handleInputChange({ target: { value: selectedMonth } }, 'Req_Months');
}}
placeholder="Select Month"
isClearable
className="text-sm"
styles={{
control: (base) => ({
...base,
padding: "1px",
borderColor: "#d1d5db",
minHeight: "2rem",
borderRadius: "0.5rem",
width: '282px', // Control the width of the select dropdown
}),
}}
/>
</div>

<div>
<label className="block font-semibold ">Evaluation Period</label>
<input
type="text"
value={editingData.Evaluation_Period}
onChange={(e) => handleInputChange(e, 'Evaluation_Period')}
className="border p-2 w-70 rounded-md"
/>
</div>
</div>

<div className="flex justify-end">
<button onClick={handleUpdate} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-900  rounded-md mr-2 mt-2 cursor-pointer">Update</button>
<button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-900  rounded-md mt-2 cursor-pointer">Cancel</button>

</div>
</div>
)}
</div>
</div>
)}
</div>
</div>
);
}