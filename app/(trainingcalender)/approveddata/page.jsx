"use client";
import React, { useState, useEffect, useMemo } from "react";

export default function TrainingDataTable() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId");

    if (!storedEmployeeId) {
      alert("Employee ID not found in localStorage");
      return;
    }

    fetch("/api/view_approval_form_submit_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: storedEmployeeId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching approval data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  if (data.length === 0) return <div>No records found.</div>;
  return (
    <div>
      <div className="p-6 ">
        <h1 className="text-sky-400 font-bold">Approved Data :</h1>
        <table
          className="min-w-full overf border relative z-0 bg-card text-foreground"
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
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  className="cursor-pointer px-4 py-2 border text-left"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border hover:bg-muted">
                {Object.values(row).map((value, index) => (
                  <td key={index} className="px-4 py-2 border">
                    {value?.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
