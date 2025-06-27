"use client";
import { useState, useEffect, useRef } from "react";

export default function EmailRejectionForTrainers() {
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const isCallingApi = useRef(false);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId");
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    } else {
      setEmployeeId("");
    }
  }, []);

  const handleSendRejectionEmail = async () => {
    if (isCallingApi.current || !employeeId) return;

    isCallingApi.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/generate_rejection_email_for_trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });

      if (res.status === 404) {
        alert("The data is already submitted or not found");
      } else {
        const data = await res.json();
        setEmail(data.email);
        if (data.email) {
          alert("Rejection Email Sent Successfully");
          window.location.reload();
        } else if (data) {
          alert("Rejection Email Sent Successfully");
          window.location.reload();
        } else {
          alert("Error sending rejection email");
        }
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
      isCallingApi.current = false;
    }
  };

  return (
    <div>
      <button
        onClick={handleSendRejectionEmail}
        className="px-6 mt-2 py-2 text-sm font-semibold text-white bg-red-500 rounded-md shadow-md hover:bg-red-800 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
        disabled={loading || !employeeId}
      >
        {loading ? "Processing..." : "Reject"}
      </button>
      {/* {email && (
        <div>
          <h3>Email Sent To:</h3>
          <p>{email}</p>
        </div>
      )} */}
    </div>
  );
}
