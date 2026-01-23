"use client"
import { useState, useEffect, useRef } from 'react';

export default function EmailApprovalhod({ selectedProgramIds, employeeId }) {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const isCallingApi = useRef(false);

  const handleApprove = async () => {
    if (isCallingApi.current || !employeeId || !selectedProgramIds.length) return;

    isCallingApi.current = true;
    setLoading(true);
    try {
      const res = await fetch('/api/generate_email_all_hos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, approve: true, programId: selectedProgramIds.join(',') }),
      });

      if (res.status === 404) {
        alert('The data is already submitted');
      } else {
        const data = await res.json();
        setEmail(data.email);
        if (data.email) {
          alert('Data Submitted Successfully');
          window.location.reload(); // Refresh page after alert
        } else if (data && !data.email) {
          alert('Last submission successful, no email sent');
          window.location.reload();
        } else {
          alert('Error');
        }
      }
    } finally {
      setLoading(false);
      isCallingApi.current = false;
    }
  };

  return (
    <div>
      <button
        onClick={handleApprove}
        className="px-6 mt-2 py-2 text-sm cursor-pointer font-semibold text-white bg-green-500 rounded-md shadow-md hover:bg-green-700 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
        disabled={loading || !employeeId || !selectedProgramIds.length}
      >
        {loading ? 'Processing...' : 'Approve'}
      </button>
    </div>
  );
}
