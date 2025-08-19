"use client";
import { useState, useEffect, useRef } from "react";

export default function EmailApprovalTrainers({selectedQualIds, selectedQualNames, selectedUsernames, onSubmitSuccess, submittedQualIds}) {
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

  const handleSendToApproval = async () => {
    if (isCallingApi.current || !employeeId || !selectedQualIds) return;

    isCallingApi.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/generate_email_qualified_trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, QualId: selectedQualIds, Usernames: selectedUsernames, approve: true }),
      });

      if (res.status === 404) {
        alert("The data is already submitted or not found");
      } else {
        const data = await res.json();
        setEmail(data.email);
        if (data.email || data) {
          alert("Data Submitted Successfully");
            window.location.reload();
          if (onSubmitSuccess) {
            onSubmitSuccess(selectedQualIds);
          }
        } else {
          alert("Error");
        }
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
      isCallingApi.current = false;
    }
  };

  // Disable approve button if loading or all selectedQualIds are already submitted
  const isDisabled = loading || (submittedQualIds && selectedQualIds.every(id => submittedQualIds.includes(id)));

  return (
    <div>
      <button
        onClick={handleSendToApproval}
        className="px-6 mt-2 py-2 text-sm cursor-pointer font-semibold text-white bg-green-400 rounded-md shadow-md hover:bg-green-800 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
        disabled={isDisabled}
        title={isDisabled ? "Already submitted or processing" : "Approve"}
      >
        {loading ? "Processing..." : "Approve"}
      </button>
    </div>
  );
}
