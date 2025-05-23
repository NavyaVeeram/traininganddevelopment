"use client"
import { useState, useEffect, useRef } from 'react';

export default function RejectEmail() {
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const isCallingApi = useRef(false);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    }
  }, []);

  const handleReject = async () => {
    if (isCallingApi.current || !employeeId) return;
    isCallingApi.current = true;
    setLoading(true);

    try {
      const res = await fetch('/api/generate_reject_email_all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
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
        className='bg-red-500 text-white px-4 py-2 rounded'
        disabled={loading || !employeeId}
      >
        {loading ? 'Sending...' : 'Reject'}
      </button>
    </div>
  );
}
