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
          alert(`Email sent to: ${data.email}`);
          window.location.reload(); // Refresh page after alert
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
      <button onClick={handleApprove} className='bg-green-400 px-4 py-2 rounded text-light' disabled={loading || !employeeId}>
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
