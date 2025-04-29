"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {FaSearch } from "react-icons/fa";


const TrainingAgencies = () => {
  const [formData, setFormData] = useState({
    Agency_name: "",
    Contact_person: "",
    Location: "",
    Contact_1: "",
    Contact_2: "",
    Mailid: "",
    Website: "",
  });

  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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
      return sortConfig.direction === "asc" ? "▲" : "▼"
    }
    return  "↕";
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
    if (!email.includes('@')) {
      email = `${email}@gmail.com`; // Only append if there's no @ at all
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setFormData((prev) => ({ ...prev, Mailid: email }));
    
    try {
      const res = await fetch("/api/insert_agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || "Successfully added.");
        setFormData({
          Agency_name: "",
          Contact_person: "",
          Location: "",
          Contact_1: "",
          Contact_2: "",
          Mailid: "",
          Website: "",
        });
        fetchAgencies();
      } else {
        setError(data.error || "Submission failed.");
      }
    } catch {
      setError("An error occurred while submitting.");
    }

    setTimeout(() => {
      setError("");
      setSuccessMessage("");
    }, 3000);
  };
  const filteredAgencies = agencies.filter((agency) =>
    Object.values(agency).some((val) =>
      val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const currentAgencies =
    itemsPerPage === "All"
      ? filteredAgencies
      : filteredAgencies.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        );

  const handlePaginationChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="max-w-full mx-auto bg-white p-2 shadow-md rounded-lg w-full">
      {/* Header */}
      <div className="bg-sky-400 text-white p-2 rounded-t-lg flex  items-center">
      <h1 className="font-semibold">
        External Training Agencies Entry
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mx-1">
        {successMessage && (
          <div className="text-green-600">{successMessage}</div>
        )}
        {error && <div className="text-red-600">{error}</div>}
<div className="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ["Agency_name", "Agency Name"],
            ["Contact_person", "Contact Person"],
            ["Location", "Location"],
            ["Contact_1", "Contact 1"],
            ["Contact_2", "Contact 2"],
            ["Mailid", "Mail ID", "email"],
            ["Website", "Website"],
          ].map(([name, label, type = "text"]) => (
            <div key={name} className="mb-4">
            <Label htmlFor={name} className="block text-sm font-medium text-gray-900">
              {label}
            </Label>
            <input
              type={type}
              name={name}
              id={name}
              value={formData[name]}
              onChange={handleChange}
              required
              autoComplete="off"
              className="block w-full py-2 pl-3 pr-8 border rounded-md text-gray-900"
              />
          </div>
          
          ))}
          <div className="col-span-full sm:col-span-2 lg:col-span-4 flex justify-end">
            <Button    className="px-6 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2">              Submit
            </Button>
          </div>
        </div>
        </div>
      </form>

      {/* Controls */}
      <div className="card-body p-0 overflow-x-auto pb-3">
      <div className="p-4 bg-card">
      <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
          <div className="flex items-center space-x-2 text-sm">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) =>
              setItemsPerPage(
                e.target.value === "All" ? "All" : Number(e.target.value)
              )
            }
            className="border px-2 py-1 rounded"
          >
            {[5, 10, 20, "All"].map((opt) => (
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
    className="border p-1 pt-[0.9] pl-8 rounded bg-secondary"  />
    <FaSearch className="absolute left-2 top-2 text-muted-foreground" />
</div>

      </div>
</div>
</div>
      {/* Table */}
              <table className="min-w-full overf border relative z-0  bg-card text-foreground" 
                style={{ 
                  tableLayout: "fixed" ,
                  fontSize: "13px", 
                 }}>
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
                    <span className="text-gray-900">Contact Person </span>
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
                  <td className="px-4 py-2 border">{agency.Agency_name}</td>
                  <td className="px-4 py-2 border">{agency.Contact_person}</td>
                  <td className="px-4 py-2 border">{agency.Location}</td>
                  <td className="px-4 py-2 border">{agency.Contact_1}</td>
                  <td className="px-4 py-2 border">{agency.Contact_2}</td>
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
          {/* Website - opens in new tab */}
          <td className="border px-2 py-2 text-gray-800 font-bold">
                    <a
                      href={
                        agency.Website.startsWith("http")
                          ? agency.Website
                          : `https://${agency.Website}`
                      } // Check if it starts with http or https
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
                <td colSpan={7} className="py-4 text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Showing Entries Summary and Pagination */}
        <div className="flex flex-wrap justify-between items-center mt-4 px-2 space-y-2">
          <div style={{ fontSize: "14px" }}>
            Showing{" "}
            {filteredAgencies.length > 0
              ? `${
                  (currentPage - 1) *
                    (itemsPerPage === "All"
                      ? filteredAgencies.length
                      : itemsPerPage) +
                  1
                } to ${Math.min(
                  currentPage *
                    (itemsPerPage === "All"
                      ? filteredAgencies.length
                      : itemsPerPage),
                  filteredAgencies.length
                )} of ${filteredAgencies.length} entries`
              : "0 entries"}
          </div>

          {/* Pagination Controls */}
          <div className="flex space-x-2" style={{ fontSize: "14px" }}>
            <button
              className="px-3 py-1 border rounded"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              {"<<"}
            </button>
            <button
              className="px-3 py-1 border rounded"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              {"<"}
            </button>
            {Array.from(
              {
                length: Math.ceil(
                  filteredAgencies.length /
                    (itemsPerPage === "All"
                      ? filteredAgencies.length
                      : itemsPerPage)
                ),
              },
              (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1 ? "bg-primary text-white" : ""
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              )
            )}
            <button
              className="px-3 py-1 border rounded"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(
                      filteredAgencies.length /
                        (itemsPerPage === "All"
                          ? filteredAgencies.length
                          : itemsPerPage)
                    )
                  )
                )
              }
              disabled={
                currentPage ===
                Math.ceil(
                  filteredAgencies.length /
                    (itemsPerPage === "All"
                      ? filteredAgencies.length
                      : itemsPerPage)
                )
              }
            >
              {">"}
            </button>
            <button
              className="px-3 py-1 border rounded"
              onClick={() =>
                setCurrentPage(
                  Math.ceil(
                    filteredAgencies.length /
                      (itemsPerPage === "All"
                        ? filteredAgencies.length
                        : itemsPerPage)
                  )
                )
              }
              disabled={
                currentPage ===
                Math.ceil(
                  filteredAgencies.length /
                    (itemsPerPage === "All"
                      ? filteredAgencies.length
                      : itemsPerPage)
                )
              }
            >
              {">>"}
            </button>
          </div>
        </div>

    </div>
  );
};

export default TrainingAgencies;
