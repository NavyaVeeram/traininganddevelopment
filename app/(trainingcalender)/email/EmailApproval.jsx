"use client"
import { useState, useEffect, useRef } from 'react';

export default function EmailApproval() {
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const isCallingApi = useRef(false);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    } else {
      setEmployeeId('');
    }
  }, []);

  const handleApprove = async () => {
    if (isCallingApi.current || !employeeId) return;


    isCallingApi.current = true;
    setLoading(true);
    try {
      const res = await fetch('/api/generate_email_all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, approve: true }),
      });

      if (res.status === 404) {
        alert('The data is already submitted');
      } else {
        const data = await res.json();
        setEmail(data.email);
        if (data.email) {
          alert(`Data Submitted Successfully`);
          window.location.reload(); // Refresh page after alert
        }else if(data){
 alert(`Data Submitted Successfully`);
          window.location.reload(); // Refresh page after alert
        }
        else{
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
      <button onClick={handleApprove} className="px-6 mt-2 py-2 text-sm font-semibold text-white bg-green-500 rounded-md shadow-md hover:bg-green-700 focus:ring-2 focus:ring-black-600 focus:ring-offset-2" disabled={loading || !employeeId}>
        {loading ? 'Processing...' : 'Send for Approval'}
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
