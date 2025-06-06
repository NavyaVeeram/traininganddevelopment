"use client";

import React, { useState, useEffect } from "react";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaArrowUp, FaArrowDown, FaArrowsAltV, FaSearch } from "react-icons/fa";
import Pagination from "@mui/material/Pagination"; // Material UI Pagination

const Upload = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [department, setDepartment] = useState('');
  const [username, setUsername] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [formData, setFormData] = useState({
    Agency_name: "",
    Contact_person: "",
    Location: "",
    Contact_1: "",
    Contact_2: "",
    Mailid: "",
    Website: "",
    CreatedBy: "",
  });

  const fetchAgencies = async () => {
    try {
      const res = await fetch("/api/get_agencies");
      const data = await res.json();
      if (res.ok) {
        setAgencies(data.agencies);
      } else {
        setError(data.error || "Failed to fetch data.");
      }
    } catch (err) {
      setError("Something went wrong while fetching data.");
    } finally {
      setLoading(false);
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
               if (data.Access_Role === "Res_Person" || data.Access_Role === "HOS" || data.Access_Role === "HOD") {
                 setIsAuthorized(false);
                 // Optionally redirect to unauthorized page
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
  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSort = (column) => {
    let direction = "asc";
    if (sortConfig.key === column && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key: column, direction });

    const sorted = [...agencies].sort((a, b) => {
      const aVal = a[column]?.toString().toLowerCase() || "";
      const bVal = b[column]?.toString().toLowerCase() || "";

      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setAgencies(sorted);
  };

  const renderSortIcon = (column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === "asc" ? "▲" : "▼";
    }
    return "↕";
  };

  const validatePhoneNumber = (number) => /^\d{10}$/.test(number);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validate phone numbers
    if (
      !validatePhoneNumber(formData.Contact_1) ||
      !validatePhoneNumber(formData.Contact_2)
    ) {
      setError("Please enter valid 10-digit phone numbers.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Ensure email ends with @gmail.com
    let email = formData.Mailid.trim();
    if (!email.includes("@")) {
      email = `${email}@gmail.com`; // Only append if there's no @ at all
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setFormData((prev) => ({ ...prev, Mailid: email }));

    // Update CreatedBy with current employeeId before submission
    const submissionData = { ...formData, CreatedBy: employeeId };

    try {
      const res = await fetch("/api/insert_agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({
          Agency_name: "",
          Contact_person: "",
          Location: "",
          Contact_1: "",
          Contact_2: "",
          Mailid: "",
          Website: "",
          CreatedBy: "",
        });
        fetchAgencies();
        alert("Data Submitted Successfully");
      } else {
        setError(data.error || "Submission failed.");
      }
    } catch {
      setError("An error occurred while submitting.");
    }

    setTimeout(() => {
      setError("");
    }, 3000);
  };

  const filteredAgencies = agencies.filter((agency) =>
    Object.values(agency).some((val) =>
      val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const totalPages =
    rowsPerPage === "All"
      ? 1
      : Math.ceil(filteredAgencies.length / rowsPerPage);
  const currentAgencies =
    rowsPerPage === "All"
      ? filteredAgencies
      : filteredAgencies.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  const handlePaginationChange = (event, value) => {
    setCurrentPage(value);
  };
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
        <div className="bg-white p-10 rounded shadow text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    );
  }

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
    <div className="max-w-full mx-auto bg-white p-2 w-full">
      <div className="bg-sky-400 text-white p-2  flex justify-between rounded-t-lg">
        <p className="font-semibold"> External Training Agencies Entry</p>
      </div>
      {/* Header */}
      {/* <div className="sticky top-0 z-10 p-1 bg-sky-600 text-white font-semibold text-lg shadow-md">
        External Training Agencies Entry
      </div> */}
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mx-1">
        {successMessage && (
          <div className="text-green-600">{successMessage}</div>
        )}
        {error && <div className="text-red-600">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          <div key="Agency_name" className="mb-4">
            <label
              htmlFor="Agency_name"
              className="block text-sm font-medium text-gray-900"
            >
              Agency Name
            </label>
            <input
              type="text"
              name="Agency_name"
              id="Agency_name"
              value={formData.Agency_name}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
            />
          </div>

          <div key="Contact_person" className="mb-4">
            <label
              htmlFor="Contact_person"
              className="block text-sm font-medium text-gray-900"
            >
              Contact Person
            </label>
            <input
              type="text"
              name="Contact_person"
              id="Contact_person"
              value={formData.Contact_person}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
            />
          </div>

          <div key="Location" className="mb-4">
            <label
              htmlFor="Location"
              className="block text-sm font-medium text-gray-900"
            >
              Location
            </label>
            <input
              type="text"
              name="Location"
              id="Location"
              value={formData.Location}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
            />
          </div>

          <div key="Contact_1" className="mb-4">
            <label
              htmlFor="Contact_1"
              className="block text-sm font-medium text-gray-900"
            >
              Contact 1
            </label>
            <input
              type="text"
              name="Contact_1"
              id="Contact_1"
              value={formData.Contact_1}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
            />
          </div>

          <div key="Contact_2" className="mb-4">
            <label
              htmlFor="Contact_2"
              className="block text-sm font-medium text-gray-900"
            >
              Contact 2
            </label>
            <input
              type="text"
              name="Contact_2"
              id="Contact_2"
              value={formData.Contact_2}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
            />
          </div>

          <div key="Mailid" className="mb-4 relative">
            <label
              htmlFor="Mailid"
              className="block text-sm font-medium text-gray-900"
            >
              Mail ID
            </label>
            <div className="relative">
              <input
                type="text"
                name="Mailid"
                id="Mailid"
                value={formData.Mailid}
                onChange={handleChange}
                required
                autoComplete="off"
                placeholder="Enter your email"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
              />
              {/* Show @gmail.com if not in email */}
              {!formData.Mailid.includes("@") && (
                <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500">
                  @gmail.com
                </span>
              )}
            </div>
          </div>

          <div key="Website" className="mb-4">
            <label
              htmlFor="Website"
              className="block text-sm font-medium text-gray-900"
            >
              Website
            </label>
            <input
              type="text"
              name="Website"
              id="Website"
              value={formData.Website}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 pr-10"
            />
          </div>
          <div className="ml-20 mt-5">
            <Button
              type="submit"
              className="bg-gray-600 hover:bg-gray-900 text-white w-full sm:w-auto"
            >
              Submit
            </Button>
          </div>
        </div>
        <div className="card-body p-0 overflow-x-auto pb-3">
          <div className="card-body p-0 overflow-x-auto pb-3">
            <div className="p-4 bg-card">
              <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) =>
                      setItemsPerPage(
                        e.target.value === "All"
                          ? "All"
                          : Number(e.target.value)
                      )
                    }
                    className="border px-2 py-1 rounded"
                  >
                    {[10, 15, 25, "All"].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <span>entries</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border p-1 pt-[0.9] pl-8 rounded bg-secondary"
                  />
                  <FaSearch className="absolute left-2 top-2 text-muted-foreground" />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table
                  className="min-w-full overf border relative z-0  bg-card text-foreground"
                  style={{
                    tableLayout: "fixed",
                    fontSize: "13px",
                  }}
                >
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      <th
                        className="px-4 py-2 border text-left cursor-pointer"
                        onClick={() => handleSort("Agency_name")}
                      >
                        <div className="flex items-center justify-start gap-2">
                          <div>
                            <span className="text-gray-900">Agency Name</span>
                          </div>
                          <div>{renderSortIcon("Agency_name")}</div>
                        </div>
                      </th>
                      <th
                        className="px-4 py-2 border text-left cursor-pointer"
                        onClick={() => handleSort("Contact_person")}
                      >
                        <div className="flex items-center justify-start gap-2">
                          <div>
                            <span className="text-gray-900">
                              Contact Person{" "}
                            </span>
                          </div>
                          <div>{renderSortIcon("Contact_person")}</div>
                        </div>
                      </th>
                      <th
                        className="px-4 py-2 border text-left cursor-pointer"
                        onClick={() => handleSort("Location")}
                      >
                        <div className="flex items-center justify-start gap-2">
                          <div>
                            <span className="text-gray-900">Location </span>
                          </div>
                          <div>{renderSortIcon("Location")}</div>
                        </div>
                      </th>
                      <th
                        className="px-4 py-2 border text-left cursor-pointer"
                        onClick={() => handleSort("Contact_1")}
                      >
                        <div className="flex items-center justify-start gap-2">
                          <div>
                            <span className="text-gray-900">Contact_1</span>
                          </div>
                          <div>{renderSortIcon("Contact_1")}</div>
                        </div>
                      </th>
                      <th
                        className="px-4 py-2 border text-left cursor-pointer"
                        onClick={() => handleSort("Contact_2")}
                      >
                        <div className="flex items-center justify-start gap-2">
                          <div>
                            <span className="text-gray-900">Contact-2</span>
                          </div>
                          <div>{renderSortIcon("Contact_2")}</div>
                        </div>
                      </th>
                      <th
                        className="px-4 py-2 border text-left cursor-pointer"
                        onClick={() => handleSort("Mailid")}
                      >
                        <div className="flex items-center justify-start gap-2">
                          <div>
                            <span className="text-gray-900">Mail ID </span>
                          </div>
                          <div>{renderSortIcon("Mailid")}</div>
                        </div>
                      </th>
                      <th
                        className="px-4 py-2 border text-left cursor-pointer"
                        onClick={() => handleSort("Website")}
                      >
                        <div className="flex items-center justify-start gap-2">
                          <div>
                            <span className="text-gray-900"> Website </span>
                          </div>
                          <div>{renderSortIcon("Website")}</div>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentAgencies.length > 0 ? (
                      currentAgencies.map((agency, i) => (
                        <tr key={i} className="hover:bg-muted">
                          <td className="px-4 py-2 border">
                            {agency.Agency_name}
                          </td>
                          <td className="px-4 py-2 border">
                            {agency.Contact_person}
                          </td>
                          <td className="px-4 py-2 border">
                            {agency.Location}
                          </td>
                          <td className="px-4 py-2 border">
                            {agency.Contact_1}
                          </td>
                          <td className="px-4 py-2 border">
                            {agency.Contact_2}
                          </td>
                          {/* Mail ID - opens mail client */}
                          <td className="border px-2 py-2 text-gray-800 font-bold">
                            <a
                              href={`mailto:${agency.Mailid}`}
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              {agency.Mailid}
                            </a>
                          </td>

                          {/* Website - opens in new tab */}
                          <td className="border px-2 py-2 text-gray-800 font-bold">
                            <a
                              href={
                                agency.Website.startsWith("http")
                                  ? agency.Website
                                  : `https://${agency.Website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              {agency.Website}
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
                    {filteredAgencies.length > 0
                      ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                          currentPage * rowsPerPage,
                          filteredAgencies.length
                        )} of ${filteredAgencies.length} entries`
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
      </form>
    </div>
  );
};

export default Upload;