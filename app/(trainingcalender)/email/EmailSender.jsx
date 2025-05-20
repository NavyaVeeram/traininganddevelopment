'use client';
import { useState } from 'react';



export default function EmailSender({  email, roleEmployeeId, senderEmployeeId  }) {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSendEmail = async () => {
    setSending(true);
    setStatus(null);

    // Fetch the HTML content from a separate HTML file
    const htmlResponse = await fetch('/email_message.html');
    const htmlContent = await htmlResponse.text();

    // Retrieve data from localStorage
    const department = localStorage.getItem('department') || '';
    const username = localStorage.getItem('username') || '';
    const section = localStorage.getItem('section') || '';
    const employeeId = localStorage.getItem('employeeId') || '';
    const designation = localStorage.getItem('Designation') || '';

    const response = await fetch('/api/send_email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email, // use the prop instead of hardcoded value
        message: htmlContent,
        section,
        department,
        employeeId,
      }),
    });

    const result = await response.json();
    setSending(false);

    if (result.success) {
      setStatus('Test email sent successfully!');
    } else {
      setStatus(`Failed to send: ${result.error}`);
    }
  };

  return (
    <div className="mt-4">
      <button onClick={handleSendEmail} disabled={sending}  className="px-6 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2">
        {sending ? 'Sending...' : 'Send for Approval'}
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}
