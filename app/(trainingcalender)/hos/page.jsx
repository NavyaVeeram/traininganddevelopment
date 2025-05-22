'use client';

import { useState, useEffect } from 'react';
import EmailSender from '../email/EmailSender';


export default function GenerateEmailForm() {
  const [department, setDepartment] = useState('');
  const [section, setSection] = useState('');
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [trainingData, setTrainingData] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/generate_email', {
        method: 'POST',
        body: JSON.stringify({ employeeId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to fetch email data');
        setResult(null);
        setEmail('');
        return;
      }

      const data = await res.json();
      console.log('API response data:', data);
      setResult(data);
      setEmail(data.Email); // Save email in state
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching email data');
      setResult(null);
      setEmail('');
    }
  };

  useEffect(() => {
    // Retrieve the department, username, and employeeId from localStorage
    const storedDepartment = localStorage.getItem('department');
    const storedUsername = localStorage.getItem('username');
    const storedEmployeeId = localStorage.getItem('employeeId');
    const storedSection = localStorage.getItem('section');

    // If data is found, update state
    if (storedDepartment && storedUsername && storedEmployeeId && storedSection) {
      setDepartment(storedDepartment);
      setUsername(storedUsername);
      setEmployeeId(storedEmployeeId);
      setSection(storedSection);
    } else {
      // If no data found, redirect to login page
      window.location.href = '/';
    }
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/view_training_data_by_employee?employeeId=${storedEmployeeId}&department=${storedDepartment}`);
        const data = await response.json();
        if (response.ok) {
          setTrainingData(data); // Set the training data fetched from the server
        } else {
          console.error('Failed to fetch training data:', data.message);
          setTrainingData([]); // Fallback to empty array in case of failure
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setTrainingData([]); // Fallback to empty array in case of error
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (employeeId) {
      handleSubmit();
    }
  }, [employeeId]);

  return (
    <div>
      <div >
      <input
        type="text"
        placeholder="Department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="border p-2 mr-2"
      />
      <input
        type="text"
        placeholder="Section"
        value={section}
        onChange={(e) => setSection(e.target.value)}
        className="border p-2 mr-2"
      />
      </div>
      {/* Removed the Generate Email button as per request */}
      {error && <p className="text-red-600">Error: {error}</p>}
      <div >
      {result && (
        <div className="mt-4">
          <p>Email: {email}</p>
          <p>Role: {result.Role}</p>
          <p>Role Employee ID: {result.Role_EmployeeId}</p>
          <p>Sender ID: {result.Send_EmployeeId}</p>
        </div>
      )}
      </div>
      {/* Pass email to another component */}
      <EmailSender email={email} roleEmployeeId={result?.Role_EmployeeId} senderEmployeeId={result?.Send_EmployeeId} />
    </div>
  );
}
