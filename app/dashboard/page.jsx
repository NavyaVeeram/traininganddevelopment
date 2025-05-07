"use client"
import { useState, useEffect } from "react";

const Dashboard = () => {
  const [department, setDepartment] = useState('');
  const [username, setUsername] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Retrieve the department, username, and employeeId from localStorage
    const storedDepartment = localStorage.getItem('department');
    const storedUsername = localStorage.getItem('username');
    const storedEmployeeId = localStorage.getItem('employeeId');

    // If data is found, update state
    if (storedDepartment && storedUsername && storedEmployeeId) {
      setDepartment(storedDepartment);
      setUsername(storedUsername);
      setEmployeeId(storedEmployeeId);
      setShowPopup(true); // Show popup on load
    } else {
      // If no data found, redirect to login page
      window.location.href = '/';
    }
  }, []);

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      {showPopup && (
        <div className="fixed top-0 left-0 right-0 bg-sky-400 text-white p-4 shadow-md flex justify-between items-center z-50">
          <div>
            <h2 className="text-lg font-semibold">Welcome to Dashboard</h2>
            <p>Hello, {username}!</p>
          </div>
          <button
            onClick={closePopup}
            className="ml-4 px-3 py-1 bg-white text-sky-400 rounded hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      )}
      <div className={`flex-grow w-full max-w-4xl mt-16 px-4 ${showPopup ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
        <h1 className="text-3xl font-bold text-center mt-8">
          Welcome, {username}!
        </h1>
        {/* Dashboard content can go here */}
      </div>
    </div>
  );
};

export default Dashboard;
