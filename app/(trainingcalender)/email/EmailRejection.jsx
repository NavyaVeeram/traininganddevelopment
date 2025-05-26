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
        className="px-6 mt-2 py-2 text-sm font-semibold text-white bg-red-500 rounded-md shadow-md hover:bg-red-700 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
        disabled={loading || !employeeId}
      >
        {loading ? 'Sending...' : 'Reject'}
      </button>
    </div>
  );
}
