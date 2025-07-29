"use client"
import { useState, useEffect, useRef } from 'react';

export default function EmailApprovalWeek({ weeks, Training_Budget, isActiveList, trainModeList, selectedProgramIds, employeeId }) {
  // Remove employeeId state and use prop instead
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const isCallingApi = useRef(false);

  const handleApprove = async () => {
    if (isCallingApi.current || !employeeId) return;

    // Defensive check for array lengths
    if (!weeks || !Training_Budget || !trainModeList) {
      console.error('Missing data arrays in approval');
      alert('Data arrays are missing.');
      return;
    }
    if (
      weeks.length !== Training_Budget.length ||
      weeks.length !== trainModeList.length
    ) {
      console.error('Data arrays length mismatch in approval');
      alert('Data arrays length mismatch.');
      return;
    }

    // Check if any week or Budget is empty and Train_Mode is not Internal
    const isWeekEmpty = weeks.some((week, index) => {
      return (week === null || week === undefined || week === '') && trainModeList[index] !== "Internal";
    });
    const isBudgetEmpty = Training_Budget.some((budget, index) => {
      return (budget === null || budget === undefined || budget === '') && trainModeList[index] !== "Internal";
    });

    if (isWeekEmpty || isBudgetEmpty) {
      alert('Please enter both the week and Training Budget for non-internal entries');
      return;
    }

    isCallingApi.current = true;
    setLoading(true);
    try {
      const programIdString = selectedProgramIds.join(',');
      const res = await fetch('/api/generate_email_all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, programId: programIdString, approve: true }),
      });

      if (res.status === 404) {
        alert('The data is already submitted');
      } else {
        const data = await res.json();
        setEmail(data.email);
        if (data.email) {
          alert(`Data Submitted Successfully`);
          window.location.reload(); // Refresh page after alert
        } else if (data) {
          alert(`Data Submitted Successfully`);
          window.location.reload(); // Refresh page after alert
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
      {/* Removed input field for employeeId */}
      <button
        onClick={handleApprove}
        className="px-6 mt-2 py-2 text-sm cursor-pointer font-semibold text-white bg-green-500 rounded-md shadow-md hover:bg-green-700 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
        disabled={loading || !employeeId}
        title="Please update all changes before approving"
      >
        {loading ? 'Processing...' : 'Approve'}
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
