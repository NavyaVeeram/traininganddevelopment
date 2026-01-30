"use client"
import { useState, useRef } from 'react';

export default function EmailApprovalWeekForHrHod({ 
  selectedItems, // Pass the full objects of selected programs
  selectedProgramIds, 
  employeeId 
}) {
  const [loading, setLoading] = useState(false);
  const isCallingApi = useRef(false);

  const handleApprove = async () => {
    if (isCallingApi.current) return;

    // 1. Check if anything is selected
    if (!selectedItems || selectedItems.length === 0) {
      alert("Please select at least one program to approve.");
      return;
    }

    // 2. VALIDATION LOGIC
    const programsMissingWeek = [];

    selectedItems.forEach(item => {
      // Skip validation for Internal training
      if (item.Train_Mode === "Internal") return;

      // Check if Week is empty
      // Handles: null, undefined, "", " ", or only commas
      const weekValue = item.Week ? String(item.Week).replace(/,/g, '').trim() : '';
      
      if (!weekValue) {
        programsMissingWeek.push(item.Program_Name);
      }
    });

    // 3. HARD STOP: If validation fails, show alert and EXIT function
    if (programsMissingWeek.length > 0) {
      const list = programsMissingWeek.map(name => `• ${name}`).join('\n');
      alert(`❌ Cannot Proceed!\n\nPlease enter the week for the following programs:\n\n${list}`);
      return; // This prevents the API call
    }

    // 4. API CALL (Only reached if validation passes)
    isCallingApi.current = true;
    setLoading(true);
    
    try {
      const programIdString = selectedProgramIds.join(',');
      const res = await fetch('/api/generate_email_all_approval_hr_hod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employeeId, 
          programId: programIdString, 
          approve: true 
        }),
      });

      if (res.ok) {
        alert('✅ Data Submitted Successfully');
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(`❌ Error: ${errorData.message || 'Failed to submit'}`);
      }
    } catch (error) {
      alert('❌ An error occurred. Please try again.');
    } finally {
      setLoading(false);
      isCallingApi.current = false;
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
         className="px-6 mt-2 py-2 text-sm cursor-pointer font-semibold text-white bg-green-500 rounded-md shadow-md hover:bg-green-700 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
    >
      {loading ? 'Processing...' : 'Approve'}
    </button>
  );
}