"use client"
import { useState, useEffect, useRef } from 'react';

export default function RejectEmail({ employeeId, selectedProgramIds, selectedProgramNames }) {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const isCallingApi = useRef(false);

  const handleReject = async () => {
    if (isCallingApi.current || !employeeId || !selectedProgramIds || selectedProgramIds.length === 0) return;

    if (selectedProgramIds.length > 1) {
      alert("you can only reject one record");
      return;
    }

    isCallingApi.current = true;
    setLoading(true);

    try {
      const res = await fetch('/api/generate_reject_email_all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, programIds: selectedProgramIds, programNames: selectedProgramNames }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Rejection emails sent successfully to ${data.count} recipient(s).`);
        window.location.reload(); // Refresh page after alert
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (err) {
      alert('An error occurred while sending rejection emails.');
    } finally {
      setLoading(false);
      isCallingApi.current = false;
    }
  };

  return (
    <div>
      <button
        onClick={handleReject}
        className={`px-6 mt-2 py-2 text-sm  font-semibold text-white rounded-md shadow-md focus:ring-2 focus:ring-black-600 focus:ring-offset-2 ${
          loading || !employeeId || !selectedProgramIds || selectedProgramIds.length === 0 || selectedProgramIds.length > 1
            ? 'bg-red-400 cursor-not-allowed'
            : 'bg-red-500 hover:bg-red-700'
        }`}
      disabled={loading || !employeeId || !selectedProgramIds || selectedProgramIds.length === 0 || selectedProgramIds.length > 1}
      >
        {loading ? 'Sending...' : 'Reject'}
      </button>
    </div>
  );
}
